import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { isRead } = await req.json();

    const notification = await prisma.notification.update({
      where: { 
        id: params.id,
        userId: session.user.id // Ensure user owns the notification
      },
      data: { isRead }
    });

    return NextResponse.json(notification, { status: 200 });
  } catch (error) {
    console.error('Notification Update Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await prisma.notification.delete({
      where: { 
        id: params.id,
        userId: session.user.id 
      }
    });

    return NextResponse.json({ message: 'Notification deleted' }, { status: 200 });
  } catch (error) {
    console.error('Notification Delete Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
