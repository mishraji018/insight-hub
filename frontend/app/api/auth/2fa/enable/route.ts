import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyTwoFaToken, generateBackupCodes, logAudit } from '@/lib/security';
import { _2faVerifySchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = _2faVerifySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.twoFaSecret) {
      return NextResponse.json({ message: '2FA setup not initiated' }, { status: 400 });
    }

    const isValid = verifyTwoFaToken(validatedData.token, user.twoFaSecret);

    if (!isValid) {
      return NextResponse.json({ message: 'Invalid 2FA code' }, { status: 400 });
    }

    const backupCodes = generateBackupCodes();

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFaEnabled: true,
        backupCodes: backupCodes
      }
    });

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    await logAudit(user.id, '2FA_ENABLED', null, { ip });

    return NextResponse.json(
      { 
        message: '2FA enabled successfully',
        backupCodes 
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('2FA Enable Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
