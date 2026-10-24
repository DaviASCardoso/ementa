import 'server-only';
import type { Step } from './types';

// Chamadas ao Gemini. A chave vem do aparelho (cabeçalho x-gemini-key) e não é guardada.
export const API = 'https://generativelanguage.googleapis.com/v1beta';
export const MODELO = 'gemini-flash-latest';

async function pdf(url: string) {
  if (!url.startsWith('https://ocw.mit.edu/')) return null;
  const r = await fetch(url);
  if (!r.ok || !(r.headers.get('content-type') || '').includes('pdf')) return null;
  return { inline_data: { mime_type: 'application/pdf', data: Buffer.from(await r.arrayBuffer()).toString('base64') } };
}

// PDFs do enunciado e do gabarito da etapa, como partes da mensagem
export async function pdfsDaEtapa(step: Step) {
  const enunciados = step.arquivos.filter((a) => a.papel === 'enunciado').slice(0, 2);
  const gabaritos = step.arquivos.filter((a) => a.papel === 'gabarito').slice(0, 2);
  const partes: object[] = [];
  for (const a of enunciados) { const p = await pdf(a.url); if (p) partes.push({ text: `Enunciado (${a.rotulo}):` }, p); }
  for (const a of gabaritos) { const p = await pdf(a.url); if (p) partes.push({ text: `Gabarito oficial (${a.rotulo}):` }, p); }
  return { partes, semGabarito: !gabaritos.length && !step.gabarito_junto };
}

// Pede uma resposta em JSON; devolve o objeto ou um erro legível
export async function gerarJson<T>(key: string, instrucao: string, partes: object[], temperature: number): Promise<{ ok: true; out: T } | { ok: false; erro: string }> {
  const body = {
    system_instruction: { parts: [{ text: instrucao }] },
    contents: [{ role: 'user', parts: partes }],
    generationConfig: { responseMimeType: 'application/json', temperature },
  };
  const r = await fetch(`${API}/models/${MODELO}:generateContent`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body),
  });
  if (!r.ok) return { ok: false, erro: `O Gemini respondeu ${r.status}: ${(await r.text()).slice(0, 300)}` };
  const j = await r.json();
  const raw = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';
  try {
    return { ok: true, out: JSON.parse(raw.replace(/^```(json)?|```$/g, '').trim()) as T };
  } catch {
    return { ok: false, erro: 'Não entendi a resposta do Gemini.' };
  }
}
