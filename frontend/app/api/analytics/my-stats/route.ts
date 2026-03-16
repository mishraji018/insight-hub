import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays } from 'date-fns';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const thirtyDaysAgo = subDays(new Date(), 30);
    
    const [loginHistory, featureUsage, sessionCount] = await Promise.all([
      prisma.loginHistory.groupBy({
        by: ['createdAt'], // Grouping normally needs a date part extraction in raw queries, doing approximation here
        where: { userId: session.user.id, createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true }
      }),
      prisma.userActivity.groupBy({
        by: ['featureName'],
        where: { userId: session.user.id },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      }),
      prisma.userSession.count({
        where: { userId: session.user.id, isActive: true }
      })
    ]);

    // Format for recharts
    const chartData = {
      loginHistory: loginHistory.map(l => ({
        date: startOfDay(l.createdAt).toISOString().split('T')[0],
        count: l._count.id
      })),
      featureUsage: featureUsage.map(f => ({
        name: f.featureName,
        value: f._count.id
      })),
      activeSessions: sessionCount
    };

    return NextResponse.json(chartData, { status: 200 });
  } catch (error) {
    console.error('Analytics Stats Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
