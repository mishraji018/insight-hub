import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTwoFaSecret, generateTwoFaUri, logAudit } from '@/lib/security';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.twoFaEnabled) {
      return NextResponse.json({ message: '2FA is already enabled' }, { status: 400 });
    }

    // Generate secret and save temporarily
    const secret = generateTwoFaSecret();
    const uri = generateTwoFaUri(user.email, secret);

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFaSecret: secret } // Stored temporarily until verified in enable step
    });

    return NextResponse.json(
      { 
        secret,
        uri,
        message: 'Scan the QR code in your authenticator app.'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('2FA Setup Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
