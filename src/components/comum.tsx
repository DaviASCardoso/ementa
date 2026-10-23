'use client';

import Link from 'next/link';
import { useState } from 'react';
import { novoId, useStore } from './Store';
import { Icon, P } from './icons';
import type { Arquivo, Card, Step } from '@/lib/types';
import { hoje } from '@/lib/format';
import { rotuloEtapa } from '@/lib/progresso';

// Barra do topo das telas de etapa: voltar à trilha, título, anterior e próxima
export function Topo({ s, extra }: { s: Step; extra?: React.ReactNode }) {
  const st = useStore();
  const passos = st.porCurso[s.course_id] || [];
  const i = passos.findIndex((x) => x.id === s.id);
  const ant = passos[i - 1], prox = passos[i + 1];
  const curto = (t: string) => (t.length > 28 ? t.slice(0, 26) + '…' : t);
  return (
    <div className="bar-top">
      <Link href={`/trilha/${s.course_id}`} className="btn soft"><Icon d={P.left} size={16} sw={2} />Trilha</Link>
      <span className="ttl">
        <span className="mono faint" style={{ fontSize: 13 }}>{s.course_id}{s.tipo === 'aula' ? ` · ${rotuloEtapa(s)}` : ''}</span>
        <h1>{s.titulo}</h1>
      </span>
      {extra}
      {ant && <Link href={`/etapa/${ant.id}`} className="btn soft icon" aria-label={`Etapa anterior: ${ant.titulo}`} title={`Anterior: ${ant.titulo}`}><Icon d={P.left} size={16} sw={2} /></Link>}
      {prox && <Link href={`/etapa/${prox.id}`} className="btn soft" title={prox.titulo}>Próxima: {curto(prox.titulo)}<Icon d={P.right} size={16} sw={2} /></Link>}
    </div>
  );
}

export function Arquivos({ lista, pagina }: { lista: Arquivo[]; pagina?: string | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {lista.map((a) => (
        <a key={a.url + a.rotulo} className="file" href={a.url} target="_blank" rel="noreferrer">
          <span className="ic">{/\.pdf$/i.test(a.url) ? 'PDF' : 'OCW'}</span>
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span className="n">{a.rotulo}</span>
            <span className="m">{a.papel === 'gabarito' ? 'Gabarito · MIT OCW' : a.papel === 'dados' ? 'Dados · MIT OCW' : 'MIT OCW'}</span>
          </span>
          <span className="a">Abrir</span>
        </a>
      ))}
      {pagina && (
        <a className="file" href={pagina} target="_blank" rel="noreferrer">
          <span className="ic">OCW</span>
          <span style={{ display: 'flex', flexDirection: 'column' }}><span className="n">Página original</span><span className="m">MIT OpenCourseWare</span></span>
          <span className="a">Abrir</span>
        </a>
      )}
    </div>
  );
}

// Fichas de uma etapa, com o formulário de criar
export function FichasDaEtapa({ s, frente, setFrente }: { s: Step; frente: string; setFrente: (v: string) => void }) {
  const st = useStore();
  const [verso, setVerso] = useState('');
  const minhas = st.cards.filter((c) => c.step_id === s.id);
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frente.trim() || !verso.trim()) return;
    const c: Card = { id: novoId(), step_id: s.id, frente: frente.trim(), verso: verso.trim(), criada_em: new Date().toISOString(),
      vence: hoje(), intervalo: 0, facilidade: 2.5, repeticoes: 0, lapsos: 0, revisada_em: null };
    st.upsertCard(c);
    setFrente(''); setVerso('');
  };
  return (
    <div className="fichas">
      {minhas.map((c) => (
        <div key={c.id} className="ficha">
          <span className="f">{c.frente}</span>
          <span className="v">{c.verso}</span>
          <span className="acts"><BotaoApagar onConfirm={() => st.deleteCard(c.id)} rotulo="Apagar ficha" /></span>
        </div>
      ))}
      <form className="newcard" onSubmit={add}>
        <label htmlFor="f-frente">Frente</label>
        <textarea id="f-frente" className="field" rows={2} placeholder="Pergunta" value={frente} onChange={(e) => setFrente(e.target.value)} />
        <label htmlFor="f-verso">Verso</label>
        <textarea id="f-verso" className="field" rows={2} placeholder="Resposta" value={verso} onChange={(e) => setVerso(e.target.value)} />
        <button className="btn forest" style={{ alignSelf: 'flex-end' }} disabled={!frente.trim() || !verso.trim()}>Adicionar ficha</button>
      </form>
    </div>
  );
}

// Ação destrutiva: pede um segundo toque
export function BotaoApagar({ onConfirm, rotulo, texto }: { onConfirm: () => void; rotulo: string; texto?: string }) {
  const [armado, setArmado] = useState(false);
  return (
    <button type="button" className={'btn sm ' + (armado ? 'danger' : 'soft')} aria-label={armado ? 'Toque de novo para apagar' : rotulo} title={rotulo}
      onClick={() => (armado ? onConfirm() : (setArmado(true), setTimeout(() => setArmado(false), 3000)))}>
      {armado ? 'Toque de novo para apagar' : texto ?? <Icon d={P.trash} size={15} />}
    </button>
  );
}

export function Seg({ label, opts, value, onPick, mono }: { label: string; opts: string[]; value: string; onPick: (v: string) => void; mono?: boolean }) {
  return (
    <span role="radiogroup" aria-label={label} className={'seg' + (mono ? ' mono' : '')}>
      {opts.map((o) => <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onPick(o)}>{o}</button>)}
    </span>
  );
}

export function Salvo() {
  const { salvo } = useStore();
  if (salvo === 'erro') return <span role="status" style={{ fontSize: 12, color: 'var(--danger-text)' }}>não salvou · confira a conexão</span>;
  return (
    <span role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: salvo === 'ok' ? 'var(--done-ink)' : 'var(--faint)' }}>
      {salvo === 'ok' && <Icon d={P.check} size={13} sw={2.4} />}{salvo === 'ok' ? 'salvo' : 'salvando…'}
    </span>
  );
}
