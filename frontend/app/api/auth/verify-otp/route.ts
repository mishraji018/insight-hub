import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const { email, otp, type = 'register' } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const dbType = type === 'login' ? 'LOGIN' : 'EMAIL_VERIFY';

    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        otps: {
          where: {
            otp,
            type: dbType,
            isUsed: false,
            expiresAt: { gt: new Date() }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const otpRecord = user.otps[0];

    if (!otpRecord) {
      // Check if OTP was actually sent but expired
      const lastOtp = await prisma.oTP.findFirst({
        where: { userId: user.id, otp, type: 'EMAIL_VERIFY' },
        orderBy: { createdAt: 'desc' }
      });

      if (lastOtp && lastOtp.expiresAt < new Date()) {
        return NextResponse.json({ message: 'OTP expired' }, { status: 410 });
      }

      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    // Mark as verified and OTP as used
    // We update isEmailVerified regardless of type since they passed the check.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true }
      }),
      prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true }
      })
    ]);

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    const auditAction = type === 'login' ? 'LOGIN_OTP_VERIFIED' : 'EMAIL_VERIFIED';
    await logAudit(user.id, auditAction, { email }, { ip });

    return NextResponse.json({ 
      message: type === 'login' ? 'Login OTP verified' : 'Email verified successfully',
      readyToLogin: true,
      firstName: user.firstName
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
