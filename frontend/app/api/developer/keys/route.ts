export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createApiKey, hashApiSecret, logAudit } from '@/lib/security';
import { apiKeyGenerateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const keys = await prisma.aPIKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        prefix: true,
        lastUsed: true,
        isActive: true,
        rateLimit: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(keys, { status: 200 });
  } catch (error) {
    console.error('API Keys Fetch Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = apiKeyGenerateSchema.parse(body);

    const { prefix, secret, fullKey, hash } = createApiKey();

    const newKey = await prisma.aPIKey.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        keyHash: hash,
        prefix: prefix,
      }
    });

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    await logAudit(session.user.id as string, 'API_KEY_CREATED', { name: validatedData.name }, { ip });

    return NextResponse.json({ 
      id: newKey.id,
      name: newKey.name,
      key: fullKey, // Only shown once
      prefix: newKey.prefix,
      message: 'API Key generated successfully. Please copy it now, you will not be able to see it again.'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    console.error('API Key Gen Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

