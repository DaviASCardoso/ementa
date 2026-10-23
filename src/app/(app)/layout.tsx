import { db } from '@/lib/db';
import type { Card, Course, Dados, Mistake, Note, Progress, Step, Submission } from '@/lib/types';
import { Store } from '@/components/Store';
import { Shell } from '@/components/Shell';

// O Supabase devolve no máximo 1000 linhas por pedido: lê em páginas.
async function todos<T>(tabela: string, colunas = '*', ordem?: string): Promise<T[]> {
  const out: T[] = [];
  for (let de = 0; ; de += 1000) {
    let q = db().from(tabela).select(colunas);
    if (ordem) q = q.order(ordem);
    const { data, error } = await q.range(de, de + 999);
    if (error) throw new Error(`Supabase (${tabela}): ${error.message}`);
    out.push(...(data as T[]));
    if (data.length < 1000) return out;
  }
}

export const dynamic = 'force-dynamic';

// O catálogo e os seus dados são carregados uma vez; dali em diante o cliente grava aos poucos.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [courses, steps, progress, notes, cards, submissions, mistakes, settings] = await Promise.all([
    todos<Course>('courses', '*', 'ordem'),
    todos<Step>('steps', '*', 'id'),
    todos<Progress>('progress'),
    todos<Pick<Note, 'step_id' | 'marcas'>>('notes', 'step_id,marcas'),
    todos<Card>('cards', '*', 'criada_em'),
    todos<Submission>('submissions'),
    todos<Mistake>('mistakes', '*', 'vence'),
    db().from('settings').select('*').eq('id', 'cfg').maybeSingle(),
  ]);
  const dados: Dados = { progress, notes, cards, submissions, mistakes, settings: settings.data?.valor ?? {} };
  return (
    <Store courses={courses} steps={steps} dados={dados}>
      <Shell>{children}</Shell>
    </Store>
  );
}
