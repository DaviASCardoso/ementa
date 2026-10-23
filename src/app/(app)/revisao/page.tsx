'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/components/Store';
import { BotaoApagar } from '@/components/comum';
import { aplicar, proxima, type Nota } from '@/lib/srs';
import { emDias, hoje, relativo } from '@/lib/format';
import type { Card } from '@/lib/types';

const NOTAS: [Nota, string, string, string][] = [
  ['errei', 'Errei', 'var(--now-soft)', 'var(--now-text)'],
  ['dificil', 'Difícil', 'var(--surface)', 'var(--ink-2)'],
  ['bom', 'Bom', 'var(--done-soft)', 'var(--done-text)'],
  ['facil', 'Fácil', 'var(--list-soft)', 'var(--list-text)'],
];

export default function Revisao() {
  const st = useStore();
  useEffect(() => { st.setNavOpen(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const dia = hoje();

  // monta a fila uma vez por sessão: vencidas + novas (até o limite diário)
  const [fila, setFila] = useState<string[]>(() => montarFila(st.cards, st.cfg.newCards, st.cfg.perSession, dia));
  const [pos, setPos] = useState(0);
  const [virada, setVirada] = useState(false);
  const [digitado, setDigitado] = useState('');
  const total = fila.length;
  const card = st.cards.find((c) => c.id === fila[pos]);

  const responder = (n: Nota) => {
    if (!card) return;
    st.upsertCard(aplicar(card, n));
    // "errei" volta para o fim da fila de hoje
    if (n === 'errei') setFila((f) => [...f, card.id]);
    setPos((p) => p + 1); setVirada(false); setDigitado('');
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (!virada && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); setVirada(true); }
      if (virada && ['1', '2', '3', '4'].includes(e.key)) responder(NOTAS[Number(e.key) - 1][0]);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const proximaData = useMemo(() => st.cards.map((c) => c.vence).filter((v) => v > dia).sort()[0], [st.cards, dia]);
  const origem = (c: Card) => {
    const s = c.step_id ? st.step(c.step_id) : null;
    return s ? `${s.course_id} · ${s.tipo === 'aula' && s.n ? 'aula ' + s.n : s.titulo} · ${s.tipo === 'aula' ? s.titulo : ''}`.replace(/ · $/, '') : 'ficha avulsa';
  };

  return (
    <div className="page rev">
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, paddingTop: 16 }}>
        <h1 className="display" style={{ margin: 0, fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>Revisão</h1>
        {card && <span className="mono muted" style={{ fontSize: 14 }}>{Math.min(pos + 1, total)} de {total}</span>}
      </header>

      {card ? (
        <>
          <div className="rv-bar"><i style={{ width: `${(pos / Math.max(1, total)) * 100}%` }} /></div>
          <article className="rv-card">
            <div className="top"><span>{origem(card)}</span><span>{card.repeticoes === 0 && !card.revisada_em ? 'nova' : relativo(card.vence)}</span></div>
            <div className="mid">
              <p className="fr">{card.frente}</p>
              {st.cfg.typing && !virada && (
                <>
                  <label htmlFor="digitado" className="sr">Sua resposta</label>
                  <textarea id="digitado" className="field" rows={3} placeholder="Escreva sua resposta antes de virar" value={digitado} onChange={(e) => setDigitado(e.target.value)} />
                </>
              )}
              {virada && (
                <>
                  {st.cfg.typing && digitado.trim() && <p className="vs" style={{ color: 'var(--muted)' }}><span className="caption">Você escreveu: </span>{digitado}</p>}
                  <p className="vs">{card.verso}</p>
                </>
              )}
            </div>
          </article>
          {!virada ? (
            <button className="btn forest" style={{ minHeight: 52, fontSize: 15 }} onClick={() => setVirada(true)}>Mostrar resposta</button>
          ) : (
            <div className="grades">
              {NOTAS.map(([n, l, bg, fg], i) => (
                <button key={n} onClick={() => responder(n)} style={{ background: bg, color: fg }} title={`Tecla ${i + 1}`}>
                  <b style={{ fontWeight: 600 }}>{l}</b><span>{emDias(proxima(card, n).intervalo)}</span>
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span className="caption">Espaço mostra a resposta; 1 a 4 escolhem a nota.</span>
            <BotaoApagar rotulo="Apagar esta ficha" texto="Apagar ficha" onConfirm={() => { st.deleteCard(card.id); setFila((f) => f.filter((x) => x !== card.id)); setVirada(false); }} />
          </div>
        </>
      ) : (
        <div className="card empty">
          <p style={{ margin: '0 0 6px', fontFamily: 'var(--f-read)', fontSize: 22, color: 'var(--ink)' }}>
            {total ? 'Revisão de hoje feita.' : st.cards.length ? 'Nenhuma ficha para hoje.' : 'Você ainda não tem fichas.'}
          </p>
          <p style={{ margin: 0 }}>
            {st.cards.length ? (proximaData ? `A próxima vence ${relativo(proximaData).replace('para ', '')}.` : '') : 'Crie fichas na aba Fichas de cada aula, ou selecione um trecho do caderno e use “Virar ficha”.'}
          </p>
          {total > 0 && <button className="btn ghost" style={{ marginTop: 16 }} onClick={() => { setFila(montarFila(st.cards, st.cfg.newCards, st.cfg.perSession, hoje())); setPos(0); }}>Ver se há mais</button>}
          {!st.cards.length && st.atual && <p style={{ marginTop: 16 }}><Link href={`/trilha/${st.atual}`}>Ir para a trilha</Link></p>}
        </div>
      )}
      <p className="caption" style={{ margin: 0 }}>{st.cards.length} fichas no total · {st.cards.filter((c) => c.vence <= dia).length} para hoje</p>
    </div>
  );
}

function montarFila(cards: Card[], novasDia: string, porSessao: string, dia: string) {
  const vencidas = cards.filter((c) => c.vence <= dia && (c.repeticoes > 0 || c.revisada_em)).sort((a, b) => a.vence.localeCompare(b.vence));
  const novasHoje = cards.filter((c) => c.revisada_em && c.revisada_em.slice(0, 10) === dia && c.repeticoes <= 1 && c.lapsos === 0).length;
  const limiteNovas = novasDia === 'Sem limite' ? Infinity : Math.max(0, parseInt(novasDia) - novasHoje);
  const novas = cards.filter((c) => c.repeticoes === 0 && !c.revisada_em).sort((a, b) => a.criada_em.localeCompare(b.criada_em)).slice(0, limiteNovas);
  const limite = porSessao === 'Todas' ? Infinity : parseInt(porSessao);
  return [...vencidas, ...novas].slice(0, limite).map((c) => c.id);
}
