-- Ementa · esquema do banco
-- O app acessa o banco só pelo servidor (chave secreta). RLS fica ligado sem políticas,
-- então as chaves públicas não leem nem escrevem nada.

-- Catálogo -----------------------------------------------------------------

create table courses (
  id            text primary key,          -- '14.01'
  ordem         int  not null,
  titulo        text not null,
  versao        text not null,
  professor     text not null,
  base          text not null,
  nota_minima   numeric(3,1) not null default 7.0,
  tem           text[] not null default '{}',   -- o que o MIT publica (chips do cartão)
  falta         text not null default '',       -- linha "Sem …"
  aviso         text not null default '',
  alternativa   boolean not null default false  -- 14.05: trilha de apoio, fora da sequência
);

create table steps (
  id              text primary key,        -- '14.01/aula-05'
  course_id       text not null references courses(id) on delete cascade,
  ordem           int  not null,
  tipo            text not null check (tipo in ('aula', 'lista', 'prova')),
  n               text,                    -- número exibido ('5', 'R1', '3')
  titulo          text not null,
  titulo_original text,
  grupo           text,                    -- unidade/parte (18.01SC, 18.02SC)
  sub             text,                    -- linha de apoio (provas)
  sugestao        boolean not null default false,
  opcional        boolean not null default false,
  revisao         boolean not null default false,
  treino          boolean not null default false,
  final           boolean not null default false,  -- prova que libera a próxima matéria
  pagina          text,                    -- página no OCW
  videos          jsonb not null default '[]',     -- [{yt, start, end, titulo}]
  arquivos        jsonb not null default '[]',     -- [{rotulo, url, papel}] papel: leitura|material|enunciado|gabarito|transcricao|dados
  gabarito_junto  boolean not null default false,  -- enunciado e gabarito no mesmo PDF
  unique (course_id, ordem)
);
create index steps_course on steps (course_id, ordem);

-- Dados do estudo ----------------------------------------------------------

create table progress (
  step_id     text primary key references steps(id) on delete cascade,
  feito       boolean not null default false,
  feito_em    timestamptz,
  posicao     int not null default 0,      -- segundos assistidos (ou índice do trecho * 100000 + segundos)
  clip        int not null default 0,      -- trecho atual (sessões do cálculo)
  updated_at  timestamptz not null default now()
);

create table notes (
  step_id     text primary key references steps(id) on delete cascade,
  html        text not null default '',
  marcas      int[] not null default '{}', -- tempos (s) com anotação, para a linha do vídeo
  updated_at  timestamptz not null default now()
);

create table cards (
  id          uuid primary key default gen_random_uuid(),
  step_id     text references steps(id) on delete set null,
  frente      text not null,
  verso       text not null,
  criada_em   timestamptz not null default now(),
  vence       date not null default current_date,
  intervalo   int not null default 0,      -- dias
  facilidade  numeric(4,2) not null default 2.5,
  repeticoes  int not null default 0,
  lapsos      int not null default 0,
  revisada_em timestamptz
);
create index cards_vence on cards (vence);

create table submissions (
  step_id      text primary key references steps(id) on delete cascade,
  respostas    jsonb not null default '[]', -- [{q, texto}]
  entregue_em  timestamptz,
  nota         numeric(3,1),
  correcao     text,                         -- comentário da IA ou seu
  updated_at   timestamptz not null default now()
);

create table mistakes (
  id          uuid primary key default gen_random_uuid(),
  step_id     text references steps(id) on delete set null,
  origem      text not null,               -- 'Lista 1 · questão 3'
  descricao   text not null,
  vence       date not null,
  resolvido   boolean not null default false,
  criado_em   timestamptz not null default now()
);

create table settings (
  id          text primary key default 'cfg',
  valor       jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

alter table courses     enable row level security;
alter table steps       enable row level security;
alter table progress    enable row level security;
alter table notes       enable row level security;
alter table cards       enable row level security;
alter table submissions enable row level security;
alter table mistakes    enable row level security;
alter table settings    enable row level security;
