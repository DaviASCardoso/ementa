import { NextResponse } from 'next/server';
import { COOKIE, criarSessao, senhaCorreta } from '@/lib/auth';

export async function POST(req: Request) {
  const form = await req.formData();
  const volta = String(form.get('volta') || '/');
  const destino = volta.startsWith('/') && !volta.startsWith('//') ? volta : '/';
  if (!(await senhaCorreta(String(form.get('senha') || '')))) {
    await new Promise((r) => setTimeout(r, 600)); // freia tentativas em sequência
    const url = new URL('/entrar', req.url);
    url.searchParams.set('erro', '1');
    if (destino !== '/') url.searchParams.set('volta', destino);
    return NextResponse.redirect(url, 303);
  }
  const { valor, maxAge } = await criarSessao();
  const res = NextResponse.redirect(new URL(destino, req.url), 303);
  res.cookies.set(COOKIE, valor, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge });
  return res;
}
