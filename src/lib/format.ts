export const mmss = (s: number) => {
  s = Math.max(0, Math.floor(s || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const mm = String(m).padStart(2, '0'), ss = String(r).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export const nota = (n: number | null | undefined) => (n == null ? '' : n.toFixed(1).replace('.', ','));
export const lerNota = (s: string) => {
  const n = parseFloat(String(s).replace(',', '.'));
  return Number.isFinite(n) ? Math.min(10, Math.max(0, Math.round(n * 10) / 10)) : null;
};

// datas em 'YYYY-MM-DD' no fuso local
export const hoje = () => iso(new Date());
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const somarDias = (dia: string, n: number) => {
  const [y, m, d] = dia.split('-').map(Number);
  return iso(new Date(y, m - 1, d + n));
};
export const diasAte = (dia: string) => {
  const [y, m, d] = dia.split('-').map(Number);
  const [a, b, c] = hoje().split('-').map(Number);
  return Math.round((new Date(y, m - 1, d).getTime() - new Date(a, b - 1, c).getTime()) / 864e5);
};
export const relativo = (dia: string) => {
  const n = diasAte(dia);
  if (n === 0) return 'para hoje';
  if (n === 1) return 'amanhã';
  if (n > 1) return `em ${n} dias`;
  return n === -1 ? 'atrasada 1 dia' : `atrasada ${-n} dias`;
};
export const emDias = (n: number) => (n <= 0 ? 'volta hoje' : n === 1 ? 'amanhã' : `em ${n} dias`);

export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
