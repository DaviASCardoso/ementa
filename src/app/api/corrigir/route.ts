import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { API, MODELO, gerarJson, pdfsDaEtapa } from '@/lib/gemini';
import type { Resposta, Step } from '@/lib/types';

// Correção com o Gemini: mandamos os PDFs do enunciado e do gabarito (quando há) e as suas respostas.
export const maxDuration = 60;

const RIGOR: Record<string, string> = {
  Tolerante: 'Seja tolerante: aceite arredondamentos e passos omitidos quando o resultado está certo.',
  Padrão: 'Corrija como um monitor do MIT: o resultado precisa estar certo e o raciocínio, claro.',
  Rigoroso: 'Seja rigoroso: cobre todas as etapas do raciocínio e a notação correta.',
};

// GET: testa a chave
export async function GET(req: Request) {
  const key = req.headers.get('x-gemini-key');
  if (!key) return NextResponse.json({ ok: false, erro: 'sem chave' }, { status: 400 });
  const r = await fetch(`${API}/models/${MODELO}`, { headers: { 'x-goog-api-key': key } });
  return NextResponse.json({ ok: r.ok, erro: r.ok ? null : `Gemini respondeu ${r.status}` }, { status: r.ok ? 200 : 400 });
}

export async function POST(req: Request) {
  const key = req.headers.get('x-gemini-key');
  if (!key) return NextResponse.json({ erro: 'Configure a chave do Gemini nas configurações.' }, { status: 400 });
  const { stepId, respostas, rigor } = (await req.json()) as { stepId: string; respostas: Resposta[]; rigor?: string };
  const { data: step } = await db().from('steps').select('*').eq('id', stepId).single<Step>();
  if (!step) return NextResponse.json({ erro: 'etapa não encontrada' }, { status: 404 });
  const { partes, semGabarito } = await pdfsDaEtapa(step);

  const instrucao = [
    'Você corrige exercícios de economia e matemática de um curso do MIT OpenCourseWare, para um estudante brasileiro.',
    semGabarito ? 'Não há gabarito oficial: resolva você mesmo antes de corrigir e diga que a correção foi feita sem gabarito.'
      : step.gabarito_junto ? 'O PDF traz enunciado e solução juntos: use a solução como gabarito.' : 'Use o gabarito oficial como referência.',
    RIGOR[rigor || 'Padrão'] || RIGOR['Padrão'],
    'Dê uma nota de 0 a 10 (uma casa decimal) para o conjunto, um comentário curto em português por questão e liste os erros conceituais que valem revisar.',
    'Responda só com JSON: {"nota": number, "comentario": string, "erros": [{"questao": string, "descricao": string}]}.',
  ].join('\n');

  const texto = respostas.map((r) => `Questão ${r.q}:\n${r.texto || '(em branco)'}`).join('\n\n');
  const r = await gerarJson<{ nota: number; comentario: string; erros: unknown }>(key, instrucao, [...partes, { text: `Respostas do estudante para ${step.titulo}:\n\n${texto}` }], 0.2);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: 502 });
  const out = r.out;
  return NextResponse.json({ nota: Number(out.nota), comentario: String(out.comentario || ''), erros: Array.isArray(out.erros) ? out.erros : [], semGabarito });
}
