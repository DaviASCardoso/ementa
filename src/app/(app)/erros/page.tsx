'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useStore } from '@/components/Store';
import { BotaoApagar } from '@/components/comum';
import { hoje, relativo, somarDias } from '@/lib/format';

export default function Erros() {
  const st = useStore();
  useEffect(() => { st.setNavOpen(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [aberto, setAberto] = useState<string | null>(null);
  const [verResolvidos, setVerResolvidos] = useState(false);
  const redo = parseInt(st.cfg.redo) || 7;
  const pendentes = st.mistakes.filter((m) => !m.resolvido).sort((a, b) => a.vence.localeCompare(b.vence));
  const resolvidos = st.mistakes.filter((m) => m.resolvido);
  const dia = hoje();

  return (
    <div className="page" style={{ maxWidth: 860, gap: 18 }}>
      <header className="page-h">
        <h1>Caderno de erros</h1>
        <p>O que você errou em listas e provas volta para refazer em {redo} dias, e sai daqui quando você acerta sem consultar. Cada erro também vira uma ficha na revisão.</p>
      </header>
      {pendentes.length === 0 && <div className="card empty">Nada para refazer. Erros que você registrar ao corrigir listas e provas aparecem aqui.</div>}
      {pendentes.map((m) => {
        const s = m.step_id ? st.step(m.step_id) : null;
        const vencido = m.vence <= dia;
        return (
          <article key={m.id} className="err">
            <span className={'pill' + (vencido ? ' warn' : '')} style={{ fontSize: 13, padding: '4px 12px' }}>{vencido ? (m.vence === dia ? 'hoje' : relativo(m.vence).replace('atrasada', 'atrasado')) : relativo(m.vence).replace('para ', '')}</span>
            <span className="w">
              <span className="src">{s ? `${s.course_id} · ` : ''}{m.origem}</span>
              <span style={{ fontSize: 16 }}>{m.descricao}</span>
            </span>
            {aberto === m.id ? (
              <span style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flexBasis: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
                {s && <Link href={`/etapa/${s.id}`} className="btn soft sm">Abrir {s.tipo === 'prova' ? 'a prova' : 'a lista'}</Link>}
                <button className="btn ghost" onClick={() => { st.upsertMistake({ ...m, vence: somarDias(dia, redo) }); setAberto(null); }}>Errei de novo</button>
                <button className="btn forest" onClick={() => { st.upsertMistake({ ...m, resolvido: true }); setAberto(null); }}>Acertei sem consultar</button>
              </span>
            ) : (
              <button className="btn ghost" onClick={() => setAberto(m.id)}>Refazer</button>
            )}
          </article>
        );
      })}
      {resolvidos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn soft" style={{ alignSelf: 'flex-start' }} onClick={() => setVerResolvidos(!verResolvidos)} aria-expanded={verResolvidos}>
            {verResolvidos ? 'Esconder' : 'Ver'} {resolvidos.length} {resolvidos.length === 1 ? 'erro resolvido' : 'erros resolvidos'}
          </button>
          {verResolvidos && resolvidos.map((m) => (
            <article key={m.id} className="err" style={{ opacity: 0.85 }}>
              <span className="pill done">resolvido</span>
              <span className="w"><span className="src">{m.origem}</span><span>{m.descricao}</span></span>
              <button className="btn soft sm" onClick={() => st.upsertMistake({ ...m, resolvido: false, vence: dia })}>Voltar para a fila</button>
              <BotaoApagar rotulo="Apagar erro" onConfirm={() => st.deleteMistake(m.id)} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
