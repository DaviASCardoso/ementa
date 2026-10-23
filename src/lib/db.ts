import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Só o servidor fala com o Supabase, com a chave secreta.
export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL e SUPABASE_SECRET_KEY não configuradas');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Tabelas de dados do estudo que o cliente pode gravar, com a chave de cada uma
export const TABELAS = {
  progress: 'step_id',
  notes: 'step_id',
  cards: 'id',
  submissions: 'step_id',
  mistakes: 'id',
  settings: 'id',
} as const;
export type Tabela = keyof typeof TABELAS;
export const ehTabela = (t: string): t is Tabela => t in TABELAS;
