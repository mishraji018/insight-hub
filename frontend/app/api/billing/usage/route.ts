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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionPlan: true,
        queryUsageCount: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      plan: user.subscriptionPlan,
      usage: user.queryUsageCount,
      limit: user.subscriptionPlan === 'free' ? 100 : 10000,
      billingCycle: "Monthly",
      renewalDate: user.subscriptionPlan === 'free' ? null : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
      paymentHistory: user.subscriptionPlan === 'free' ? [] : [
        { id: 'INV-001', date: '2026-03-01', amount: 9.00, status: 'Paid' },
        { id: 'INV-002', date: '2026-02-01', amount: 9.00, status: 'Paid' },
      ]
    }, { status: 200 });

  } catch (error) {
    console.error('Billing Fetch Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

