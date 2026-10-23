import { NextResponse } from 'next/server';
import { db, TABELAS, type Tabela } from '@/lib/db';

const ORDEM = Object.keys(TABELAS) as Tabela[];

// Exporta tudo o que é seu (o catálogo fica de fora: ele sai do material do curso)
export async function GET() {
  const out: Record<string, unknown> = { app: 'ementa', versao: 1, exportado_em: new Date().toISOString() };
  for (const t of ORDEM) {
    const { data, error } = await db().from(t).select('*');
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
    out[t] = data;
  }
  return new NextResponse(JSON.stringify(out, null, 1), {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="ementa-backup-${out.exportado_em!.toString().slice(0, 10)}.json"` },
  });
}

// Restaura um backup: apaga os dados atuais e grava os do arquivo
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || b.app !== 'ementa') return NextResponse.json({ erro: 'arquivo não é um backup da Ementa' }, { status: 400 });
  const erro = await apagar();
  if (erro) return NextResponse.json({ erro }, { status: 500 });
  const { data: steps } = await db().from('steps').select('id');
  const existe = new Set((steps || []).map((s) => s.id));
  for (const t of ORDEM) {
    let linhas = Array.isArray(b[t]) ? b[t] : [];
    // etapas que saíram do catálogo: progresso some; fichas e erros ficam soltos
    if (['progress', 'notes', 'submissions'].includes(t)) linhas = linhas.filter((l: { step_id: string }) => existe.has(l.step_id));
    if (['cards', 'mistakes'].includes(t)) linhas = linhas.map((l: { step_id: string | null }) => (l.step_id && !existe.has(l.step_id) ? { ...l, step_id: null } : l));
    if (!linhas.length) continue;
    const { error } = await db().from(t).insert(linhas);
    if (error) return NextResponse.json({ erro: `${t}: ${error.message}` }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const erro = await apagar();
  return erro ? NextResponse.json({ erro }, { status: 500 }) : NextResponse.json({ ok: true });
}

async function apagar() {
  for (const t of ORDEM) {
    const { error } = await db().from(t).delete().not(TABELAS[t], 'is', null);
    if (error) return `${t}: ${error.message}`;
  }
  return null;
}
