import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { QueryProvider } from '@/components/providers/QueryProvider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Moni',
    default: 'Moni',
  },
  description: 'Moni application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
