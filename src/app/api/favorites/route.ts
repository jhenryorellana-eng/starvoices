import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('*, audio:audios(*, pack:packs(id, title))')
    .eq('user_id', auth.sub)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Error al obtener favoritos' }, { status: 500 });
  }

  const response = NextResponse.json({ favorites: data });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  const { audio_id } = await request.json();
  if (!audio_id) {
    return NextResponse.json({ error: 'audio_id requerido' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .insert({ user_id: auth.sub, audio_id })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ message: 'Ya esta en favoritos' }, { status: 200 });
    }
    return NextResponse.json({ error: 'Error al agregar favorito' }, { status: 500 });
  }

  return NextResponse.json({ favorite: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  const { audio_id } = await request.json();
  if (!audio_id) {
    return NextResponse.json({ error: 'audio_id requerido' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('user_id', auth.sub)
    .eq('audio_id', audio_id);

  if (error) {
    return NextResponse.json({ error: 'Error al eliminar favorito' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Favorito eliminado' });
}