import type { ReactNode } from 'react';
import { Noto_Serif, Manrope } from 'next/font/google';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-ellie-serif',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ellie-sans',
});

export default function EllieLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${notoSerif.variable} ${manrope.variable} font-ellie-sans`}>
      {children}
    </div>
  );
}
