import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';
import { hashPassword, generateDigitOTP, logAudit } from '@/lib/security';
import { sendVerificationEmail } from '@/lib/email';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(validatedData.password);
    const otp = generateDigitOTP();
    
    // Using transaction to create user and OTP securely
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          role: 'USER',
        }
      });

      await tx.oTP.create({
        data: {
          userId: user.id,
          otp,
          type: 'EMAIL_VERIFY',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
        }
      });

      // Send Welcome Notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Welcome to Insight Hub! 🚀",
          message: "We're excited to have you on board. Start exploring your dashboard to see your platform analytics.",
          type: "INFO"
        }
      });

      return user;
    });

    await sendVerificationEmail(newUser.email, otp);

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    await logAudit(newUser.id, 'USER_REGISTERED', { email: newUser.email }, { ip });

    return NextResponse.json(
      { 
        message: 'Registration successful. Please verify your email.',
        email: newUser.email 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
