'use client';
/* eslint-disable react-hooks/refs -- os botões da barra leem o editor só quando clicados */

import { useEffect, useRef, useState } from 'react';
import { useStore } from './Store';
import { Salvo } from './comum';
import { Icon, P } from './icons';
import { mmss } from '@/lib/format';
import type { Step } from '@/lib/types';

type Props = {
  s: Step;
  comTempo: boolean;
  agora: () => { c: number; t: number };
  irPara: (c: number, t: number) => void;
  aoDigitar: () => void;
  virarFicha: (txt: string) => void;
};

const CORES: [string, string][] = [['#14201C', 'Texto preto'], ['#C2410C', 'Texto laranja'], ['#3B4BA8', 'Texto azul'], ['#1D6B4F', 'Texto verde']];

const carimbo = (c: number, t: number) => {
  const sp = document.createElement('span');
  sp.className = 'ts';
  sp.contentEditable = 'false';
  sp.dataset.t = String(Math.floor(t));
  sp.dataset.c = String(c);
  sp.textContent = mmss(t);
  return sp;
};

export function Caderno({ s, comTempo, agora, irPara, aoDigitar, virarFicha }: Props) {
  const st = useStore();
  const ed = useRef<HTMLDivElement>(null);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState(false);
  const [tempo, setTempo] = useState(0);

  // carrega o HTML guardado
  useEffect(() => {
    let vivo = true;
    fetch(`/api/data/notes?id=${encodeURIComponent(s.id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((n) => { if (!vivo || !ed.current) return; ed.current.innerHTML = n?.html || ''; setPronto(true); })
      .catch(() => vivo && setErro(true));
    return () => { vivo = false; };
  }, [s.id]);

  // relógio do botão "Marcar mm:ss"
  useEffect(() => { if (!comTempo) return; const i = setInterval(() => setTempo(agora().t), 1000); return () => clearInterval(i); }, [comTempo]); // eslint-disable-line react-hooks/exhaustive-deps

  const salvar = () => {
    const el = ed.current;
    if (!el || !pronto) return;
    const marcas = [...el.querySelectorAll<HTMLElement>('.ts')].map((x) => Number(x.dataset.c || 0) * 100000 + Number(x.dataset.t || 0));
    st.saveNote({ step_id: s.id, html: el.innerHTML, marcas });
  };

  // bloco de primeiro nível onde está o cursor
  const blocoAtual = (): HTMLElement | null => {
    const sel = window.getSelection();
    let n: Node | null = sel?.anchorNode ?? null;
    while (n && n.parentNode !== ed.current) n = n.parentNode;
    return n instanceof HTMLElement ? n : null;
  };

  const onInput = () => {
    aoDigitar();
    const el = ed.current!;
    // texto solto direto no editor vira parágrafo
    if (el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE) document.execCommand('formatBlock', false, '<p>');
    if (comTempo && st.cfg.autoStamp) {
      const b = blocoAtual();
      // marca o tempo quando você começa a escrever num bloco novo
      if (b && !b.querySelector(':scope > .ts') && (b.textContent || '').replace(/​/g, '').trim().length === 1) {
        const { c, t } = agora();
        b.insertBefore(carimbo(c, t), b.firstChild);
      }
    }
    salvar();
  };

  const cmd = (c: string, v?: string) => (e: React.MouseEvent) => { e.preventDefault(); ed.current?.focus(); document.execCommand(c, false, v); salvar(); };

  const marcarAgora = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = ed.current!;
    const { c, t } = agora();
    const p = document.createElement('p');
    p.appendChild(carimbo(c, t));
    p.appendChild(document.createTextNode('​'));
    const b = blocoAtual();
    if (b) b.after(p); else el.appendChild(p);
    const r = document.createRange();
    r.setStart(p.lastChild!, 1); r.collapse(true);
    const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(r);
    el.focus();
    salvar();
  };

  const onClick = (e: React.MouseEvent) => {
    const ts = (e.target as HTMLElement).closest<HTMLElement>('.ts');
    if (ts && comTempo) irPara(Number(ts.dataset.c || 0), Number(ts.dataset.t || 0));
  };

  const onPaste = (e: React.ClipboardEvent) => {
    // cola só o texto, sem a formatação de fora
    e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
  };

  const fonte = st.cfg.nbFont === 'Sem serifa' ? ' sans' : st.cfg.nbFont === 'Mono' ? ' mono' : '';
  const tam = st.cfg.nbSize === 'Pequeno' ? ' sm' : st.cfg.nbSize === 'Grande' ? ' lg' : '';
  const T = (label: string, conteudo: React.ReactNode, run: (e: React.MouseEvent) => void, title?: string) => (
    <button type="button" className="tool" aria-label={label} title={title || label} onMouseDown={run}>{conteudo}</button>
  );
  const t = tempo;

  return (
    <section className="pane-r" aria-label="Caderno da aula">
      <div role="toolbar" aria-label="Formatação" className="toolbar">
        <label htmlFor="tb-bloco" className="sr">Estilo do bloco</label>
        <select id="tb-bloco" defaultValue="" onChange={(e) => { ed.current?.focus(); document.execCommand('formatBlock', false, `<${e.target.value}>`); e.target.value = ''; salvar(); }}>
          <option value="" disabled>Estilo</option>
          <option value="P">Parágrafo</option><option value="H2">Título</option><option value="H3">Subtítulo</option><option value="BLOCKQUOTE">Citação</option>
        </select>
        <span className="sep" />
        {T('Negrito', <span style={{ fontWeight: 700 }}>B</span>, cmd('bold'), 'Negrito (Ctrl+B)')}
        {T('Itálico', <span style={{ fontStyle: 'italic', fontFamily: 'var(--f-read)', fontSize: 17 }}>I</span>, cmd('italic'), 'Itálico (Ctrl+I)')}
        {T('Sublinhado', <span style={{ textDecoration: 'underline' }}>U</span>, cmd('underline'), 'Sublinhado (Ctrl+U)')}
        {T('Riscado', <span style={{ textDecoration: 'line-through' }}>S</span>, cmd('strikeThrough'))}
        <span className="sep" />
        {T('Marca-texto', <Icon d={P.pen} size={17} sw={1.9} />, cmd('hiliteColor', '#FDE7A6'))}
        {T('Lista com marcadores', <Icon d={P.ul} size={17} sw={1.9} />, cmd('insertUnorderedList'))}
        {T('Lista numerada', <Icon d={P.ol} size={17} sw={1.9} />, cmd('insertOrderedList'))}
        {T('Fórmula ou código', <Icon d={P.code} size={17} sw={1.9} />, (e) => {
          e.preventDefault();
          const txt = String(window.getSelection() || '') || 'fórmula';
          document.execCommand('insertHTML', false, '<code>' + txt.replace(/[<&>]/g, '') + '</code>&nbsp;');
          salvar();
        })}
        {T('Virar ficha', <Icon d={P.cards} size={17} sw={1.9} />, (e) => { e.preventDefault(); virarFicha(String(window.getSelection() || '').trim()); }, 'Transformar o trecho selecionado em ficha')}
        <span className="sep" />
        <span role="group" aria-label="Cor do texto" style={{ display: 'inline-flex' }}>
          {CORES.map(([c, l]) => (
            <button key={c} type="button" className="tool" style={{ width: 30, minWidth: 30 }} aria-label={l} title={l} onMouseDown={cmd('foreColor', c)}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: c }} />
            </button>
          ))}
        </span>
        {comTempo && (
          <button type="button" className="stampbtn" onMouseDown={marcarAgora} title={`Novo parágrafo marcado em ${mmss(t)}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
            Marcar {mmss(t)}
          </button>
        )}
      </div>
      <div className="nb-wrap">
        <div className="nb-head">
          <span className="t">Caderno · {s.tipo === 'aula' && s.n ? `aula ${s.n}` : s.titulo}</span>
          {pronto ? <Salvo /> : <span className="caption" style={{ fontSize: 12 }}>{erro ? 'não consegui abrir o caderno' : 'abrindo…'}</span>}
        </div>
        <div ref={ed} className={'nb' + fonte + tam} contentEditable={pronto} suppressContentEditableWarning spellCheck role="textbox" aria-multiline="true"
          aria-label={`Anotações: ${s.titulo}`} data-placeholder={comTempo ? 'Escreva aqui. Cada parágrafo novo guarda o ponto do vídeo.' : 'Escreva aqui suas anotações da leitura.'}
          onInput={onInput} onClick={onClick} onPaste={onPaste} onBlur={salvar} />
      </div>
    </section>
  );
}
