'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Card, Course, Dados, Mistake, Note, Progress, Settings, Step, Submission } from '@/lib/types';
import { PADRAO } from '@/lib/types';
import { etapaAtual, situacoes, type Mapas, type Situacao } from '@/lib/progresso';
import { hoje } from '@/lib/format';

type Salvo = 'ok' | 'salvando' | 'erro';

type Ctx = {
  courses: Course[];
  steps: Step[];
  step: (id: string) => Step | undefined;
  porCurso: Record<string, Step[]>;
  mapas: Mapas;
  cards: Card[];
  mistakes: Mistake[];
  marcas: Record<string, number[]>;
  cfg: Settings;
  situacao: Record<string, Situacao>;
  atual: string | null;
  atualEtapa: (courseId: string) => Step | null;
  pendentes: { fichas: number; erros: number };
  salvo: Salvo;
  setProgress: (id: string, patch: Partial<Progress>, imediato?: boolean) => void;
  saveNote: (n: Note) => void;
  saveSubmission: (s: Submission, imediato?: boolean) => void;
  upsertCard: (c: Card) => void;
  deleteCard: (id: string) => void;
  upsertMistake: (m: Mistake) => void;
  deleteMistake: (id: string) => void;
  setCfg: (patch: Partial<Settings>) => void;
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
  travado: boolean;
  setTravado: (v: boolean) => void;
};

const C = createContext<Ctx | null>(null);
export const useStore = () => {
  const c = useContext(C);
  if (!c) throw new Error('useStore fora do Store');
  return c;
};

const porChave = <T,>(rows: T[], k: keyof T) => Object.fromEntries(rows.map((r) => [String(r[k]), r])) as Record<string, T>;

export function Store({ courses, steps, dados, children }: { courses: Course[]; steps: Step[]; dados: Dados; children: React.ReactNode }) {
  const [progress, setProg] = useState(() => porChave(dados.progress, 'step_id'));
  const [submissions, setSubs] = useState(() => porChave(dados.submissions, 'step_id'));
  const [cards, setCards] = useState(dados.cards);
  const [mistakes, setMistakes] = useState(dados.mistakes);
  const [marcas, setMarcas] = useState<Record<string, number[]>>(() => Object.fromEntries(dados.notes.map((n) => [n.step_id, n.marcas || []])));
  const [cfg, setCfgState] = useState<Settings>({ ...PADRAO, ...dados.settings });
  const [salvo, setSalvo] = useState<Salvo>('ok');
  const [navOpen, setNavOpen] = useState(true);
  const [travado, setTravado] = useState(false);

  // --- gravação: cada chave tem seu temporizador; ao sair da página, envia o que falta
  const fila = useRef(new Map<string, { tabela: string; row: object; t: ReturnType<typeof setTimeout> | null }>());
  const emVoo = useRef(0);
  const enviar = useCallback(async (tabela: string, row: object) => {
    emVoo.current++;
    setSalvo('salvando');
    try {
      const r = await fetch(`/api/data/${tabela}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row) });
      // sessão expirou: recarrega inteiro na tela de entrada
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      if (r.status === 401) { location.href = '/entrar?volta=' + encodeURIComponent(location.pathname); return; }
      if (!r.ok) throw new Error(await r.text());
      emVoo.current--;
      if (!emVoo.current && !fila.current.size) setSalvo('ok');
    } catch (e) {
      emVoo.current--;
      console.error(e);
      setSalvo('erro');
    }
  }, []);
  const gravar = useCallback((tabela: string, chave: string, row: object, atraso = 900) => {
    const k = `${tabela}:${chave}`;
    const f = fila.current.get(k);
    if (f?.t) clearTimeout(f.t);
    setSalvo('salvando');
    if (!atraso) { fila.current.delete(k); void enviar(tabela, row); return; }
    const t = setTimeout(() => { fila.current.delete(k); void enviar(tabela, row); }, atraso);
    fila.current.set(k, { tabela, row, t });
  }, [enviar]);
  useEffect(() => {
    const flush = () => {
      for (const [k, f] of fila.current) {
        if (f.t) clearTimeout(f.t);
        navigator.sendBeacon(`/api/data/${f.tabela}`, new Blob([JSON.stringify(f.row)], { type: 'application/json' }));
        fila.current.delete(k);
      }
    };
    const vis = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', vis);
    return () => { window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', vis); };
  }, []);
  const apagar = useCallback(async (tabela: string, id: string) => {
    setSalvo('salvando');
    const r = await fetch(`/api/data/${tabela}?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => null);
    setSalvo(r?.ok ? 'ok' : 'erro');
  }, []);

  // --- derivados
  const porCurso = useMemo(() => {
    const o: Record<string, Step[]> = {};
    for (const s of steps) (o[s.course_id] ??= []).push(s);
    for (const k in o) o[k].sort((a, b) => a.ordem - b.ordem);
    return o;
  }, [steps]);
  const byId = useMemo(() => new Map(steps.map((s) => [s.id, s])), [steps]);
  const mapas = useMemo(() => ({ progress, submissions }), [progress, submissions]);
  const { situacao, atual } = useMemo(() => situacoes(courses, porCurso, mapas, cfg), [courses, porCurso, mapas, cfg]);
  const dia = hoje();
  const pendentes = useMemo(() => ({
    fichas: cards.filter((c) => c.vence <= dia).length,
    erros: mistakes.filter((m) => !m.resolvido && m.vence <= dia).length,
  }), [cards, mistakes, dia]);

  // --- ações
  const setProgress = useCallback((id: string, patch: Partial<Progress>, imediato = false) => {
    setProg((p) => {
      const atual = p[id] ?? { step_id: id, feito: false, feito_em: null, posicao: 0, clip: 0 };
      const novo = { ...atual, ...patch, step_id: id };
      if (patch.feito && !atual.feito) novo.feito_em = new Date().toISOString();
      if (patch.feito === false) novo.feito_em = null;
      gravar('progress', id, novo, imediato ? 0 : 1500);
      return { ...p, [id]: novo };
    });
  }, [gravar]);
  const saveNote = useCallback((n: Note) => {
    setMarcas((m) => ({ ...m, [n.step_id]: n.marcas }));
    gravar('notes', n.step_id, n, 800);
  }, [gravar]);
  const saveSubmission = useCallback((s: Submission, imediato = false) => {
    setSubs((p) => ({ ...p, [s.step_id]: s }));
    gravar('submissions', s.step_id, s, imediato ? 0 : 900);
  }, [gravar]);
  const upsertCard = useCallback((c: Card) => {
    setCards((cs) => (cs.some((x) => x.id === c.id) ? cs.map((x) => (x.id === c.id ? c : x)) : [...cs, c]));
    gravar('cards', c.id, c, 0);
  }, [gravar]);
  const deleteCard = useCallback((id: string) => { setCards((cs) => cs.filter((c) => c.id !== id)); void apagar('cards', id); }, [apagar]);
  const upsertMistake = useCallback((m: Mistake) => {
    setMistakes((ms) => (ms.some((x) => x.id === m.id) ? ms.map((x) => (x.id === m.id ? m : x)) : [...ms, m]));
    gravar('mistakes', m.id, m, 0);
  }, [gravar]);
  const deleteMistake = useCallback((id: string) => { setMistakes((ms) => ms.filter((m) => m.id !== id)); void apagar('mistakes', id); }, [apagar]);
  const setCfg = useCallback((patch: Partial<Settings>) => {
    setCfgState((c) => {
      const novo = { ...c, ...patch };
      gravar('settings', 'cfg', { id: 'cfg', valor: novo }, 400);
      return novo;
    });
  }, [gravar]);

  const value: Ctx = {
    courses, steps, step: (id) => byId.get(id), porCurso, mapas, cards, mistakes, marcas, cfg, situacao, atual,
    atualEtapa: (cid) => etapaAtual(porCurso[cid] || [], mapas),
    pendentes, salvo, setProgress, saveNote, saveSubmission, upsertCard, deleteCard, upsertMistake, deleteMistake, setCfg,
    navOpen, setNavOpen, travado, setTravado,
  };

  return (
    <C.Provider value={value}>
      <div className={cfg.calm ? 'calm' : undefined} style={{ zoom: cfg.scale === '100%' ? undefined : parseInt(cfg.scale) / 100 }}>
        {children}
      </div>
    </C.Provider>
  );
}

export const novoId = () => crypto.randomUUID();
