export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security';
import { profileUpdateSchema } from '@/lib/validations';
import { z } from 'zod';
import { Theme } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phoneNumber: true,
        gender: true,
        dateOfBirth: true,
        bio: true,
        country: true,
        city: true,
        timezone: true,
        language: true,
        themePreference: true,
        digestEnabled: true,
        securityAlertsEnabled: true,
        weeklyReportEnabled: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Profile GET Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Clean nulls to undefined to satisfy Prisma validation for non-nullable optional fields
    // Convert empty strings to null for nullable fields
    const cleanBody = Object.fromEntries(
      Object.entries(body).map(([k, v]) => [k, v === '' ? null : v])
    );
    
    // Validate fields using Zod
    const validatedData = profileUpdateSchema.partial().parse(cleanBody);

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json({ message: 'No valid fields provided' }, { status: 400 });
    }

    // Explicitly handle themePreference type casting for Prisma Enum
    const { fontPreference, ...validatedDataWithoutFont } = validatedData;
    const updateData: any = { ...validatedDataWithoutFont };
    
    if (validatedDataWithoutFont.themePreference) {
      updateData.themePreference = validatedDataWithoutFont.themePreference as Theme;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        themePreference: true,
        digestEnabled: true,
        securityAlertsEnabled: true,
        weeklyReportEnabled: true,
      }
    });

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    await logAudit(session.user.id, 'PROFILE_UPDATED', Object.keys(validatedData), { ip });

    return NextResponse.json(
      { message: 'Profile updated successfully', user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile Update Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export const PUT = PATCH;

