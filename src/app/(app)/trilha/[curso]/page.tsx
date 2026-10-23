'use client';

import Link from 'next/link';
import { use, useEffect, useMemo } from 'react';
import { notFound } from 'next/navigation';
import { useStore } from '@/components/Store';
import { Icon, P } from '@/components/icons';
import { feita, notaMinima, proxima, rotuloEtapa } from '@/lib/progresso';
import { mmss, nota } from '@/lib/format';
import type { Step } from '@/lib/types';

const COR = { aula: 'var(--done)', lista: 'var(--list)', prova: 'var(--prova-seg)' };

export default function Trilha({ params }: { params: Promise<{ curso: string }> }) {
  const { curso } = use(params);
  const id = decodeURIComponent(curso);
  const st = useStore();
  const c = st.courses.find((x) => x.id === id);
  const passos = useMemo(() => st.porCurso[id] || [], [st.porCurso, id]);
  const cur = st.atualEtapa(id);

  useEffect(() => { st.setNavOpen(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    // leva a etapa atual para perto do topo ao abrir a trilha
    if (cur) document.getElementById('etapa-' + cur.ordem)?.scrollIntoView({ block: 'center' });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!c) notFound();
  const sit = st.situacao[id];
  const feitas = passos.filter((s) => feita(s, st.mapas)).length;
  const notasListas = passos.filter((s) => s.tipo === 'lista').map((s) => st.mapas.submissions[s.id]?.nota).filter((n): n is number => n != null);
  const media = notasListas.length ? notasListas.reduce((a, b) => a + b, 0) / notasListas.length : null;
  const prox = proxima(st.courses, id);
  const min = nota(notaMinima(st.cfg));

  return (
    <div className="page" style={{ maxWidth: 1180, gap: 28 }}>
      <header className="trail-h">
        <span className="hero">{c.id}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 6, flex: '1 1 280px' }}>
          <h1>{c.titulo}</h1>
          <span className="muted">{c.versao} · Prof. {c.professor} · <a href={c.base} target="_blank" rel="noreferrer">página no MIT OCW</a></span>
        </div>
      </header>
      {sit === 'bloqueada' && <p className="notice warn" style={{ margin: 0 }}>Esta matéria abre quando você passar na prova final da anterior com {min}. Você pode olhar tudo, mas o foco agora é outra.</p>}
      {c.aviso && <p className="notice" style={{ margin: 0 }}>{c.aviso}</p>}

      <div className="trail-wrap">
        <ol className="trail" aria-label="Etapas na ordem de estudo">
          {passos.map((s, i) => (
            <Etapa key={s.id} s={s} grupo={s.grupo && s.grupo !== passos[i - 1]?.grupo ? s.grupo : null}
              done={feita(s, st.mapas)} isCur={cur?.id === s.id} libera={s.final && prox ? `${min} libera a ${prox.id}` : s.final ? `${min} conclui a matéria` : null} />
          ))}
        </ol>

        <aside className="side">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="caption">Progresso na matéria</span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span className="big">{feitas}</span><span className="faint">de {passos.length} etapas</span></span>
            <div className="bigsegs" role="img" aria-label={`${feitas} de ${passos.length} etapas concluídas`} style={{ gap: passos.length > 60 ? 1 : 3 }}>
              {passos.map((s) => <span key={s.id} style={{ height: passos.length > 60 ? 14 : 22, background: feita(s, st.mapas) ? COR[s.tipo] : s.id === cur?.id ? 'var(--now)' : undefined }} />)}
            </div>
            <div className="legend"><span><i style={{ background: COR.aula }} />aula</span><span><i style={{ background: COR.lista }} />lista</span><span><i style={{ background: COR.prova }} />prova</span></div>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="caption">Média nas listas</span>
            <span className="big" style={{ color: media == null ? 'var(--faint)' : media >= notaMinima(st.cfg) ? 'var(--done-ink)' : 'var(--now)', lineHeight: 1.1 }}>{media == null ? '—' : nota(media)}</span>
            <span className="muted" style={{ fontSize: 13 }}>
              {passos.some((s) => s.final) ? `Na prova final, ${min} ou mais ${prox ? 'libera a ' + prox.id : 'conclui a matéria'}.` : 'Esta matéria não tem prova final.'}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Etapa({ s, grupo, done, isCur, libera }: { s: Step; grupo: string | null; done: boolean; isCur: boolean; libera: string | null }) {
  const st = useStore();
  const href = `/etapa/${s.id}`;
  const cls = (k: string) => ['step', k, done ? 'done' : '', isCur ? 'cur' : '', s.opcional ? 'opt' : ''].join(' ');
  const sub = st.mapas.submissions[s.id];
  const pos = st.mapas.progress[s.id]?.posicao || 0;

  return (
    <li id={'etapa-' + s.ordem}>
      {grupo && <div className="grp">{grupo}</div>}
      {s.tipo === 'aula' && (
        <Link href={href} className={cls('')}>
          <span className={'node' + (isCur ? ' now-dot' : '')}>{done && <Icon d={P.check} size={14} sw={3} />}</span>
          <span className="txt">
            <span className="eb">{rotuloEtapa(s)}{done ? ' · feita' : ''}{s.revisao && s.n && !/^R/.test(s.n) ? ' · revisão' : ''}{s.opcional ? ' · opcional' : ''}{!s.videos.length ? ' · leitura' : ''}</span>
            <span className="step-t">{s.titulo}</span>
          </span>
          {isCur && (
            <span className="btn now go"><Icon d={P.play} size={12} fill />{pos > 5 ? `Continuar em ${mmss(pos)}` : 'Começar'}</span>
          )}
        </Link>
      )}
      {s.tipo === 'lista' && (
        <Link href={href} className={cls('lst')}>
          <span className="qnode"><Icon d={done ? P.check : P.list} size={14} sw={2.2} /></span>
          <span className="lcard">
            <span style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
              <span className="k">Lista de exercícios{s.sugestao ? ' · posição sugerida' : ''}</span>
              <span className="t step-t">{s.titulo}</span>
            </span>
            {done ? <span className="pill done">nota {nota(sub?.nota)}</span>
              : sub?.entregue_em ? <span className="pill warn">falta a nota</span>
              : <span className="pill list">{s.arquivos.some((a) => a.papel === 'gabarito') ? 'gabarito oficial' : 'sem gabarito'}</span>}
          </span>
        </Link>
      )}
      {s.tipo === 'prova' && (
        <Link href={href} className={cls('prv')}>
          <span className="qnode"><Icon d={done ? P.check : P.exam} size={18} sw={2} /></span>
          <span className={'pband' + (s.treino ? ' treino' : '')}>
            <span style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="t step-t">{s.titulo}</span>
              <span className="s">{s.sub}</span>
            </span>
            <span className="o">{done ? `nota ${nota(sub?.nota)}` : libera || (s.treino ? 'treino' : 'treino para a final')}</span>
          </span>
        </Link>
      )}
    </li>
  );
}
