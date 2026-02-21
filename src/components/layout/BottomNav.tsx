'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Headphones, Compass, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/',
    label: 'Feed',
    icon: Headphones,
  },
  {
    href: '/packs',
    label: 'Explorar',
    icon: Compass,
  },
  {
    href: '/favorites',
    label: 'Favoritos',
    icon: Heart,
  },
  {
    href: '/profile',
    label: 'Perfil',
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/favorites') return pathname === '/favorites';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'border-t border-white/10',
        'bg-[#F4F4F1]/80 backdrop-blur-xl backdrop-saturate-150',
        'supports-[backdrop-filter]:bg-[#F4F4F1]/70'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-1 px-5 py-1.5',
                'transition-colors duration-200',
                active ? 'text-[#C8963E]' : 'text-[#1E3A5F]/40'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-all duration-200',
                  active && 'scale-110'
                )}
                strokeWidth={active ? 2.2 : 1.8}
              />

              <span
                className={cn(
                  'text-[10px] tracking-wide transition-colors duration-200',
                  active ? 'font-semibold text-[#C8963E]' : 'font-medium'
                )}
              >
                {item.label}
              </span>

              {active && (
                <motion.span
                  layoutId="bottomnav-indicator"
                  className="absolute -bottom-0.5 h-[3px] w-5 rounded-full bg-[#C8963E]"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
