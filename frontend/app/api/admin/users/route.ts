export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const all = searchParams.get('all') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { email: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
      ]
    };

    if (role && role !== 'all') where.role = role;
    if (status === 'active') where.isActive = true;
    if (status === 'banned') where.isActive = false;

    const [users, totalCount, stats] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          avatar: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        ...(all ? {} : { skip, take: limit }),
      }),
      prisma.user.count({ where }),
      // Aggregated stats for the header
      Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isActive: false } }),
        prisma.user.count({ 
          where: { 
            createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } 
          } 
        }),
      ])
    ]);

    return NextResponse.json({
      users,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      stats: {
        total: stats[0],
        active: stats[1],
        banned: stats[2],
        newThisMonth: stats[3],
      }
    });
  } catch (error) {
    console.error('Admin Users API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

