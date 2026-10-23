'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/components/Store';
import { Seg } from '@/components/comum';
import { Icon, P } from '@/components/icons';
import { gravarChave, lerChave } from '@/lib/chave';
import type { Settings } from '@/lib/types';

type Linha =
  | { tipo: 'seg'; k: keyof Settings; label: string; hint?: string; opts: string[] }
  | { tipo: 'tog'; k: keyof Settings; label: string; hint?: string }
  | { tipo: 'outro'; label: string; hint?: string; el: React.ReactNode };

export default function Config() {
  const st = useStore();
  useEffect(() => { st.setNavOpen(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const cfg = st.cfg;

  const secoes: { id: string; titulo: string; icon: string; linhas: Linha[] }[] = [
    { id: 'estudo', titulo: 'Estudo', icon: P.path, linhas: [
      { tipo: 'seg', k: 'minGrade', label: 'Nota para liberar a próxima matéria', hint: 'Vale para a prova final de cada matéria.', opts: ['6,0', '7,0', '8,0'] },
      { tipo: 'tog', k: 'lockdown', label: 'Prova sem consulta', hint: 'Durante a prova, o menu, o caderno e as fichas ficam escondidos.' },
      { tipo: 'tog', k: 'hideKey', label: 'Gabarito só depois de entregar', hint: 'O gabarito das listas e provas aparece quando você envia as respostas.' },
    ] },
    { id: 'video', titulo: 'Aulas e vídeo', icon: P.play, linhas: [
      { tipo: 'seg', k: 'speed', label: 'Velocidade padrão', hint: 'Cada aula começa nesta velocidade.', opts: ['1×', '1,25×', '1,5×', '2×'] },
      { tipo: 'seg', k: 'autoDone', label: 'Concluir a aula sozinha', hint: 'Marca como feita quando o vídeo passa desse ponto.', opts: ['80%', '90%', 'Só manual'] },
      { tipo: 'seg', k: 'subs', label: 'Legendas', hint: 'Do YouTube; vale ao abrir a próxima aula.', opts: ['Desligadas', 'Inglês', 'Português'] },
      { tipo: 'tog', k: 'foldNav', label: 'Recolher o menu na aula', hint: 'Deixa mais espaço para o vídeo e o caderno.' },
    ] },
    { id: 'caderno', titulo: 'Caderno', icon: P.pen, linhas: [
      { tipo: 'seg', k: 'nbFont', label: 'Fonte das anotações', hint: 'Muda o texto do caderno, não da interface.', opts: ['Serifada', 'Sem serifa', 'Mono'] },
      { tipo: 'seg', k: 'nbSize', label: 'Tamanho do texto', opts: ['Pequeno', 'Médio', 'Grande'] },
      { tipo: 'tog', k: 'autoStamp', label: 'Marcar o tempo em cada parágrafo', hint: 'Todo parágrafo novo guarda o ponto do vídeo em que você estava.' },
      { tipo: 'tog', k: 'pauseTyping', label: 'Pausar o vídeo ao escrever', hint: 'Volta a tocar quando você para de digitar.' },
    ] },
    { id: 'fichas', titulo: 'Fichas e revisão', icon: P.cards, linhas: [
      { tipo: 'seg', k: 'newCards', label: 'Fichas novas por dia', hint: 'As que passarem disso esperam o dia seguinte.', opts: ['10', '20', 'Sem limite'] },
      { tipo: 'seg', k: 'perSession', label: 'Fichas por revisão', opts: ['20', '50', 'Todas'] },
      { tipo: 'tog', k: 'typing', label: 'Responder digitando', hint: 'Você escreve antes de ver o verso e compara as duas.' },
      { tipo: 'seg', k: 'redo', label: 'Caderno de erros: refazer em', hint: 'Quando uma questão errada volta para você.', opts: ['3 dias', '7 dias', '14 dias'] },
    ] },
    { id: 'ia', titulo: 'Correção com IA', icon: P.spark, linhas: [
      { tipo: 'outro', label: 'Chave da API do Gemini', hint: 'Fica só neste aparelho e não vai para o backup. Crie uma em aistudio.google.com.', el: <Chave /> },
      { tipo: 'seg', k: 'rigor', label: 'Rigor da correção', hint: 'Tolerante aceita arredondamentos; rigoroso cobra todas as etapas.', opts: ['Tolerante', 'Padrão', 'Rigoroso'] },
    ] },
    { id: 'aparencia', titulo: 'Aparência', icon: P.palette, linhas: [
      { tipo: 'seg', k: 'scale', label: 'Tamanho da interface', opts: ['90%', '100%', '115%'] },
      { tipo: 'tog', k: 'calm', label: 'Reduzir animações', hint: 'Tira o pulso da aula atual e as transições.' },
    ] },
    { id: 'dados', titulo: 'Dados', icon: P.db, linhas: [
      { tipo: 'outro', label: 'Backup', hint: 'Anotações, fichas, notas, erros e progresso num arquivo. Os dados já ficam no Supabase; o backup é uma cópia a mais.', el: <Backup /> },
      { tipo: 'outro', label: 'Apagar tudo', hint: 'Remove anotações, fichas, notas, erros e progresso. O catálogo das matérias fica. Não dá para desfazer.', el: <Apagar /> },
      { tipo: 'outro', label: 'Sair', hint: 'Encerra a sessão neste aparelho.', el: <form method="post" action="/api/sair"><button className="btn ghost"><Icon d={P.out} size={16} />Sair</button></form> },
    ] },
  ];

  return (
    <div className="page" style={{ maxWidth: 1040 }}>
      <header className="page-h">
        <h1>Configurações</h1>
        <p>As mudanças valem na hora e ficam salvas no Supabase, então valem em qualquer aparelho.</p>
      </header>
      <div className="cfg">
        <nav aria-label="Seções das configurações" className="cfg-nav">
          {secoes.map((s) => <a key={s.id} href={`#cfg-${s.id}`}><Icon d={s.icon} size={16} sw={1.9} />{s.titulo}</a>)}
        </nav>
        <div style={{ flex: '999 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {secoes.map((s) => (
            <section key={s.id} id={`cfg-${s.id}`} aria-labelledby={`cfg-h-${s.id}`} className="cfg-sec">
              <h2 id={`cfg-h-${s.id}`}>{s.titulo}</h2>
              {s.linhas.map((r) => (
                <div key={r.label} className="row">
                  <span className="lab"><b>{r.label}</b>{r.hint && <span>{r.hint}</span>}</span>
                  {r.tipo === 'seg' && <Seg label={r.label} opts={r.opts} value={String(cfg[r.k])} onPick={(v) => st.setCfg({ [r.k]: v })} />}
                  {r.tipo === 'tog' && (
                    <button role="switch" aria-checked={!!cfg[r.k]} aria-label={r.label} className="switch" onClick={() => st.setCfg({ [r.k]: !cfg[r.k] })}><span /></button>
                  )}
                  {r.tipo === 'outro' && r.el}
                </div>
              ))}
            </section>
          ))}
          <p className="caption" style={{ margin: '4px 0 0', textAlign: 'center' }}>Ementa · versão 1.0 · conteúdo do MIT OpenCourseWare, licença CC BY-NC-SA</p>
        </div>
      </div>
    </div>
  );
}

function Chave() {
  const [v, setV] = useState('');
  const [msg, setMsg] = useState<[string, string]>(['Ainda não configurada', 'var(--faint)']);
  const [testando, setTestando] = useState(false);
  // localStorage só existe no navegador
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const k = lerChave(); setV(k); if (k) setMsg(['Guardada neste aparelho', 'var(--faint)']); }, []);
  const testar = async () => {
    gravarChave(v.trim());
    if (!v.trim()) { setMsg(['Chave removida', 'var(--faint)']); return; }
    setTestando(true);
    const r = await fetch('/api/corrigir', { headers: { 'x-gemini-key': v.trim() } }).then((x) => x.json()).catch(() => ({ ok: false }));
    setTestando(false);
    setMsg(r.ok ? ['Funcionando', 'var(--done)'] : [r.erro || 'Não funcionou', 'var(--danger-text)']);
  };
  return (
    <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, flex: '1 1 320px' }}>
      <label htmlFor="cfg-key" className="sr">Chave da API do Gemini</label>
      <input id="cfg-key" type="password" autoComplete="off" placeholder="Cole a chave aqui" className="field" style={{ flex: '1 1 200px', minWidth: 0 }} value={v} onChange={(e) => setV(e.target.value)} />
      <button className="btn forest" onClick={testar} disabled={testando}>{testando ? 'Testando…' : 'Salvar e testar'}</button>
      <span role="status" style={{ fontSize: 13, fontWeight: 500, color: msg[1] }}>{msg[0]}</span>
    </span>
  );
}

function Backup() {
  const arq = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const restaurar = async (f: File) => {
    setMsg('Restaurando…');
    const r = await fetch('/api/backup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: await f.text() });
    if (r.ok) { setMsg('Backup restaurado. Recarregando…'); location.reload(); }
    else setMsg('Não deu: ' + ((await r.json().catch(() => ({}))).erro || r.status));
  };
  return (
    <span style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <a className="btn forest" href="/api/backup" download>Exportar backup</a>
      <button className="btn ghost" onClick={() => arq.current?.click()}>Restaurar</button>
      <input ref={arq} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && restaurar(e.target.files[0])} />
      {msg && <span role="status" className="caption">{msg}</span>}
    </span>
  );
}

function Apagar() {
  const [armado, setArmado] = useState(false);
  const [msg, setMsg] = useState('');
  const apagar = async () => {
    if (!armado) { setArmado(true); return; }
    setMsg('Apagando…');
    const r = await fetch('/api/backup', { method: 'DELETE' });
    if (r.ok) location.reload(); else setMsg('Não deu para apagar.');
  };
  return (
    <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <button className="btn danger" onClick={apagar} onBlur={() => setArmado(false)}>{armado ? 'Toque de novo para apagar' : 'Apagar dados'}</button>
      {msg && <span role="status" className="caption">{msg}</span>}
    </span>
  );
}
