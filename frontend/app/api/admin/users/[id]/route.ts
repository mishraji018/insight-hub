export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper to check Admin
async function isAdmin() {
  const session = await auth();
  return (session?.user as any)?.role === 'ADMIN';
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!await isAdmin()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { role, isActive } = body;

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(role && { role }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ message: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!await isAdmin()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    // In a real app, you might want a soft delete or cascade handle
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Delete failed' }, { status: 500 });
  }
}
