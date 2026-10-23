'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useStore } from '@/components/Store';
import { feita, notaMinima } from '@/lib/progresso';
import { nota } from '@/lib/format';

const STATUS = { aprovada: 'aprovada', estudando: 'estudando', bloqueada: 'bloqueada', apoio: 'apoio' };

export default function Materias() {
  const st = useStore();
  useEffect(() => { st.setNavOpen(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <header className="page-h">
        <h1>Matérias</h1>
        <p>O núcleo do bacharelado em economia do MIT, na ordem. Cada matéria abre quando você passa na prova final da anterior com {nota(notaMinima(st.cfg))}.</p>
      </header>
      <div className="grid">
        {st.courses.map((c) => {
          const sit = st.situacao[c.id];
          const passos = st.porCurso[c.id] || [];
          const f = passos.filter((s) => feita(s, st.mapas)).length;
          const cur = c.id === st.atual;
          return (
            <Link key={c.id} href={`/trilha/${c.id}`} className={'course' + (cur ? ' cur' : '')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <span className="code">{c.id}</span>
                <span className={'pill' + (cur ? ' now' : sit === 'aprovada' ? ' done' : '')}>{STATUS[sit]}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <h2>{c.titulo}</h2>
                <span className="ver">{c.versao} · Prof. {c.professor}</span>
              </div>
              <div className="chips">{c.tem.map((h) => <span key={h} className="pill">{h}</span>)}</div>
              {c.falta && <span className="miss">Sem {c.falta}</span>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="bar" role="img" aria-label={`${f} de ${passos.length} etapas`}><i style={{ width: `${(f / Math.max(1, passos.length)) * 100}%` }} /></div>
                <span className="ver mono" style={{ fontSize: 12 }}>{f} de {passos.length} etapas</span>
              </div>
              {cur && <span className="btn paper" style={{ alignSelf: 'flex-start' }}>Abrir trilha</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
