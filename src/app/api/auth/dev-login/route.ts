import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  if (!isLocalhost) {
    return NextResponse.json(
      { error: 'Solo disponible en desarrollo local' },
      { status: 403 }
    );
  }

  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Solo disponible en modo desarrollo' },
      { status: 403 }
    );
  }

  const user = {
    id: 'dev_parent_001',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@example.com',
    code: 'STAR-PAD-DEV001',
    familyId: 'dev_family_001',
  };

  const token = await createToken({
    sub: user.id,
    family_id: user.familyId,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    code: user.code,
    role: 'parent',
    mini_app: 'starvoices',
  });

  return NextResponse.json({ token, user });
}
