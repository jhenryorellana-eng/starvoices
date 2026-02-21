'use client';

import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatDuration } from '@/lib/utils';

interface AudioPlayerProps {
  audioId: string;
  audioUrl: string;
}

export function AudioPlayer({ audioId, audioUrl }: AudioPlayerProps) {
  const {
    currentAudioId,
    isPlaying,
    progress,
    duration,
    playAudio,
    pause,
    resume,
    seek,
    seekForward,
    seekBackward,
  } = useAudioPlayer();

  const isCurrentAudio = currentAudioId === audioId;
  const isCurrentPlaying = isCurrentAudio && isPlaying;
  const currentProgress = isCurrentAudio ? progress : 0;
  const currentDuration = isCurrentAudio ? duration : 0;

  const handlePlayPause = () => {
    if (!isCurrentAudio) {
      playAudio(audioId, audioUrl);
    } else if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Skip back */}
      <button
        onClick={() => isCurrentAudio && seekBackward(15)}
        disabled={!isCurrentAudio}
        className="flex-shrink-0 p-1 text-[#1E3A5F]/40 hover:text-[#1E3A5F]/70 disabled:opacity-30 transition-colors"
        aria-label="Skip back 15 seconds"
      >
        <SkipBack className="w-4 h-4" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={handlePlayPause}
        className="flex-shrink-0 w-9 h-9 rounded-full bg-[#C8963E] flex items-center justify-center text-white shadow-sm hover:bg-[#C8963E]/90 transition-colors"
        aria-label={isCurrentPlaying ? 'Pause' : 'Play'}
      >
        {isCurrentPlaying ? (
          <Pause className="w-4 h-4" fill="white" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" fill="white" />
        )}
      </button>

      {/* Skip forward */}
      <button
        onClick={() => isCurrentAudio && seekForward(15)}
        disabled={!isCurrentAudio}
        className="flex-shrink-0 p-1 text-[#1E3A5F]/40 hover:text-[#1E3A5F]/70 disabled:opacity-30 transition-colors"
        aria-label="Skip forward 15 seconds"
      >
        <SkipForward className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="flex-1 min-w-0">
        <ProgressBar
          progress={currentProgress}
          duration={currentDuration}
          onSeek={isCurrentAudio ? seek : undefined}
          className="h-1 bg-[#1E3A5F]/10 [&>div]:bg-gradient-to-r [&>div]:from-[#C8963E] [&>div]:to-[#C8963E]/70"
        />
      </div>

      {/* Time display */}
      <span className="flex-shrink-0 text-[11px] font-medium text-[#1E3A5F]/50 tabular-nums min-w-[70px] text-right">
        {isCurrentAudio
          ? `${formatDuration(Math.floor(currentProgress))} / ${currentDuration > 0 ? formatDuration(Math.floor(currentDuration)) : '--:--'}`
          : '--:--'}
      </span>
    </div>
  );
}
