import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Silkscreen } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], axes: ['opsz'], variable: '--font-display', display: 'swap' });
const pixel = Silkscreen({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-pixel', display: 'swap' });

export const metadata: Metadata = {
  title: 'Cake Kitchen',
  description: 'Build your cake like a game. A real bakery in Seoul bakes it.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF0F1' },
    { media: '(prefers-color-scheme: dark)', color: '#1B1110' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${pixel.variable}`}>
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
