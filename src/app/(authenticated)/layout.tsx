'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { BottomNav } from '@/components/layout/BottomNav';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, loadFromStorage, token } = useAuthStore();
  const notificationsSentRef = useRef(false);

  const shouldHideNav = pathname.startsWith('/packs/') && pathname !== '/packs';
  const isFullscreenFeed = pathname === '/';

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/callback?error=session_expired');
    }
  }, [isLoading, isAuthenticated, router]);

  // Enviar notificaciones pendientes al super app via WebView bridge
  useEffect(() => {
    if (!isAuthenticated || !token || notificationsSentRef.current) return;
    if (typeof window === 'undefined' || !(window as any).ReactNativeWebView) return;

    notificationsSentRef.current = true;

    async function sendPendingNotifications() {
      try {
        const res = await fetch('/api/notifications', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) return;

        const { notifications } = await res.json();
        if (!notifications || notifications.length === 0) return;

        for (const notif of notifications) {
          (window as any).ReactNativeWebView.postMessage(JSON.stringify({
            type: 'NOTIFICATION',
            payload: {
              title: notif.title,
              message: notif.message,
              miniAppId: 'starvoices',
            },
          }));
        }

        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notificationIds: notifications.map((n: any) => n.id),
          }),
        });
      } catch (err) {
        console.error('Error sending notifications:', err);
      }
    }

    sendPendingNotifications();
  }, [isAuthenticated, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F4F1] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#C8963E]/15" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#C8963E] animate-spin" />
          </div>
          <p className="mt-4 text-[#1E3A5F]/40 text-sm tracking-wide">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={isFullscreenFeed ? 'h-screen bg-[#0A0F1C] overflow-hidden' : 'min-h-screen bg-[#F4F4F1]'}>
      <main>{children}</main>
      {!shouldHideNav && <BottomNav />}
    </div>
  );
}
