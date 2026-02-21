'use client';

import { PackGrid } from '@/components/packs/PackGrid';

export default function PacksPage() {
  return (
    <div>
      {/* Sticky blur-nav header */}
      <div className="sticky top-0 z-40 blur-nav border-b border-[#C8963E]/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="font-serif text-xl font-bold text-[#1E3A5F]">
            Explorar
          </h1>
          <p className="text-xs text-[#1E3A5F]/45 mt-0.5 tracking-wide">
            Descubre packs tematicos
          </p>
        </div>
      </div>

      <PackGrid />
    </div>
  );
}
