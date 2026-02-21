'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { usePlayerStore } from '@/stores/player-store';

export function useAudioPlayer() {
  const howlRef = useRef<Howl | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const preloadCacheRef = useRef<Map<string, Howl>>(new Map());
  const pausedByUserRef = useRef(false);
  const {
    currentAudioId,
    currentAudioUrl,
    isPlaying,
    progress,
    duration,
    setCurrentAudio,
    setIsPlaying,
    setProgress,
    setDuration,
    reset,
  } = usePlayerStore();

  const stopProgressTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(() => {
    stopProgressTracking();
    intervalRef.current = setInterval(() => {
      if (howlRef.current && howlRef.current.playing()) {
        setProgress(howlRef.current.seek() as number);
      }
    }, 250);
  }, [stopProgressTracking, setProgress]);

  const preload = useCallback((audioId: string, audioUrl: string) => {
    // Don't preload if already cached or currently playing
    if (preloadCacheRef.current.has(audioId)) return;
    if (currentAudioId === audioId) return;

    const howl = new Howl({
      src: [audioUrl],
      html5: true,
      preload: true,
    });

    preloadCacheRef.current.set(audioId, howl);

    // Limit cache to 3 items max
    if (preloadCacheRef.current.size > 3) {
      const firstKey = preloadCacheRef.current.keys().next().value;
      if (firstKey) {
        const old = preloadCacheRef.current.get(firstKey);
        old?.unload();
        preloadCacheRef.current.delete(firstKey);
      }
    }
  }, [currentAudioId]);

  const clearPreloadCache = useCallback(() => {
    preloadCacheRef.current.forEach((howl) => {
      howl.unload();
    });
    preloadCacheRef.current.clear();
  }, []);

  const playAudio = useCallback(
    (audioId: string, audioUrl: string) => {
      // If same audio, respect user pause
      if (currentAudioId === audioId && howlRef.current) {
        if (pausedByUserRef.current) return;
        howlRef.current.play();
        setIsPlaying(true);
        startProgressTracking();
        return;
      }

      // Reset user pause flag when switching to different audio
      pausedByUserRef.current = false;

      // Stop previous
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
        stopProgressTracking();
      }

      setCurrentAudio(audioId, audioUrl);

      // Check preload cache first
      const cached = preloadCacheRef.current.get(audioId);
      if (cached) {
        preloadCacheRef.current.delete(audioId);
        howlRef.current = cached;

        cached.on('play', () => {
          setIsPlaying(true);
          setDuration(cached.duration());
          startProgressTracking();
        });
        cached.on('pause', () => {
          setIsPlaying(false);
          stopProgressTracking();
        });
        cached.on('stop', () => {
          setIsPlaying(false);
          stopProgressTracking();
        });
        cached.on('end', () => {
          setIsPlaying(false);
          setProgress(0);
          stopProgressTracking();
        });
        cached.on('loaderror', () => {
          console.error('Error loading audio:', audioUrl);
          setIsPlaying(false);
        });

        cached.play();
        return;
      }

      // Create new Howl instance
      const howl = new Howl({
        src: [audioUrl],
        html5: true,
        onplay: () => {
          setIsPlaying(true);
          setDuration(howl.duration());
          startProgressTracking();
        },
        onpause: () => {
          setIsPlaying(false);
          stopProgressTracking();
        },
        onstop: () => {
          setIsPlaying(false);
          stopProgressTracking();
        },
        onend: () => {
          setIsPlaying(false);
          setProgress(0);
          stopProgressTracking();
        },
        onloaderror: () => {
          console.error('Error loading audio:', audioUrl);
          setIsPlaying(false);
        },
      });

      howlRef.current = howl;
      howl.play();
    },
    [currentAudioId, setCurrentAudio, setIsPlaying, setDuration, setProgress, startProgressTracking, stopProgressTracking]
  );

  const pause = useCallback(() => {
    if (howlRef.current) {
      pausedByUserRef.current = true;
      howlRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (howlRef.current) {
      pausedByUserRef.current = false;
      howlRef.current.play();
    }
  }, []);

  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop();
      howlRef.current.unload();
      howlRef.current = null;
    }
    stopProgressTracking();
    reset();
  }, [stopProgressTracking, reset]);

  const seek = useCallback((time: number) => {
    if (howlRef.current) {
      howlRef.current.seek(time);
      setProgress(time);
    }
  }, [setProgress]);

  const seekForward = useCallback((seconds: number = 15) => {
    if (howlRef.current) {
      const current = howlRef.current.seek() as number;
      const newTime = Math.min(current + seconds, howlRef.current.duration());
      howlRef.current.seek(newTime);
      setProgress(newTime);
    }
  }, [setProgress]);

  const seekBackward = useCallback((seconds: number = 15) => {
    if (howlRef.current) {
      const current = howlRef.current.seek() as number;
      const newTime = Math.max(current - seconds, 0);
      howlRef.current.seek(newTime);
      setProgress(newTime);
    }
  }, [setProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
      }
      stopProgressTracking();
      // Clean preload cache
      preloadCacheRef.current.forEach((howl) => howl.unload());
      preloadCacheRef.current.clear();
    };
  }, [stopProgressTracking]);

  return {
    currentAudioId,
    isPlaying,
    progress,
    duration,
    playAudio,
    pause,
    resume,
    stop,
    seek,
    seekForward,
    seekBackward,
    preload,
    clearPreloadCache,
  };
}
