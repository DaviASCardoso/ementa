'use client';

import { useEffect, useMemo, useState } from 'react';
import { novoId, useStore } from './Store';
import { Arquivos, Topo } from './comum';
import { Icon, P } from './icons';
import { hoje, lerNota, nota, somarDias } from '@/lib/format';
import type { Card, Mistake, Resposta, Step, Submission } from '@/lib/types';
import { lerChave } from '@/lib/chave';

type Correcao = { nota: number; comentario: string; erros: { questao: string; descricao: string }[]; semGabarito?: boolean };

export function Lista({ s }: { s: Step }) {
  const st = useStore();
  const salvo = st.mapas.submissions[s.id];
  const [sub, setSub] = useState<Submission>(() => salvo ?? { step_id: s.id, respostas: [1, 2, 3].map((q) => ({ q: String(q), texto: '' })), entregue_em: null, nota: null, correcao: null });
  const entregue = !!sub.entregue_em;
  const prova = s.tipo === 'prova';
  const travar = prova && !entregue && st.cfg.lockdown;
  const verGabarito = entregue || !st.cfg.hideKey;
  const nome = prova ? 'prova' : 'lista';

  useEffect(() => { st.setNavOpen(!travar); st.setTravado(travar); return () => { st.setTravado(false); st.setNavOpen(true); }; }, [travar]); // eslint-disable-line react-hooks/exhaustive-deps

  const gravar = (novo: Submission, imediato = false) => { setSub(novo); st.saveSubmission(novo, imediato); };
  const setResp = (i: number, r: Partial<Resposta>) => gravar({ ...sub, respostas: sub.respostas.map((x, j) => (j === i ? { ...x, ...r } : x)) });
  const respondidas = sub.respostas.filter((r) => r.texto.trim()).length;

  // documentos à esquerda: enunciado(s); o gabarito aparece depois de entregar
  const docs = useMemo(() => s.arquivos.filter((a) => a.papel === 'enunciado' || (a.papel === 'gabarito' && verGabarito) || (a.papel === 'material' && /\.pdf$/i.test(a.url))),
    [s.arquivos, verGabarito]);
  const [doc, setDoc] = useState(0);
  const atual = docs[Math.min(doc, docs.length - 1)];

  const curso = st.courses.find((c) => c.id === s.course_id)!;
  const proxCurso = s.final ? st.courses.filter((c) => !c.alternativa)[st.courses.filter((c) => !c.alternativa).findIndex((c) => c.id === curso.id) + 1] : null;

  return (
    <div className="page" style={{ maxWidth: 1360, gap: 16, padding: '0 0 40px' }}>
      <Topo s={s} />
      {travar && <p className="notice warn" style={{ margin: 0 }}>Prova sem consulta: o menu, o caderno e as fichas ficam escondidos até você entregar.</p>}
      {s.gabarito_junto && !entregue && <p className="notice" style={{ margin: 0 }}>Este PDF traz o gabarito no fim. Resolva só até o fim das questões e não role além delas antes de entregar.</p>}
      {s.sub && <p className="caption" style={{ margin: 0 }}>{s.sub}{s.sugestao ? ' · posição na trilha sugerida' : ''}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' }}>
        <section className="doc" aria-label="Enunciado em PDF">
          <div className="hd">
            {docs.length > 1 ? (
              <div className="tabs" role="tablist">{docs.map((a, i) => <button key={a.url} role="tab" aria-selected={a === atual} onClick={() => setDoc(i)}>{a.rotulo}</button>)}</div>
            ) : <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{atual?.rotulo || 'Sem PDF'}</span>}
            {atual && <a href={atual.url} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600 }}>Abrir em nova aba</a>}
          </div>
          {atual && /\.pdf$/i.test(atual.url) ? <iframe key={atual.url} src={atual.url} title={atual.rotulo} />
            : <div style={{ padding: 22 }}><Arquivos lista={s.arquivos} pagina={s.pagina} /></div>}
        </section>

        <section className="answers" aria-label="Suas respostas">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <h2>Suas respostas</h2>
            <span className="caption">{respondidas} de {sub.respostas.length} respondidas</span>
          </div>
          {sub.respostas.map((r, i) => (
            <div key={i} className="q">
              <div className="lb">
                <label htmlFor={`q${i}`}>Questão <input className="qn" aria-label={`Número da questão ${i + 1}`} value={r.q} onChange={(e) => setResp(i, { q: e.target.value })} /></label>
                {!r.texto && sub.respostas.length > 1 && (
                  <button type="button" className="btn sm soft" aria-label={`Remover questão ${r.q}`} title="Remover questão"
                    onClick={() => gravar({ ...sub, respostas: sub.respostas.filter((_, j) => j !== i) })}><Icon d={P.trash} size={15} /></button>
                )}
              </div>
              <textarea id={`q${i}`} className="field" rows={4} placeholder="Raciocínio, contas e resultado" value={r.texto} onChange={(e) => setResp(i, { texto: e.target.value })} />
            </div>
          ))}
          <button type="button" className="btn ghost" style={{ alignSelf: 'flex-start' }}
            onClick={() => gravar({ ...sub, respostas: [...sub.respostas, { q: String(sub.respostas.length + 1), texto: '' }] })}>
            <Icon d={P.plus} size={16} />Adicionar questão
          </button>

          {!entregue ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 4 }}>
              <span className="caption">{st.cfg.hideKey ? 'O gabarito aparece depois que você entregar.' : 'Gabarito liberado nas configurações.'}</span>
              <button className="btn now" onClick={() => gravar({ ...sub, entregue_em: new Date().toISOString() }, true)}>Entregar {nome}</button>
            </div>
          ) : (
            <Correcao s={s} sub={sub} gravar={gravar} nome={nome} libera={s.final && proxCurso ? proxCurso.id : null} />
          )}
        </section>
      </div>
    </div>
  );
}

function Correcao({ s, sub, gravar, nome, libera }: { s: Step; sub: Submission; gravar: (x: Submission, imediato?: boolean) => void; nome: string; libera: string | null }) {
  const st = useStore();
  const [txt, setTxt] = useState(nota(sub.nota));
  const [ia, setIa] = useState<Correcao | null>(null);
  const [estado, setEstado] = useState<'' | 'corrigindo' | string>('');
  const [errQ, setErrQ] = useState('');
  const [errD, setErrD] = useState('');
  const [ultimo, setUltimo] = useState('');
  // situação de cada erro registrado nesta tela: gerando a ficha, ficha criada ou o motivo da falha
  const [anotados, setAnotados] = useState<Record<string, string>>({});
  const temGabarito = s.arquivos.some((a) => a.papel === 'gabarito') || s.gabarito_junto;
  const redo = parseInt(st.cfg.redo) || 7;
  const min = lerNota(st.cfg.minGrade) ?? 7;

  const salvarNota = (n: number | null, correcao = sub.correcao) => {
    gravar({ ...sub, nota: n, correcao }, true);
    setTxt(nota(n));
  };
  const corrigir = async () => {
    const key = lerChave();
    if (!key) { setEstado('Configure a chave do Gemini em Configurações · Correção com IA.'); return; }
    setEstado('corrigindo');
    try {
      const r = await fetch('/api/corrigir', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-gemini-key': key },
        body: JSON.stringify({ stepId: s.id, respostas: sub.respostas, rigor: st.cfg.rigor }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || 'falhou');
      setIa(j);
      const n = Math.round(Math.min(10, Math.max(0, j.nota)) * 10) / 10;
      salvarNota(n, (j.semGabarito ? '[sem gabarito oficial] ' : '') + j.comentario);
      setEstado('');
    } catch (e) {
      setEstado(e instanceof Error ? e.message : 'falhou');
    }
  };
  // registra o erro e pede ao Gemini uma ficha sobre o conceito, com a pergunta reescrita
  const erro = async (questao: string, descricao: string) => {
    const k = questao + descricao;
    const m: Mistake = { id: novoId(), step_id: s.id, origem: `${s.titulo} · questão ${questao}`, descricao, vence: somarDias(hoje(), redo), resolvido: false, criado_em: new Date().toISOString() };
    st.upsertMistake(m);
    const key = lerChave();
    if (!key) { setAnotados((a) => ({ ...a, [k]: 'Erro registrado. Sem a chave do Gemini, a ficha não foi criada.' })); return; }
    setAnotados((a) => ({ ...a, [k]: 'gerando' }));
    try {
      const resposta = sub.respostas.find((r) => r.q.trim() === questao.trim())?.texto;
      const r = await fetch('/api/ficha-erro', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-gemini-key': key },
        body: JSON.stringify({ stepId: s.id, questao, descricao, resposta }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || 'falhou');
      const c: Card = { id: novoId(), step_id: s.id, frente: j.frente, verso: j.verso, criada_em: new Date().toISOString(),
        vence: hoje(), intervalo: 0, facilidade: 2.5, repeticoes: 0, lapsos: 0, revisada_em: null };
      st.upsertCard(c);
      setAnotados((a) => ({ ...a, [k]: 'ficha' }));
    } catch (e) {
      setAnotados((a) => ({ ...a, [k]: `Erro registrado, mas a ficha não foi criada: ${e instanceof Error ? e.message : 'falhou'}` }));
    }
  };
  const situacao = (k: string) => anotados[k] === 'gerando' ? 'Criando a ficha…' : anotados[k] === 'ficha' ? 'No caderno de erros e nas fichas' : anotados[k];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
      {sub.nota != null ? (
        <p style={{ margin: 0, fontWeight: 600 }}>
          {nome === 'prova' ? 'Prova entregue' : 'Lista entregue'} · nota <span className="mono">{nota(sub.nota)}</span>
          {libera && <span className="caption" style={{ fontWeight: 400 }}> · {sub.nota >= min ? `libera a ${libera}` : `precisa de ${nota(min)} para liberar a ${libera}`}</span>}
        </p>
      ) : (
        <p style={{ margin: 0 }} className="muted">{temGabarito ? 'Compare com o gabarito (na aba ao lado) e dê a sua nota, ou peça a correção da IA.' : 'Não há gabarito oficial: dê a sua nota ou peça a correção da IA.'}</p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <label htmlFor="nota" className="sr">Nota de 0 a 10</label>
        <input id="nota" className="field mono" style={{ width: 90 }} inputMode="decimal" placeholder="0 a 10" value={txt} onChange={(e) => setTxt(e.target.value)} />
        <button className="btn forest" onClick={() => salvarNota(lerNota(txt))} disabled={lerNota(txt) == null}>Salvar nota</button>
        <button className="btn ghost" onClick={corrigir} disabled={estado === 'corrigindo'}><Icon d={P.spark} size={16} />{estado === 'corrigindo' ? 'Corrigindo…' : 'Corrigir com IA'}</button>
      </div>
      {estado && estado !== 'corrigindo' && <p role="alert" className="notice warn" style={{ margin: 0 }}>{estado}</p>}
      {sub.correcao && <div className="notice" style={{ whiteSpace: 'pre-wrap' }}>{sub.correcao}</div>}
      {ia?.erros?.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="caption">Erros apontados pela IA</span>
          {ia.erros.map((e, i) => {
            const k = e.questao + e.descricao;
            return (
              <div key={i} className="ficha">
                <span className="f">Questão {e.questao}</span><span className="v">{e.descricao}</span>
                <span className="acts">
                  {anotados[k] ? <span className="caption" role="status">{situacao(k)}</span> : (
                    <button className="btn sm ghost" onClick={() => void erro(e.questao, e.descricao)}>Mandar para o caderno de erros</button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
      <form className="newcard" onSubmit={(e) => { e.preventDefault(); if (!errD.trim()) return; setUltimo((errQ || '?') + errD.trim()); void erro(errQ || '?', errD.trim()); setErrQ(''); setErrD(''); }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Registrar um erro</span>
        <span className="caption">Volta para você refazer em {redo} dias e vira uma ficha sobre o conceito, reescrita pela IA.</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label htmlFor="err-q" className="sr">Questão</label>
          <input id="err-q" className="field" style={{ width: 110 }} placeholder="Questão" value={errQ} onChange={(e) => setErrQ(e.target.value)} />
          <label htmlFor="err-d" className="sr">O que você errou</label>
          <input id="err-d" className="field" style={{ flex: '1 1 200px' }} placeholder="O que você errou e por quê" value={errD} onChange={(e) => setErrD(e.target.value)} />
        </div>
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span className="caption" role="status">{ultimo && situacao(ultimo)}</span>
          <button className="btn forest sm" disabled={!errD.trim()}>Registrar erro</button>
        </span>
      </form>
      <button type="button" className="btn soft sm" style={{ alignSelf: 'flex-start' }} onClick={() => gravar({ ...sub, entregue_em: null, nota: null, correcao: null }, true)}>
        Reabrir {nome}
      </button>
    </div>
  );
}
