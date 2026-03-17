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

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const now = new Date();

    // ── Date boundaries ──────────────────────────────────────────
    const last30  = new Date(now.getTime() - 30  * 24 * 60 * 60 * 1000);
    const last60  = new Date(now.getTime() - 60  * 24 * 60 * 60 * 1000);
    const last365 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const last7   = new Date(now.getTime() - 7   * 24 * 60 * 60 * 1000);

    // ── Parallel DB queries ───────────────────────────────────────
    const [
      totalLogins,
      prevPeriodLogins,
      loginHistory,
      daysActiveRaw,
      prevDaysActiveRaw,
      featureUsage,
      prevFeatureCount,
      recentSessions,
      prevSessions,
      chartSessions,
    ] = await Promise.all([
      // 1. Total logins (all time)
      prisma.loginHistory.count({ where: { userId } }),

      // 2. Logins in PREVIOUS 30-day window (for trend)
      prisma.loginHistory.count({
        where: { userId, createdAt: { gte: last60, lt: last30 } },
      }),

      // 3. Last 7 days of logins — for line chart
      prisma.loginHistory.findMany({
        where: { userId, createdAt: { gte: last7 } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),

      // 4. Distinct active days in last 365d (raw SQL for DATE grouping)
      prisma.$queryRaw<{ day: string }[]>`
        SELECT DISTINCT DATE("createdAt"::timestamp) AS day
        FROM "LoginHistory"
        WHERE "userId" = ${userId}
          AND "createdAt" >= ${last365}
      `,

      // 5. Distinct active days in previous 365d window (for trend)
      prisma.$queryRaw<{ day: string }[]>`
        SELECT DISTINCT DATE("createdAt"::timestamp) AS day
        FROM "LoginHistory"
        WHERE "userId" = ${userId}
          AND "createdAt" >= ${new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000)}
          AND "createdAt" <  ${last365}
      `,

      // 6. Top 5 features (all time) — for bar chart + featuresUsed count
      prisma.userActivity.groupBy({
        by: ['featureName'],
        where: { userId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),

      // 7. Distinct feature count in previous 30d (for trend)
      prisma.$queryRaw<{ cnt: bigint }[]>`
        SELECT COUNT(DISTINCT "featureName") AS cnt
        FROM "UserActivity"
        WHERE "userId" = ${userId}
          AND "visitedAt" >= ${last60}
          AND "visitedAt" <  ${last30}
      `,

      // 8. Current 30d sessions — for avg duration KPI
      prisma.userSession.findMany({
        where: { userId, createdAt: { gte: last30 } },
        select: { createdAt: true, lastActive: true },
      }),

      // 9. Previous 30d sessions (for trend)
      prisma.userSession.findMany({
        where: { userId, createdAt: { gte: last60, lt: last30 } },
        select: { createdAt: true, lastActive: true },
      }),

      // 10. All sessions in last 24h — for area chart (hourly buckets)
      prisma.userSession.findMany({
        where: {
          userId,
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // ── KPI: Total Logins ─────────────────────────────────────────
    const currentPeriodLogins = await prisma.loginHistory.count({
      where: { userId, createdAt: { gte: last30 } },
    });

    // ── KPI: Days Active ──────────────────────────────────────────
    const daysActive     = daysActiveRaw.length;
    const prevDaysActive = prevDaysActiveRaw.length;

    // ── KPI: Features Used ────────────────────────────────────────
    const featuresUsed = featureUsage.length;
    // For trend: how many distinct features did the user use in the prev window
    const prevFeatUsed = Number((prevFeatureCount[0] as any)?.cnt ?? 0);

    // ── KPI: Avg Session Duration ─────────────────────────────────
    const avgMinutes = (sessions: { createdAt: Date; lastActive: Date }[]): number => {
      if (sessions.length === 0) return 0;
      const total = sessions.reduce((acc, s) => {
        return acc + (s.lastActive.getTime() - s.createdAt.getTime());
      }, 0);
      return Math.round(total / sessions.length / 60_000); // ms → minutes
    };
    const avgSessionMinutes     = avgMinutes(recentSessions);
    const prevAvgSessionMinutes = avgMinutes(prevSessions);

    // ── Chart: Login Trend (last 7 days) ─────────────────────────
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const loginCountByDay: Record<string, number> = {};
    loginHistory.forEach((l) => {
      const key = l.createdAt.toISOString().split('T')[0]; // yyyy-mm-dd
      loginCountByDay[key] = (loginCountByDay[key] ?? 0) + 1;
    });

    // Build last-7-days slots (oldest → newest)
    const loginTrend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      return {
        name:   DAY_LABELS[d.getDay()],
        logins: loginCountByDay[key] ?? 0,
      };
    });

    // ── Chart: Feature Trend (top 5) ─────────────────────────────
    const featureTrend = featureUsage.map((f) => ({
      name:  f.featureName,
      value: f._count.id,
    }));

    // ── Chart: Session Trend (last 24h in 4-hour buckets) ────────
    const BUCKET_HOURS = [0, 4, 8, 12, 16, 20];
    const sessionCountByBucket: Record<string, number> = {};
    chartSessions.forEach((s) => {
      const h = s.createdAt.getHours();
      const bucket = BUCKET_HOURS.reduce((prev, curr) =>
        h >= curr ? curr : prev
      );
      const label = `${String(bucket).padStart(2, '0')}:00`;
      sessionCountByBucket[label] = (sessionCountByBucket[label] ?? 0) + 1;
    });
    const sessionTrend = BUCKET_HOURS.map((b) => {
      const label = `${String(b).padStart(2, '0')}:00`;
      return { time: label, sessions: sessionCountByBucket[label] ?? 0 };
    });

    // ── Response ──────────────────────────────────────────────────
    return NextResponse.json({
      // KPI values
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

      // Chart arrays
      loginTrend,
      featureTrend,
      sessionTrend,
    });
  } catch (error) {
    console.error('[dashboard/stats] error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
