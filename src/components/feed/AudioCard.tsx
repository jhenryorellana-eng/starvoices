'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play, Pause, Clock, Disc3 } from 'lucide-react';
import { cn, getGradient, formatDuration } from '@/lib/utils';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import type { Audio } from '@/types';

interface AudioCardProps {
  audio: Audio;
  isFavorite?: boolean;
  onToggleFavorite?: (audioId: string) => void;
  variant?: 'fullscreen' | 'compact';
}

export function AudioCard({
  audio,
  isFavorite = false,
  onToggleFavorite,
  variant = 'compact',
}: AudioCardProps) {
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const gradient = getGradient(audio.id);

  const {
    currentAudioId,
    isPlaying,
    progress,
    duration,
    playAudio,
    pause,
    resume,
  } = useAudioPlayer();

  const isCurrentAudio = currentAudioId === audio.id;
  const isCurrentPlaying = isCurrentAudio && isPlaying;
  const progressPercent =
    isCurrentAudio && duration > 0 ? (progress / duration) * 100 : 0;

  const handlePlayPause = () => {
    if (!isCurrentAudio) {
      playAudio(audio.id, audio.audio_url);
    } else if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleFavorite = async () => {
    if (!onToggleFavorite || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      onToggleFavorite(audio.id);
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (variant === 'fullscreen') {
    return <FullscreenSlide
      audio={audio}
      gradient={gradient}
      isFavorite={isFavorite}
      isCurrentAudio={isCurrentAudio}
      isCurrentPlaying={isCurrentPlaying}
      progressPercent={progressPercent}
      favoriteLoading={favoriteLoading}
      onPlayPause={handlePlayPause}
      onFavorite={handleFavorite}
    />;
  }

  return <CompactCard
    audio={audio}
    gradient={gradient}
    isFavorite={isFavorite}
    isCurrentAudio={isCurrentAudio}
    isCurrentPlaying={isCurrentPlaying}
    progressPercent={progressPercent}
    favoriteLoading={favoriteLoading}
    onPlayPause={handlePlayPause}
    onFavorite={handleFavorite}
  />;
}

/* ─── Fullscreen TikTok Slide ─── */

interface SlideProps {
  audio: Audio;
  gradient: string;
  isFavorite: boolean;
  isCurrentAudio: boolean;
  isCurrentPlaying: boolean;
  progressPercent: number;
  favoriteLoading: boolean;
  onPlayPause: () => void;
  onFavorite: () => void;
}

function FullscreenSlide({
  audio,
  gradient,
  isFavorite,
  isCurrentPlaying,
  progressPercent,
  favoriteLoading,
  onPlayPause,
  onFavorite,
}: SlideProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      {audio.cover_url ? (
        <>
          <Image
            src={audio.cover_url}
            alt=""
            fill
            className="object-cover scale-110 blur-[20px] brightness-[0.3]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1C]/60 via-transparent to-[#0A0F1C]/90" />
        </>
      ) : (
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br',
          'from-[#0A0F1C] via-[#1E3A5F]/40 to-[#0A0F1C]'
        )} />
      )}

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      }} />

      {/* Cover art (centered, floating) */}
      {audio.cover_url && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[65%] w-56 h-56 rounded-3xl overflow-hidden shadow-2xl shadow-black/40"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={audio.cover_url}
            alt={audio.title}
            fill
            className="object-cover"
            priority
          />
          {/* Gold border glow when playing */}
          {isCurrentPlaying && (
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-[#C8963E]/50"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </motion.div>
      )}

      {/* Play/Pause button (centered) */}
      <button
        onClick={onPlayPause}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        aria-label={isCurrentPlaying ? 'Pause' : 'Play'}
      >
        <div className="relative">
          {/* Pulsing ring when playing */}
          <AnimatePresence>
            {isCurrentPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#C8963E]/40"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>

          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center',
            'bg-white/10 backdrop-blur-md border border-white/20',
            'transition-all duration-300',
            isCurrentPlaying && 'bg-[#C8963E]/20 border-[#C8963E]/40'
          )}>
            {isCurrentPlaying ? (
              <Pause className="w-7 h-7 text-white" fill="white" />
            ) : (
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            )}
          </div>
        </div>
      </button>

      {/* Bottom info area */}
      <div className="absolute bottom-20 left-0 right-16 px-5 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {audio.pack && (
            <span className="inline-flex items-center gap-1.5 text-[#C8963E] text-xs font-semibold tracking-wide uppercase mb-2">
              <Disc3 className="w-3 h-3" />
              {audio.pack.title}
            </span>
          )}
          <h2 className="font-serif text-2xl font-bold text-white leading-tight">
            {audio.title}
          </h2>
          {audio.description && (
            <p className="text-sm text-white/50 mt-1.5 line-clamp-2 leading-relaxed">
              {audio.description}
            </p>
          )}
        </motion.div>
      </div>

      {/* Right side action column (TikTok-style) */}
      <div className="absolute bottom-24 right-4 flex flex-col items-center gap-6 z-10">
        {/* Favorite */}
        <button
          onClick={onFavorite}
          disabled={favoriteLoading}
          className="flex flex-col items-center gap-1"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <motion.div
            whileTap={{ scale: 1.3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Heart
              className={cn(
                'w-7 h-7 transition-colors duration-200',
                isFavorite ? 'text-[#B8453A] fill-[#B8453A]' : 'text-white/70'
              )}
            />
          </motion.div>
          <span className="text-[10px] text-white/50 font-medium">
            {isFavorite ? 'Guardado' : 'Guardar'}
          </span>
        </button>

        {/* Duration */}
        <div className="flex flex-col items-center gap-1">
          <Clock className="w-5 h-5 text-white/50" />
          <span className="text-[10px] text-white/50 font-medium">
            {formatDuration(audio.duration_seconds)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-16 left-0 right-0 h-[2px] bg-white/10 z-10">
        <motion.div
          className="h-full bg-gradient-to-r from-[#C8963E] to-[#C8963E]/70"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
          transition={{ duration: 0.25, ease: 'linear' }}
        />
      </div>

      {/* Preview badge */}
      {audio.is_preview && (
        <span className="absolute top-5 left-5 bg-[#C8963E]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10">
          Preview
        </span>
      )}
    </div>
  );
}

/* ─── Compact Card (for favorites, pack detail) ─── */

function CompactCard({
  audio,
  gradient,
  isFavorite,
  isCurrentAudio,
  isCurrentPlaying,
  progressPercent,
  favoriteLoading,
  onPlayPause,
  onFavorite,
}: SlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn(
        'relative flex items-center gap-3.5 p-2.5 rounded-2xl overflow-hidden',
        'bg-white/[0.06] backdrop-blur-md',
        'border border-white/[0.08]',
        'shadow-[0_2px_12px_rgba(0,0,0,0.08)]',
        'transition-shadow duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)]',
        isCurrentPlaying && 'border-[#C8963E]/30'
      )}
    >
      {/* Thumbnail with play/pause overlay */}
      <button
        onClick={onPlayPause}
        className="relative flex-shrink-0 w-[82px] h-[82px] rounded-xl overflow-hidden group"
        aria-label={isCurrentPlaying ? 'Pause' : 'Play'}
      >
        {audio.cover_url ? (
          <Image
            src={audio.cover_url}
            alt={audio.title}
            fill
            sizes="82px"
            className="object-cover"
          />
        ) : (
          <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
        )}

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            isCurrentPlaying && 'opacity-100'
          )}
        >
          <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            {isCurrentPlaying ? (
              <Pause className="w-4 h-4 text-white" fill="white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
            )}
          </div>
        </div>

        {audio.is_preview && (
          <span className="absolute top-1.5 left-1.5 bg-[#C8963E]/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none">
            Preview
          </span>
        )}
      </button>

      {/* Text content */}
      <div className="flex-1 min-w-0 py-0.5">
        <h3 className="font-bold text-sm leading-snug text-[#1E3A5F] line-clamp-2">
          {audio.title}
        </h3>
        {audio.pack && (
          <p className="text-xs font-medium text-[#C8963E] mt-0.5 truncate">
            {audio.pack.title}
          </p>
        )}
        {audio.description && (
          <p className="text-xs text-[#1E3A5F]/50 mt-0.5 line-clamp-1">
            {audio.description}
          </p>
        )}
        <span className="inline-block text-[11px] text-[#1E3A5F]/40 font-medium mt-1">
          {formatDuration(audio.duration_seconds)}
        </span>
      </div>

      {/* Favorite button */}
      <button
        onClick={onFavorite}
        disabled={favoriteLoading}
        className={cn(
          'flex-shrink-0 p-2 rounded-full transition-colors duration-200',
          'hover:bg-[#B8453A]/10',
          favoriteLoading && 'opacity-50 pointer-events-none'
        )}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={cn(
            'w-[18px] h-[18px] transition-colors duration-200',
            isFavorite ? 'text-[#B8453A] fill-[#B8453A]' : 'text-[#1E3A5F]/30'
          )}
        />
      </button>

      {/* Progress bar */}
      {isCurrentAudio && progressPercent > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#C8963E]/10">
          <motion.div
            className="h-full bg-gradient-to-r from-[#C8963E] to-[#C8963E]/70 rounded-r-full"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
            transition={{ duration: 0.25, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
}
