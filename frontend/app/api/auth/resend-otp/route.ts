import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDigitOTP } from '@/lib/security';
import { sendVerificationEmail } from '@/lib/email';
import { z } from 'zod';

const resendOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = resendOtpSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      // Don't leak user existence
      return NextResponse.json(
        { message: 'If that email exists, an OTP has been sent.' },
        { status: 200 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified.' },
        { status: 400 }
      );
    }

    // Check for recent OTP to prevent spam (e.g., 60 seconds cooldown)
    const recentOtp = await prisma.oTP.findFirst({
      where: {
        userId: user.id,
        type: 'EMAIL_VERIFY',
        createdAt: { gt: new Date(Date.now() - 60 * 1000) }
      }
    });

    if (recentOtp) {
      return NextResponse.json(
        { message: 'Please wait before requesting a new OTP.' },
        { status: 429 }
      );
    }

    const otp = generateDigitOTP();

    // Create a new OTP record
    await prisma.oTP.create({
      data: {
        userId: user.id,
        otp: otp,
        type: 'EMAIL_VERIFY',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      }
    });

    await sendVerificationEmail(user.email, otp);

    return NextResponse.json(
      { message: 'OTP sent successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend OTP Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
