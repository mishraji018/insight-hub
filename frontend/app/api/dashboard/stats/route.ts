export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** Format a number difference as a signed %-change string, e.g. "+12.5%" */
function formatTrend(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

/** True if the trend is positive (higher is better) */
function isTrendUp(current: number, previous: number): boolean {
  return current >= previous;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'week'; // today, week, month
    const now = new Date();

    // ── Date boundaries based on range ──────────────────────────
    let currentStart: Date;
    let prevStart: Date;
    let prevEnd: Date;
    let chartStart: Date;

    if (range === 'today') {
      currentStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      prevStart    = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      prevEnd      = currentStart;
      chartStart   = currentStart;
    } else if (range === 'month') {
      currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      prevStart    = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      prevEnd      = currentStart;
      chartStart   = currentStart;
    } else {
      // Default: week
      currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevStart    = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      prevEnd      = currentStart;
      chartStart   = currentStart;
    }

    const last365 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // ── Parallel DB queries ───────────────────────────────────────
    const [
      totalLogins,
      prevPeriodLogins,
      currentPeriodLogins,
      loginHistory,
      daysActiveRaw,
      prevDaysActiveRaw,
      featureUsage,
      prevFeatureCount,
      recentSessions,
      prevSessions,
      chartSessions,
      lastLoginData,
      lastActionData,
    ] = await Promise.all([
      // 1. Total logins (all time)
      prisma.loginHistory.count({ where: { userId } }),

      // 2. Logins in PREVIOUS window (for trend)
      prisma.loginHistory.count({
        where: { userId, createdAt: { gte: prevStart, lt: prevEnd } },
      }),

      // 3. Logins in CURRENT window
      prisma.loginHistory.count({
        where: { userId, createdAt: { gte: currentStart } },
      }),

      // 4. Chart data for logins
      prisma.loginHistory.findMany({
        where: { userId, createdAt: { gte: chartStart } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),

      // 5. Distinct active days in last 365d
      prisma.$queryRaw<{ day: string }[]>`
        SELECT DISTINCT DATE("createdAt"::timestamp) AS day
        FROM "LoginHistory"
        WHERE "userId" = ${userId}
          AND "createdAt" >= ${last365}
      `,

      // 6. Distinct active days in previous 365d window
      prisma.$queryRaw<{ day: string }[]>`
        SELECT DISTINCT DATE("createdAt"::timestamp) AS day
        FROM "LoginHistory"
        WHERE "userId" = ${userId}
          AND "createdAt" >= ${new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000)}
          AND "createdAt" <  ${last365}
      `,

      // 7. Top 5 features (all time)
      prisma.userActivity.groupBy({
        by: ['featureName'],
        where: { userId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),

      // 8. Distinct feature count in previous window
      prisma.$queryRaw<{ cnt: bigint }[]>`
        SELECT COUNT(DISTINCT "featureName") AS cnt
        FROM "UserActivity"
        WHERE "userId" = ${userId}
          AND "visitedAt" >= ${prevStart}
          AND "visitedAt" <  ${prevEnd}
      `,

      // 9. Current sessions
      prisma.userSession.findMany({
        where: { userId, createdAt: { gte: currentStart } },
        select: { createdAt: true, lastActive: true },
      }),

      // 10. Previous sessions
      prisma.userSession.findMany({
        where: { userId, createdAt: { gte: prevStart, lt: prevEnd } },
        select: { createdAt: true, lastActive: true },
      }),

      // 11. Sessions for area chart
      prisma.userSession.findMany({
        where: { userId, createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),

      // 12. Last login (excluding current one)
      prisma.loginHistory.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: 1,
        select: { createdAt: true }
      }),

      // 13. Last action
      prisma.userActivity.findFirst({
        where: { userId },
        orderBy: { visitedAt: 'desc' },
        select: { featureName: true }
      }),
    ]);

    // ── KPI: Days Active ──────────────────────────────────────────
    const daysActive     = daysActiveRaw.length;
    const prevDaysActive = prevDaysActiveRaw.length;

    // ── KPI: Features Used ────────────────────────────────────────
    const featuresUsed = featureUsage.length;
    const prevFeatUsed = Number((prevFeatureCount[0] as any)?.cnt ?? 0);

    // ── KPI: Avg Session Duration ─────────────────────────────────
    const avgMinutes = (sessions: { createdAt: Date; lastActive: Date }[]): number => {
      if (sessions.length === 0) return 0;
      const total = sessions.reduce((acc, s) => {
        return acc + (s.lastActive.getTime() - s.createdAt.getTime());
      }, 0);
      return Math.round(total / sessions.length / 60_000);
    };
    const avgSessionMinutes     = avgMinutes(recentSessions);
    const prevAvgSessionMinutes = avgMinutes(prevSessions);

    // ── Chart: Login Trend ───────────────────────────────────────
    const loginCountByBucket: Record<string, number> = {};
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    loginHistory.forEach((l) => {
      const key = range === 'today' 
        ? l.createdAt.getHours().toString().padStart(2, '0') + ':00'
        : l.createdAt.toISOString().split('T')[0];
      loginCountByBucket[key] = (loginCountByBucket[key] ?? 0) + 1;
    });

    let loginTrend: any[] = [];
    if (range === 'today') {
      loginTrend = Array.from({ length: 12 }, (_, i) => {
        const h = i * 2;
        const label = h.toString().padStart(2, '0') + ':00';
        return { name: label, logins: loginCountByBucket[label] ?? 0 };
      });
    } else {
      const days = range === 'month' ? 30 : 7;
      loginTrend = Array.from({ length: days }, (_, i) => {
        const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
        const key = d.toISOString().split('T')[0];
        return {
          name:   days === 7 ? DAY_LABELS[d.getDay()] : (d.getMonth() + 1) + '/' + d.getDate(),
          logins: loginCountByBucket[key] ?? 0,
        };
      });
    }

    // ── Chart: Feature Trend ─────────────────────────────────────
    const featureTrend = featureUsage.map((f) => ({
      name:  f.featureName,
      value: f._count.id,
    }));

    // ── Chart: Session Trend ─────────────────────────────────────
    const BUCKET_HOURS = [0, 4, 8, 12, 16, 20];
    const sessionCountByBucket: Record<string, number> = {};
    chartSessions.forEach((s) => {
      const h = s.createdAt.getHours();
      const bucket = BUCKET_HOURS.reduce((prev, curr) => h >= curr ? curr : prev);
      const label = `${String(bucket).padStart(2, '0')}:00`;
      sessionCountByBucket[label] = (sessionCountByBucket[label] ?? 0) + 1;
    });
    const sessionTrend = BUCKET_HOURS.map((b) => {
      const label = `${String(b).padStart(2, '0')}:00`;
      return { time: label, sessions: sessionCountByBucket[label] ?? 0 };
    });

    // ── Welcome Metadata ──────────────────────────────────────────
    const firstName = session.user.name?.split(' ')[0] || 'User';
    const lastLogin = lastLoginData 
      ? formatDistanceToNow(lastLoginData.createdAt) + ' ago' 
      : 'First time today';
    const lastAction = lastActionData?.featureName || 'Getting started';

    return NextResponse.json({
      firstName,
      lastLogin,
      lastAction,
      totalLogins,
      loginsTrend:        formatTrend(currentPeriodLogins, prevPeriodLogins),
      loginsUp:           isTrendUp(currentPeriodLogins, prevPeriodLogins),
      daysActive,
      daysActiveTrend:    formatTrend(daysActive, prevDaysActive),
      daysActiveUp:       isTrendUp(daysActive, prevDaysActive),
      featuresUsed,
      featuresUsedTrend:  formatTrend(featuresUsed, prevFeatUsed),
      featuresUsedUp:     isTrendUp(featuresUsed, prevFeatUsed),
      avgSessionMinutes,
      avgSessionTrend:    formatTrend(avgSessionMinutes, prevAvgSessionMinutes),
      avgSessionUp:       isTrendUp(avgSessionMinutes, prevAvgSessionMinutes),
      loginTrend,
      featureTrend,
      sessionTrend,
    });
  } catch (error) {
    console.error('[dashboard/stats] error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

function formatDistanceToNow(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'just now';
}

