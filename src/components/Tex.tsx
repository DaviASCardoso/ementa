'use client';

import { memo } from 'react';
import katex from 'katex';
import { urlImagem, type Parte } from '@/lib/questoes';

// Texto com fórmulas entre $...$ e $$...$$ (KaTeX); \$ é cifrão literal; *x* vira itálico
function render(tex: string, display: boolean) {
  try {
    return katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore' });
  } catch {
    return tex;
  }
}

function escapar(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\\\$/g, '$').replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
}

export function texParaHtml(texto: string) {
  let html = '';
  const re = /(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$|(?<!\\)\$([^$]+?)(?<!\\)\$/g;
  let ult = 0;
  for (const m of texto.matchAll(re)) {
    html += escapar(texto.slice(ult, m.index));
    html += m[1] != null ? render(m[1], true) : render(m[2], false);
    ult = m.index! + m[0].length;
  }
  return html + escapar(texto.slice(ult));
}

export const Tex = memo(function Tex({ texto, como = 'span', className }: { texto: string; como?: 'span' | 'p' | 'div'; className?: string }) {
  const Tag = como;
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: texParaHtml(texto) }} />;
});

export function Partes({ partes, sid }: { partes?: Parte[]; sid: string }) {
  if (!partes?.length) return null;
  return (
    <div className="tx">
      {partes.map((p, i) => p.img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={urlImagem(sid, p.img)} alt="Figura do enunciado" loading="lazy"
          style={{ maxWidth: Math.min(640, (p.w || 400) * 1.4), width: '100%' }} />
      ) : (
        <Tex key={i} texto={p.p || ''} como={p.display ? 'div' : 'p'} className={p.display ? 'tx-d' : undefined} />
      ))}
    </div>
  );
}
