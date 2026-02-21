import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'starvoices-dev-secret-key-32chars!'
);

export interface TokenPayload {
  sub: string;
  family_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  code: string;
  role: 'parent';
  mini_app: 'starvoices';
  iat?: number;
  exp?: number;
}

export async function createToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthFromRequest(request: NextRequest): Promise<TokenPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'No autorizado', code: 'AUTH_001' },
    { status: 401 }
  );
}

export function forbiddenResponse() {
  return NextResponse.json(
    { error: 'Acceso denegado', code: 'AUTH_002' },
    { status: 403 }
  );
}
