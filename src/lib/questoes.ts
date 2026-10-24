'use client';

import { useEffect, useState } from 'react';

// Banco de questões (gerado por scripts/questoes.py e publicado em public/questoes/)

export type Parte = { p?: string; display?: boolean; img?: string; w?: number; h?: number };
export type Opcao = { id: string; texto: string };
export type TipoItem = 'aberta' | 'vf' | 'alternativa' | 'grupo';
export type Item = {
  id: string; pai?: string; tipo: TipoItem; partes: Parte[];
  contexto?: Parte[]; solucao?: Parte[]; opcoes?: Opcao[];
};
export type Questao = {
  n: string; titulo: string; tipo: TipoItem; partes: Parte[]; itens: Item[];
  solucao?: Parte[]; opcoes?: Opcao[]; fonte?: number;
};
export type EtapaQuestoes = { etapa: string; intro: Parte[]; questoes: Questao[]; avisos?: string[] };
export type BancoItem = {
  sid: string; k: number; n: string; titulo: string; curso: string; tipo: 'lista' | 'prova'; etapa: string;
  ordem: number; resumo: string[]; busca: string; itens: number; tipos: TipoItem[]; sol: boolean; fig: boolean;
};

// Um item que recebe resposta: a própria questão quando ela não tem itens
export type Respondivel = { chave: string; rotulo: string; item: Item | null; questao: Questao; k: number };

export const chave = (k: number, itemId = '') => `${k}/${itemId}`;
export const rotulo = (q: Questao, it?: Item | null) => (it ? `${q.n}${/\d$/.test(q.n) && /^\d/.test(it.id) ? '.' : ''}${it.id}` : q.n);

export function respondiveis(eq: EtapaQuestoes): Respondivel[] {
  const out: Respondivel[] = [];
  eq.questoes.forEach((q, k) => {
    const itens = q.itens.filter((it) => it.tipo !== 'grupo');
    if (!itens.length) out.push({ chave: chave(k), rotulo: rotulo(q), item: null, questao: q, k });
    for (const it of itens) out.push({ chave: chave(k, it.id), rotulo: rotulo(q, it), item: it, questao: q, k });
  });
  return out;
}

const cache = new Map<string, Promise<unknown>>();
function buscar<T>(url: string): Promise<T> {
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    }).catch((e) => { cache.delete(url); throw e; }));
  }
  return cache.get(url) as Promise<T>;
}

export const urlEtapa = (sid: string) => `/questoes/${sid}.json`;
export const urlImagem = (sid: string, img: string) => `/questoes/${sid}/${img}`;
export const carregarEtapa = (sid: string) => buscar<EtapaQuestoes>(urlEtapa(sid));
export const carregarBanco = () => buscar<BancoItem[]>('/questoes/banco.json');

// undefined enquanto carrega; null se a etapa não tem questões no banco
export function useEtapaQuestoes(sid: string | null) {
  const [carregada, setCarregada] = useState<{ sid: string; eq: EtapaQuestoes | null } | null>(null);
  useEffect(() => {
    if (!sid) return;
    let vivo = true;
    carregarEtapa(sid).then((r) => vivo && setCarregada({ sid, eq: r.questoes.length ? r : null }))
      .catch(() => vivo && setCarregada({ sid, eq: null }));
    return () => { vivo = false; };
  }, [sid]);
  if (!sid) return null;
  return carregada?.sid === sid ? carregada.eq : undefined;
}

// Texto simples de uma lista de partes (para a IA e para as fichas)
export function textoPartes(ps: Parte[] | undefined) {
  return (ps || []).map((p) => (p.img ? '[figura]' : p.p || '')).join('\n').trim();
}

export function textoRespondivel(r: Respondivel) {
  const q = r.questao;
  const ctx = [q.titulo, textoPartes(q.partes)];
  if (r.item) {
    if (r.item.pai) ctx.push(textoPartes(q.itens.find((i) => i.id === r.item!.pai)?.partes));
    ctx.push(textoPartes(r.item.contexto), `(${r.item.id}) ${textoPartes(r.item.partes)}`);
    if (r.item.opcoes?.length) ctx.push(r.item.opcoes.map((o) => `(${o.id}) ${o.texto}`).join('\n'));
  }
  return ctx.filter(Boolean).join('\n');
}

export const solucaoRespondivel = (r: Respondivel) => (r.item ? r.item.solucao : r.questao.solucao);

// Normaliza para busca: minúsculo, sem acento
export const normalizar = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
