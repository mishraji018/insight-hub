import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security';

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate only safe fields (no role, no email verifications)
    const dataToUpdate: any = {};
    if (body.firstName) dataToUpdate.firstName = body.firstName;
    if (body.lastName) dataToUpdate.lastName = body.lastName;
    if (body.themePreference) dataToUpdate.themePreference = body.themePreference;
    if (body.digestEnabled !== undefined) dataToUpdate.digestEnabled = body.digestEnabled;
    if (body.securityAlertsEnabled !== undefined) dataToUpdate.securityAlertsEnabled = body.securityAlertsEnabled;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ message: 'No valid fields provided' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        themePreference: true,
        digestEnabled: true,
        securityAlertsEnabled: true,
      }
    });

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    await logAudit(session.user.id, 'PROFILE_UPDATED', Object.keys(dataToUpdate), { ip });

    return NextResponse.json(
      { message: 'Profile updated successfully', user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
