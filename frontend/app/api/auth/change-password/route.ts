import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword, logAudit } from '@/lib/security';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'New password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || (!await comparePassword(validatedData.currentPassword, user.password))) {
      return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(validatedData.newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
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
      { message: 'Password changed successfully. All other sessions have been logged out.' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('Change Password Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
