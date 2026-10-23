'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from './Store';
import { Arquivos, FichasDaEtapa, Seg, Topo } from './comum';
import { Caderno } from './Caderno';
import { carregarYT, ESTADO, velocidade, type YTPlayer } from './youtube';
import { Icon, P } from './icons';
import { mmss } from '@/lib/format';
import type { Step } from '@/lib/types';

const VELOCIDADES = ['1×', '1,25×', '1,5×', '2×'];

export function Aula({ s }: { s: Step }) {
  const st = useStore();
  const prog = st.mapas.progress[s.id];
  const temVideo = s.videos.length > 0;
  const [tab, setTab] = useState<'fichas' | 'material' | 'sobre'>('fichas');
  const [frente, setFrente] = useState('');
  const [ratio, setRatio] = useState(0.46);
  const [speed, setSpeed] = useState(st.cfg.speed);
  const [clip, setClip] = useState(() => Math.min(prog?.clip ?? 0, Math.max(0, s.videos.length - 1)));
  const [t, setT] = useState(prog?.posicao ?? 0);
  const [dur, setDur] = useState(0);
  const player = useRef<YTPlayer | null>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const tRef = useRef(t);
  const clipRef = useRef(clip);
  const salvoEm = useRef(0);
  const pausadoPorDigitar = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausouDigitando = useRef(false);

  useEffect(() => { if (st.cfg.foldNav) st.setNavOpen(false); return () => st.setNavOpen(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const v = s.videos[clip];
  const ini = v?.start ?? 0;
  const fim = v?.end ?? dur;
  const frac = fim > ini ? Math.min(1, Math.max(0, (t - ini) / (fim - ini))) : 0;
  const limite = st.cfg.autoDone === '80%' ? 0.8 : st.cfg.autoDone === '90%' ? 0.9 : null;

  const trocarClip = (i: number, tocar: boolean, em?: number) => {
    const vv = s.videos[i];
    clipRef.current = i;
    setClip(i);
    const o = { videoId: vv.yt, startSeconds: em ?? vv.start ?? 0, ...(vv.end ? { endSeconds: vv.end } : {}) };
    if (tocar) player.current?.loadVideoById(o); else player.current?.cueVideoById(o);
    tRef.current = o.startSeconds; setT(o.startSeconds);
    st.setProgress(s.id, { clip: i, posicao: Math.floor(o.startSeconds) });
  };

  const irPara = (c: number, seg: number) => {
    if (!player.current) return;
    if (c !== clipRef.current && s.videos[c]) trocarClip(c, true, seg);
    else { player.current.seekTo(seg, true); player.current.playVideo(); }
  };


  // --- player
  useEffect(() => {
    if (!temVideo || !caixa.current) return;
    let vivo = true;
    const el = document.createElement('div');
    caixa.current.appendChild(el);
    const v0 = s.videos[clipRef.current];
    const retoma = prog?.posicao && prog.posicao > (v0.start ?? 0) + 3 && (!v0.end || prog.posicao < v0.end - 3) ? Math.floor(prog.posicao) : v0.start ?? 0;
    const subs = st.cfg.subs;
    carregarYT().then((YT) => {
      if (!vivo) return;
      player.current = new YT.Player(el, {
        videoId: v0.yt, host: 'https://www.youtube-nocookie.com',
        playerVars: {
          start: retoma, ...(v0.end ? { end: v0.end } : {}), rel: 0, playsinline: 1, hl: 'pt-BR',
          cc_load_policy: subs === 'Desligadas' ? 0 : 1, ...(subs !== 'Desligadas' ? { cc_lang_pref: subs === 'Português' ? 'pt' : 'en' } : {}),
        },
        events: {
          onReady: () => { player.current?.setPlaybackRate(velocidade(st.cfg.speed)); setDur(player.current?.getDuration() || 0); },
          onStateChange: (e) => {
            if (e.data === ESTADO.TOCANDO) setDur(player.current?.getDuration() || 0);
            // no fim de um trecho, passa para o próximo
            if (e.data === ESTADO.FIM && clipRef.current < s.videos.length - 1) trocarClip(clipRef.current + 1, true);
          },
        },
      });
    });
    return () => { vivo = false; player.current?.destroy(); player.current = null; el.remove(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // relógio: lê o tempo do vídeo, guarda a posição e conclui a aula sozinha
  useEffect(() => {
    if (!temVideo) return;
    const id = setInterval(() => {
      const p = player.current;
      if (!p?.getCurrentTime) return;
      const now = p.getCurrentTime() || 0;
      if (Math.abs(now - tRef.current) < 0.25) return;
      tRef.current = now;
      setT(now);
      if (Date.now() - salvoEm.current > 5000) {
        salvoEm.current = Date.now();
        st.setProgress(s.id, { posicao: Math.floor(now), clip: clipRef.current });
      }
    }, 400);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (limite && clip === s.videos.length - 1 && frac >= limite && !st.mapas.progress[s.id]?.feito) st.setProgress(s.id, { feito: true }, true);
  }, [frac, clip, limite]); // eslint-disable-line react-hooks/exhaustive-deps

  const aoDigitar = () => {
    if (!st.cfg.pauseTyping || !player.current) return;
    // pausa se estava tocando; volta 2 s depois da última tecla, só se fomos nós que pausamos
    if (player.current.getPlayerState() === ESTADO.TOCANDO) { player.current.pauseVideo(); pausouDigitando.current = true; }
    if (!pausouDigitando.current) return;
    if (pausadoPorDigitar.current) clearTimeout(pausadoPorDigitar.current);
    pausadoPorDigitar.current = setTimeout(() => { pausouDigitando.current = false; player.current?.playVideo(); }, 2000);
  };

  const pick = (sp: string) => { setSpeed(sp); player.current?.setPlaybackRate(velocidade(sp)); };
  const marcas = (st.marcas[s.id] || []).map((m) => ({ c: Math.floor(m / 100000), t: m % 100000 })).filter((m) => m.c === clip && fim > ini);

  // --- divisor
  const arrastando = useRef(false);
  const clamp = (r: number) => Math.max(0.28, Math.min(0.72, r));
  const divisor = {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => { arrastando.current = true; e.currentTarget.setPointerCapture(e.pointerId); },
    onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!arrastando.current) return;
      const box = e.currentTarget.parentElement!.getBoundingClientRect();
      setRatio(clamp((e.clientX - box.left) / box.width));
    },
    onPointerUp: () => { arrastando.current = false; },
    onPointerCancel: () => { arrastando.current = false; },
    onDoubleClick: () => setRatio(0.46),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); setRatio((r) => clamp(r - 0.04)); }
      if (e.key === 'ArrowRight') { e.preventDefault(); setRatio((r) => clamp(r + 0.04)); }
    },
  };

  const feito = !!prog?.feito;
  const leituras = s.arquivos.filter((a) => a.papel === 'leitura' && /\.pdf$/i.test(a.url));
  const [doc, setDoc] = useState(0);
  const passos = st.porCurso[s.course_id] || [];
  const idx = passos.findIndex((x) => x.id === s.id);
  const curso = st.courses.find((c) => c.id === s.course_id)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <Topo s={s} extra={
        <button className={'btn sm ' + (feito ? 'ghost' : 'soft')} onClick={() => st.setProgress(s.id, { feito: !feito }, true)} aria-pressed={feito}
          style={feito ? { color: 'var(--done-ink)', borderColor: 'var(--done-soft)' } : undefined}>
          {feito ? <><Icon d={P.check} size={14} sw={2.4} />Aula feita</> : 'Marcar como feita'}
        </button>} />

      <div className="split">
        <section className="pane-l" aria-label={temVideo ? 'Vídeo e apoio' : 'Leitura e apoio'} style={{ flex: `0 0 ${(ratio * 100).toFixed(1)}%` }}>
          {temVideo ? (
            <>
              <div className="player" ref={caixa} aria-label={`Vídeo: ${v?.titulo}`} />
              <div className="vbar">
                <div className="tl" role="slider" aria-label="Posição no vídeo; as marcas são suas anotações" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(frac * 100)} tabIndex={0}
                  onClick={(e) => { const b = e.currentTarget.getBoundingClientRect(); irPara(clip, ini + ((e.clientX - b.left) / b.width) * (fim - ini)); }}
                  onKeyDown={(e) => { if (e.key === 'ArrowRight') irPara(clip, t + 10); if (e.key === 'ArrowLeft') irPara(clip, Math.max(ini, t - 10)); }}>
                  <div className="tr" /><div className="pr" style={{ width: `${frac * 100}%` }} />
                  {marcas.map((m, i) => <span key={i} className="mk" title={mmss(m.t)} style={{ left: `${((m.t - ini) / (fim - ini)) * 100}%` }} />)}
                </div>
                <div className="vrow">
                  <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{mmss(t)}{fim ? ` / ${mmss(fim)}` : ''} · marcas amarelas = suas anotações</span>
                  <Seg label="Velocidade do vídeo" opts={VELOCIDADES} value={speed} onPick={pick} mono />
                </div>
                {s.videos.length > 1 && (
                  <div className="clips" role="group" aria-label="Trechos da aula">
                    {s.videos.map((vv, i) => (
                      <button key={i} aria-pressed={i === clip} className={i < clip ? 'seen' : ''} title={vv.titulo} onClick={() => trocarClip(i, true)}>
                        {vv.start == null && i > 0 ? `extra ${i + 1}` : `trecho ${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}
                <span className="caption" style={{ fontSize: 12 }}>{v?.titulo} · MIT OpenCourseWare · Prof. {curso.professor}</span>
              </div>
            </>
          ) : leituras.length ? (
            <div className="reader">
              <div className="hd">
                {leituras.length > 1 ? (
                  <div className="tabs" role="tablist">{leituras.map((a, i) => <button key={a.url} role="tab" aria-selected={i === doc} onClick={() => setDoc(i)}>{a.rotulo}</button>)}</div>
                ) : <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{leituras[0].rotulo}</span>}
                <a href={leituras[doc].url} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600 }}>Abrir em nova aba</a>
              </div>
              <iframe src={leituras[doc].url} title={leituras[doc].rotulo} />
            </div>
          ) : (
            <div className="reader" style={{ padding: 22, gap: 12, minHeight: 0, flexGrow: 0 }}>
              <span className="caption">Aula de leitura</span>
              <p style={{ margin: 0, fontFamily: 'var(--f-read)', fontSize: 19 }}>{s.sub || 'Leia o material indicado na página do curso.'}</p>
              {s.pagina && <a className="btn ghost" style={{ alignSelf: 'flex-start' }} href={s.pagina} target="_blank" rel="noreferrer">Abrir leituras no MIT OCW</a>}
            </div>
          )}

          <div className="support">
            <div className="tabs" role="tablist" aria-label="Apoio da aula">
              {([['fichas', `Fichas · ${st.cards.filter((c) => c.step_id === s.id).length}`], ['material', 'Material'], ['sobre', 'Sobre']] as const).map(([id, l]) => (
                <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{l}</button>
              ))}
            </div>
            <div className="body">
              {tab === 'fichas' && <FichasDaEtapa s={s} frente={frente} setFrente={setFrente} />}
              {tab === 'material' && <Arquivos lista={s.arquivos} pagina={s.pagina} />}
              {tab === 'sobre' && (
                <dl className="dl">
                  <dt>Na trilha</dt><dd>Etapa {idx + 1} de {passos.length}{passos[idx + 1] ? ` · depois vem ${passos[idx + 1].titulo}` : ''}</dd>
                  {s.grupo && <><dt>Parte</dt><dd>{s.grupo}</dd></>}
                  {s.titulo_original && <><dt>Original</dt><dd>{s.titulo_original}</dd></>}
                  {s.sub && temVideo && <><dt>Leitura</dt><dd>{s.sub}</dd></>}
                  <dt>Conclusão</dt><dd>{temVideo && limite ? `Automática ao assistir ${st.cfg.autoDone} do vídeo${s.videos.length > 1 ? ' (último trecho)' : ''}` : 'Manual, no botão do topo'}</dd>
                  <dt>Crédito</dt><dd>MIT OpenCourseWare · Prof. {curso.professor} · CC BY-NC-SA</dd>
                  {s.pagina && <><dt>Página</dt><dd><a href={s.pagina} target="_blank" rel="noreferrer">Página da aula no MIT OCW</a></dd></>}
                </dl>
              )}
            </div>
          </div>
        </section>

        <button className="divider" aria-label={`Divisor entre ${temVideo ? 'vídeo' : 'leitura'} e caderno, em ${Math.round(ratio * 100)}%. Use as setas para ajustar.`}
          title="Arraste para redimensionar · duplo clique volta ao meio" {...divisor}><span className="grip" /></button>

        <Caderno s={s} comTempo={temVideo} agora={() => ({ c: clipRef.current, t: tRef.current })} irPara={irPara} aoDigitar={aoDigitar}
          virarFicha={(txt) => { setFrente(txt); setTab('fichas'); }} />
      </div>
    </div>
  );
}
