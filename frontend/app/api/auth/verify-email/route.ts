export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyEmailSchema } from '@/lib/validations';
import { logAudit } from '@/lib/security';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Use extended schema because the request includes email to find the user
    const schema = verifyEmailSchema.extend({ email: z.string().email() });
    const validatedData = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 400 });
    }

    const otpRecord = await prisma.oTP.findFirst({
      where: {
        userId: user.id,
        otp: validatedData.otp,
        type: 'EMAIL_VERIFY',
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!otpRecord) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

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
    await logAudit(user.id, 'EMAIL_VERIFIED', null, { ip });

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('Verify Email Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

