export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const activeSessions = await prisma.userSession.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      orderBy: { lastActive: 'desc' }
    });

    return NextResponse.json(activeSessions, { status: 200 });
  } catch (error) {
    console.error('Session Fetch Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

