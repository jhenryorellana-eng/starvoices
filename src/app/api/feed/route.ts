import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  const { data: audios, error } = await supabaseAdmin
    .from('audios')
    .select('*, pack:packs(id, title, category)')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Error al obtener feed' }, { status: 500 });
  }

  // Shuffle
  const shuffled = (audios || []).sort(() => Math.random() - 0.5);

  const response = NextResponse.json({ audios: shuffled });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}