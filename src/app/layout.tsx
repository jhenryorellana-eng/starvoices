import type { Metadata, Viewport } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1E3A5F',
};

export const metadata: Metadata = {
  title: 'StarVoices',
  description: 'Audios de apoyo para padres - Entiende a la nueva generacion',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-72x72.png',
    shortcut: '/icons/icon-72x72.png',
    apple: '/icons/icon-72x72.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StarVoices',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${dmSerif.variable} font-sans antialiased bg-background-light text-soft-black`}>
        {children}
      </body>
    </html>
  );
}