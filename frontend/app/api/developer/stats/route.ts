export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, startOfDay } from 'date-fns';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Mock/Basic stats since we don't have a dedicated APIUsage table yet
    // In a real app, you'd query a table that tracks every API call
    const totalCallsMonth = 12450; // Mocked
    const callsToday = 842;        // Mocked
    const successRate = 99.8;      // Mocked
    
    // We can however check how many keys they have
    const activeKeysCount = await prisma.aPIKey.count({
      where: { userId: session.user.id, isActive: true }
    });

    return NextResponse.json({
      totalCallsMonth,
      callsToday,
      successRate,
      activeKeysCount,
      rateLimit: {
        limit: 100000,
        remaining: 87550,
        resetIn: '12 days'
      }
    }, { status: 200 });
  } catch (error) {
    console.error('API Stats Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

