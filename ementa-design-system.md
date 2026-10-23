# Ementa · Design System

Guia de design da Ementa, a plataforma de estudo de economia pelo MIT OpenCourseWare.
Vale para qualquer tela nova: se algo não estiver aqui, siga o espírito das regras gerais.

---

## 1. Princípios

1. **Caderno de estudo, não sistema.** A Ementa deve parecer um bom caderno e uma biblioteca calma, nunca um ERP. Nada de tabelas para o que pode ser uma lista, nem bordas em volta de tudo.
2. **O conteúdo manda.** Vídeo, anotações e questões ocupam o espaço. A interface recua: menu recolhe na aula, controles ficam discretos até serem usados.
3. **Sério sem ser frio.** Nada infantil (sem mascotes, sequências de dias, confete ou cores saturadas por toda parte), mas com personalidade: tipografia expressiva nos títulos, cantos arredondados, cor com significado.
4. **Cor tem função.** Cada cor representa uma coisa (aula, lista, prova, agora, anotação). Não use cor só para decorar.
5. **Uma ação principal por tela.** Só um botão laranja ou verde-escuro de destaque por vez.
6. **Acessível por padrão.** Contraste mínimo de 4.5:1 para texto, alvos de toque de 44 px, tudo navegável pelo teclado.

---

## 2. Cores

### 2.1 Base

| Token | Hex | Uso |
|---|---|---|
| `ground` | `#E9ECE6` | Fundo da página (cinza-esverdeado claro) |
| `surface` | `#FFFFFF` | Cartões, painéis, caderno |
| `surface-soft` | `#F5F7F3` | Itens dentro de cartões (fichas, arquivos) |
| `field` | `#F2F4F0` | Fundo de campos de texto e selects |
| `chip` | `#EEF1EC` | Fundo de pílulas neutras e controles segmentados |
| `line` | `#EEF1EC` | Divisória dentro de cartões |
| `line-strong` | `#CDD5CE` | Linha da trilha, borda de botão secundário |
| `track` | `#E3E8E2` | Trilho de barras de progresso vazias |

### 2.2 Texto

| Token | Hex | Contraste | Uso |
|---|---|---|---|
| `ink` | `#14201C` | 16.8 no branco · 14.0 no `ground` | Texto principal |
| `ink-2` | `#33403B` | 9.5 no `chip` | Texto secundário forte, opções não selecionadas |
| `muted` | `#4A5651` | 7.7 no branco | Descrições, subtítulos |
| `faint` | `#5B6661` | 6.0 no branco · 5.0 no `ground` | Rótulos pequenos, metadados (o mais claro permitido) |

> Não use cinza mais claro que `#5B6661` para texto. Cinzas mais claros são só para linhas e fundos.

### 2.3 Marca e significado

| Token | Hex | Significa | Pares aprovados |
|---|---|---|---|
| `forest` | `#12352B` | Marca, menu, provas, ação principal neutra | branco 13.4 · `paper` 11.8 |
| `paper` | `#F4F1E8` | Item ativo do menu, botão sobre `forest` | `forest` 11.8 |
| `now` | `#C2410C` | **Agora**: aula atual, ação de continuar, entregar | branco 5.2 (texto branco em botão; como texto, só 15 px+ semibold) |
| `now-soft` | `#FBE3D6` | Fundo de "errei", "hoje", aviso suave | texto `#8A2E0A` 6.9 |
| `now-light` | `#F08A5D` | Contadores e destaques sobre `forest` | texto `#2A1206` 7.2 |
| `list` | `#3B4BA8` | **Listas de exercícios** | branco 7.6 · `list-soft` 6.6 |
| `list-soft` | `#ECEEFB` | Fundo do cartão de lista, "fácil" | texto `#2F3C8C` 8.5 |
| `done` | `#1D6B4F` | **Concluído**, nota boa, interruptor ligado | branco 6.4 |
| `done-soft` | `#E3F1EA` | Fundo de nota, "bom" | texto `#165239` 7.8 |
| `stamp` | `#FDF1D3` | **Marca de tempo** das anotações | texto `#7A4B00` 6.6 |
| `stamp-mark` | `#E0A800` | Marcas na linha do tempo do vídeo (não é texto) | — |
| `highlight` | `#FDE7A6` | Marca-texto no caderno | texto `ink` |
| `danger-text` | `#A3360B` | Ação destrutiva (apagar) | branco 6.8 |
| `link` | `#1D5C47` | Links | branco 7.9 |

### 2.4 Texto sobre `forest` (menu e faixas de prova)

| Token | Hex | Contraste | Uso |
|---|---|---|---|
| `on-forest` | `#FFFFFF` | 13.4 | Títulos |
| `on-forest-2` | `#D5E5DE` | 10.3 | Itens do menu |
| `on-forest-3` | `#B9D3C8` | 8.4 | Subtítulos |
| `on-forest-4` | `#9CC0B2` | 6.7 | Rótulos pequenos |

### 2.5 Mapa de significados

- **Aula** → `done` quando feita; círculo vazado quando pendente.
- **Lista** → `list` (anil), sempre em cartão próprio.
- **Prova** → `forest`, faixa escura que corta a trilha.
- **Agora** → `now` (laranja), só um elemento por tela.
- **Anotação e tempo** → `stamp` (âmbar).

Cores que precisam ser diferenciadas também diferem em claridade, não só em matiz. Prefira anil e laranja a vermelho e verde.

---

## 3. Tipografia

Três famílias, todas do Google Fonts:

| Papel | Fonte | Pesos | Onde |
|---|---|---|---|
| **Display** | Bricolage Grotesque | 600 · 700 · 800 | Títulos de página, códigos de matéria, títulos de lista e prova, números grandes |
| **Interface** | Geist | 400 · 500 · 600 | Todo o resto da interface |
| **Leitura** | Newsreader | 400 · 600 · itálico | Corpo do caderno, frente das fichas, PDFs simulados |
| **Dados** | Geist Mono | 400 · 500 | Marcas de tempo, velocidades, notas, nomes de arquivo, contadores |

### 3.1 Escala

| Token | Tamanho / altura de linha | Fonte · peso | Uso |
|---|---|---|---|
| `hero` | clamp(64px, 9vw, 120px) / 0.85, tracking −0.05em | Bricolage 800 | Código da matéria no topo da trilha ("14.01") |
| `display` | 44px / 1, tracking −0.03em | Bricolage 800 | Título de página |
| `code-card` | 40px / 0.9, tracking −0.04em | Bricolage 800 | Código no cartão de matéria |
| `h1` | 30px / 1.1, tracking −0.02em | Bricolage 700 | Nome da matéria |
| `h2` | 21–23px / 1.25, tracking −0.01em | Bricolage 700 | Títulos de seção, lista, prova, aula aberta |
| `title` | 17–19px / 1.3 | Geist 600 ou Bricolage 700 | Título de cartão, aula atual |
| `body` | 15px / 1.5 | Geist 400 | Texto padrão |
| `body-sm` | 14px / 1.5 | Geist 400–500 | Botões, campos, abas |
| `caption` | 13px / 1.45 | Geist 400 | Descrições e dicas |
| `micro` | 12px / 1.4 | Geist 500 ou Mono | Rótulos, pílulas, marcas de tempo (nunca menor) |
| `note` | 19px / 1.65 | Newsreader 400 | Corpo do caderno |
| `note-h` | 23px / 1.25 | Bricolage 700 | Título dentro do caderno |
| `card-front` | 27px / 1.3 | Newsreader 400 | Frente da ficha na revisão |

### 3.2 Regras

- Títulos em Bricolage sempre com tracking negativo; texto corrido nunca.
- Não use caixa alta para rótulos (deixa a interface com cara de sistema). Prefira minúsculas em `micro` ou `caption` na cor `faint`.
- Números que se comparam (notas, tempos, contagens) em Geist Mono.
- Texto corrido com no máximo 75 caracteres por linha (`max-width` de 600–780 px).

---

## 4. Espaço, forma e profundidade

### 4.1 Espaçamento (base 4)

`4 · 8 · 12 · 14 · 16 · 18 · 22 · 28 · 40`

- Entre cartões soltos: 14–16 px.
- Padding interno de cartão: 18–24 px.
- Margem externa da página: 14 px em volta de tudo (o menu também flutua com essa margem).
- Entre seções de uma página: 22–28 px.

### 4.2 Raios

| Token | Valor | Uso |
|---|---|---|
| `r-sm` | 6–8px | Botões de ferramenta, chips de tempo, campos pequenos |
| `r-md` | 10–12px | Campos, itens dentro de cartões, nós de lista e prova |
| `r-lg` | 16px | Painéis da aula, cartões de lista e prova, vídeo |
| `r-xl` | 18–22px | Cartões de página, ficha da revisão, menu lateral |
| `r-pill` | 99px | Botões, pílulas, controles segmentados, interruptores |

### 4.3 Profundidade

- Prefira **fundo diferente** a borda: cartão branco sobre o `ground` já separa.
- Sombra única e leve: `0 1px 2px rgba(18,53,43,0.06)`; no item atual, `0.08`.
- Bordas só em: botão secundário (`1.5px solid #CDD5CE`), área de criar ficha (`1.5px dashed #C9D2CA`) e divisórias internas (`1px solid #EEF1EC`).
- Proibido: gradientes decorativos, cartão com borda colorida só de um lado, sombras grandes.

---

## 5. Layout

- **Estrutura:** menu lateral flutuante (236 px aberto, 68 px recolhido) + conteúdo fluido. Em telas estreitas, o menu passa para cima (`flex-wrap`).
- **Larguras máximas:** trilha 1180 px · matérias 1100 px · configurações 1040 px · erros 860 px · revisão 720 px · caderno 780 px.
- **Aula:** tela dividida, vídeo à esquerda e caderno à direita, com divisor arrastável entre 28% e 72% (padrão 46%). Abaixo de 980 px, os painéis empilham e o divisor some.
- **Trilha:** linha do tempo à esquerda (flex 999) e resumo à direita (flex 1, mínimo 280 px).
- O menu recolhe sozinho ao abrir uma aula e volta ao sair dela.

---

## 6. Componentes

### 6.1 Menu lateral (trilho)
- Bloco `forest`, raio `r-xl`, 14 px de margem da borda da tela.
- Marca: quadrado `paper` 36 px com "e" em Bricolage 800 + "ementa" em minúsculas.
- Item: 46 px de altura, raio 12, ícone 20 px. Ativo: fundo `paper`, texto `forest`, peso 600. Inativo: `on-forest-2`.
- Contador: pílula `now-light` com texto `#2A1206`. Recolhido, vira um ponto de 8 px.
- Bloco "Estudando agora": código grande + 37 barrinhas de progresso.
- Rodapé: Recolher e Configurações.

### 6.2 Botões

| Tipo | Estilo | Quando |
|---|---|---|
| Principal "agora" | `now`, texto branco, pílula, 600 | Continuar aula, entregar lista. Um por tela |
| Principal neutro | `forest`, texto branco, pílula | Adicionar, testar, mostrar resposta |
| Secundário | branco, borda `line-strong` 1.5px | Refazer, restaurar |
| Suave | branco sobre `ground`, sem borda | Voltar, anterior, próxima |
| Perigo | branco, borda `#E7B9A3`, texto `danger-text` | Apagar. Sempre pede um segundo toque |

Altura mínima de 40 px (44 px quando é a ação principal da tela). Texto em verbo no infinitivo: "Entregar lista", "Adicionar ficha".

### 6.3 Pílulas e chips
- Pílula de status: `micro`, padding 3–4 × 10–12, `r-pill`. Cores pelo mapa de significados.
- Nota: Geist Mono 500 sobre `done-soft`.

### 6.4 Controle segmentado
- Trilho `chip` com 3 px de padding, `r-pill`.
- Opção: 32–34 px de altura. Selecionada: `forest` com texto branco. `role="radiogroup"` e `role="radio"`.

### 6.5 Interruptor
- 52 × 30 px, bolinha branca de 24 px. Ligado: `done`. Desligado: `#C9D2CA`. `role="switch"`.

### 6.6 Campos
- Fundo `field`, sem borda, raio 10, padding 11–12 × 14.
- Foco: contorno de 2px `#1D5C47`.
- Sempre com `<label>`, mesmo que visualmente escondido.

### 6.7 Trilha
- Linha vertical de 2px `line-strong`, a 21 px da esquerda.
- **Aula pendente:** círculo vazado de 16 px (borda 2px `#9AA79F`), título Geist 500 16px, rótulo `aula 06` em Mono.
- **Aula feita:** círculo `done` de 18 px com ✓, título em `faint`.
- **Aula atual:** cartão branco elevado, círculo `now` de 20 px com anel `now-soft` e pulso, título Bricolage 19px, botão "Continuar em mm:ss".
- **Lista:** nó quadrado de 44 px `list`; cartão `list-soft` com o rótulo "Lista de exercícios" e o título em Bricolage 19px. Feita: nó `done`, cartão branco e pílula de nota. A lista não diz quais aulas cobre: a posição na trilha já mostra.
- **Prova:** nó `forest` de 44 px + faixa `forest` com título Bricolage 21px e pílula com contorno ("7,0 libera a 14.02").

### 6.8 Barra de progresso segmentada
- Uma barrinha por etapa, gap de 2–3 px, raio 2–3.
- Feita: cor do tipo (aula `done`, lista `list`, prova `forest`). Atual: `now`. Pendente: `track`.
- Sempre com `role="img"` e `aria-label` descrevendo o total.

### 6.9 Player de vídeo
- 16:9, fundo `#0B1411`, raio `r-lg`.
- Linha do tempo abaixo, num cartão: trilho `track`, progresso `forest`, marcas `stamp-mark` de 3 × 14 px onde há anotações.
- Velocidade em controle segmentado com Mono 12px.

### 6.10 Divisor arrastável
- 14 px de largura, alça de 4 × 48 px `#B9C3BB`, que fica `now` no hover e no foco.
- Arrastar com mouse ou toque, setas do teclado (±4%) e duplo clique para voltar a 46%.

### 6.11 Caderno
- Um único bloco editável em Newsreader 19px.
- Cada parágrafo, título ou lista tem 78 px de recuo à esquerda, onde fica a **marca de tempo**: Mono 12px, `stamp` com texto `#7A4B00`, raio 6. Clicar nela leva o vídeo àquele ponto.
- Títulos em Bricolage 23px; fórmulas em Mono 15px sobre `chip`; marca-texto `highlight`.
- **Barra de ferramentas:** estilo do bloco, fonte, B · I · U · S, marca-texto, listas, fórmula, "Virar ficha", 4 cores de texto (`ink`, `now`, `list`, `done`) e, à direita, a pílula âmbar "Marcar mm:ss".

### 6.12 Abas
- Pílulas de 38 px. Ativa: fundo `chip`, texto `ink` 600. `role="tablist"`, `role="tab"`, `aria-selected`.

### 6.13 Ficha (revisão)
- Cartão branco `r-xl`, mínimo de 320 px de altura. Origem e prazo em `caption` no topo, frente em Newsreader 27px e verso abaixo de uma divisória.
- Botões de nota em grade de 4: Errei (`now-soft`), Difícil (branco), Bom (`done-soft`), Fácil (`list-soft`), cada um com o próximo prazo.

### 6.14 Cartão de matéria
- Código em Bricolage 40px como "capa".
- Materiais que o MIT publica em chips neutros e o que falta numa linha "Sem …" em `#8A4A1C`.
- A matéria atual é o cartão invertido (`forest`), com o botão "Abrir trilha" em `paper`.

### 6.15 Linha de configuração
- Rótulo Geist 500 + dica `caption` à esquerda; controle à direita (segmentado, interruptor, campo ou botões).
- Divisória `line` entre linhas; quebra para baixo em telas estreitas.

---

## 7. Ícones

- Traço, sem preenchimento, `stroke-width` 1.8–2.2, pontas e junções arredondadas, grade de 24.
- Tamanhos: 14–16 px em linhas e botões pequenos, 18–20 px no menu e na barra do caderno.
- Ícone sozinho precisa de `aria-label` e `title`. Ícone decorativo leva `aria-hidden="true"`.
- Nunca emoji.

---

## 8. Movimento

- Transições de 150 ms para interruptores, setas de expandir e trocas de estado.
- Só um elemento animado em loop: o pulso da aula atual (2s).
- Com `prefers-reduced-motion` ou "Reduzir animações" ligado, nada se move em loop.

---

## 9. Texto da interface

- Português do Brasil, tratando por "você". Frases curtas e diretas.
- Sem jargão de sistema: "Aula", "Lista", "Prova", "Caderno", "Fichas", "Revisão", "Caderno de erros".
- Nomes de matéria pelo código e pelo nome em português ("14.01 Princípios de Microeconomia"). Títulos de aula traduzidos; o nome original em inglês fica só no player.
- Datas relativas quando ajudam ("em 3 dias", "atrasada 1 dia"); tempos de vídeo em `mm:ss`.
- Notas com vírgula decimal: 8,5 e 7,0.
- Botões descrevem a ação: "Entregar lista", nunca "OK" ou "Enviar".
- Nada de comemoração exagerada. Um "Lista entregue · nota 8,5" basta.

---

## 10. Acessibilidade

- Texto com contraste de pelo menos 4.5:1 (todos os pares da seção 2 passam).
- Alvos de toque de 44 px; nunca menos de 32 px, mesmo em ferramentas compactas.
- Foco visível: contorno de 2px `now` com 2px de afastamento.
- Elementos reais: `<button>`, `<a href>`, `<input>` com `<label>`. Nada de `div` clicável.
- Itens de navegação com `aria-current="page"`; abas, rádios e interruptores com os papéis ARIA corretos.
- Informação nunca só pela cor: notas também em número, estados também em texto.

---

## 11. Não faça

- Tabelas para listas de itens (deixa com cara de ERP).
- Bordas em todos os cartões ao mesmo tempo.
- Rótulos em caixa alta com espaçamento largo.
- Mais de uma ação laranja na mesma tela.
- Cores fora do mapa de significados.
- Mascotes, emoji, confete, sequências de dias ou linguagem infantil.
- Cinza de texto mais claro que `#5B6661`.
- Gradientes decorativos e sombras pesadas.
