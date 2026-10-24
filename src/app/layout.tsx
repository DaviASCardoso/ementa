import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Geist, Geist_Mono, Newsreader } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';

const bricolage = Bricolage_Grotesque({ subsets: ['latin', 'latin-ext'], weight: ['500', '600', '700', '800'], variable: '--font-bricolage' });
const geist = Geist({ subsets: ['latin', 'latin-ext'], variable: '--font-geist' });
const mono = Geist_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-geist-mono' });
const newsreader = Newsreader({ subsets: ['latin', 'latin-ext'], style: ['normal', 'italic'], variable: '--font-newsreader' });

export const metadata: Metadata = {
  title: 'Ementa · economia pelo MIT',
  description: 'Estudo de economia pelo MIT OpenCourseWare',
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: '#12352B' };

// aplica o tema escolhido antes de pintar a página
const TEMA = "try{var t=localStorage.getItem('ementa.tema');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${geist.variable} ${mono.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: TEMA }} /></head>
      <body>{children}</body>
    </html>
  );
}
