import type { Card } from './types';
import { hoje, somarDias } from './format';

// Repetição espaçada no estilo SM-2, com as quatro notas do protótipo.
export type Nota = 'errei' | 'dificil' | 'bom' | 'facil';

export function proxima(c: Pick<Card, 'intervalo' | 'facilidade' | 'repeticoes' | 'lapsos'>, n: Nota) {
  const { repeticoes, lapsos } = c;
  let { intervalo } = c;
  let facilidade = Number(c.facilidade) || 2.5;
  if (n === 'errei') {
    return { intervalo: 0, facilidade: Math.max(1.3, facilidade - 0.2), repeticoes: 0, lapsos: lapsos + 1 };
  }
  const base = repeticoes === 0 ? 1 : repeticoes === 1 ? 3 : Math.round(intervalo * facilidade);
  if (n === 'dificil') intervalo = Math.max(repeticoes === 0 ? 1 : 2, Math.round(Math.max(1, intervalo) * 1.2));
  if (n === 'bom') intervalo = Math.max(1, base);
  if (n === 'facil') intervalo = Math.max(4, Math.round(base * 1.3) + 1);
  facilidade = n === 'dificil' ? Math.max(1.3, facilidade - 0.15) : n === 'facil' ? facilidade + 0.15 : facilidade;
  return { intervalo, facilidade: Math.round(facilidade * 100) / 100, repeticoes: repeticoes + 1, lapsos };
}

export function aplicar(c: Card, n: Nota): Card {
  const p = proxima(c, n);
  return { ...c, ...p, vence: somarDias(hoje(), p.intervalo), revisada_em: new Date().toISOString() };
}
