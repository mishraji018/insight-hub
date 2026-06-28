export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const bodySchema = z.object({
  featureName: z.string().min(1).max(100),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { featureName } = bodySchema.parse(body);

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        featureName,
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }
    // Silently fail — feature tracking must never break the UI
    console.error('[track/feature] error:', error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

