import { NextResponse } from 'next/server';
import { db, ehTabela, TABELAS } from '@/lib/db';

type Ctx = { params: Promise<{ tabela: string }> };

const erro = (msg: string, status = 400) => NextResponse.json({ erro: msg }, { status });

// GET ?id=… lê uma linha (usado para o HTML das anotações, que não vem na carga inicial)
export async function GET(req: Request, ctx: Ctx) {
  const { tabela } = await ctx.params;
  if (!ehTabela(tabela)) return erro('tabela desconhecida', 404);
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return erro('falta id');
  const { data, error } = await db().from(tabela).select('*').eq(TABELAS[tabela], id).maybeSingle();
  if (error) return erro(error.message, 500);
  return NextResponse.json(data);
}

// POST [linhas] grava (insere ou atualiza)
export async function POST(req: Request, ctx: Ctx) {
  const { tabela } = await ctx.params;
  if (!ehTabela(tabela)) return erro('tabela desconhecida', 404);
  const body = await req.json().catch(() => null);
  const linhas = Array.isArray(body) ? body : body ? [body] : [];
  if (!linhas.length) return erro('nada para gravar');
  const agora = new Date().toISOString();
  const comData = ['progress', 'notes', 'submissions', 'settings'].includes(tabela);
  const { error } = await db().from(tabela).upsert(linhas.map((l) => (comData ? { ...l, updated_at: agora } : l)), { onConflict: TABELAS[tabela] });
  if (error) return erro(error.message, 500);
  return NextResponse.json({ ok: true });
}

// DELETE ?id=… apaga uma linha
export async function DELETE(req: Request, ctx: Ctx) {
  const { tabela } = await ctx.params;
  if (!ehTabela(tabela)) return erro('tabela desconhecida', 404);
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return erro('falta id');
  const { error } = await db().from(tabela).delete().eq(TABELAS[tabela], id);
  if (error) return erro(error.message, 500);
  return NextResponse.json({ ok: true });
}
