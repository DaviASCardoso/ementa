# Ementa

Plataforma pessoal para estudar o núcleo de economia do MIT pelo OpenCourseWare: trilha de aulas, listas e provas por matéria, caderno com marcas de tempo do vídeo, fichas com repetição espaçada e caderno de erros.

- **App:** Next.js 16 (App Router), hospedado na Vercel com deploy automático a partir do `main`.
- **Dados:** Supabase (Postgres). O app fala com o banco só pelo servidor, com a chave secreta; o RLS fica ligado sem políticas.
- **Entrada:** uma senha só, na variável `APP_PASSWORD`.
- **Conteúdo:** os vídeos e PDFs continuam no MIT OCW e no YouTube (CC BY-NC-SA); o banco guarda o catálogo e os links.

## Variáveis de ambiente

| Nome | O que é |
|---|---|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SECRET_KEY` | Chave secreta (`sb_secret_…`) |
| `APP_PASSWORD` | Senha de entrada |
| `SESSION_SECRET` | Segredo aleatório que assina o cookie da sessão |

Localmente ficam em `.env.local` (fora do git).

## Comandos

```sh
npm run dev        # app em http://localhost:3000
npm run catalogo   # regera data/catalog.json a partir de ementa-material-do-curso.md
npm run seed       # carrega o catálogo no Supabase (idempotente)
npx supabase db push   # aplica as migrações em supabase/migrations
```

## Arquivos de referência

- `ementa-material-do-curso.md`: matérias, aulas, listas e provas, com os endereços no OCW.
- `ementa-design-system.md`: cores, tipografia e componentes.
- `prototipo.html`: protótipo original das telas.
- `data/raw/sc-raw.json`: raspagem das sessões do 18.01SC e 18.02SC (vídeos com início e fim, PDFs).
