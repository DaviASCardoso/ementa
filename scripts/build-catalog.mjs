// Gera data/catalog.json a partir de ementa-material-do-curso.md e de data/raw/sc-raw.json
// (raspagem das sessões do 18.01SC e 18.02SC). Uso: node scripts/build-catalog.mjs
import fs from 'node:fs';
import { tr, G } from './traducoes.mjs';

const md = fs.readFileSync(new URL('../ementa-material-do-curso.md', import.meta.url), 'utf8').split(/\r?\n/);
const sc = JSON.parse(fs.readFileSync(new URL('../data/raw/sc-raw.json', import.meta.url), 'utf8'));

// primeira tabela depois do título que começa com `heading`
function table(heading) {
  const i = md.findIndex((l) => l.startsWith(heading));
  if (i < 0) throw new Error('seção não encontrada: ' + heading);
  const out = [];
  let j = i + 1;
  while (j < md.length && !md[j].startsWith('|')) j++;
  j += 2; // cabeçalho e separador
  for (; j < md.length && md[j].startsWith('|'); j++) {
    out.push(md[j].slice(1, -1).split('|').map((c) => c.trim().replace(/^`|`$/g, '').replace(/\*\*/g, '')));
  }
  return out;
}
const none = (v) => !v || v === '—' || v === '-' || v.startsWith('não');

const courses = [];
const steps = [];

function course(c) { courses.push({ tem: [], falta: '', aviso: '', alternativa: false, nota_minima: 7.0, ...c, ordem: courses.length + 1 }); return c; }

// Constrói as etapas de uma matéria a partir de uma lista ordenada.
function push(courseId, list) {
  list.forEach((s, i) => {
    const id = s.id || `${courseId}/${s.tipo}-${String(s.n ?? i + 1).toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
    if (steps.find((x) => x.id === id)) throw new Error('id repetido ' + id);
    steps.push({
      id, course_id: courseId, ordem: i + 1, tipo: s.tipo, n: s.n != null ? String(s.n) : null,
      titulo: s.titulo, titulo_original: s.titulo_original || null, grupo: s.grupo || null, sub: s.sub || null,
      sugestao: !!s.sugestao, opcional: !!s.opcional, revisao: !!s.revisao, treino: !!s.treino, final: !!s.final,
      pagina: s.pagina || null, videos: s.videos || [], arquivos: (s.arquivos || []).filter((a) => a.url),
      gabarito_junto: !!s.gabarito_junto,
    });
  });
}
const file = (base, f) => (none(f) ? null : base + f);
const page = (base, p) => (none(p) ? null : base + p.replace(/^\//, ''));
const yt = (id, titulo) => (none(id) ? [] : [{ yt: id, start: null, end: null, titulo }]);

// ---------------------------------------------------------------- 14.01
{
  const base = 'https://ocw.mit.edu/courses/14-01-principles-of-microeconomics-fall-2023/';
  course({ id: '14.01', titulo: 'Princípios de Microeconomia', versao: 'Fall 2023', professor: 'Jonathan Gruber', base,
    tem: ['vídeos', 'resumos e handouts', 'listas + gabarito', 'provas + gabarito'] });
  const aulas = table('### 3.2 Aulas').map(([n, t, pg, id, resumo, handout]) => ({
    tipo: 'aula', n: +n, titulo: tr(t), titulo_original: t, pagina: page(base, pg), videos: yt(id, `Lecture ${n}: ${t}`),
    arquivos: [{ rotulo: 'Resumo da aula', url: file(base, resumo), papel: 'material' }, { rotulo: 'Handout', url: file(base, handout), papel: 'material' }],
  }));
  const listas = table('### 3.3 Listas').map(([n, enun, gab]) => ({
    tipo: 'lista', n: +n, titulo: `Lista ${n}`, pagina: page(base, 'lists/problem-sets/'),
    arquivos: [{ rotulo: 'Enunciado', url: file(base, enun), papel: 'enunciado' }, { rotulo: 'Gabarito', url: file(base, gab), papel: 'gabarito' }],
  }));
  const prova = (n, titulo, f, sub, final) => ({ tipo: 'prova', n, titulo, sub, final, gabarito_junto: true, pagina: page(base, 'lists/exams/'),
    arquivos: [{ rotulo: 'Prova com gabarito no mesmo PDF', url: file(base, f), papel: 'enunciado' }] });
  const after = { 6: [listas[0]], 8: [listas[1]], 9: [listas[2]], 11: [listas[3]], 13: [prova('1', 'Prova intermediária', 'mit14_01_f23_midterm.pdf', 'Aulas 1 a 13, sem consulta')],
    15: [listas[4]], 19: [listas[5]], 21: [listas[6]], 23: [listas[7]], 26: [prova('final', 'Prova final', 'mit14_01_f23_final.pdf', 'Matéria inteira, sem consulta', true)] };
  const list = [];
  aulas.forEach((a) => { list.push(a); (after[a.n] || []).forEach((x) => list.push(x)); });
  push('14.01', list);
}

// ---------------------------------------------------------------- 14.02
{
  const base = 'https://ocw.mit.edu/courses/14-02-principles-of-macroeconomics-spring-2023/';
  course({ id: '14.02', titulo: 'Princípios de Macroeconomia', versao: 'Spring 2023', professor: 'Ricardo Caballero', base,
    tem: ['vídeos', 'listas + gabarito', 'provas + gabarito'], falta: 'notas de aula',
    aviso: 'O MIT não publica as datas das listas: a posição delas na trilha é uma sugestão. Livro-texto: Blanchard, Macroeconomics.' });
  const aulas = table('### 4.1 Aulas').map(([n, t, pg, id]) => ({
    tipo: 'aula', n: +n, titulo: tr(t), titulo_original: t, revisao: /Review/.test(t), pagina: page(base, pg), videos: yt(id, `Lecture ${n}: ${t}`),
  }));
  const listas = table('### 4.2 Listas').map(([n, enun, gab]) => ({
    tipo: 'lista', n: +n, titulo: `Lista ${n}`, sugestao: true, pagina: page(base, 'pages/problem-sets/'),
    arquivos: [{ rotulo: 'Enunciado', url: file(base, enun), papel: 'enunciado' }, { rotulo: 'Gabarito', url: file(base, gab), papel: 'gabarito' }],
  }));
  const q = table('### 4.3 Provas').map(([nome, enun, gab], i) => {
    const junto = gab.startsWith('no mesmo');
    return { tipo: 'prova', n: String(i + 1), titulo: `Prova ${i + 1}`, final: i === 2, gabarito_junto: junto, pagina: page(base, 'pages/quizzes/'),
      sub: i === 0 ? 'Aulas 1 a 9, sem consulta' : i === 1 ? 'Aulas 11 a 17, sem consulta' : 'Aulas 19 a 24, sem consulta',
      arquivos: junto ? [{ rotulo: 'Prova com gabarito no mesmo PDF', url: file(base, enun), papel: 'enunciado' }]
        : [{ rotulo: 'Enunciado', url: file(base, enun), papel: 'enunciado' }, { rotulo: 'Gabarito', url: file(base, gab), papel: 'gabarito' }] };
  });
  const posLista = Object.fromEntries(table('**Sugestão** de posição').map(([l, a]) => [+a, +l]));
  const list = [];
  for (const a of aulas) {
    list.push(a);
    if (posLista[a.n]) list.push(listas[posLista[a.n] - 1]);
    if (a.n === 10) list.push(q[0]);
    if (a.n === 18) list.push(q[1]);
    if (a.n === 25) list.push(q[2]);
  }
  push('14.02', list);
}

// ------------------------------------------------- 18.01SC e 18.02SC (sessões)
function scCourse(id, items, base) {
  const list = [];
  let lastProva = 0;
  const label = (r) => {
    const t = r.title || '';
    const sol = /sol/i.test(r.pdf || '') || /Solution/.test(t);
    if (/^problems?-set|^solutions/.test(r.secao)) return sol ? 'Gabarito' : 'Enunciado';
    if (/worked-example|^examples|exmaples/.test(r.secao)) return (t.match(/Example: (.+)/) ? 'Exemplo: ' + t.match(/Example: (.+)/)[1] : 'Exemplo resolvido') + (sol && !/comb/.test(r.pdf) ? ' · solução' : '');
    if (/problems-and-solutions/.test(r.secao)) return sol || /comb/.test(r.pdf) ? 'Problemas · soluções' : 'Problemas';
    if (/reading/.test(r.secao)) return 'Leitura' + (/Example/.test(t) ? ' e exemplos' : '');
    return t.replace(/\.pdf$/i, '').replace(/^Session \d+:? ?/, '') || 'Material';
  };
  for (const it of items) {
    const g = (it.unidade || '').replace(/^Unidade (\d+) · (.+)$/, (_, n, nome) => `Unidade ${n} · ${G[nome] || nome}`);
    const rawTitle = (it.titulo || '').replace(/^\./, '');
    const m = rawTitle.match(/^Session (\d+):\s*(.+)$/);
    const vids = it.recursos.filter((r) => r.youtube).map((r) => ({ yt: r.youtube, start: r.start, end: r.end, titulo: r.title }));
    const pdfs = it.recursos.filter((r) => r.pdf);
    if (it.tipo === 'aula') {
      list.push({ tipo: 'aula', n: m ? m[1] : null, titulo: m ? tr(m[2]) : tr(rawTitle), titulo_original: rawTitle, grupo: g + (it.parte && !/^Prova|^Revisão/.test(it.parte) ? ' · ' + it.parte.replace(/^Parte (\w) · (.+)$/, 'parte $1') : ''),
        revisao: !!it.revisao || /Review/.test(rawTitle), opcional: !!it.opcional, pagina: base + it.path.replace(/^pages\//, 'pages/'),
        videos: vids, arquivos: pdfs.map((r) => ({ rotulo: label(r), url: base + r.pdf, papel: /sol/i.test(r.pdf) ? 'gabarito' : /reading/.test(r.secao) ? 'leitura' : 'material' })) });
    } else if (it.tipo === 'lista') {
      list.push({ tipo: 'lista', n: it.n, titulo: `Lista ${it.n}`, grupo: g, pagina: base + it.path,
        arquivos: pdfs.map((r) => {
          const sup = /sup/i.test(r.pdf); const sol = /sol/i.test(r.pdf);
          return { rotulo: sup ? 'Problemas extras' + (sol ? ' · gabarito' : '') : sol ? 'Gabarito' : 'Enunciado', url: base + r.pdf, papel: sol ? 'gabarito' : sup ? 'material' : 'enunciado' };
        }) });
    } else {
      const treino = it.tipo === 'treino';
      const final = !!it.final || (it.parte === 'Prova final' && !treino);
      if (!treino) lastProva++;
      const n = final ? 'final' : treino ? `treino-${lastProva + 1}${it.unidade === 'Prova final' ? 'f' : ''}` : String(lastProva);
      list.push({ tipo: 'prova', n, treino, final, grupo: g,
        titulo: treino ? (final || it.unidade === 'Prova final' ? 'Prova final · treino' : `Prova ${lastProva + 1} · treino`) : final ? 'Prova final' : `Prova ${lastProva}`,
        sub: treino ? 'Treino, não conta para liberar' : final ? 'Matéria inteira, sem consulta' : 'Sem consulta',
        pagina: base + it.path,
        arquivos: pdfs.map((r) => ({ rotulo: /sol/i.test(r.pdf) ? 'Gabarito' : 'Enunciado', url: base + r.pdf, papel: /sol/i.test(r.pdf) ? 'gabarito' : 'enunciado' })) });
    }
  }
  // garante uma única prova final
  const finals = list.filter((s) => s.final);
  if (finals.length !== 1) throw new Error(id + ': provas finais = ' + finals.length);
  push(id, list);
}
{
  const base = 'https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/';
  course({ id: '18.01SC', titulo: 'Cálculo de uma variável', versao: 'Fall 2010', professor: 'David Jerison', base,
    tem: ['vídeos', 'notas', 'listas + gabarito', 'provas + gabarito'],
    aviso: 'Cada sessão é uma aula com trechos curtos de vídeo. A unidade 5 não tem lista própria.' });
  scCourse('18.01SC', sc['18.01SC'], base);
}
{
  const base = 'https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/';
  course({ id: '18.02SC', titulo: 'Cálculo de várias variáveis', versao: 'Fall 2010', professor: 'Denis Auroux', base,
    tem: ['vídeos', 'notas', 'listas + gabarito', 'provas + gabarito'],
    aviso: 'Para economia, as partes mais importantes são a 2A (otimização) e a 2C (multiplicadores de Lagrange).' });
  scCourse('18.02SC', sc['18.02SC'], base);
}

// ---------------------------------------------------------------- 14.04
{
  const base = 'https://ocw.mit.edu/courses/14-04-intermediate-microeconomic-theory-fall-2020/';
  course({ id: '14.04', titulo: 'Microeconomia intermediária', versao: 'Fall 2020', professor: 'Robert M. Townsend', base,
    tem: ['vídeos', 'leituras', 'listas', 'provas + gabarito'], falta: 'gabarito das listas',
    aviso: 'As listas não têm gabarito: a correção fica com você ou com a IA, sem gabarito de referência.' });
  const rows = table('### 7.2 Aulas');
  const aula = Object.fromEntries(rows.map(([n, t, pg, id]) => [n, {
    tipo: 'aula', n, titulo: tr(t), titulo_original: t, revisao: n.startsWith('R'), pagina: page(base, pg), videos: yt(id, (n.startsWith('R') ? '' : `Lecture ${n}: `) + t),
    arquivos: [{ rotulo: 'Leituras da matéria', url: base + 'pages/readings/', papel: 'leitura' }],
  }]));
  const lp = Object.fromEntries(table('### 7.3 Listas e provas').map(([item, f, pg]) => [item, { f, pg }]));
  const lista = (n) => ({ tipo: 'lista', n, titulo: `Lista ${n}`, pagina: page(base, lp[`Lista ${n}`].pg),
    arquivos: [{ rotulo: 'Enunciado', url: file(base, lp[`Lista ${n}`].f), papel: 'enunciado' },
      ...(n === 3 ? [{ rotulo: 'Simulação (Excel)', url: page(base, lp['Lista 3 · simulação (Excel)'].pg), papel: 'dados' }] : [])] });
  const prova = (n, sub, final) => ({ tipo: 'prova', n: String(n), titulo: final ? 'Prova final' : `Prova ${n}`, sub, final, gabarito_junto: true,
    pagina: page(base, lp[`Prova ${n} (com solução)`].pg), arquivos: [{ rotulo: 'Prova com gabarito no mesmo PDF', url: file(base, lp[`Prova ${n} (com solução)`].f), papel: 'enunciado' }] });
  const A = (...ns) => ns.map((n) => aula[String(n)]);
  push('14.04', [...A(1, 2, 3, 4), lista(1), ...A(5, 6, 7), lista(2), aula.R1, prova(1, 'Aulas 1 a 7, sem consulta'),
    ...A(8, 9, 10, 11), lista(3), ...A(12, 13, 14, 15), lista(4), aula.R2, prova(2, 'Aulas 8 a 15, sem consulta'),
    ...A(16, 17, 18, 19, 20, 21), lista(5), aula.R3, prova(3, 'Matéria inteira, sem consulta', true)]);
}

// ---------------------------------------------------------------- 14.06
{
  const base = 'https://ocw.mit.edu/courses/14-06-intermediate-macroeconomic-theory-spring-2004/';
  course({ id: '14.06', titulo: 'Macroeconomia intermediária', versao: 'Spring 2004', professor: 'George-Marios Angeletos', base,
    tem: ['notas', 'listas + gabarito', 'provas + gabarito'], falta: 'vídeos e gabarito da lista 3',
    aviso: 'Sem vídeo: a aula é a leitura das notas e do Romer, Advanced Macroeconomics. A ordem das listas é uma sugestão. As aulas do 14.05 servem de apoio.' });
  const notas = Object.fromEntries(table('### 8.2 Notas').map(([cap, f]) => [cap, f]));
  const top = table('### 8.1 Tópicos').map(([n, t, leitura]) => ({
    tipo: 'aula', n: +n, titulo: tr(t), titulo_original: t, sub: 'Leitura: ' + leitura, pagina: base + 'pages/lecture-notes/',
    arquivos: [{ rotulo: notas[n] ? `Notas de aula · capítulo ${n}` : null, url: notas[n] ? base + notas[n] : null, papel: 'leitura' },
      { rotulo: 'Leituras (Romer e artigos)', url: base + 'pages/readings/', papel: 'material' }],
  }));
  const L = Object.fromEntries(table('### 8.3 Listas').map(([n, enun, sol]) => [n, { enun, sol }]));
  const lista = (n) => ({ tipo: 'lista', n, titulo: `Lista ${n}`, sugestao: true, pagina: base + 'pages/assignments/',
    arquivos: [{ rotulo: 'Enunciado', url: file(base, L[n].enun), papel: 'enunciado' }, { rotulo: 'Gabarito', url: file(base, L[n].sol), papel: 'gabarito' },
      ...(n === 3 ? [{ rotulo: 'Consumption Problem', url: file(base, L['3 · Consumption Problem'].enun), papel: 'enunciado' }] : [])] });
  const P = table('### 8.4 Provas');
  const prova = (i, final) => ({ tipo: 'prova', n: final ? 'final' : '1', titulo: final ? 'Prova final' : 'Prova intermediária', final, sugestao: true,
    sub: final ? 'Matéria inteira, sem consulta' : 'Tópicos 1 a 6, sem consulta', pagina: base + 'pages/exams/',
    arquivos: [{ rotulo: 'Enunciado', url: file(base, P[i][1]), papel: 'enunciado' }, { rotulo: 'Gabarito', url: file(base, P[i][2]), papel: 'gabarito' }] });
  const t = (n) => top[n - 1];
  push('14.06', [t(1), t(2), lista(1), t(3), lista(2), t(4), t(5), lista(3), t(6), prova(0), t(7), t(8), lista(4), t(9), t(10), t(11), lista(5), prova(1, true)]);
}

// ---------------------------------------------------------------- 14.05 (apoio)
{
  const base = 'https://ocw.mit.edu/courses/14-05-intermediate-macroeconomics-fall-2025/';
  course({ id: '14.05', titulo: 'Macroeconomia intermediária (apoio)', versao: 'Fall 2025', professor: 'Christian Wolf', base, alternativa: true,
    tem: ['slides', 'listas', 'provas de 2024'], falta: 'vídeos e gabaritos',
    aviso: 'Alternativa ao 14.06, atual mas sem gabaritos. Use os slides como leitura de apoio. A ordem das listas e provas é uma sugestão.' });
  const aulas = table('### 9.1 Slides').map(([n, t]) => ({
    tipo: 'aula', n: +n, titulo: tr(t), titulo_original: t, pagina: base + `resources/mit14_05_f25_lecture${n}_pdf/`,
    arquivos: [{ rotulo: `Slides da aula ${n}`, url: base + `mit14_05_f25_lecture${n}.pdf`, papel: 'leitura' }],
  }));
  const it = table('### 9.2 Listas e provas');
  const lista = (n) => ({ tipo: 'lista', n, titulo: `Lista ${n}`, sugestao: true, pagina: base + 'lists/problem-sets/',
    arquivos: [{ rotulo: 'Enunciado', url: file(base, it[n - 1][1]), papel: 'enunciado' }] });
  const prova = (n, f, final) => ({ tipo: 'prova', n: String(n), titulo: final ? 'Prova final (intermediária 2 de 2024)' : 'Prova intermediária 1 (2024)', final, sugestao: true,
    sub: 'Confira se o PDF traz solução antes de começar', pagina: base + 'lists/exams/', arquivos: [{ rotulo: 'Enunciado', url: file(base, f), papel: 'enunciado' }] });
  const a = (n) => aulas[n - 1];
  push('14.05', [a(1), a(2), a(3), a(4), a(5), lista(1), a(6), a(7), a(8), a(9), a(10), lista(2), a(11), a(12), prova(1, it[4][1]),
    a(13), a(14), a(15), lista(3), a(16), a(17), a(18), a(19), lista(4), a(20), a(21), a(22), prova(2, it[5][1], true)]);
}

// ---------------------------------------------------------------- 14.30
{
  const base = 'https://ocw.mit.edu/courses/14-30-introduction-to-statistical-methods-in-economics-spring-2009/';
  course({ id: '14.30', titulo: 'Métodos estatísticos em economia', versao: 'Spring 2009', professor: 'Konrad Menzel', base,
    tem: ['notas', 'listas + gabarito', 'provas'], falta: 'vídeos e gabarito das provas',
    aviso: 'Sem vídeo: a aula é a nota de aula. Livros: Larsen e Marx; DeGroot e Schervish.' });
  const aula = table('### 10.2 Notas').map(([n, t, f]) => {
    const fs_ = f.split(' + ');
    return { tipo: 'aula', n: +n, titulo: tr(t), titulo_original: t, revisao: t === 'Review', pagina: base + `resources/mit14_30s09_lec${String(n).padStart(2, '0')}/`,
      arquivos: fs_.map((x, i) => ({ rotulo: i ? 'Exemplos' : 'Notas de aula', url: base + x.replace(/`/g, ''), papel: 'leitura' })) };
  });
  const L = table('### 10.3 Listas').map(([n, enun, gab]) => ({ tipo: 'lista', n: +n, titulo: `Lista ${n}`, pagina: base + 'pages/assignments/',
    arquivos: [{ rotulo: 'Enunciado', url: file(base, enun), papel: 'enunciado' }, { rotulo: 'Gabarito', url: file(base, gab), papel: 'gabarito' }] }));
  const P = table('### 10.4 Provas').map(([n, treino, prova]) => ({ tipo: 'prova', n, titulo: n === '3' ? 'Prova final' : `Prova ${n}`, final: n === '3',
    sub: (n === '3' ? 'Matéria inteira' : n === '1' ? 'Aulas 1 a 8' : 'Aulas 9 a 16') + ', sem consulta · sem gabarito publicado', pagina: base + 'pages/exams/',
    arquivos: [{ rotulo: 'Prova de 2009', url: file(base, prova), papel: 'enunciado' }, { rotulo: 'Prova de treino (2008)', url: file(base, treino), papel: 'material' }] }));
  const a = (n) => aula[n - 1];
  push('14.30', [a(1), a(2), a(3), L[0], a(4), a(5), L[1], a(6), a(7), L[2], a(8), P[0], a(9), L[3], a(10), a(11), a(12), a(13), L[4],
    a(14), a(15), L[5], a(16), P[1], a(17), L[6], a(18), a(19), L[7], a(20), a(21), a(22), L[8], a(23), a(24), P[2]]);
}

// ---------------------------------------------------------------- 14.32
{
  const base = 'https://ocw.mit.edu/courses/14-32-econometrics-spring-2007/';
  course({ id: '14.32', titulo: 'Econometria', versao: 'Spring 2007', professor: 'Joshua Angrist', base,
    tem: ['listas', 'dados'], falta: 'vídeos, notas, provas e gabaritos',
    aviso: 'Material a definir: o OCW publica só listas e dados (formato SAS). Livros: Wooldridge, Introductory Econometrics; Goldberger, A Course in Econometrics. Sem prova final: a matéria não trava nada.' });
  const temas = [
    ['Revisão de probabilidade e estatística', 'Probabilidade e distribuição; esperança e momentos.'],
    ['Revisão de inferência', 'Distribuições amostrais; teorema central do limite; intervalos de confiança.'],
    ['Regressão simples', 'CEF; distribuição dos estimadores; Gauss-Markov; resíduos e R².'],
    ['Regressão múltipla', 'Causalidade e controle; viés de variável omitida; dummies, interações e testes F; experimentos naturais e diferenças-em-diferenças.'],
    ['Heterocedasticidade e autocorrelação', 'MQP, modelo de probabilidade linear; Durbin-Watson.'],
    ['Variáveis instrumentais', 'Variável omitida, erro de medida, regressão descontínua.'],
    ['Equações simultâneas', 'Identificação, forma reduzida, MQO indireto, 2SLS.'],
  ].map(([t, sub], i) => ({ tipo: 'aula', n: i + 1, titulo: t, sub, pagina: base + 'pages/readings/',
    arquivos: [{ rotulo: 'Leituras', url: base + 'pages/readings/', papel: 'leitura' }, { rotulo: 'Recitations', url: base + 'pages/recitations/', papel: 'material' }] }));
  const L = table('### 11.1 Listas e dados').map(([n, enun, dados]) => ({
    tipo: 'lista', n: n === 'Revisão' ? '0' : n, titulo: n === 'Revisão' ? 'Lista de revisão' : `Lista ${n}`, sugestao: true, pagina: base + 'pages/assignments/',
    arquivos: [{ rotulo: 'Enunciado', url: file(base, enun), papel: 'enunciado' },
      ...(none(dados) ? [] : dados.split(',').map((d) => d.trim().replace(/`/g, '').split(' ')[0]).map((d) => ({ rotulo: `Dados: ${d}`, url: base + `resources/${d}/`, papel: 'dados' })))],
  }));
  const t = (n) => temas[n - 1];
  push('14.32', [t(1), t(2), L[0], t(3), L[1], t(4), L[2], L[3], t(5), L[4], t(6), L[5], t(7), L[6]]);
}

// sequência de liberação: 14.05 é apoio e não entra
const out = { gerado_em: new Date().toISOString().slice(0, 10), courses, steps };
fs.writeFileSync(new URL('../data/catalog.json', import.meta.url), JSON.stringify(out, null, 1));
const by = {};
for (const s of steps) { by[s.course_id] ??= { aula: 0, lista: 0, prova: 0, videos: 0 }; by[s.course_id][s.tipo]++; by[s.course_id].videos += s.videos.length; }
console.log(courses.length, 'matérias,', steps.length, 'etapas');
console.table(by);
