import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { inter, mono } from '@/lib/fonts';

// Off Vercel, Next can't infer the origin, so absolute OG URLs need it spelled out.
export const metadata: Metadata = {
  metadataBase: new URL('https://dotgrain.space'),
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${inter.className} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
