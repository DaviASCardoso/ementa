// Carrega data/catalog.json no Supabase (matérias e etapas). Pode rodar de novo à vontade:
// atualiza o que mudou e remove etapas que saíram do catálogo.
// Uso: node --env-file=.env.local scripts/seed.mjs
import fs from 'node:fs';

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Defina SUPABASE_URL e SUPABASE_SECRET_KEY');
const cat = JSON.parse(fs.readFileSync(new URL('../data/catalog.json', import.meta.url), 'utf8'));

const headers = { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}`, 'Content-Type': 'application/json' };

async function rest(path, init) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { ...headers, ...init?.headers } });
  if (!r.ok) throw new Error(`${init?.method || 'GET'} ${path}: ${r.status} ${await r.text()}`);
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}
// uma requisição = uma transação; a unique(course_id, ordem) é adiada até o fim dela
const upsert = (table, rows) => rest(`${table}?on_conflict=id`, { method: 'POST', body: JSON.stringify(rows), headers: { Prefer: 'resolution=merge-duplicates,return=minimal' } });

await upsert('courses', cat.courses);

const ids = new Set(cat.steps.map((s) => s.id));
const old = await rest('steps?select=id');
const gone = old.filter((s) => !ids.has(s.id)).map((s) => s.id);
if (gone.length) await rest(`steps?id=in.(${gone.map((i) => `"${i}"`).join(',')})`, { method: 'DELETE' });

await upsert('steps', cat.steps);

console.log(`ok: ${cat.courses.length} matérias, ${cat.steps.length} etapas, ${gone.length} removidas`);
