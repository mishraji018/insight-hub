export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { newPasswordSchema } from '@/lib/validations';
import { hashPassword, logAudit } from '@/lib/security';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Validate password payload
    const validatedData = Object.assign(newPasswordSchema.parse(body), { email: body.email, otp: body.otp });

    if (!validatedData.email || !validatedData.otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const otpRecord = await prisma.oTP.findFirst({
      where: {
        userId: user.id,
        otp: validatedData.otp,
        type: 'PASSWORD_RESET',
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!otpRecord) {
      return NextResponse.json({ message: 'Invalid or expired reset code' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(validatedData.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, lockedUntil: null, failedAttempts: 0 }
      }),
      prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true }
      }),
      // Revoke all sessions on password change
      prisma.userSession.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false }
      })
    ]);

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    await logAudit(user.id, 'PASSWORD_CHANGED', null, { ip });

    return NextResponse.json(
      { message: 'Password reset successful' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('Reset Password Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

