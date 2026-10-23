// Sessão por senha única (APP_PASSWORD). O cookie guarda a validade assinada com HMAC;
// a assinatura inclui a senha, então trocar a senha derruba as sessões abertas.

export const COOKIE = 'ementa_sessao';
const DIAS = 90;

const enc = new TextEncoder();

async function hmac(msg: string): Promise<string> {
  const secret = process.env.SESSION_SECRET || '';
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return Buffer.from(sig).toString('base64url');
}

const senha = () => (process.env.APP_PASSWORD || '').trim();

export async function criarSessao(): Promise<{ valor: string; maxAge: number }> {
  const exp = Date.now() + DIAS * 864e5;
  return { valor: `${exp}.${await hmac(`${exp}:${senha()}`)}`, maxAge: DIAS * 86400 };
}

export async function sessaoValida(valor: string | undefined): Promise<boolean> {
  if (!valor || !process.env.SESSION_SECRET || !senha()) return false;
  const [exp, sig] = valor.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return iguais(sig, await hmac(`${exp}:${senha()}`));
}

export async function senhaCorreta(tentativa: string): Promise<boolean> {
  if (!senha()) return false;
  // compara os resumos para o tempo não depender do conteúdo
  const [a, b] = await Promise.all([tentativa.trim(), senha()].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))));
  return iguais(Buffer.from(a).toString('base64'), Buffer.from(b).toString('base64'));
}

function iguais(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
