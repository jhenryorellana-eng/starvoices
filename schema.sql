-- StarVoices Database Schema
-- Execute in Supabase SQL Editor

-- Packs de audio (albums tematicos)
CREATE TABLE packs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  category TEXT NOT NULL,
  audio_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audios individuales
CREATE TABLE audios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration_seconds INTEGER NOT NULL,
  tags TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Favoritos del usuario
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  audio_id UUID REFERENCES audios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, audio_id)
);

-- Progreso de escucha
CREATE TABLE listen_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  audio_id UUID REFERENCES audios(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, audio_id)
);

-- Indices para performance
CREATE INDEX idx_audios_pack_id ON audios(pack_id);
CREATE INDEX idx_audios_is_preview ON audios(is_preview);
CREATE INDEX idx_audios_is_published ON audios(is_published);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_audio_id ON favorites(audio_id);
CREATE INDEX idx_listen_progress_user_id ON listen_progress(user_id);
CREATE INDEX idx_packs_category ON packs(category);
CREATE INDEX idx_packs_is_published ON packs(is_published);

-- RLS Policies
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE listen_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on packs" ON packs FOR ALL USING (true);
CREATE POLICY "Service role full access on audios" ON audios FOR ALL USING (true);
CREATE POLICY "Service role full access on favorites" ON favorites FOR ALL USING (true);
CREATE POLICY "Service role full access on listen_progress" ON listen_progress FOR ALL USING (true);

-- Storage: Crear bucket publico para archivos
INSERT INTO storage.buckets (id, name, public) VALUES ('starvoices', 'starvoices', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public read access on starvoices" ON storage.objects
  FOR SELECT USING (bucket_id = 'starvoices');

CREATE POLICY "Allow uploads to starvoices" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'starvoices');

CREATE POLICY "Allow updates in starvoices" ON storage.objects
  FOR UPDATE USING (bucket_id = 'starvoices');

CREATE POLICY "Allow deletes in starvoices" ON storage.objects
  FOR DELETE USING (bucket_id = 'starvoices');

-- Trigger para actualizar audio_count en packs
CREATE OR REPLACE FUNCTION update_pack_audio_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE packs SET audio_count = (
      SELECT COUNT(*) FROM audios WHERE pack_id = NEW.pack_id
    ) WHERE id = NEW.pack_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE packs SET audio_count = (
      SELECT COUNT(*) FROM audios WHERE pack_id = OLD.pack_id
    ) WHERE id = OLD.pack_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pack_audio_count
AFTER INSERT OR DELETE ON audios
FOR EACH ROW EXECUTE FUNCTION update_pack_audio_count();

-- Seed data para desarrollo
INSERT INTO packs (title, description, category, is_featured, is_published, sort_order) VALUES
  ('Comunicacion Digital', 'Como hablar con tus hijos sobre redes sociales y tecnologia', 'comunicacion', true, true, 1),
  ('Inteligencia Emocional', 'Guia para entender las emociones de la nueva generacion', 'emocional', true, true, 2),
  ('Limites Saludables', 'Establece limites sin perder la conexion con tus hijos', 'relaciones', false, true, 3),
  ('Seguridad en Internet', 'Protege a tus hijos en el mundo digital', 'tecnologia', false, true, 4),
  ('Motivacion Escolar', 'Ayuda a tus hijos a encontrar su motivacion', 'educacion', true, true, 5),
  ('Bienestar Familiar', 'Estrategias para una familia mas unida y feliz', 'bienestar', false, true, 6);

INSERT INTO audios (pack_id, title, description, audio_url, duration_seconds, sort_order, is_preview, is_published) VALUES
  ((SELECT id FROM packs WHERE title = 'Comunicacion Digital'), 'Por que tu hijo no te cuenta nada', 'Entiende las razones detras del silencio adolescente', 'https://cdn.example.com/audio1.mp3', 210, 1, true, true),
  ((SELECT id FROM packs WHERE title = 'Comunicacion Digital'), 'El arte de preguntar sin interrogar', 'Tecnicas para iniciar conversaciones genuinas', 'https://cdn.example.com/audio2.mp3', 195, 2, false, true),
  ((SELECT id FROM packs WHERE title = 'Comunicacion Digital'), 'Redes sociales: amiga o enemiga', 'Una perspectiva equilibrada sobre el uso de redes', 'https://cdn.example.com/audio3.mp3', 225, 3, false, true),
  ((SELECT id FROM packs WHERE title = 'Inteligencia Emocional'), 'Cuando tu hijo dice que esta bien pero no lo esta', 'Senales de que algo pasa y como abordarlo', 'https://cdn.example.com/audio4.mp3', 240, 1, true, true),
  ((SELECT id FROM packs WHERE title = 'Inteligencia Emocional'), 'Ansiedad en adolescentes: que puedes hacer', 'Herramientas practicas para padres', 'https://cdn.example.com/audio5.mp3', 200, 2, false, true),
  ((SELECT id FROM packs WHERE title = 'Limites Saludables'), 'Limites vs control: cual es la diferencia', 'Aprende a poner limites que funcionen', 'https://cdn.example.com/audio6.mp3', 180, 1, true, true),
  ((SELECT id FROM packs WHERE title = 'Limites Saludables'), 'Hora de pantalla: la batalla diaria', 'Estrategias realistas para el tiempo de pantalla', 'https://cdn.example.com/audio7.mp3', 215, 2, false, true),
  ((SELECT id FROM packs WHERE title = 'Seguridad en Internet'), 'Lo que tus hijos hacen online', 'Un recorrido por las apps y plataformas actuales', 'https://cdn.example.com/audio8.mp3', 230, 1, true, true),
  ((SELECT id FROM packs WHERE title = 'Motivacion Escolar'), 'Mi hijo no quiere estudiar: que hago', 'Causas comunes y soluciones practicas', 'https://cdn.example.com/audio9.mp3', 205, 1, true, true),
  ((SELECT id FROM packs WHERE title = 'Bienestar Familiar'), 'Cenas sin celular: el reto familiar', 'Como crear momentos de conexion real', 'https://cdn.example.com/audio10.mp3', 190, 1, true, true);

-- Notificaciones (patron StarReads)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL DEFAULT 'new_content',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_reads (
  user_id TEXT NOT NULL,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, notification_id)
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Service role full access on notification_reads" ON notification_reads FOR ALL USING (true);
