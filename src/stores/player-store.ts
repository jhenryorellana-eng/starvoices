import { create } from 'zustand';

interface PlayerState {
  currentAudioId: string | null;
  currentAudioUrl: string | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  setCurrentAudio: (id: string, url: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentAudioId: null,
  currentAudioUrl: null,
  isPlaying: false,
  progress: 0,
  duration: 0,

  setCurrentAudio: (id, url) =>
    set({ currentAudioId: id, currentAudioUrl: url, progress: 0, duration: 0 }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),

  reset: () =>
    set({
      currentAudioId: null,
      currentAudioUrl: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
    }),
}));
