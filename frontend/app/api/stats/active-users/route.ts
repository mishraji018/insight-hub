import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Consider users active if they had activity in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeCount = await prisma.userSession.count({
      where: {
        lastActive: { gte: fiveMinutesAgo },
        isActive: true
      }
    });

    return NextResponse.json({ activeCount }, { status: 200 });
  } catch (error) {
    console.error('Active Users Fetch Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
