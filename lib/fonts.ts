import { Inter, JetBrains_Mono } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'] });

// Also the ASCII glyph font: next/font renames the family, so pass `mono.style.fontFamily` to the provider.
export const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });
