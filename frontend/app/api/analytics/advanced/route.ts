import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  startOfDay, 
  endOfDay, 
  subDays, 
  subWeeks, 
  subMonths, 
  format,
  eachDayOfInterval,
  isSameDay
} from 'date-fns';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d'; // 24h, 7d, 30d, 90d, custom
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');

    let startDate: Date;
    let endDate: Date = new Date();

    if (range === '24h') {
      startDate = startOfDay(new Date());
    } else if (range === '7d') {
      startDate = subWeeks(new Date(), 1);
    } else if (range === '90d') {
      startDate = subMonths(new Date(), 3);
    } else if (fromStr && toStr) {
      startDate = new Date(fromStr);
      endDate = new Date(toStr);
    } else {
      startDate = subDays(new Date(), 30);
    }

    const [
      totalUsers,
      activeToday,
      newThisWeek,
      churnedUsers,
      loginHistory,
      featureUsage,
      deviceBreakdown,
      locationData,
      retentionData
    ] = await Promise.all([
      // 1. Total Users
      prisma.user.count(),

      // 2. Active Today
      prisma.userSession.count({
        where: { lastActive: { gte: startOfDay(new Date()) }, isActive: true }
      }),

      // 3. New This Week
      prisma.user.count({
        where: { createdAt: { gte: subWeeks(new Date(), 1) } }
      }),

      // 4. Churn Rate (Inactive for > 30 days)
      prisma.user.count({
        where: { 
          sessions: {
            none: { lastActive: { gte: subDays(new Date(), 30) } }
          }
        }
      }),

      // 5. Login Activity (Line Chart)
      prisma.loginHistory.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' }
      }),

      // 6. Feature Usage (Bar Chart)
      prisma.userActivity.groupBy({
        by: ['featureName'],
        where: { visitedAt: { gte: startDate, lte: endDate } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 8
      }),

      // 7. Device Breakdown (Pie Chart)
      prisma.loginHistory.groupBy({
        by: ['device'],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true }
      }),

      // 8. Location Distribution (Table)
      prisma.user.groupBy({
        by: ['country'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),

      // 9. Retention proxy (Active users per day in range)
      prisma.userSession.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    // Processing Login Activity for Recharts
    const dayInterval = eachDayOfInterval({ start: startDate, end: endDate });
    const loginChart = dayInterval.map(day => {
      const count = loginHistory.filter(l => isSameDay(l.createdAt, day)).length;
      return {
        date: format(day, 'MMM dd'),
        value: count
      };
    });

    // Device breakdown formatting
    const deviceChart = deviceBreakdown.map(d => ({
      name: d.device || 'Desktop', // Default if null
      value: d._count.id
    }));

    // Retention data formatting
    const retentionChart = dayInterval.map(day => {
       const count = retentionData.filter(r => isSameDay(r.createdAt, day)).length;
       return {
         date: format(day, 'MMM dd'),
         count: count
       }
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        activeToday,
        newThisWeek,
        churnRate: totalUsers > 0 ? ((churnedUsers / totalUsers) * 100).toFixed(1) + '%' : '0%'
      },
      charts: {
        loginActivity: loginChart,
        featureUsage: featureUsage.map(f => ({ name: f.featureName, value: f._count.id })),
        deviceBreakdown: deviceChart,
        retention: retentionChart
      },
      locations: locationData.map(l => ({
        country: l.country || 'Unknown',
        count: l._count.id
      }))
    });

  } catch (error) {
    console.error('Advanced Analytics Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
