import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { gerarJson, pdfsDaEtapa } from '@/lib/gemini';
import type { Step } from '@/lib/types';

// Transforma um erro de lista ou prova numa ficha de revisão sobre o conceito por trás dele.
// A pergunta é reescrita com outras palavras e sem alternativas, para não ligar a resposta ao texto do enunciado.
export const maxDuration = 60;

const INSTRUCAO = [
  'Você cria fichas de revisão (flashcards) para um estudante brasileiro de economia que segue cursos do MIT OpenCourseWare.',
  'Recebe o enunciado (e o gabarito, quando há) de uma lista, o número da questão, o erro que o estudante cometeu e a resposta dele.',
  'Crie UMA ficha sobre o conceito ou a teoria que o estudante errou. Regras:',
  '- A frente é uma pergunta aberta, em português. Nunca de múltipla escolha, nunca "qual das alternativas", nunca verdadeiro ou falso.',
  '- Reescreva com outras palavras: não copie frases, nomes, números nem o cenário do enunciado. A pergunta precisa ser respondível só por quem entende o conceito, sem lembrar da questão original.',
  '- Foque em conceito e teoria (definição, intuição, condição, relação entre variáveis, por que algo acontece). Não peça contas.',
  '- O verso é a resposta correta, curta e direta (uma a três frases), em português.',
  'Responda só com JSON: {"frente": string, "verso": string}.',
].join('\n');

export async function POST(req: Request) {
  const key = req.headers.get('x-gemini-key');
  if (!key) return NextResponse.json({ erro: 'Configure a chave do Gemini nas configurações.' }, { status: 400 });
  const { stepId, questao, descricao, resposta, enunciado, solucao } = (await req.json()) as {
    stepId: string; questao: string; descricao: string; resposta?: string; enunciado?: string; solucao?: string;
  };
  const { data: step } = await db().from('steps').select('*').eq('id', stepId).single<Step>();
  if (!step) return NextResponse.json({ erro: 'etapa não encontrada' }, { status: 404 });
  // com o enunciado transcrito (lista interativa) não precisa dos PDFs
  const { partes } = enunciado?.trim() ? { partes: [] as object[] } : await pdfsDaEtapa(step);

  const pedido = [`${step.titulo} · questão ${questao}`, enunciado?.trim() ? `Enunciado:\n${enunciado}` : '',
    solucao?.trim() ? `Solução oficial:\n${solucao}` : '', `Erro: ${descricao}`, `Resposta do estudante: ${resposta?.trim() || '(não informada)'}`]
    .filter(Boolean).join('\n');
  const r = await gerarJson<{ frente?: string; verso?: string }>(key, INSTRUCAO, [...partes, { text: pedido }], 0.7);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: 502 });
  const frente = String(r.out.frente || '').trim(), verso = String(r.out.verso || '').trim();
  if (!frente || !verso) return NextResponse.json({ erro: 'O Gemini não devolveu a ficha.' }, { status: 502 });
  return NextResponse.json({ frente, verso });
}
