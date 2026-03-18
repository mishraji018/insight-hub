import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { billingDetailsSchema } from '@/lib/validations';
import { logAudit } from '@/lib/security';
import { z } from 'zod';

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate the incoming data
    const validatedData = billingDetailsSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: validatedData,
    });

    // Log the update
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    await logAudit(session.user.id, 'BILLING_DETAILS_UPDATED', Object.keys(validatedData), { ip });

    return NextResponse.json(
      { message: 'Billing details updated successfully', user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Billing Details PUT Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        message: 'Validation failed', 
        errors: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
