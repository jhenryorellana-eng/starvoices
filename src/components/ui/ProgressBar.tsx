'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  duration: number;
  onSeek?: (time: number) => void;
  className?: string;
}

export function ProgressBar({ progress, duration, onSeek, className }: ProgressBarProps) {
  const percent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    onSeek(ratio * duration);
  };

  return (
    <div
      className={cn('h-1.5 bg-dark-100 rounded-full cursor-pointer overflow-hidden', className)}
      onClick={handleClick}
    >
      <div
        className="h-full bg-gradient-to-r from-primary to-utah-red rounded-full progress-glow transition-all duration-200"
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}
