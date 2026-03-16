import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations';
import { generateDigitOTP, logAudit } from '@/lib/security';
import { sendPasswordResetEmail } from '@/lib/email';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = resetPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists, a reset code was sent.' },
        { status: 200 }
      );
    }

    // Invalidate previous reset OTPs
    await prisma.oTP.updateMany({
      where: {
        userId: user.id,
        type: 'PASSWORD_RESET',
        isUsed: false
      },
      data: { isUsed: true }
    });

    const otp = generateDigitOTP();
    await prisma.oTP.create({
      data: {
        userId: user.id,
        otp,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      }
    });

    await sendPasswordResetEmail(user.email, otp);

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    await logAudit(user.id, 'OTP_SENT_PASSWORD_RESET', null, { ip });

    return NextResponse.json(
      { message: 'If an account exists, a reset code was sent.' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
