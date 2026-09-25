import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Silkscreen } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import './globals.css';

const sans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const pixel = Silkscreen({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-pixel', display: 'swap' });

export const metadata: Metadata = {
  title: 'Cake Kitchen',
  description: 'Order a cake, or build your own like a game. A real bakery in Seoul bakes it.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F5F1' },
    { media: '(prefers-color-scheme: dark)', color: '#17110D' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${pixel.variable}`}>
      <body>
        <Providers>
          <div className="app">
            <Header />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
