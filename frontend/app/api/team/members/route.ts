export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // For this demo/upgrade, we'll fetch all users as "team members" 
    // since the user might not have an organization set up yet.
    // In a real multi-tenant app, we'd filter by OrgMember.
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const members = users.map(user => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
      email: user.email,
      avatar: user.avatar,
      orgRole: user.role === 'ADMIN' ? 'ADMIN' : 'MEMBER', // Mapping system role to org role for display
      status: user.isActive ? 'Active' : 'Inactive',
      lastActive: '2 mins ago', // Mocked as we don't have a specific lastActive field in User model directly (it's in sessions)
      joinedAt: user.createdAt.toISOString()
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Team API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

