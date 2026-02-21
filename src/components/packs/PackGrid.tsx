'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PackCard } from './PackCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { PACK_CATEGORIES, cn } from '@/lib/utils';
import type { Pack } from '@/types';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export function PackGrid() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { token } = useAuthStore();

  const fetchPacks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/packs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPacks(data.packs || []);
      }
    } catch (error) {
      console.error('Error fetching packs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  const filteredPacks = selectedCategory
    ? packs.filter((p) => p.category === selectedCategory)
    : packs;

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-3 pb-28">
        {/* Chip skeletons */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              className="h-9 w-24 rounded-full flex-shrink-0"
            />
          ))}
        </div>
        {/* Card skeletons */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pt-3 pb-28">
      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
        <button
          onClick={() => setSelectedCategory('')}
          className={cn(
            'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0',
            !selectedCategory
              ? 'bg-[#C8963E] text-white shadow-sm shadow-[#C8963E]/25'
              : 'bg-white/60 text-[#1E3A5F]/60 border border-[#1E3A5F]/8 backdrop-blur-sm hover:bg-white/80'
          )}
        >
          Todos
        </button>
        {PACK_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0',
              selectedCategory === cat.value
                ? 'bg-[#C8963E] text-white shadow-sm shadow-[#C8963E]/25'
                : 'bg-white/60 text-[#1E3A5F]/60 border border-[#1E3A5F]/8 backdrop-blur-sm hover:bg-white/80'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredPacks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-[#C8963E]/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-[#C8963E]/50"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z"
              />
            </svg>
          </div>
          <p className="font-serif text-[#1E3A5F] font-bold">
            Sin packs aqui
          </p>
          <p className="text-[#1E3A5F]/40 text-sm mt-1">
            Prueba otra categoria
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          key={selectedCategory}
        >
          {filteredPacks.map((pack) => (
            <motion.div key={pack.id} variants={staggerItem}>
              <PackCard pack={pack} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
