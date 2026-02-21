import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Codigo requerido' },
        { status: 400 }
      );
    }

    let userData: any;

    // Dev mode: accept dev_ codes
    const host = request.headers.get('host') || '';
    const isDev = process.env.NODE_ENV === 'development' &&
      (host.includes('localhost') || host.includes('127.0.0.1'));

    if (isDev && code.startsWith('dev_')) {
      userData = {
        id: 'dev_parent_001',
        familyId: 'dev_family_001',
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@example.com',
        code: 'STAR-PAD-DEV001',
        role: 'parent',
      };
    } else {
      // Exchange code with Hub Central
      const hubUrl = process.env.HUB_CENTRAL_API_URL || 'https://api.starbizacademy.com';
      const response = await fetch(`${hubUrl}/auth/mini-app-exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mini-App-Id': 'starvoices',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: error.message || 'Error al verificar codigo' },
          { status: response.status }
        );
      }

      const hubData = await response.json();
      userData = {
        id: hubData.user.id,
        familyId: hubData.user.familyId,
        firstName: hubData.user.firstName,
        lastName: hubData.user.lastName,
        email: hubData.user.email || null,
        code: hubData.user.code,
      };
    }

    // Validate parent code
    const userCode = userData.code || '';
    if (!userCode.startsWith('P-') && !userCode.startsWith('STAR-PAD-')) {
      return NextResponse.json(
        { error: 'StarVoices es exclusivo para padres', code: 'CODE_002' },
        { status: 403 }
      );
    }

    // Generate JWT
    const token = await createToken({
      sub: userData.id,
      family_id: userData.familyId,
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email || null,
      code: userData.code,
      role: 'parent',
      mini_app: 'starvoices',
    });

    const user = {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email || null,
      code: userData.code,
      familyId: userData.familyId,
    };

    return NextResponse.json({ token, user });
  } catch (error: any) {
    console.error('Auth exchange error:', error);
    return NextResponse.json(
      { error: 'Error interno de autenticacion' },
      { status: 500 }
    );
  }
}
