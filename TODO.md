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
- [x] Build e teste de ponta a ponta (local e em produção)

## 4. Publicação
- [x] Projeto na Vercel ligado ao GitHub (deploy automático a cada push no main)
- [x] Variáveis de ambiente na Vercel (Supabase, senha, segredo da sessão), em produção e preview
- [x] Funções na região gru1 (São Paulo), perto do Supabase
- [x] Teste do app no ar: https://ementa-taupe.vercel.app
- [x] Apagar `senha.txt`

## Depois (ideias)
- [ ] Trocar o 14.32 por uma alternativa com vídeo e gabarito
- [ ] Conferir a posição sugerida das listas do 14.02, 14.06 e 14.32 pelo conteúdo dos enunciados
- [x] Tema escuro configurável (Sistema, Claro, Escuro)

## 5. Banco de questões
- [x] Script que transcreve listas e provas sem IA (`scripts/transcrever.py`): fórmulas em LaTeX, questões, itens, subitens, alternativas, soluções; recorte de segurança onde a transcrição é duvidosa
- [x] Banco gerado para as 99 listas e provas (`npm run questoes`): 1.143 questões, 2.575 itens, respostas do gabarito ligadas a 1.859 itens
- [x] Correções à mão em `data/questoes/manual/` (14.01 prova final, 14.06 prova 1, 14.30 lista 1)
- [ ] Usar o banco no app: listas e provas interativas (campo por item, gabarito por item, treino misturado)
- [ ] Revisar os avisos que sobraram (numeração que recomeça nos exercícios do 18.01SC, gabaritos que não casaram em 18.02SC lista 12 e 14.06 lista 2)
