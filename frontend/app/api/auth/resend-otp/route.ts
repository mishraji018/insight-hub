import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDigitOTP, logAudit } from '@/lib/security';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate new OTP
    const isLoginFlow = user.isEmailVerified; // If verified, must be login flow resend
    const otp = generateDigitOTP();
    
    await prisma.oTP.create({
      data: {
        userId: user.id,
        otp,
        type: isLoginFlow ? 'LOGIN' : 'EMAIL_VERIFY',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      }
    });

    await sendVerificationEmail(email, otp);

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    await logAudit(user.id, 'OTP_RESENT', { email }, { ip });

    return NextResponse.json({ message: 'New OTP sent to your email' });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
