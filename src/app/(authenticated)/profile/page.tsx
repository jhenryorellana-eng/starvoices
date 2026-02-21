'use client';

import { useAuth } from '@/hooks/use-auth';
import { useSuperAppBridge } from '@/hooks/use-super-app-bridge';
import {
  Users,
  Smartphone,
  LogOut,
  ChevronLeft,
  Shield,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { isInWebView, requestClose } = useSuperAppBridge();

  if (!user) return null;

  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#F4F4F1]">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 blur-nav border-b border-[#C8963E]/10">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="font-serif text-xl font-bold text-[#1E3A5F]">
            Mi Perfil
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 pb-28 space-y-5">
        {/* Avatar & identity card */}
        <div className="relative rounded-2xl bg-white/70 backdrop-blur-sm border border-[#1E3A5F]/[0.06] shadow-sm shadow-black/[0.03] p-6 text-center">
          {/* Gradient ring avatar */}
          <div className="relative w-22 h-22 mx-auto mb-4">
            <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-[#C8963E] to-[#B8453A] p-[3px]">
              <div className="w-full h-full rounded-full bg-[#F4F4F1] flex items-center justify-center">
                <span className="text-2xl font-bold bg-gradient-to-br from-[#C8963E] to-[#B8453A] bg-clip-text text-transparent">
                  {initials}
                </span>
              </div>
            </div>
          </div>

          {/* Name */}
          <h2 className="font-serif text-2xl font-bold text-[#1E3A5F]">
            {user.firstName} {user.lastName}
          </h2>

          {/* Email */}
          {user.email && (
            <p className="text-sm text-[#1E3A5F]/40 mt-1">{user.email}</p>
          )}

          {/* Code badge - Utah desert style */}
          <div className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 rounded-full bg-[#C8963E]/10 border border-[#C8963E]/20">
            <Shield className="w-3 h-3 text-[#C8963E]" strokeWidth={2} />
            <span className="text-xs font-bold text-[#C8963E] tracking-wider">
              {user.code}
            </span>
          </div>
        </div>

        {/* Info cards */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#1E3A5F]/[0.06] shadow-sm shadow-black/[0.03] overflow-hidden">
          {/* Familia */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A5F]/[0.06] flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-[#1E3A5F]/50" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#1E3A5F]/40 font-medium uppercase tracking-wider">
                Familia
              </p>
              <p className="text-sm font-semibold text-[#1E3A5F] truncate">
                {user.familyId}
              </p>
            </div>
          </div>

          <div className="h-px bg-[#1E3A5F]/[0.04] mx-4" />

          {/* Mini App */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#C8963E]/[0.08] flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4 text-[#C8963E]/70" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#1E3A5F]/40 font-medium uppercase tracking-wider">
                Mini App
              </p>
              <p className="text-sm font-semibold text-[#1E3A5F]">
                StarVoices
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#B8453A]/8 hover:bg-[#B8453A]/14 text-[#B8453A] rounded-2xl font-semibold text-sm transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
            Cerrar sesion
          </button>

          {isInWebView && (
            <button
              onClick={requestClose}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1E3A5F]/[0.05] hover:bg-[#1E3A5F]/[0.08] text-[#1E3A5F]/60 rounded-2xl font-medium text-sm transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              Volver a Padres 3.0
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
