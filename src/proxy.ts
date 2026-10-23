import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE, sessaoValida } from '@/lib/auth';

// Tudo exige sessão, menos a tela de entrada.
export async function proxy(req: NextRequest) {
  if (await sessaoValida(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith('/api/')) return NextResponse.json({ erro: 'sessão expirada' }, { status: 401 });
  const url = new URL('/entrar', req.url);
  if (req.nextUrl.pathname !== '/') url.searchParams.set('volta', req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!entrar|api/entrar|_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)'],
};
