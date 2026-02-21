import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  const { data, error } = await supabaseAdmin
    .from('packs')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Error al obtener packs' }, { status: 500 });
  }

  const response = NextResponse.json({ packs: data });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}