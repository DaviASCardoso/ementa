'use client';

import Link from 'next/link';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useStore } from '@/components/Store';
import { Seg } from '@/components/comum';
import { QuestaoView } from '@/components/Questao';
import { Tex } from '@/components/Tex';
import { variantes } from '@/lib/termos';
import { carregarBanco, carregarEtapa, normalizar, type BancoItem, type EtapaQuestoes } from '@/lib/questoes';

const TIPOS: Record<string, string> = { Todas: '', Listas: 'lista', Provas: 'prova' };
const FORMATOS: Record<string, string> = { Todos: '', Abertas: 'aberta', 'V ou F': 'vf', Alternativas: 'alternativa' };
const POR_PAGINA = 25;

export default function Banco() {
  const st = useStore();
  useEffect(() => { st.setNavOpen(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [banco, setBanco] = useState<BancoItem[] | null>(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [curso, setCurso] = useState('');
  const [tipo, setTipo] = useState('Todas');
  const [formato, setFormato] = useState('Todos');
  const [comSol, setComSol] = useState(false);
  const [soErros, setSoErros] = useState(false);
  const termo = useDeferredValue(busca);
  // volta para a primeira página quando a busca ou um filtro muda
  const filtro = JSON.stringify([termo, curso, tipo, formato, comSol, soErros]);
  const [pagina, setPagina] = useState({ filtro, n: POR_PAGINA });
  const limite = pagina.filtro === filtro ? pagina.n : POR_PAGINA;
  const setLimite = (n: number) => setPagina({ filtro, n });

  useEffect(() => { carregarBanco().then(setBanco).catch(() => setErro('Não consegui carregar o banco de questões.')); }, []);

  // questões com erro registrado: etapa + índice da questão
  const comErro = useMemo(() => new Set(st.mistakes.filter((m) => m.step_id && m.questao).map((m) => `${m.step_id}#${m.questao!.split('/')[0]}`)), [st.mistakes]);
  const cursos = useMemo(() => {
    const ids = new Set(banco?.map((b) => b.curso));
    return st.courses.filter((c) => ids.has(c.id));
  }, [banco, st.courses]);

  const resultado = useMemo(() => {
    if (!banco) return [];
    const palavras = normalizar(termo).split(/\s+/).filter(Boolean).map(variantes);
    return banco.filter((b) => {
      if (curso && b.curso !== curso) return false;
      if (TIPOS[tipo] && b.tipo !== TIPOS[tipo]) return false;
      if (FORMATOS[formato] && !b.tipos.includes(FORMATOS[formato] as BancoItem['tipos'][number])) return false;
      if (comSol && !b.sol) return false;
      if (soErros && !comErro.has(`${b.sid}#${b.k}`)) return false;
      if (!palavras.length) return true;
      const alvo = `${b.busca} ${normalizar(b.titulo)} ${normalizar(b.etapa)} ${b.curso.toLowerCase()}`;
      return palavras.every((vs) => vs.some((p) => alvo.includes(p)));
    });
  }, [banco, termo, curso, tipo, formato, comSol, soErros, comErro]);

  return (
    <div className="page" style={{ maxWidth: 980, gap: 18 }}>
      <header className="page-h">
        <h1>Banco de questões</h1>
        <p>Todas as questões das listas e provas, separadas e pesquisáveis. {banco ? `${banco.length} questões.` : ''}</p>
      </header>

      <div className="card bq-filtros">
        <label htmlFor="busca" className="sr">Buscar questões</label>
        <input id="busca" type="search" className="field bq-busca" placeholder="Buscar em português ou inglês: elasticidade, Lagrange, Cobb-Douglas…"
          value={busca} onChange={(e) => setBusca(e.target.value)} autoFocus />
        <div className="bq-linha">
          <span className="caption">Matéria</span>
          <Seg label="Matéria" mono opts={['Todas', ...cursos.map((c) => c.id)]} value={curso || 'Todas'} onPick={(v) => setCurso(v === 'Todas' ? '' : v)} />
        </div>
        <div className="bq-linha">
          <span className="caption">Origem</span>
          <Seg label="Origem" opts={Object.keys(TIPOS)} value={tipo} onPick={setTipo} />
          <span className="caption" style={{ marginLeft: 8 }}>Formato</span>
          <Seg label="Formato" opts={Object.keys(FORMATOS)} value={formato} onPick={setFormato} />
        </div>
        <div className="bq-linha">
          <label className="bq-check"><input type="checkbox" checked={comSol} onChange={(e) => setComSol(e.target.checked)} /> Só com solução</label>
          <label className="bq-check"><input type="checkbox" checked={soErros} onChange={(e) => setSoErros(e.target.checked)} /> Só as que eu errei</label>
          {(busca || curso || tipo !== 'Todas' || formato !== 'Todos' || comSol || soErros) && (
            <button type="button" className="btn sm soft" style={{ marginLeft: 'auto' }}
              onClick={() => { setBusca(''); setCurso(''); setTipo('Todas'); setFormato('Todos'); setComSol(false); setSoErros(false); }}>Limpar filtros</button>
          )}
        </div>
      </div>

      {erro && <p className="notice warn" role="alert">{erro}</p>}
      {!banco && !erro && <p className="caption">Carregando…</p>}
      {banco && (
        <p className="caption" role="status" style={{ margin: 0 }}>
          {resultado.length === banco.length ? `${banco.length} questões` : `${resultado.length} de ${banco.length} questões`}
        </p>
      )}

      <div className="bq-lista">
        {resultado.slice(0, limite).map((b) => <Cartao key={`${b.sid}#${b.k}`} b={b} erro={comErro.has(`${b.sid}#${b.k}`)} />)}
      </div>
      {resultado.length > limite && (
        <button className="btn ghost" style={{ alignSelf: 'center' }} onClick={() => setLimite(limite + POR_PAGINA)}>
          Mostrar mais ({resultado.length - limite} restantes)
        </button>
      )}
      {banco && !resultado.length && <div className="card empty">Nenhuma questão com esses filtros.</div>}
    </div>
  );
}

const NOME_FORMATO: Record<string, string> = { aberta: 'aberta', vf: 'V ou F', alternativa: 'alternativas' };

function Cartao({ b, erro }: { b: BancoItem; erro: boolean }) {
  const [aberto, setAberto] = useState(false);
  const [eq, setEq] = useState<EtapaQuestoes | null>(null);
  const abrir = () => {
    setAberto(!aberto);
    if (!eq) carregarEtapa(b.sid).then(setEq).catch(() => {});
  };
  const q = eq?.questoes[b.k];
  return (
    <article className="bq-card">
      <div className="bq-orig">
        <Link href={`/etapa/${b.sid}#q-${b.k}`} className={'bq-tag ' + b.tipo} title="Abrir a lista ou prova">
          <b className="mono">{b.curso}</b> · {b.etapa} · questão {b.n}
        </Link>
        {erro && <span className="pill warn">errei</span>}
        <span className="bq-meta">
          {b.itens > 1 && <span>{b.itens} itens</span>}
          {b.tipos.filter((t) => t !== 'aberta').map((t) => <span key={t}>{NOME_FORMATO[t]}</span>)}
          {b.sol && <span>com solução</span>}
          {b.fig && <span>figura</span>}
        </span>
      </div>
      {b.titulo && <h3 className="bq-tit">{b.titulo}</h3>}
      {aberto && q ? (
        <QuestaoView q={q} k={b.k} sid={b.sid} modo="banco" />
      ) : (
        <div className="bq-resumo">{b.resumo.map((r, i) => <Tex key={i} texto={r} como="p" />)}</div>
      )}
      <button type="button" className="btn sm soft" style={{ alignSelf: 'flex-start' }} onClick={abrir} aria-expanded={aberto}>
        {aberto ? 'Recolher' : aberto && !q ? 'Carregando…' : 'Ver questão completa'}
      </button>
    </article>
  );
}
