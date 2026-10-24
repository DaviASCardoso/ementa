// Lê um JSON com uma lista de fórmulas e devolve os índices das que o KaTeX não consegue desenhar.
// Uso: node scripts/katex-check.mjs entrada.json   (cada item: { tex, display })
import fs from 'node:fs';
import katex from 'katex';

const formulas = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const ruins = [];
formulas.forEach((f, i) => {
  try {
    katex.renderToString(f.tex, { displayMode: f.display, throwOnError: true, strict: 'ignore' });
  } catch {
    ruins.push(i);
  }
});
process.stdout.write(JSON.stringify(ruins));
