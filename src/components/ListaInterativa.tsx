'use client';

import { useEffect, useMemo, useState } from 'react';
import { novoId, useStore } from './Store';
import { Topo } from './comum';
import { Icon, P } from './icons';
import { QuestaoView } from './Questao';
import { hoje, lerNota, nota, somarDias } from '@/lib/format';
import { lerChave } from '@/lib/chave';
import {
  respondiveis, solucaoRespondivel, textoPartes, textoRespondivel,
  type EtapaQuestoes, type Respondivel,
} from '@/lib/questoes';
import type { Avaliacao, Card, Mistake, Resposta, Step, Submission } from '@/lib/types';

const PESO: Record<Avaliacao, number> = { certo: 1, parcial: 0.5, errado: 0 };

export function ListaInterativa({ s, eq }: { s: Step; eq: EtapaQuestoes }) {
  const st = useStore();
  const salvo = st.mapas.submissions[s.id];
  const [sub, setSub] = useState<Submission>(() => salvo ?? { step_id: s.id, respostas: [], entregue_em: null, nota: null, correcao: null });
  const entregue = !!sub.entregue_em;
  const prova = s.tipo === 'prova';
  const travar = prova && !entregue && st.cfg.lockdown;
  const nome = prova ? 'prova' : 'lista';
  const [aba, setAba] = useState<'questoes' | 'pdf'>('questoes');
  const itens = useMemo(() => respondiveis(eq), [eq]);
  const porChave = useMemo(() => new Map(sub.respostas.map((r) => [r.q, r])), [sub.respostas]);

  useEffect(() => { st.setNavOpen(!travar); st.setTravado(travar); return () => { st.setTravado(false); st.setNavOpen(true); }; }, [travar]); // eslint-disable-line react-hooks/exhaustive-deps

  // links do banco de questões chegam com #q-<k>
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
  }, []);

  const gravar = (novo: Submission, imediato = false) => { setSub(novo); st.saveSubmission(novo, imediato); };

  // nota pela autocorreção: certo 1, em parte 0,5, errei 0, sobre todos os itens
  const notaAuto = (rs: Resposta[]) => {
    const m = new Map(rs.map((r) => [r.q, r]));
    if (!itens.every((i) => m.get(i.chave)?.avaliacao)) return null;
    const soma = itens.reduce((a, i) => a + PESO[m.get(i.chave)!.avaliacao!], 0);
    return Math.round((soma / itens.length) * 100) / 10;
  };

  const setResposta = (chave: string, r: Partial<Resposta>) => {
    const atual = porChave.get(chave);
    const respostas = atual
      ? sub.respostas.map((x) => (x.q === chave ? { ...x, ...r } : x))
      : [...sub.respostas, { q: chave, texto: '', ...r }];
    const novo = { ...sub, respostas };
    if ('avaliacao' in r) {
      const n = notaAuto(respostas);
      gravar(n == null ? novo : { ...novo, nota: n }, true);
    } else gravar(novo);
  };

  const respondidas = itens.filter((i) => { const r = porChave.get(i.chave); return r && (r.texto.trim() || r.escolha); }).length;
  const avaliadas = itens.filter((i) => porChave.get(i.chave)?.avaliacao).length;

  const docs = s.arquivos.filter((a) => /\.pdf$/i.test(a.url) && (a.papel === 'enunciado' || (a.papel === 'gabarito' && (entregue || !st.cfg.hideKey)) || a.papel === 'material'));
  const [doc, setDoc] = useState(0);
  const atualDoc = docs[Math.min(doc, docs.length - 1)];
  const curso = st.courses.find((c) => c.id === s.course_id)!;
  const ordem = st.courses.filter((c) => !c.alternativa);
  const libera = s.final ? ordem[ordem.findIndex((c) => c.id === curso.id) + 1]?.id ?? null : null;

  return (
    <div className="page" style={{ maxWidth: 980, gap: 16, padding: '0 0 120px' }}>
      <Topo s={s} />
      {travar && <p className="notice warn" style={{ margin: 0 }}>Prova sem consulta: o menu, o caderno e as fichas ficam escondidos até você entregar.</p>}
      {s.sub && <p className="caption" style={{ margin: 0 }}>{s.sub}{s.sugestao ? ' · posição na trilha sugerida' : ''}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={aba === 'questoes'} onClick={() => setAba('questoes')}>Questões</button>
          {docs.length > 0 && <button role="tab" aria-selected={aba === 'pdf'} onClick={() => setAba('pdf')}>PDF original</button>}
        </div>
        <span className="caption">{eq.questoes.length} questões · {itens.length} itens</span>
      </div>

      {entregue && (
        <Resumo s={s} sub={sub} gravar={gravar} itens={itens} porChave={porChave} avaliadas={avaliadas} nome={nome} libera={libera} />
      )}

      {aba === 'pdf' && atualDoc ? (
        <section className="doc" aria-label="PDF original">
          <div className="hd">
            {docs.length > 1 ? (
              <div className="tabs" role="tablist">{docs.map((a, i) => <button key={a.url} role="tab" aria-selected={a === atualDoc} onClick={() => setDoc(i)}>{a.rotulo}</button>)}</div>
            ) : <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{atualDoc.rotulo}</span>}
            <a href={atualDoc.url} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600 }}>Abrir em nova aba</a>
          </div>
          {s.gabarito_junto && !entregue && <p className="notice" style={{ margin: 10 }}>Este PDF traz o gabarito no fim. Não role além das questões antes de entregar.</p>}
          <iframe key={atualDoc.url} src={atualDoc.url} title={atualDoc.rotulo} />
        </section>
      ) : (
        <div className="qz-list">
          {eq.questoes.map((q, k) => (
            <QuestaoView key={k} q={q} k={k} sid={s.id} modo="lista" entregue={entregue}
              resposta={(c) => porChave.get(c)} setResposta={setResposta}
              extra={(r) => <ErroItem s={s} r={r} resp={porChave.get(r.chave)} />} />
          ))}
        </div>
      )}

      {!entregue && (
        <div className="qz-bar">
          <span>{respondidas} de {itens.length} respondidos</span>
          <span className="caption" style={{ flexGrow: 1 }}>{st.cfg.hideKey ? 'As soluções aparecem depois que você entregar.' : 'Gabarito liberado nas configurações.'}</span>
          <button className="btn now" onClick={() => { gravar({ ...sub, entregue_em: new Date().toISOString() }, true); window.scrollTo({ top: 0 }); }}>Entregar {nome}</button>
        </div>
      )}
    </div>
  );
}

// Depois da entrega: nota, correção com IA e reabrir
function Resumo({ s, sub, gravar, itens, porChave, avaliadas, nome, libera }: {
  s: Step; sub: Submission; gravar: (x: Submission, imediato?: boolean) => void; itens: Respondivel[];
  porChave: Map<string, Resposta>; avaliadas: number; nome: string; libera: string | null;
}) {
  const st = useStore();
  const [txt, setTxt] = useState(nota(sub.nota));
  const [estado, setEstado] = useState('');
  const min = lerNota(st.cfg.minGrade) ?? 7;
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setTxt(nota(sub.nota)); }, [sub.nota]);

  const corrigir = async () => {
    const key = lerChave();
    if (!key) { setEstado('Configure a chave do Gemini em Configurações · Correção com IA.'); return; }
    setEstado('corrigindo');
    try {
      const payload = itens.map((i) => {
        const r = porChave.get(i.chave);
        return {
          q: i.chave, rotulo: i.rotulo, enunciado: textoRespondivel(i), solucao: textoPartes(solucaoRespondivel(i)),
          resposta: [r?.escolha ? `[${r.escolha}]` : '', r?.texto || ''].join(' ').trim(),
        };
      });
      const res = await fetch('/api/corrigir', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-gemini-key': key },
        body: JSON.stringify({ stepId: s.id, rigor: st.cfg.rigor, itens: payload }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.erro || 'falhou');
      const porQ = new Map<string, { avaliacao?: string; comentario?: string }>((j.itens || []).map((x: { q: string }) => [x.q, x]));
      const respostas = itens.map((i) => {
        const r = porChave.get(i.chave) ?? { q: i.chave, texto: '' };
        const c = porQ.get(i.chave);
        const av = c?.avaliacao === 'certo' || c?.avaliacao === 'parcial' || c?.avaliacao === 'errado' ? c.avaliacao : r.avaliacao;
        return { ...r, avaliacao: av as Avaliacao | undefined, comentario: c?.comentario || r.comentario };
      });
      const n = Math.round(Math.min(10, Math.max(0, Number(j.nota))) * 10) / 10;
      gravar({ ...sub, respostas, nota: Number.isFinite(n) ? n : sub.nota, correcao: (j.semGabarito ? '[sem gabarito oficial] ' : '') + (j.comentario || '') }, true);
      setEstado('');
    } catch (e) {
      setEstado(e instanceof Error ? e.message : 'falhou');
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, fontWeight: 600 }}>
        {nome === 'prova' ? 'Prova entregue' : 'Lista entregue'}{sub.nota != null && <> · nota <span className="mono">{nota(sub.nota)}</span></>}
        {libera && sub.nota != null && <span className="caption" style={{ fontWeight: 400 }}> · {sub.nota >= min ? `libera a ${libera}` : `precisa de ${nota(min)} para liberar a ${libera}`}</span>}
      </p>
      <p className="muted" style={{ margin: 0, fontSize: 14 }}>
        Compare cada resposta com a solução e marque como foi: {avaliadas} de {itens.length} itens corrigidos.
        {avaliadas < itens.length ? ' Com todos marcados, a nota sai sozinha.' : ''} Ou peça a correção da IA.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <label htmlFor="nota" className="sr">Nota de 0 a 10</label>
        <input id="nota" className="field mono" style={{ width: 90 }} inputMode="decimal" placeholder="0 a 10" value={txt} onChange={(e) => setTxt(e.target.value)} />
        <button className="btn forest" onClick={() => gravar({ ...sub, nota: lerNota(txt) }, true)} disabled={lerNota(txt) == null}>Salvar nota</button>
        <button className="btn ghost" onClick={corrigir} disabled={estado === 'corrigindo'}><Icon d={P.spark} size={16} />{estado === 'corrigindo' ? 'Corrigindo…' : 'Corrigir com IA'}</button>
        <button type="button" className="btn soft sm" style={{ marginLeft: 'auto' }}
          onClick={() => gravar({ ...sub, entregue_em: null, nota: null, correcao: null, respostas: sub.respostas.map((r) => ({ ...r, avaliacao: undefined, comentario: undefined })) }, true)}>
          Reabrir {nome}
        </button>
      </div>
      {estado && estado !== 'corrigindo' && <p role="alert" className="notice warn" style={{ margin: 0 }}>{estado}</p>}
      {sub.correcao && <div className="notice" style={{ whiteSpace: 'pre-wrap' }}>{sub.correcao}</div>}
    </div>
  );
}

// Registrar um erro a partir de um item: vai para o caderno de erros e vira uma ficha
function ErroItem({ s, r, resp }: { s: Step; r: Respondivel; resp?: Resposta }) {
  const st = useStore();
  const existente = st.mistakes.find((m) => m.step_id === s.id && m.questao === r.chave);
  const [aberto, setAberto] = useState(false);
  const [desc, setDesc] = useState('');
  const [estado, setEstado] = useState('');
  const redo = parseInt(st.cfg.redo) || 7;

  if (existente) return <span className="caption" role="status">{estado || 'No caderno de erros'}</span>;
  if (!aberto) {
    if (resp?.avaliacao !== 'errado' && resp?.avaliacao !== 'parcial') return null;
    return <button type="button" className="btn sm ghost" onClick={() => { setDesc(resp?.comentario || ''); setAberto(true); }}>Registrar erro</button>;
  }
  const registrar = async () => {
    const descricao = desc.trim();
    if (!descricao) return;
    const m: Mistake = { id: novoId(), step_id: s.id, questao: r.chave, origem: `${s.titulo} · questão ${r.rotulo}`, descricao,
      vence: somarDias(hoje(), redo), resolvido: false, criado_em: new Date().toISOString() };
    st.upsertMistake(m);
    setAberto(false);
    const key = lerChave();
    if (!key) { setEstado('No caderno de erros · sem a chave do Gemini, a ficha não foi criada'); return; }
    setEstado('No caderno de erros · criando a ficha…');
    try {
      const res = await fetch('/api/ficha-erro', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-gemini-key': key },
        body: JSON.stringify({ stepId: s.id, questao: r.rotulo, descricao, resposta: [resp?.escolha, resp?.texto].filter(Boolean).join(' '),
          enunciado: textoRespondivel(r), solucao: textoPartes(solucaoRespondivel(r)) }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.erro || 'falhou');
      const c: Card = { id: novoId(), step_id: s.id, frente: j.frente, verso: j.verso, criada_em: new Date().toISOString(),
        vence: hoje(), intervalo: 0, facilidade: 2.5, repeticoes: 0, lapsos: 0, revisada_em: null };
      st.upsertCard(c);
      setEstado('No caderno de erros e nas fichas');
    } catch (e) {
      setEstado(`No caderno de erros · a ficha não foi criada: ${e instanceof Error ? e.message : 'falhou'}`);
    }
  };
  return (
    <form className="qz-erro" onSubmit={(e) => { e.preventDefault(); void registrar(); }}>
      <label htmlFor={`erro-${r.chave}`} className="sr">O que você errou</label>
      <input id={`erro-${r.chave}`} className="field" autoFocus placeholder="O que você errou e por quê" value={desc} onChange={(e) => setDesc(e.target.value)} />
      <button className="btn forest sm" disabled={!desc.trim()}>Registrar</button>
      <button type="button" className="btn soft sm" onClick={() => setAberto(false)}>Cancelar</button>
    </form>
  );
}
