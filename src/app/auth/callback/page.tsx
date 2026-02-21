'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  useEffect(() => {
    if (errorParam) {
      setError(errorParam === 'session_expired' ? 'Tu sesion ha expirado' : errorParam);
      setIsLoading(false);
      return;
    }

    if (!code) {
      if (isLocalhost) {
        setError(null);
        setIsLoading(false);
      } else {
        setError('Abre StarVoices desde Padres 3.0');
        setIsLoading(false);
      }
      return;
    }

    // Exchange code
    const exchange = async () => {
      try {
        const res = await fetch('/api/auth/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Error de autenticacion');
        }

        const { token, user } = await res.json();
        setAuth(token, user);
        router.replace('/');
      } catch (err: any) {
        setError(err.message || 'Error al autenticar');
        setIsLoading(false);
      }
    };

    exchange();
  }, [code, errorParam, isLocalhost, setAuth, router]);

  const handleDevLogin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/dev-login', { method: 'POST' });
      if (!res.ok) throw new Error('Error en dev login');
      const { token, user } = await res.json();
      setAuth(token, user);
      router.replace('/');
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'CLOSE' }));
    }
  };

  if (isLoading && code) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="premium-spinner w-12 h-12 mx-auto" />
          <p className="mt-4 text-dark-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-6">
      <div className="glass-card rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-soft-black mb-2">StarVoices</h1>

        {error && (
          <p className="text-utah-red mb-4 text-sm">{error}</p>
        )}

        {!error && !isLocalhost && (
          <p className="text-dark-400 text-sm mb-4">
            Abre StarVoices desde la app Padres 3.0
          </p>
        )}

        {isLocalhost && (
          <div className="space-y-3 mt-4">
            <button
              onClick={handleDevLogin}
              className="btn-utah-gradient w-full py-3 rounded-xl text-white font-semibold"
            >
              <span>Entrar en modo desarrollo</span>
            </button>
            <p className="text-xs text-dark-300">
              Solo disponible en localhost
            </p>
          </div>
        )}

        {error && (
          <button
            onClick={handleClose}
            className="mt-4 text-sm text-primary font-medium"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background-light flex items-center justify-center">
          <div className="premium-spinner w-12 h-12" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
