import type { Course, Progress, Settings, Step, Submission } from './types';
import { lerNota } from './format';

export type Mapas = {
  progress: Record<string, Progress>;
  submissions: Record<string, Submission>;
};

export const feita = (s: Step, m: Mapas) =>
  s.tipo === 'aula' ? !!m.progress[s.id]?.feito : m.submissions[s.id]?.nota != null;

export const notaMinima = (cfg: Settings) => lerNota(cfg.minGrade) ?? 7;

// Matéria aprovada: nota mínima na prova final; sem prova final, todas as etapas feitas.
export function aprovada(c: Course, steps: Step[], m: Mapas, cfg: Settings) {
  const fin = steps.find((s) => s.final);
  if (!fin) return steps.length > 0 && steps.every((s) => s.opcional || feita(s, m));
  const n = m.submissions[fin.id]?.nota;
  return n != null && n >= notaMinima(cfg);
}

export type Situacao = 'aprovada' | 'estudando' | 'bloqueada' | 'apoio';

export function situacoes(courses: Course[], porCurso: Record<string, Step[]>, m: Mapas, cfg: Settings) {
  const out: Record<string, Situacao> = {};
  let atual: string | null = null;
  let liberada = true;
  for (const c of courses) {
    if (c.alternativa) { out[c.id] = 'apoio'; continue; }
    if (aprovada(c, porCurso[c.id] || [], m, cfg)) { out[c.id] = 'aprovada'; continue; }
    if (liberada) { out[c.id] = 'estudando'; atual ??= c.id; liberada = false; }
    else out[c.id] = 'bloqueada';
  }
  if (!atual) atual = courses.filter((c) => !c.alternativa).at(-1)?.id ?? courses[0]?.id ?? null;
  return { situacao: out, atual };
}

export const etapaAtual = (steps: Step[], m: Mapas) => steps.find((s) => !s.opcional && !feita(s, m)) ?? null;

// Matéria que vem depois na sequência (para o texto "7,0 libera a 14.02")
export const proxima = (courses: Course[], id: string) => {
  const seq = courses.filter((c) => !c.alternativa);
  const i = seq.findIndex((c) => c.id === id);
  return i >= 0 ? seq[i + 1] ?? null : null;
};

export const rotuloEtapa = (s: Step) =>
  s.tipo === 'aula' ? (s.n ? (/^R/.test(s.n) ? 'revisão' : `aula ${s.n.padStart(2, '0')}`) : 'aula') : s.titulo;
