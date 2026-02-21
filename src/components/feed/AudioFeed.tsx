'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioCard } from './AudioCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { Headphones } from 'lucide-react';
import type { Audio } from '@/types';

export function AudioFeed() {
  const [audios, setAudios] = useState<Audio[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuthStore();
  const { playAudio, stop, preload, clearPreloadCache } = useAudioPlayer();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef<number>(-1);

  const fetchFeed = useCallback(async () => {
    if (!token) return;
    try {
      const [feedRes, favRes] = await Promise.all([
        fetch('/api/feed', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setAudios(feedData.audios || []);
      }

      if (favRes.ok) {
        const favData = await favRes.json();
        const favIds = new Set<string>((favData.favorites || []).map((f: any) => f.audio_id));
        setFavorites(favIds);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // IntersectionObserver for autoplay + preload
  useEffect(() => {
    if (audios.length === 0 || !scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const index = Number((entry.target as HTMLElement).dataset.index);
          if (isNaN(index) || index === activeIndexRef.current) return;

          activeIndexRef.current = index;
          const audio = audios[index];
          if (!audio) return;

          // Autoplay the visible slide
          playAudio(audio.id, audio.audio_url);

          // Preload next 2 audios
          if (audios[index + 1]) {
            preload(audios[index + 1].id, audios[index + 1].audio_url);
          }
          if (audios[index + 2]) {
            preload(audios[index + 2].id, audios[index + 2].audio_url);
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.6,
      }
    );

    slideRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [audios, playAudio, preload]);

  // Cleanup on unmount: stop audio and clear preload cache
  useEffect(() => {
    return () => {
      stop();
      clearPreloadCache();
    };
  }, [stop, clearPreloadCache]);

  const toggleFavorite = async (audioId: string) => {
    if (!token) return;
    const isFav = favorites.has(audioId);

    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(audioId);
      else next.add(audioId);
      return next;
    });

    try {
      await fetch('/api/favorites', {
        method: isFav ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio_id: audioId }),
      });
    } catch {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(audioId);
        else next.delete(audioId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-4rem)] flex items-center justify-center bg-[#0A0F1C]">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#C8963E]/15" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#C8963E] animate-spin" />
          </div>
          <p className="mt-4 text-white/30 text-sm tracking-wide">Cargando...</p>
        </div>
      </div>
    );
  }

  if (audios.length === 0) {
    return (
      <div className="h-[calc(100dvh-4rem)] flex items-center justify-center bg-[#0A0F1C]">
        <div className="text-center px-6">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C8963E]/15 to-[#B8453A]/10" />
            <div className="absolute inset-2 rounded-full bg-[#C8963E]/10 flex items-center justify-center">
              <Headphones className="w-10 h-10 text-[#C8963E]/60" />
            </div>
          </div>
          <h3 className="font-serif text-xl font-bold text-white/80">
            Sin audios por ahora
          </h3>
          <p className="text-white/30 text-sm mt-2 leading-relaxed max-w-[240px] mx-auto">
            Vuelve pronto para descubrir nuevo contenido exclusivo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-[calc(100dvh-4rem)] snap-feed hide-scrollbar"
    >
      {audios.map((audio, index) => (
        <div
          key={audio.id}
          ref={(el) => { slideRefs.current[index] = el; }}
          data-index={index}
          className="h-[calc(100dvh-4rem)] snap-start"
        >
          <AudioCard
            audio={audio}
            isFavorite={favorites.has(audio.id)}
            onToggleFavorite={toggleFavorite}
            variant="fullscreen"
          />
        </div>
      ))}
    </div>
  );
}
