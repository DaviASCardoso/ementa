import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Resposta, Step } from '@/lib/types';

// Correção com o Gemini. A chave vem do aparelho (cabeçalho x-gemini-key) e não é guardada.
// Mandamos os PDFs do enunciado e do gabarito (quando há) e as suas respostas.

const API = 'https://generativelanguage.googleapis.com/v1beta';
const MODELO = 'gemini-flash-latest';
export const maxDuration = 60;

const RIGOR: Record<string, string> = {
  Tolerante: 'Seja tolerante: aceite arredondamentos e passos omitidos quando o resultado está certo.',
  Padrão: 'Corrija como um monitor do MIT: o resultado precisa estar certo e o raciocínio, claro.',
  Rigoroso: 'Seja rigoroso: cobre todas as etapas do raciocínio e a notação correta.',
};

async function pdf(url: string) {
  if (!url.startsWith('https://ocw.mit.edu/')) return null;
  const r = await fetch(url);
  if (!r.ok || !(r.headers.get('content-type') || '').includes('pdf')) return null;
  return { inline_data: { mime_type: 'application/pdf', data: Buffer.from(await r.arrayBuffer()).toString('base64') } };
}

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

  const enunciados = step.arquivos.filter((a) => a.papel === 'enunciado').slice(0, 2);
  const gabaritos = step.arquivos.filter((a) => a.papel === 'gabarito').slice(0, 2);
  const partes: object[] = [];
  for (const a of enunciados) { const p = await pdf(a.url); if (p) partes.push({ text: `Enunciado (${a.rotulo}):` }, p); }
  for (const a of gabaritos) { const p = await pdf(a.url); if (p) partes.push({ text: `Gabarito oficial (${a.rotulo}):` }, p); }
  const semGabarito = !gabaritos.length && !step.gabarito_junto;

  const instrucao = [
    'Você corrige exercícios de economia e matemática de um curso do MIT OpenCourseWare, para um estudante brasileiro.',
    semGabarito ? 'Não há gabarito oficial: resolva você mesmo antes de corrigir e diga que a correção foi feita sem gabarito.'
      : step.gabarito_junto ? 'O PDF traz enunciado e solução juntos: use a solução como gabarito.' : 'Use o gabarito oficial como referência.',
    RIGOR[rigor || 'Padrão'] || RIGOR['Padrão'],
    'Dê uma nota de 0 a 10 (uma casa decimal) para o conjunto, um comentário curto em português por questão e liste os erros conceituais que valem revisar.',
    'Responda só com JSON: {"nota": number, "comentario": string, "erros": [{"questao": string, "descricao": string}]}.',
  ].join('\n');

  const texto = respostas.map((r) => `Questão ${r.q}:\n${r.texto || '(em branco)'}`).join('\n\n');
  const body = {
    system_instruction: { parts: [{ text: instrucao }] },
    contents: [{ role: 'user', parts: [...partes, { text: `Respostas do estudante para ${step.titulo}:\n\n${texto}` }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
  };
  const r = await fetch(`${API}/models/${MODELO}:generateContent`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body),
  });
  if (!r.ok) return NextResponse.json({ erro: `O Gemini respondeu ${r.status}: ${(await r.text()).slice(0, 300)}` }, { status: 502 });
  const j = await r.json();
  const raw = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';
  try {
    const out = JSON.parse(raw.replace(/^```(json)?|```$/g, '').trim());
    return NextResponse.json({ nota: Number(out.nota), comentario: String(out.comentario || ''), erros: Array.isArray(out.erros) ? out.erros : [], semGabarito });
  } catch {
    return NextResponse.json({ erro: 'Não entendi a resposta do Gemini.', bruto: raw.slice(0, 500) }, { status: 502 });
  }
}
