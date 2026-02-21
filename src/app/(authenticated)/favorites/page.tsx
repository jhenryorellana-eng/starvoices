'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { AudioCard } from '@/components/feed/AudioCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Audio } from '@/types';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function FavoritesPage() {
  const { token } = useAuthStore();
  const [audios, setAudios] = useState<Audio[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const favs = data.favorites || [];
        setAudios(favs.filter((f: any) => f.audio).map((f: any) => f.audio));
        setFavorites(new Set(favs.map((f: any) => f.audio_id)));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const toggleFavorite = async (audioId: string) => {
    if (!token) return;
    setFavorites((prev) => { const next = new Set(prev); next.delete(audioId); return next; });
    setAudios((prev) => prev.filter((a) => a.id !== audioId));
    try {
      await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_id: audioId }),
      });
    } catch {
      fetchFavorites();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F4F4F1]/80 backdrop-blur-xl backdrop-saturate-150 border-b border-[#C8963E]/10">
        <div className="max-w-md mx-auto px-5 pt-5 pb-4">
          <motion.h1
            className="font-serif text-[28px] leading-tight tracking-tight text-[#1E3A5F]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Mis Favoritos
          </motion.h1>
          <motion.p
            className="mt-1 text-sm text-[#1E3A5F]/50 font-medium"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {audios.length} {audios.length === 1 ? 'audio guardado' : 'audios guardados'}
          </motion.p>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : audios.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh] px-6">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#B8453A]/15 to-[#C8963E]/10" />
              <div className="absolute inset-2 rounded-full bg-[#B8453A]/10 flex items-center justify-center">
                <Heart className="w-8 h-8 text-[#B8453A]/50" />
              </div>
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1E3A5F]">
              Sin favoritos aun
            </h3>
            <p className="text-[#1E3A5F]/40 text-sm mt-2 leading-relaxed max-w-[260px] mx-auto">
              Toca el corazon en cualquier audio para guardarlo aqui
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-3 px-4 pt-4 pb-28"
        >
          {audios.map((audio) => (
            <motion.div key={audio.id} variants={fadeUp}>
              <AudioCard
                audio={audio}
                isFavorite={true}
                onToggleFavorite={toggleFavorite}
                variant="compact"
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
