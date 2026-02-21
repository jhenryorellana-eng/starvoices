'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Headphones, Star } from 'lucide-react';
import { cn, getGradient } from '@/lib/utils';
import type { Pack } from '@/types';

interface PackCardProps {
  pack: Pack;
}

export function PackCard({ pack }: PackCardProps) {
  const gradient = getGradient(pack.id);

  return (
    <Link href={`/packs/${pack.id}`}>
      <motion.div
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'rounded-2xl overflow-hidden',
          'bg-white/60 backdrop-blur-sm',
          'border border-[#1E3A5F]/[0.06]',
          'shadow-sm shadow-black/[0.03]',
          'hover:shadow-md hover:shadow-black/[0.06]',
          'transition-shadow duration-300'
        )}
      >
        {/* Cover image or gradient placeholder */}
        <div className={cn('relative aspect-[4/3] bg-gradient-to-br', gradient)}>
          {pack.cover_url ? (
            <Image
              src={pack.cover_url}
              alt={pack.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 200px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Headphones className="w-7 h-7 text-white/60" strokeWidth={1.5} />
              </div>
            </div>
          )}

          {/* Featured badge */}
          {pack.is_featured && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#C8963E]/90 backdrop-blur-sm text-white pl-1.5 pr-2.5 py-1 rounded-full">
              <Star className="w-3 h-3 fill-white" />
              <span className="text-[10px] font-bold tracking-wide">
                Destacado
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 pb-3.5">
          <h3 className="font-serif font-bold text-[#1E3A5F] text-sm leading-snug line-clamp-2">
            {pack.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Headphones className="w-3 h-3 text-[#C8963E]/60" strokeWidth={2} />
            <span className="text-[11px] text-[#1E3A5F]/45 font-medium">
              {pack.audio_count} {pack.audio_count === 1 ? 'audio' : 'audios'}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
