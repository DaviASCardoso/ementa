# Ementa · andamento

Lista viva do que falta para o app estar no ar. `[x]` feito · `[~]` em andamento · `[ ]` a fazer.

## 1. Base
- [x] Repositório git e `.gitignore` (senha.txt nunca entra)
- [x] Repositório público no GitHub: DaviASCardoso/ementa
- [x] Projeto Next.js 16 (App Router, TypeScript)
- [x] Tokens do design system e fontes (Bricolage, Geist, Newsreader, Geist Mono)

## 2. Dados (Supabase)
- [x] Projeto `ementa` no Supabase (sa-east-1)
- [x] Esquema: matérias, etapas, progresso, anotações, fichas, entregas, erros, configurações (RLS ligado, acesso só pelo servidor)
- [x] Catálogo das 9 matérias a partir de `ementa-material-do-curso.md` (437 etapas, títulos em português)
- [x] Vídeos do YouTube das sessões do 18.01SC e 18.02SC (raspados do OCW, com início e fim de cada trecho)
- [x] Carga inicial (`npm run seed`)

## 3. Telas (do protótipo)
- [x] Entrada por senha (variável `APP_PASSWORD`)
- [x] Menu lateral + "Estudando agora"
- [x] Trilha da matéria
- [x] Matérias
- [x] Aula: vídeo, trechos, velocidade, marcas, caderno com marcas de tempo, fichas da aula, material; aula de leitura com o PDF
- [x] Lista / prova: PDF, respostas, entrega, gabarito, nota, prova sem consulta
- [x] Revisão de fichas (repetição espaçada)
- [x] Caderno de erros
- [x] Configurações (backup, apagar, correção com IA pelo Gemini)
- [~] Build e teste local

## 4. Publicação
- [ ] Projeto na Vercel ligado ao GitHub (deploy automático)
- [ ] Variáveis de ambiente na Vercel (Supabase, senha, segredo da sessão)
- [ ] Teste do app no ar
- [ ] Apagar `senha.txt`
