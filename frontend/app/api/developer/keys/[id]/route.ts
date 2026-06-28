export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify ownership and existence
    const key = await prisma.aPIKey.findUnique({
      where: { id }
    });

    if (!key || key.userId !== session.user.id) {
      return NextResponse.json({ message: 'Not found or unauthorized' }, { status: 404 });
    }

    // Revoke key (delete it)
    await prisma.aPIKey.delete({
      where: { id }
    });

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    await logAudit(session.user.id as string, 'API_KEY_REVOKED', { name: key.name, keyId: id }, { ip });

    return NextResponse.json({ message: 'API Key revoked successfully' }, { status: 200 });
  } catch (error) {
    console.error('API Key Revocation Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
