'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, Headphones } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { AudioCard } from '@/components/feed/AudioCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, getGradient } from '@/lib/utils';
import type { Pack, Audio } from '@/types';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function PackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [pack, setPack] = useState<Pack | null>(null);
  const [audios, setAudios] = useState<Audio[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchPack = useCallback(async () => {
    if (!token || !params.id) return;
    try {
      const [packRes, favRes] = await Promise.all([
        fetch(`/api/packs/${params.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (packRes.ok) {
        const data = await packRes.json();
        setPack(data.pack);
        setAudios(data.audios || []);
      }

      if (favRes.ok) {
        const favData = await favRes.json();
        setFavorites(new Set((favData.favorites || []).map((f: any) => f.audio_id)));
      }
    } catch (error) {
      console.error('Error fetching pack:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, params.id]);

  useEffect(() => { fetchPack(); }, [fetchPack]);

  const toggleFavorite = async (audioId: string) => {
    if (!token) return;
    const isFav = favorites.has(audioId);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(audioId); else next.add(audioId);
      return next;
    });
    try {
      await fetch('/api/favorites', {
        method: isFav ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_id: audioId }),
      });
    } catch {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(audioId); else next.delete(audioId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-64" />
        <div className="space-y-3 mt-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#1E3A5F]/40">Pack no encontrado</p>
          <button onClick={() => router.back()} className="text-[#C8963E] font-medium mt-2">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const gradient = getGradient(pack.id);

  return (
    <div className="pb-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-50 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-white/20"
      >
        <ChevronLeft className="w-5 h-5 text-[#1E3A5F]" />
      </button>

      {/* Pack header */}
      <div className={cn('relative h-56 bg-gradient-to-br', gradient)}>
        {pack.cover_url && (
          <Image src={pack.cover_url} alt={pack.title} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A5F]/70 via-[#1E3A5F]/20 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="absolute bottom-5 left-5 right-5"
        >
          <h1 className="font-serif text-2xl font-bold text-white leading-tight">{pack.title}</h1>
          {pack.description && (
            <p className="text-sm text-white/75 mt-1.5 line-clamp-2">{pack.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2.5">
            <Headphones className="w-3.5 h-3.5 text-[#C8963E]" />
            <span className="text-xs text-white/60 font-medium">{pack.audio_count} episodios</span>
          </div>
        </motion.div>
      </div>

      {/* Audios */}
      {audios.length === 0 ? (
        <div className="text-center py-16 px-6">
          <div className="w-14 h-14 rounded-full bg-[#C8963E]/10 flex items-center justify-center mx-auto mb-3">
            <Headphones className="w-6 h-6 text-[#C8963E]/50" />
          </div>
          <p className="font-serif text-lg text-[#1E3A5F]/60">Sin episodios aun</p>
          <p className="text-sm text-[#1E3A5F]/30 mt-1">Vuelve pronto para nuevo contenido</p>
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-3 px-4 pt-4"
        >
          {audios.map((audio) => (
            <motion.div key={audio.id} variants={fadeUp}>
              <AudioCard
                audio={audio}
                isFavorite={favorites.has(audio.id)}
                onToggleFavorite={toggleFavorite}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
