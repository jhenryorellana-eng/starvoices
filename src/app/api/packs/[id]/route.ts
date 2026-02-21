import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  const { data: pack, error: packError } = await supabaseAdmin
    .from('packs')
    .select('*')
    .eq('id', params.id)
    .eq('is_published', true)
    .single();

  if (packError || !pack) {
    return NextResponse.json({ error: 'Pack no encontrado' }, { status: 404 });
  }

  const { data: audios } = await supabaseAdmin
    .from('audios')
    .select('*')
    .eq('pack_id', params.id)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  const response = NextResponse.json({ pack, audios: audios || [] });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}