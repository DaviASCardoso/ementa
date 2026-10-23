# Ementa · Material do curso (MIT OpenCourseWare)

Referência de conteúdo da Ementa. Lista as matérias do núcleo de economia, na ordem de estudo, e para cada uma: aulas (com vídeo do YouTube quando existe), notas, listas, gabaritos e provas, com o endereço de cada material.

Levantado direto do site do MIT OCW em **23/10/2026**. O OCW troca versões de curso de vez em quando (o 14.01 Fall 2018 já saiu do ar). Antes de gravar algo definitivo, confira se a página ainda abre.

---

## 1. Como ler este arquivo

### 1.1 Endereços

Cada matéria tem uma **BASE**. Os caminhos ao lado de cada item são relativos a ela.

| O que é | Como montar a URL | Exemplo |
|---|---|---|
| Página do curso | `BASE` | `https://ocw.mit.edu/courses/14-01-principles-of-microeconomics-fall-2023/` |
| Página de um material | `BASE + caminho` | `BASE + resources/mit14_01_f23_pset1_pdf/` |
| Arquivo (PDF etc.) | `BASE + arquivo` | `BASE + mit14_01_f23_pset1.pdf` |
| Vídeo no YouTube | `https://www.youtube.com/watch?v=ID` | `https://www.youtube.com/watch?v=8ssjKR7nNck` |
| Vídeo incorporado | `https://www.youtube-nocookie.com/embed/ID` | para o player da aula |

Nas matérias "SC" (18.01SC e 18.02SC), `…/` quer dizer "o caminho da parte logo acima".

### 1.2 Como o OCW organiza um curso (útil para raspar o que faltar)

- Menu do curso: links da home que começam com `BASE` (Syllabus, Calendar, Video Lectures, Problem Sets, Exams…).
- Cada material tem uma página `BASE/resources/<slug>/`. Dentro dela:
  - o arquivo é o primeiro `<a href>` terminado em `.pdf` (ou `.xlsx`, `.zip` etc.);
  - o vídeo do YouTube aparece como `youtube.com/embed/<ID>` ou `data-videoid="<ID>"` no HTML;
  - páginas de vídeo também trazem a transcrição em `*_transcript.pdf`.
- Galeria de vídeos: `BASE/video_galleries/<nome>/`. Listas de arquivos: `BASE/lists/<nome>/` ou `BASE/pages/<nome>/`.
- O site responde normalmente a `fetch` (HTML estático). Nada exige login.

### 1.3 Licença

O conteúdo do OCW usa **Creative Commons BY-NC-SA 4.0**: uso não comercial, com crédito ao MIT OpenCourseWare e ao professor, e obras derivadas na mesma licença. A Ementa é de uso pessoal; mesmo assim, mostre o crédito ("MIT OpenCourseWare · Prof. X") na página da aula e não hospede os arquivos fora do OCW sem necessidade: aponte para os links.

### 1.4 Ordem das etapas dentro de cada matéria

A trilha intercala aulas, listas e provas. **Regra usada:** a lista entra logo **antes da aula em que ela vence** no calendário do MIT (ou seja, depois da última aula antes da entrega). A prova entra depois da última aula que ela cobre. Onde o MIT não publica calendário, a posição está marcada como **sugestão**.

---

## 2. Visão geral do núcleo

| Ordem | Código | Matéria | Versão no OCW | Vídeos | Notas | Listas | Gab. listas | Provas | Gab. provas |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 14.01 | Princípios de Microeconomia | Fall 2023 · Jonathan Gruber | 26 | resumos + handouts | 8 | sim | 2 | sim |
| 2 | 14.02 | Princípios de Macroeconomia | Spring 2023 · Ricardo Caballero | 25 | — | 8 | sim | 3 | sim |
| 3 | 18.01SC | Cálculo de uma variável | Fall 2010 · David Jerison | por sessão | sim | 11 | sim | 4 + final | sim |
| 4 | 18.02SC | Cálculo de várias variáveis | Fall 2010 · Denis Auroux | por sessão | sim | 12 | sim | 4 + final | sim |
| 5 | 14.04 | Microeconomia intermediária | Fall 2020 · Robert Townsend | 24 | leituras | 5 | **não** | 3 | sim |
| 6 | 14.06 | Macroeconomia intermediária | Spring 2004 · G.-M. Angeletos | — | 6 capítulos | 5 | 1, 2, 4, 5 | 2 | sim |
| 6-alt | 14.05 | Macroeconomia intermediária | Fall 2025 · Christian Wolf | — | 22 slides | 4 | **não** | 2 (de 2024) | ? |
| 7 | 14.30 | Métodos estatísticos em economia | Spring 2009 · Konrad Menzel | — | 24 | 9 | sim | 3 + 3 de treino | **não** |
| 8 | 14.32 | Econometria | Spring 2007 · Joshua Angrist | — | — | 6 + revisão | **não** | **não** | — |

Sem material utilizável no OCW: **14.33** (pesquisa e comunicação, Spring 2012 não publica nada). Substituir por um projeto próprio.

### 2.1 Pontos de atenção

- **14.01:** a versão Fall 2018 foi retirada do site. Use a **Fall 2023**, que tem 26 aulas (não 25), 8 listas (não 10) e 2 provas.
- **14.02:** não há calendário; a posição das listas é sugestão (seção 4.3).
- **14.04:** listas **sem gabarito** → correção pela IA sem gabarito.
- **14.06 vs 14.05:** o 14.06 (2004) tem gabarito de 4 das 5 listas e das 2 provas, mas é antigo e sem vídeo. O 14.05 (2025) é atual, porém sem gabaritos. Recomendado: 14.06 como trilha e as aulas do 14.05 como leitura de apoio.
- **14.30:** provas sem gabarito publicado.
- **14.32:** só listas e dados (formato SAS). Tratar como "material a definir" e procurar alternativa.

---

## 3. 14.01 Princípios de Microeconomia (Fall 2023)

**BASE:** `https://ocw.mit.edu/courses/14-01-principles-of-microeconomics-fall-2023/`
Professor: Jonathan Gruber. Páginas: `pages/syllabus/` · `pages/calendar/` · `video_galleries/video-lectures/` · `lists/lecture-handouts/` · `lists/lecture-summaries/` · `lists/problem-sets/` · `lists/exams/`

### 3.1 Ordem de estudo

| # | Etapa |
|---|---|
| 1–6 | Aulas 1 a 6 |
| 7 | **Lista 1** |
| 8–9 | Aulas 7 e 8 |
| 10 | **Lista 2** |
| 11 | Aula 9 |
| 12 | **Lista 3** |
| 13–14 | Aulas 10 e 11 |
| 15 | **Lista 4** |
| 16–17 | Aulas 12 e 13 |
| 18 | **Prova intermediária** |
| 19–20 | Aulas 14 e 15 |
| 21 | **Lista 5** |
| 22–25 | Aulas 16 a 19 |
| 26 | **Lista 6** |
| 27–28 | Aulas 20 e 21 |
| 29 | **Lista 7** |
| 30–31 | Aulas 22 e 23 |
| 32 | **Lista 8** |
| 33–35 | Aulas 24 a 26 |
| 36 | **Prova final** |

Calendário oficial (achatado): L1 · L2 · L3 (lista 1 sai) · L4 · L5 · L6 · L7 (vence lista 1; sai lista 2) · L8 · L9 (vence lista 2; sai lista 3) · L10 (vence lista 3; sai lista 4) · L11 · L12 (vence lista 4) · L13 · prova intermediária · L14 (sai lista 5) · L15 · L16 (vence lista 5; sai lista 6) · L17 · L18 · L19 · L20 (vence lista 6; sai lista 7) · L21 · L22 (vence lista 7; sai lista 8) · L23 · L24 (vence lista 8) · L25 · L26 · prova final.

### 3.2 Aulas

Cada aula tem vídeo, transcrição (na página do vídeo), resumo e, na maioria, handout.

| Aula | Título | Página do vídeo | YouTube | Resumo | Handout |
|---|---|---|---|---|---|
| 1 | Introduction to Principles of Microeconomics and Supply & Demand | `resources/lec-1-introduction-to-principles-of-microeconomics-and-supply-demand/` | `8ssjKR7nNck` | `mit14_01_f23_lec1.pdf` | `mit14_01_f23_handout1.pdf` |
| 2 | Preferences and Utility Function | `resources/lec-2-preferences-and-utility-function/` | `uuY13aUtFUo` | `mit14_01_f23_lec2.pdf` | `mit14_01_f23_handout2.pdf` |
| 3 | Budget Constraints and Constrained Choice | `resources/lec-3-budget-constraints-and-constrained-choice/` | `c8K_FSLtceQ` | `mit14_01_f23_lec3.pdf` | `mit14_01_f23_handout3.pdf` |
| 4 | Demand Curves and Income/Substitution Effects | `resources/lec-4-demand-curves-and-incomesubstitution-effects/` | `Qj1HvrSKLqY` | `mit14_01_f23_lec4.pdf` | `mit14_01_f23_handout4.pdf` |
| 5 | Production Theory | `resources/lec-5-production-theory/` | `Q7-mCKOzNUI` | `mit14_01_f23_lec5.pdf` | `mit14_01_f23_handout5.pdf` |
| 6 | Costs | `resources/lec-6-costs/` | `y1bnBxfNVkU` | `mit14_01_f23_lec6.pdf` | `mit14_01_f23_handout6.pdf` |
| 7 | Competition I | `resources/lec-7-competition-i/` | `IYwk6EwPmCg` | `mit14_01_f23_lec7.pdf` | `mit14_01_f23_handout7.pdf` |
| 8 | Competition II | `resources/lec-8-competition-ii/` | `sHlazW9s_g8` | `mit14_01_f23_lec8.pdf` | `mit14_01_f23_handout8.pdf` |
| 9 | Supply and Demand & Consumer/Producer Surplus | `resources/lec-9-supply-and-demand-consumerproducer-surplus/` | `-Z35m38qLd4` | `mit14_01_f23_lec9.pdf` | `mit14_01_f23_handout9.pdf` |
| 10 | Welfare Economics | `resources/lec-10-welfare-economics/` | `1zAuKwZ5PPE` | `mit14_01_f23_lec10.pdf` | `mit14_01_f23_handout10.pdf` |
| 11 | Monopoly I | `resources/lec-11-monopoly-i/` | `CD_HqiEdNOw` | `mit14_01_f23_lec11.pdf` | `mit14_01_f23_handout11.pdf` |
| 12 | Monopoly II | `resources/lec-12-monopoly-ii/` | `iBmoqczj7xs` | `mit14_01_f23_lec12.pdf` | `mit14_01_f23_handout12.pdf` |
| 13 | Oligopoly I | `resources/lec-13-oligopoly-i/` | `_crDeSDpB20` | `mit14_01_f23_lec13.pdf` | `mit14_01_f23_handout13.pdf` |
| 14 | Oligopoly II | `resources/lec-14-oligopoly-ii/` | `omeBIMSJ89k` | `mit14_01_f23_lec14.pdf` | — |
| 15 | Input Markets I—Labor Market | `resources/lec-15-input-markets-ilabor-market/` | `kUt5rgd8kfc` | `mit14_01_f23_lec15.pdf` | `mit14_01_f23_handout15.pdf` |
| 16 | Input Markets II—Labor and Capital | `resources/lec-16-input-markets-iilabor-and-capital/` | `Zl92WCm30bU` | `mit14_01_f23_lec16.pdf` | `mit14_01_f23_handout16.pdf` |
| 17 | Making Choices over Time | `resources/lec-17-making-choices-over-time/` | `CZwgOqxScB4` | `mit14_01_f23_lec17.pdf` | `mit14_01_f23_handout17.pdf` |
| 18 | Introduction to Trade | `resources/lec-18-introduction-to-trade/` | `KVV8pUOap2I` | `mit14_01_f23_lec18.pdf` | `mit14_01_f23_handout18.pdf` |
| 19 | International Trade: Welfare and Policy | `resources/lec-19-international-trade-welfare-and-policy/` | `TxoAbm57ELE` | `mit14_01_f23_lec19.pdf` | `mit14_01_f23_handout19.pdf` |
| 20 | Uncertainty | `resources/lec-20-uncertainty/` | `qwNTv1tjKbA` | `mit14_01_f23_lec20.pdf` | `mit14_01_f23_handout20.pdf` |
| 21 | Social Insurance | `resources/lec-21-social-insurance/` | `rXwgo-9xZDo` | `mit14_01_f23_lec21.pdf` | — |
| 22 | Efficiency and Equity | `resources/lec-22-efficiency-and-equity/` | `8sgl_wzzQUY` | `mit14_01_f23_lec22.pdf` | `mit14_01_f23_handout22.pdf` |
| 23 | Government Redistribution and Taxation | `resources/lec-23-government-redistribution-and-taxation/` | `DB7dSaro4cE` | `mit14_01_f23_lec23.pdf` | `mit14_01_f23_handout23.pdf` |
| 24 | Externalities | `resources/lec-24-externalities/` | `EDGRxqnILUM` | `mit14_01_f23_lec24.pdf` | `mit14_01_f23_handout24.pdf` |
| 25 | Behavioral Economics | `resources/lec-25-behavioral-economics/` | `TT7ZUJGPqos` | `mit14_01_f23_lec25.pdf` | — |
| 26 | Health Care Economics | `resources/lec-26-health-care-economics/` | `VoLP28-OSRU` | — | — |

Todos os resumos num arquivo só: `mit14_01_f23_full.pdf`.

### 3.3 Listas (com gabarito)

| Lista | Enunciado | Gabarito |
|---|---|---|
| 1 | `mit14_01_f23_pset1.pdf` | `mit14_01_f23_pset1sol.pdf` |
| 2 | `mit14_01_f23_pset2.pdf` | `mit14_01_f23_pset2sol.pdf` |
| 3 | `mit14_01_f23_pset3.pdf` | `mit14_01_f23_pset3sol.pdf` |
| 4 | `mit14_01_f23_pset4.pdf` | `mit14_01_f23_pset4sol.pdf` |
| 5 | `mit14_01_f23_pset5.pdf` | `mit14_01_f23_pset5sol.pdf` |
| 6 | `mit14_01_f23_pset6.pdf` | `mit14_01_f23_pset6sol.pdf` |
| 7 | `mit14_01_f23_pset7.pdf` | `mit14_01_f23_pset7sol.pdf` |
| 8 | `mit14_01_f23_pset8.pdf` | `mit14_01_f23_pset8sol.pdf` |

Página de cada arquivo: `resources/<nome sem .pdf>_pdf/` (ex.: `resources/mit14_01_f23_pset1sol_pdf/`).

### 3.4 Provas

| Prova | Arquivo | Observação |
|---|---|---|
| Intermediária | `mit14_01_f23_midterm.pdf` | Enunciado **e gabarito no mesmo PDF** |
| Final | `mit14_01_f23_final.pdf` | Enunciado **e gabarito no mesmo PDF** |

> Como o gabarito vem junto, o app precisa esconder o PDF até a entrega, ou mostrar só as páginas do enunciado.

---

## 4. 14.02 Princípios de Macroeconomia (Spring 2023)

**BASE:** `https://ocw.mit.edu/courses/14-02-principles-of-macroeconomics-spring-2023/`
Professor: Ricardo Caballero. Páginas: `pages/syllabus/` · `pages/topics-and-readings/` · `video_galleries/1402-lecture-videos/` · `pages/problem-sets/` · `pages/quizzes/`
Livro-texto: Blanchard, *Macroeconomics* (capítulos na tabela 4.4).

### 4.1 Aulas

| Aula | Título | Página do vídeo | YouTube |
|---|---|---|---|
| 1 | Introduction to 14.02 Principles of Macroeconomics | `resources/1402-sp23-lecture-1-v2_mp4/` | `heBErnN3ZPk` |
| 2 | Basic Macroeconomic Concepts | `resources/1402-sp23-lecture-2-v2_mp4/` | `kmUPK9AIE64` |
| 3 | The Goods Market | `resources/1402-sp23-lecture-3-v2_mp4/` | `fxrwTj2i_S4` |
| 4 | The Financial Market | `resources/1402-sp23-lecture-4-v2_mp4/` | `b5H8D_wD2AY` |
| 5 | IS-LM Model | `resources/1402-sp23-lecture-5-v2_mp4/` | `qg_HT3CjFI4` |
| 6 | IS-LM, continued | `resources/1402-sp23-lecture-6-v2_mp4/` | `gYgARXwnZTk` |
| 7 | An Extended IS-LM Model | `resources/1402-sp23-lecture-7-v2_mp4/` | `fkiWQZPOHXk` |
| 8 | The Labor Market | `resources/1402-sp23-lecture-8-v2_mp4/` | `oQ2mTN1_bus` |
| 9 | The Phillips Curve and Inflation | `resources/1402-sp23-lecture-9-v2_mp4/` | `mhqsslG9tyw` |
| 10 | Quiz 1 Review | `resources/1402-sp23-lecture-10-v2_mp4/` | `XEETOp5jo9w` |
| 11 | The IS-LM-PC Model | `resources/1402-sp23-lecture-11-v2_mp4/` | `QMtbUSfRWBY` |
| 12 | IS-LM-PC Model continued | `resources/1402-sp23-lecture-12-v2_mp4/` | `yoq0ENMiR4w` |
| 13 | The Facts of Growth | `resources/1402-sp23-lecture-13-v2_mp4/` | `v3k6BbBLULI` |
| 14 | Saving, Capital Accumulation, and Output | `resources/1402-sp23-lecture-14-v2_mp4/` | `VE4whF07w08` |
| 15 | Technological Progress and Growth | `resources/1402-sp23-lecture-15-v2_mp4/` | `nNqnivVl8WI` |
| 16 | Convergence and Cross-Country Variation | `resources/1402-sp23-lecture-16-v2_mp4/` | `ijXdeJTL6OU` |
| 17 | Introduction to Open Economy | `resources/1402-sp23-lecture-17-v2_mp4/` | `5uygC4oJvCI` |
| 18 | Quiz 2 Review | `resources/1402-sp23-lecture-18-v2_mp4/` | `yv0KsBKJzKY` |
| 19 | The Goods Market in the Open Economy | `resources/1402-sp23-lecture-19-v2_mp4/` | `f5ExlmDGdro` |
| 20 | The Mundell-Fleming Model | `resources/1402-sp23-lecture-20-v2_mp4/` | `ucPrWHF_5Lc` |
| 21 | Exchange Rate Regimes | `resources/1402-sp23-lecture-21-v2_mp4/` | `84LF3ze7Yvw` |
| 22 | Financial Markets and Expectations | `resources/1402-sp23-lecture-22-v2_mp4/` | `csWwk_MOLww` |
| 23 | Asset Pricing | `resources/1402-sp23-lecture-23-v2_mp4/` | `dCJEeSD7hKk` |
| 24 | IS-LM and Expectations | `resources/1402-sp23-lecture-24-v2_mp4/` | `bEWpXwflCoY` |
| 25 | Quiz 3 Review | `resources/1402-sp23-lecture-25-v2_mp4/` | `spY5kl_EYDU` |

### 4.2 Listas (com gabarito)

| Lista | Enunciado | Gabarito |
|---|---|---|
| 1 | `mit14_02_s23_pset1.pdf` | `mit14_02_s23_pset1_solutions.pdf` |
| 2 | `mit14_02_s23_pset2.pdf` | `mit14_02_s23_pset2_solutions.pdf` |
| 3 | `mit14_02_s23_pset3.pdf` | `mit14_02_s23_pset3_solutions.pdf` |
| 4 | `mit14_02_s23_pset4.pdf` | `mit14_02_s23_pset4_solutions.pdf` |
| 5 | `mit14_02_s23_pset5.pdf` | `mit14_02_s23_pset5_solutions.pdf` |
| 6 | `mit14_02_s23_pset6.pdf` | `mit14_02_s23_pset6_solutions.pdf` |
| 7 | `mit14_02_s23_pset7.pdf` | `mit14_02_s23_pset7_solutions.pdf` |
| 8 | `mit14_02_s23_pset8.pdf` | `mit14_02_s23_pset8_solutions.pdf` |

### 4.3 Provas (quizzes) e ordem de estudo

| Prova | Enunciado | Gabarito | Entra depois de |
|---|---|---|---|
| Quiz 1 | `mit14_02_s23_quiz1_no_sol.pdf` | `mit14_02_s23_quiz1.pdf` | Aula 10 (revisão) |
| Quiz 2 | `mit14_02_s23_quiz2.pdf` | no mesmo PDF | Aula 18 (revisão) |
| Quiz 3 | `mit14_02_s23_quiz3_no_sol.pdf` | `mit14_02_s23_quiz3_solutions.pdf` | Aula 25 (revisão) |

**Sugestão** de posição das listas (o MIT não publica as datas; confira o conteúdo de cada enunciado antes de fixar):

| Lista | Depois da aula |
|---|---|
| 1 | 3 |
| 2 | 5 |
| 3 | 7 |
| 4 | 9 |
| 5 | 12 |
| 6 | 16 |
| 7 | 21 |
| 8 | 24 |

### 4.4 Tópicos e leituras (Blanchard)

| Bloco | Tópico | Capítulos |
|---|---|---|
| Antes do Quiz 1 | Economic Measurement | 2 |
| | Goods and Financial Markets | 3 e 4 |
| | Short-Run Fluctuations and the IS-LM Model | 5 e 6 |
| | Labor Markets | 7 |
| Entre Quiz 1 e 2 | The Phillips Curve, Aggregate Supply, and Aggregate Demand | 8 e 9 |
| | Exchange Rates and the Open Economy | 17–20 |
| Depois do Quiz 2 | Theory of Economic Growth | 10–13 |
| | Expectations and Interest Rates | 14 |
| | Term Structure and the Stock Market | 14 |
| | Consumption and Investment | 15 |
| | Expectations and Policy | 16 |
| | Fiscal Policy | 22 |

---

## 5. 18.01SC Cálculo de uma variável (Fall 2010)

**BASE:** `https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/`
Professor: David Jerison. Formato "Scholar": 5 unidades → partes → **sessões**. A ordem do site já é a ordem de estudo.

**O que tem em cada sessão** (`pages/.../session-N-.../`): trechos de vídeo da aula ("Clip 1, Clip 2…", cada um uma página `resources/clip-...` com o YouTube), notas, exemplo resolvido com problema e solução em PDF, às vezes vídeo de recitation e mathlet. **Listas** (`problem-set-N/`) trazem enunciado e solução em PDF. **Provas** ficam nas páginas de "Materials for Exam N" (enunciado e solução).

Para o app: tratar **cada sessão como uma aula** (com vários vídeos curtos), cada `problem-set-N` como lista e cada `Materials for Exam N` como prova. Os IDs do YouTube saem raspando as páginas `resources/clip-...` de cada sessão.

### Unidade 1 · Differentiation — `pages/1.-differentiation/`

**Parte A · Definition and Basic Rules** — `pages/1.-differentiation/part-a-definition-and-basic-rules/`
- Sessões 1–12: `session-1-introduction-to-derivatives/` · `session-2-examples-of-derivatives/` · `session-3-derivative-as-rate-of-change/` · `session-4-limits-and-continuity/` · `session-5-discontinuity/` · `session-6-calculating-derivatives/` · `session-7-derivatives-of-sine-and-cosine/` · `session-8-limits-of-sine-and-cosine/` · `session-9-product-rule/` · `session-10-quotient-rule/` · `session-11-chain-rule/` · `session-12-higher-derivatives/`
- **Lista 1** — `problem-set-1/`

**Parte B · Implicit Differentiation and Inverse Functions** — `pages/1.-differentiation/part-b-implicit-differentiation-and-inverse-functions/`
- Sessões 13–20: `session-13-implicit-differentiation/` · `session-14-examples-of-implicit-differentiation/` · `session-15-implicit-differentiation-and-inverse-functions/` · `session-16-the-derivative-of-a-x/` · `session-17-the-exponential-function-its-derivative-and-its-inverse/` · `session-18-derivatives-of-other-exponential-functions/` · `session-19-an-interesting-limit-involving-e/` · `session-20-hyperbolic-trig-functions/`
- **Lista 2** — `problem-set-2/`

**Prova 1** — `pages/1.-differentiation/exam-1/`
- `session-21-review-for-exam-1-computing-derivatives-using-differentiation-rules/` (revisão) · `session-22-materials-for-exam-1/` (**prova**)

### Unidade 2 · Applications of Differentiation — `pages/unit-2-applications-of-differentiation/`

**Parte A · Approximation and Curve Sketching** — `…/part-a-approximation-and-curve-sketching/`
- Sessões 23–28: `session-23-linear-approximation/` · `session-24-examples-of-linear-approximation/` · `session-25-introduction-to-quadratic-appoximation/` · `session-26-using-quadratic-approximations/` · `session-27-sketching-graphs-i-polynomials-and-rational-functions/` · `session-28-sketching-graphs-ii-general-strategies/`
- **Lista 3** — `problem-set-3/`

**Parte B · Optimization, Related Rates and Newton's Method** — `…/part-b-optimization-related-rates-and-newtons-method/`
- Sessões 29–33: `session-29-optimization-problems/` · `session-30-optimization-problems-ii/` · `session-31-related-rates/` · `session-32-ring-on-a-string/` · `session-33-newtons-method/`
- **Lista 4** — `problem-set-4/`

**Parte C · Mean Value Theorem, Antiderivatives and Differential Equations** — `…/part-c-mean-value-theorem-antiderivatives-and-differential-equations/`
- Sessões 34–40: `session-34-introduction-to-the-mean-value-theorem/` · `session-35-using-the-mean-value-theorem/` · `session-36-differentials/` · `session-37-antiderivatives/` · `session-38-integration-by-substitution/` · `session-39-introduction-to-differential-equations/` · `session-40-separation-of-variables/`
- **Lista 5** — `problem-set-5/`

**Prova 2** — `pages/unit-2-applications-of-differentiation/exam-2/`
- `session-41-review-for-exam-2/` · `materials-for-exam-2/` (**prova**)

### Unidade 3 · The Definite Integral and its Applications — `pages/unit-3-the-definite-integral-and-its-applications/`

**Parte A · Definition of the Definite Integral and First Fundamental Theorem** — `…/part-a-definition-of-the-definite-integral-and-first-fundamental-theorem/`
- Sessões 43–50: `session-43-definite-integrals/` · `session-44-adding-areas-of-rectangles/` · `session-45-some-easy-integrals/` · `session-46-riemann-sums/` · `session-47-introduction-of-the-fundamental-theorem-of-calculus/` · `session-48-the-fundamental-theorem-of-calculus/` · `session-49-applications-of-the-fundamental-theorem-of-calculus/` · `session-50-combining-the-fundamental-theorem-and-the-mean-value-theorem/`
- **Lista 6** — `problem-set-6/`

**Parte B · Second Fundamental Theorem, Areas, Volumes** — `…/part-b-second-fundamental-theorem-areas-volumes/`
- Sessões 51–59: `session-51-the-second-fundamental-theorem-of-calculus/` · `session-52-proving-the-fundamental-theorem-of-calculus/` · `session-53-new-functions-from-old/` · `session-54-the-second-fundamental-theorem-and-ln-x/` · `session-55-creating-new-functions-using-the-second-fundamental-theorem/` · `session-56-geometric-interpretation-of-definite-integrals/` · `session-57-how-to-calculate-volumes/` · `session-58-volume-of-a-sphere-revolving-about-x-axis/` · `session-59-volume-of-a-parabaloid-revolving-about-y-axis/`
- **Lista 7** — `problem-set-7/`

**Parte C · Average Value, Probability and Numerical Integration** — `…/part-c-average-value-probability-and-numerical-integration/`
- Sessões 60–65: `session-60-integrals-and-averages/` · `session-61-integrals-and-weighted-averages/` · `session-62-integrals-and-probability/` · `session-63-numerical-integration/` · `session-64-numerical-integration-continued/` · `session-65-bell-curve-conclusion/`
- **Lista 8** — `problem-set-8/`

**Prova 3** — `pages/unit-3-the-definite-integral-and-its-applications/exam-3/`
- `review-for-exam-3/` (sessão 66) · `materials-for-exam-3/` (sessão 67, **prova**)

### Unidade 4 · Techniques of Integration — `pages/unit-4-techniques-of-integration/`

**Parte A · Trigonometric Powers, Trigonometric Substitution and Completing the Square** — `…/part-a-trigonometric-powers-trigonometric-substitution-and-completing-the-square/`
- Sessões 68–73: `session-68-integral-of-sin-n-x-cos-m-x-odd-exponents/` · `session-69-integral-of-sin-n-x-cos-m-x-even-exponents/` · `session-70-preview-of-trig-substitution-and-polar-coordinates/` · `session-71-integrals-involving-secant-cosecant-and-cotangent/` · `session-72-trig-substitution/` · `session-73-completing-the-square/`
- **Lista 9** — `problem-set-9/`

**Parte B · Partial Fractions, Integration by Parts, Arc Length, and Surface Area** — `…/part-b-partial-fractions-integration-by-parts-arc-length-and-surface-area/`
- Sessões 74–79: `session-74-integration-by-partial-fractions/` · `session-75-advanced-partial-fractions/` · `session-76-integration-by-parts/` · `session-77-volume-of-a-wine-glass/` · `session-78-computing-the-length-of-a-curve/` · `session-79-surface-area/`
- **Lista 10** — `problem-set-10/`

**Parte C · Parametric Equations and Polar Coordinates** — `…/part-c-parametric-equations-and-polar-coordinates/`
- Sessões 80–84: `session-80-parametric-curves/` · `session-81-examples-using-parametrized-curves/` · `session-82-polar-coordinates/` · `session-83-polar-coordinates-continued/` · `session-84-polar-coordinates-and-graphing/`
- **Lista 11** — `problem-set-11/`

**Prova 4** — `pages/unit-4-techniques-of-integration/exam-4/`
- `session-85-review-for-exam-4/` · `session-86-materials-for-exam-4/` (**prova**)

### Unidade 5 · Exploring the Infinite — `pages/unit-5-exploring-the-infinite/`

**Parte A · L'Hospital's Rule and Improper Integrals** — `…/part-a-lhospitals-rule-and-improper-integrals/`
- Sessões 87–93: `session-87-lhospitals-rule/` · `session-88-examples-of-lhospitals-rule/` · `session-89-lhospitals-rule-and-rates-of-growth/` · `session-90-advanced-examples-of-lhospitals-rule/` · `session-91-improper-integrals/` · `session-92-integral-comparison/` · `session-93-indefinite-integrals-and-singularities/`

**Parte B · Taylor Series** — `…/part-b-taylor-series/`
- Sessões 94–101: `session-94-infinite-series/` · `session-95-series-comparison/` · `session-96-stacking-blocks/` · `session-97-power-series/` · `session-98-taylors-series/` · `session-99-taylors-series-continued/` · `session-100-operations-on-power-series/` · `session-101-conclusion/`

(A unidade 5 não tem lista própria no site.)

**Prova final** — `pages/final-exam/`
- Enunciado: `resources/mit18_01scf10_final/` · Solução: `resources/mit18_01scf10_finalsol/`

---

## 6. 18.02SC Cálculo de várias variáveis (Fall 2010)

**BASE:** `https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/`
Professor: Denis Auroux. Mesmo formato do 18.01SC (unidades → partes → sessões; listas e provas com solução). Para economia, as partes mais importantes são a **2A** (otimização) e a **2C** (multiplicadores de Lagrange).

### Unidade 1 · Vectors and Matrices — `pages/1.-vectors-and-matrices/`

**Parte A · Vectors, Determinants and Planes** — `…/part-a-vectors-determinants-and-planes/`
- Sessões 1–8: `session-1-vectors/` · `session-2-dot-products/` · `session-3-uses-of-the-dot-product-lengths-and-angles/` · `session-4-vector-components/` · `session-5-area-and-determinants-in-2d/` · `session-6-volumes-and-determinants-in-space/` · `session-7-cross-products/` · `session-8-equations-of-planes/`
- **Lista 1** — `problem-set-1/`

**Parte B · Matrices and Systems of Equations** — `…/part-b-matrices-and-systems-of-equations/`
- Sessões 9–14: `session-9-matrix-multiplication/` · `session-10-meaning-of-matrix-multiplication/` · `session-11-matrix-inverses/` · `session-12-equations-of-planes-ii/` · `session-13-linear-systems-and-planes/` · `session-14-solutions-to-square-systems/`
- **Lista 2** — `problem-set-2/`

**Parte C · Parametric Equations for Curves** — `…/part-c-parametric-equations-for-curves/`
- Sessões 15–21: `session-15-equations-of-lines/` · `session-16-intersection-of-a-line-and-a-plane/` · `session-17-general-parametric-equations-the-cycloid/` · `session-18-point-cusp-on-cycloid/` · `session-19-velocity-and-acceleration/` · `session-20-velocity-and-arc-length/` · `session-21-keplers-second-law/`
- **Lista 3** — `problem-set-3/`

**Prova 1** — `pages/1.-vectors-and-matrices/exam-1/`
- `practice-exam/` (treino) · `session-22-review-of-topics/` · `session-23-review-of-problems/` · `exam/` (**prova**)

### Unidade 2 · Partial Derivatives — `pages/2.-partial-derivatives/`

**Parte A · Functions of Two Variables, Tangent Approximation and Optimization** — `…/part-a-functions-of-two-variables-tangent-approximation-and-optimization/`
- Sessões 24–31: `session-24-functions-of-two-variables-graphs/` · `session-25-level-curves-and-contour-plots/` · `session-26-partial-derivatives/` · `session-27-approximation-formula/` · `session-28-optimization-problems/` · `session-29-least-squares/` · `session-30-second-derivative-test/` · `session-31-example/`
- **Lista 4** — `problem-set-4/`

**Parte B · Chain Rule, Gradient and Directional Derivatives** — `…/part-b-chain-rule-gradient-and-directional-derivatives/`
- Sessões 32–38: `session-32-total-differentials-and-the-chain-rule/` · `session-33-examples/` · `session-34-the-chain-rule-with-more-variables/` · `session-35-gradient-definition-perpendicular-to-level-curves/` · `session-36-proof/` · `session-37-example/` · `session-38-directional-derivatives/`
- **Lista 5** — `problem-set-5/`

**Parte C · Lagrange Multipliers and Constrained Differentials** — `…/part-c-lagrange-multipliers-and-constrained-differentials/`
- Sessões 39–44: `session-39-statement-of-lagrange-multipliers-and-example/` · `session-40-proof-of-lagrange-multipliers/` · `session-41-advanced-example/` · `session-42-constrained-differentials/` · `session-43-clearer-notation/` · `session-44-example/`
- **Lista 6** — `problem-set-6/`

**Prova 2** — `pages/2.-partial-derivatives/exam-2/`
- `practice-exam/` · `session-45-review-of-topics/` · `session-46-review-of-problems/` · `exam-materials/` (**prova**)

### Unidade 3 · Double Integrals and Line Integrals in the Plane — `pages/3.-double-integrals-and-line-integrals-in-the-plane/`

**Parte A · Double Integrals** — `…/part-a-double-integrals/`
- Sessões 47–55: `session-47-definition-of-double-integration/` · `session-48-examples-of-double-integration/` · `session-49-exchanging-the-order-of-integration/` · `session-50-double-integrals-in-polar-coordinates/` · `session-51-applications-mass-and-average-value/` · `session-52-applications-moment-of-inertia/` · `session-53-change-of-variables/` · `session-54-example-polar-coordinates/` · `session-55-example/`
- **Lista 7** — `problem-set-7/`

**Parte B · Vector Fields and Line Integrals** — `…/part-b-vector-fields-and-line-integrals/`
- Sessões 56–64: `session-56-vector-fields/` · `session-57-work-and-line-integrals/` · `session-58-geometric-approach/` · `session-59-example-line-integrals-for-work/` · `session-60-fundamental-theorem-for-line-integrals/` · `session-61-conservative-fields-path-independence-exact-differentials/` · `session-62-gradient-fields/` · `session-63-potential-functions/` · `session-64-curl/`
- **Lista 8** — `problem-set-8/`

**Parte C · Green's Theorem** — `…/part-c-greens-theorem/`
- Sessões 65–72: `session-65-greens-theorem/` · `session-66-curl-f-equals-0-implies-conservative/` · `session-67-proof-of-greens-theorem/` · `session-68-planimeter-greens-theorem-and-area/` · `session-69-flux-in-2d/` · `session-70-normal-form-of-greens-theorem/` · `session-71-extended-greens-theorem-boundaries-with-multiple-pieces/` · `session-72-simply-connected-regions-and-conservative-fields/`
- **Lista 9** — `problem-set-9/`

**Prova 3** — `pages/3.-double-integrals-and-line-integrals-in-the-plane/exam-3/`
- `practice-exam/` · `session-73-exam-review/` · `exam/` (**prova**)

### Unidade 4 · Triple Integrals and Surface Integrals in 3-Space — `pages/4.-triple-integrals-and-surface-integrals-in-3-space/`

**Parte A · Triple Integrals** — `…/part-a-triple-integrals/`
- Sessões 74–78: `session-74-triple-integrals-rectangular-and-cylindrical-coordinates/` · `session-75-applications-and-examples/` · `session-76-spherical-coordinates/` · `session-77-triple-integrals-in-spherical-coordinates/` · `session-78-applications-gravitational-attraction/`
- **Lista 10** — `problem-set-10/`

**Parte B · Flux and the Divergence Theorem** — `…/part-b-flux-and-the-divergence-theorem/`
- Sessões 79–87: `session-79-vector-fields-in-space/` · `session-80-flux-through-a-surface/` · `session-81-calculating-flux-finding-nds/` · `session-82-nds-for-a-surface-z-f-x-y/` · `session-83-other-ways-to-find-nds/` · `session-84-divergence-theorem/` · `session-85-physical-meaning-of-flux-del-notation/` · `session-86-proof-of-the-divergence-theorem/` · `session-87-diffusion-equation/`
- **Lista 11** — `problem-set-11/`

**Parte C · Line Integrals and Stokes' Theorem** — `…/part-c-line-integrals-and-stokes-theorem/`
- Sessões 88–96: `session-88-line-integrals-in-space/` · `session-89-gradient-fields-and-potential-functions/` · `session-90-curl-in-3d/` · `session-91-stokes-theorem/` · `session-92-proof-of-stokes-theorem/` · `session-93-example/` · `session-94-simply-connected-regions-topology/` · `session-95-stokes-theorem-and-surface-independence/` · `session-96-summary-of-multiple-integration/`
- **Lista 12** — `problem-set-12/`

**Prova 4** — `pages/4.-triple-integrals-and-surface-integrals-in-3-space/exam-4/`
- `practice-exam/` · `exam/` (**prova**)

**Aplicações em física (opcional)** — `…/physics-applications/`: `session-97-curl-and-physics/` · `session-98-maxwells-equations/`

**Prova final** — `pages/final-exam-1/`
- Revisão: `review/session-99-unit-1-review/` · `review/session-100-unit-2-review/` · `review/session-101-unit-3-review/` · `review/session-102-unit-4-review/`
- Treino: `resources/mit18_02sc_pracfinal/` · solução `resources/mit18_02sc_pracfinalsol/`
- Prova: `resources/mit18_02sc_finalexam/` · solução `resources/mit18_02sc_finalexamsol/`

---

## 7. 14.04 Microeconomia intermediária (Fall 2020)

**BASE:** `https://ocw.mit.edu/courses/14-04-intermediate-microeconomic-theory-fall-2020/`
Professor: Robert M. Townsend. Páginas: `pages/syllabus/` · `pages/calendar/` · `pages/readings/` · `video_galleries/test-video-gallery/` · `pages/assignments/` · `pages/exams/`
**Listas sem gabarito.** As provas trazem a solução no mesmo PDF.

### 7.1 Ordem de estudo (pelo calendário oficial)

| # | Etapa |
|---|---|
| 1–4 | Aulas 1 a 4 |
| 5 | **Lista 1** |
| 6–8 | Aulas 5 a 7 |
| 9 | **Lista 2** |
| 10 | Revisão da Prova 1 (vídeo) |
| 11 | **Prova 1** (aulas 1–7) |
| 12–15 | Aulas 8 a 11 |
| 16 | **Lista 3** |
| 17–20 | Aulas 12 a 15 |
| 21 | **Lista 4** |
| 22 | Revisão da Prova 2 (vídeo) |
| 23 | **Prova 2** (aulas 8–15) |
| 24–29 | Aulas 16 a 21 |
| 30 | **Lista 5** |
| 31 | Revisão final (vídeo) |
| 32 | **Prova 3** (matéria inteira) |

### 7.2 Aulas

| Aula | Título | Página do vídeo | YouTube |
|---|---|---|---|
| 1 | Economic Science | `resources/ocw_1404_lecture01_2020sep01/` | `XSTSfCs74bg` |
| 2 | Consumer Choice | `resources/ocw_1404_lecture02_2020sep03/` | `rhOpABGewYA` |
| 3 | Income and Substitution Effects | `resources/ocw_1404_lecture03_2020sep08/` | `DGoILxx9KsE` |
| 4 | Production and Profit Maximization | `resources/ocw_1404_lecture04_2020sep10/` | `o8sje-b-BCk` |
| 5 | Uncertainty and Linear Programs | `resources/ocw_1404_lecture05_2020sep15/` | `s0gfi3OrtQk` |
| 6 | Dynamics and Programming | `resources/ocw_1404_lecture06_2020sep17/` | `aaLDUlJXXNM` |
| 7 | Pareto Optimality | `resources/ocw_1404_lecture07_2020sep22/` | `EK1pgrHeqpQ` |
| R1 | Exam #1 Review | `resources/ocw_1404_review_2020sep24/` | `ANprMjSgTZY` |
| 8 | Risk-Sharing Application | `resources/ocw_1404_lecture08_2020oct01/` | `6Tm4bHa28Ck` |
| 9 | Risk-Sharing with Production | `resources/ocw_1404_lecture09_2020oct06/` | `QcUUGlsSXmY` |
| 10 | Ledgers and Management | `resources/ocw_1404_lecture10_2020oct08/` | `5rjoqINtRbs` |
| 11 | Contracts and Mechanism Design | `resources/ocw_1404_lecture11_2020oct15/` | `cAFh3oWw6Vc` |
| 12 | Contract Application, Obstacles | `resources/ocw_1404_lecture12_2020oct20/` | `FGxxnOLvSfg` |
| 13 | Walrasian Equilibrium and Trade | `resources/ocw_1404_lecture13_2020oct22/` | `3X3b1GMniC4` |
| 14 | Real and Financial Flows: Thailand | `resources/ocw_1404_lecture14_2020oct27/` | `R8k2x5qJgO4` |
| 15 | Data and Policy in the United States | `resources/ocw_1404_lecture15_2020oct29/` | `O5YwAGe8rmk` |
| R2 | Exam #2 Review | `resources/ocw_1404_midtermreview_2020nov03/` | `JZplGZVCdN8` |
| 16 | Fundamental Welfare Theorems | `resources/ocw_1404_lecture16_2020nov10/` | `h0IfCMqepfM` |
| 17 | Existence of Equilibria | `resources/ocw_1404_lecture17_2020nov12/` | `eBb1BLE4am0` |
| 18 | Aggregation | `resources/ocw_1404_lecture18_2020nov17/` | `pAP1HKzueqc` |
| 19 | Identification and Falsification | `resources/ocw_1404_lecture19_2020nov19/` | `rWnyP-iZGu4` |
| 20 | Failure of Welfare Theorems | `resources/ocw_1404_lecture20_2020dec01/` | `lUqwzrkO5fw` |
| 21 | Bubbles | `resources/ocw_1404_lecture21_2020dec03/` | `ySqVVEBTy2o` |
| R3 | Final Exam Review | `resources/ocw_1404_finalreview_2020dec08/` | `Dqko567cE9I` |

### 7.3 Listas e provas

| Item | Arquivo | Página |
|---|---|---|
| Lista 1 | `mit14_04f20_pset1.pdf` | `resources/mit14_04f20_pset1/` |
| Lista 2 | `mit14_04f20_pset2.pdf` | `resources/mit14_04f20_pset2/` |
| Lista 3 | `mit14_04f20_pset3.pdf` | `resources/mit14_04f20_pset3/` |
| Lista 3 · simulação (Excel) | — | `resources/mit14_04f20_pset3_sim/` |
| Lista 4 | `mit14_04f20_pset4.pdf` | `resources/mit14_04f20_pset4/` |
| Lista 5 | `mit14_04f20_pset5.pdf` | `resources/mit14_04f20_pset5/` |
| Prova 1 (com solução) | `mit14_04f20_exam1.pdf` | `resources/mit14_04f20_exam1/` |
| Prova 2 (com solução) | `mit14_04f20_exam2.pdf` | `resources/mit14_04f20_exam2/` |
| Prova 3 (com solução) | `mit14_04f20_exam3.pdf` | `resources/mit14_04f20_exam3/` |

O calendário também lista 13 recitations (sem vídeo publicado). As leituras estão em `pages/readings/`.

---

## 8. 14.06 Macroeconomia intermediária (Spring 2004) · recomendado

**BASE:** `https://ocw.mit.edu/courses/14-06-intermediate-macroeconomic-theory-spring-2004/`
Professor: George-Marios Angeletos. **Sem vídeo**: a "aula" é a leitura das notas (capítulos) e das leituras do Romer, *Advanced Macroeconomics*. Páginas: `pages/syllabus/` · `pages/calendar/` · `pages/readings/` · `pages/lecture-notes/` · `pages/assignments/` · `pages/exams/`

### 8.1 Tópicos (calendário)

| # | Tópico | Leitura obrigatória principal |
|---|---|---|
| 1 | Introduction to Growth Facts and Growth Models | Romer cap. 1; Solow (1956) |
| 2 | The Neoclassical Growth Model | Romer cap. 2; Mankiw, Romer e Weil (1992) |
| 3 | Overlapping Generations | Romer cap. 2; Barro (1974); Diamond (1965) |
| 4 | Applications: Fluctuations, Investment, Asset Pricing, Public Finance, Behavioral | Romer caps. 7–8; Barro (1979) |
| 5 | Endogenous Growth: Externalities, R&D, Innovation | Romer cap. 3; P. Romer (1986, 1990); Lucas (1988) |
| 6 | Real Business Cycles | Romer cap. 4; Kydland e Prescott (1982) |
| 7 | The IS-LM Model | Romer cap. 5 |
| 8 | Incomplete Nominal Adjustment | Romer cap. 6; Mankiw (1985) |
| 9 | Incomplete Financial Markets | Obstfeld (1994); Bernanke e Gertler (1989) |
| 10 | Unemployment | Romer caps. 9–10; Shapiro e Stiglitz (1984) |
| 11 | Consumption and Savings | Romer cap. 7 |

Referências completas em `pages/readings/`.

### 8.2 Notas de aula (capítulos)

Não há capítulo 5 publicado.

| Capítulo | Arquivo |
|---|---|
| 1 | `88d3202cd98d9fdf352e58f5200bd0d8_14_06lec_nts_ch1.pdf` |
| 2 | `b7f2621c81ea4d1d83fa80389ee4ec02_14_06lec_nts_ch2.pdf` |
| 3 | `5c9ea97ac98934e90c46bc7cef6deb7f_14_06lec_nts_ch3.pdf` |
| 4 | `d03cc97524ee08086499d94d4613ce02_14_06lec_nts_ch4.pdf` |
| 6 | `886c82034d9300a3539c91041c8ca6d3_14_06lec_nts_ch6.pdf` |
| 7 | `1c996acb5be3e4a5361e13c95f3fec5a_14_06lec_nts_ch7.pdf` |

### 8.3 Listas

As soluções não aparecem na página de listas, mas existem como materiais avulsos (verificado).

| Lista | Enunciado | Solução |
|---|---|---|
| 1 | `65cfce6b9eda58aa861edde68ff6a2e0_14_06problemset1.pdf` | `e0eb8dcdf74387845b03ce38507b0344_14_06proset1_sol.pdf` |
| 2 | `4d297b631d6cf49757942279af25c1dc_14_06problemset2.pdf` | `1bb94818cfd4f2dd887259d3f8dc883e_14_06proset2_sol.pdf` |
| 3 | `e8e80132ad28956c111cba9b2a9536e3_14_06problemset3.pdf` | não encontrada |
| 3 · Consumption Problem | `72cb5230dc4738ee515351c8a53cffd4_1406pset3conprob.pdf` | — |
| 4 | `3da70d25129f5983c169e414ba05c360_14_06problemset4.pdf` | `dad5b59a0d5bab1912aa180f7bb5482f_14_06proset4_sol.pdf` |
| 5 | `99de95b7e147aa5bc4e4f3c4e5a9515d_14_06problemset5.pdf` | `ccfe3bc6b6f39222a051ae98a3734fa0_14_06proset5_sol.pdf` |
| Requisitos do trabalho escrito | `5e8d6e9fb8fa2b4ea262487777c358a4_14_06_paper_req.pdf` | — |

### 8.4 Provas

| Prova | Enunciado | Solução |
|---|---|---|
| Intermediária | `6d9578103ab4503ad59d582ceba68820_1406mterm_s04.pdf` | `96cf36fde6c5c24eec95a4c42229c468_1406mterm04_sol.pdf` |
| Final | `cbc105b99659482969c5ae34db15dd0e_1406fexam_s04.pdf` | `9f1d7902941bd9bf201f9b601e883e5e_1406fexamsol_s04.pdf` |

**Sugestão** de ordem (não há datas no calendário): tópicos 1–2 → Lista 1 → tópico 3 → Lista 2 → tópicos 4–5 → Lista 3 → tópico 6 → **Prova intermediária** → tópicos 7–8 → Lista 4 → tópicos 9–11 → Lista 5 → **Prova final**. Confira o conteúdo de cada lista antes de fixar.

---

## 9. 14.05 Macroeconomia intermediária (Fall 2025) · alternativa e apoio

**BASE:** `https://ocw.mit.edu/courses/14-05-intermediate-macroeconomics-fall-2025/`
Professor: Christian Wolf. Sem vídeo e **sem gabaritos**. Páginas: `pages/syllabus/` · `pages/course-outline/` · `lists/lecture-slides/` · `lists/problem-sets/` · `lists/exams/` · `pages/paper-assignment/`

### 9.1 Slides das aulas

Todos os arquivos seguem o padrão `mit14_05_f25_lectureN.pdf`, com página `resources/mit14_05_f25_lectureN_pdf/`.

| Aula | Título |
|---|---|
| 1 | Introduction and Stylized Facts |
| 2 | A Simple General Equilibrium Model |
| 3 | Aggregate Production, and Cross-Country Differences in L, K, and A |
| 4 | The Solow Model |
| 5 | The Solow Model and Cross-Country Income Differences |
| 6 | The Solow Model with Exogenous Perpetual Growth and Growth Accounting |
| 7 | Growth Accounting, Golden Rule, and Endogenous Saving |
| 8 | The Neoclassical Growth Model Part 1 |
| 9 | The Neoclassical Growth Model Part 2 |
| 10 | The Neoclassical Growth Model Part 3 |
| 11 | Endogenous Technological Progress |
| 12 | Technological Change and Inequality |
| 13 | Business Cycles-Overview |
| 14 | Towards Real Business Cycles |
| 15 | The Real Business Cycle Model |
| 16 | Permanent-Income Consumption |
| 17 | Hand-to-Mouth Consumption |
| 18 | Investment |
| 19 | Sticky Prices |
| 20 | The New Keynesian Model |
| 21 | Fiscal Policy |
| 22 | Optimal Monetary Policy Design |

### 9.2 Listas e provas

| Item | Arquivo |
|---|---|
| Lista 1 | `mit14_05_f25_pset1.pdf` |
| Lista 2 | `mit14_05_f25_pset2.pdf` |
| Lista 3 | `mit14_05_f25_pset3.pdf` |
| Lista 4 | `mit14_05_f25_pset4.pdf` |
| Prova intermediária 1 (de 2024) | `mit14_05_f25_midterm12024.pdf` |
| Prova intermediária 2 (de 2024) | `mit14_05_f25_midterm2fall2024.pdf` |

Não confirmei se as provas de 2024 trazem solução; abra os PDFs para checar.

---

## 10. 14.30 Métodos estatísticos em economia (Spring 2009)

**BASE:** `https://ocw.mit.edu/courses/14-30-introduction-to-statistical-methods-in-economics-spring-2009/`
Professor: Konrad Menzel. **Sem vídeo** (a aula é a nota de aula). Listas com gabarito. Provas **sem** gabarito (há provas de treino de 2008). Páginas: `pages/syllabus/` · `pages/calendar/` · `pages/readings/` · `pages/lecture-notes/` · `pages/assignments/` · `pages/exams/`
Livros citados nas leituras: [LM] Larsen e Marx; [DS] DeGroot e Schervish; [L] terceiro livro-texto citado no syllabus.

### 10.1 Ordem de estudo (pelo calendário oficial)

| # | Etapa |
|---|---|
| 1–3 | Aulas 1 a 3 |
| 4 | **Lista 1** |
| 5–6 | Aulas 4 e 5 |
| 7 | **Lista 2** |
| 8–9 | Aulas 6 e 7 |
| 10 | **Lista 3** |
| 11 | Aula 8 (revisão) |
| 12 | **Prova 1** |
| 13 | Aula 9 |
| 14 | **Lista 4** |
| 15–18 | Aulas 10 a 13 |
| 19 | **Lista 5** |
| 20–21 | Aulas 14 e 15 |
| 22 | **Lista 6** |
| 23 | Aula 16 (revisão) |
| 24 | **Prova 2** |
| 25 | Aula 17 |
| 26 | **Lista 7** |
| 27–28 | Aulas 18 e 19 |
| 29 | **Lista 8** |
| 30–32 | Aulas 20 a 22 |
| 33 | **Lista 9** |
| 34–35 | Aulas 23 e 24 (revisão) |
| 36 | **Prova 3** |

### 10.2 Notas de aula

O padrão do arquivo é `<hash>_MIT14_30s09_lecNN.pdf`, com página `resources/mit14_30s09_lecNN/`.

| Aula | Tópico | Arquivo |
|---|---|---|
| 1 | Sets and events | `b7e094cbc0fd2de22977a35a0f957786_MIT14_30s09_lec01.pdf` |
| 2 | Probabilities and counting rules | `0ae3bdadf74a48e05aed6f639c1b23d2_MIT14_30s09_lec02.pdf` |
| 3 | Conditional probability and independence | `9c89201451ee315f78f75d1dcdfef47e_MIT14_30s09_lec03.pdf` |
| 4 | Bayes theorem and random variables | `e126cf189fd96b8cadf7e28d578e12cf_MIT14_30s09_lec04.pdf` |
| 5 | Discrete and continuous random variables | `e54b3838f350ab02d28c460cdad262b3_MIT14_30s09_lec05.pdf` |
| 6 | PDFs, CDFs, joint distribution of 2+ random variables | `a39b3988bd2f6241565473277cb82365_MIT14_30s09_lec06.pdf` |
| 7 | Joint and marginal distributions | `5eb6b62623ac2e828079db609e0a44b5_MIT14_30s09_lec07.pdf` |
| 8 | Review | `9cda4d4c7bbf21f05d493c0888a45119_MIT14_30s09_lec08.pdf` |
| 9 | Functions of random variables | `73fdac8f3116a25185265124138c33e6_MIT14_30s09_lec09.pdf` |
| 10 | Functions of several random variables | `208014d7a2f8fa463cfcd83b3d3c4d8f_MIT14_30s09_lec10.pdf` + `93c9ca6053e598e97baf12194eb1afd4_MIT14_30s09_lec10ex.pdf` |
| 11 | Order statistics and expectations | `fe7f0d9c5833858fc1ac48230e6dbcd2_MIT14_30s09_lec11.pdf` |
| 12 | Median, quantiles, and variance | `c5f4033c634e701f4e339a30a00022f4_MIT14_30s09_lec12.pdf` |
| 13 | Covariance and conditional expectations | `3d59fe993bc8a07bf26c3c16c0b06f64_MIT14_30s09_lec13.pdf` |
| 14 | Conditional expectations and special distributions | `1f874922245d8dc83bd671ba9255e61d_MIT14_30s09_lec14.pdf` |
| 15 | Law of large numbers | `107829d606f0b5e28ffed9e6a1cfaa3a_MIT14_30s09_lec15.pdf` |
| 16 | Review | `b5f0c35be0af22f4c8948e7db00ac9fa_MIT14_30s09_lec16.pdf` |
| 17 | Central limit theorem, estimators, bias, and consistency | `18d871e66ec8702a000da059098152fe_MIT14_30s09_lec17.pdf` |
| 18 | Constructing estimators | `64ef22da815cf9f625b196d7db3397d3_MIT14_30s09_lec18.pdf` |
| 19 | Confidence intervals | `ec1d44a7aacf2408403d2cc83c89ec89_MIT14_30s09_lec19.pdf` |
| 20 | Confidence intervals (cont.) | `39b3f42fb38a16c2f6c95d53eced4eba_MIT14_30s09_lec20.pdf` |
| 21 | Hypothesis tests | `056205c5182ca40345a4e0c5236909da_MIT14_30s09_lec21.pdf` |
| 22 | Hypothesis tests (cont.) | `20cd12fd8544087e7ece894208e6703b_MIT14_30s09_lec22.pdf` |
| 23 | Hypothesis tests (cont.) | `0b1289d0f0a4f5b29c5a7f8969e763a5_MIT14_30s09_lec23.pdf` |
| 24 | Review | `deec4590151e8c52e5dfacf953a0b645_MIT14_30s09_lec24.pdf` |

### 10.3 Listas (com gabarito)

| Lista | Enunciado | Gabarito |
|---|---|---|
| 1 | `456138af4f3daa310d641ccf82123714_MIT14_30s09_pset01.pdf` | `e3917773bf1588c4771c9411f7ba18c4_MIT14_30s09_sol_pset01.pdf` |
| 2 | `4e71faba6ddac1151d53135fe77c59b1_MIT14_30s09_pset02.pdf` | `7b821e6a50dd84251533a02fe3898f3d_MIT14_30s09_sol_pset02.pdf` |
| 3 | `9197cb740caca50a7fc405b8229cf4be_MIT14_30s09_pset03.pdf` | `7b7388dfecf65bb2c5efd41bcf9a60b6_MIT14_30s09_sol_pset03.pdf` |
| 4 | `b1c8e1965950d6efe3e3cfbf345f8319_MIT14_30s09_pset04.pdf` | `464704cd0b2a7fcf8aa98a3318f6b853_MIT14_30s09_sol_pset04.pdf` |
| 5 | `1e1b29763c6edb4c01c695e0e376c5e4_MIT14_30s09_pset05.pdf` | `03ef5da497d3f4d85c8ca073cbb4eec3_MIT14_30s09_sol_pset05.pdf` |
| 6 | `3fd1cf8f29a4bee9cfa9879c1f4489c5_MIT14_30s09_pset06.pdf` | `4f6b3bbbdd8009cb178db350a8f25c49_MIT14_30s09_sol_pset06.pdf` |
| 7 | `1f8f28796cdeba5838ea347f53143bd0_MIT14_30s09_pset07.pdf` | `e7130f6a0b8fb9a5953494117a8156b6_MIT14_30s09_sol_pset07.pdf` |
| 8 | `4b6cf5c45dd7d3f1b6ed5d3c31ca2b91_MIT14_30s09_pset08.pdf` | `7db83ceb44efc1c20a9624f2b8d827fe_MIT14_30s09_sol_pset08.pdf` |
| 9 | `94991a7242d5560f7efa20166b0d593a_MIT14_30s09_pset09.pdf` | `412105de9a80deeff0610e73496a707b_MIT14_30s09_sol_pset09.pdf` |

### 10.4 Provas (sem gabarito)

| Prova | Treino (2008) | Prova de 2009 |
|---|---|---|
| 1 | `ba0d6e92b940a082ceeae76382224e70_MIT14_30s09_exam01_08.pdf` | `487dd6ce78798890c420fa1c2dcb1a43_MIT14_30s09_exam01_09.pdf` |
| 2 | `bd7c63e68c81e810e5bb2ea177135bde_MIT14_30s09_exam02_08.pdf` | `437ceb34efa23a56f7fb7b47b837574d_MIT14_30s09_exam02_09.pdf` |
| 3 | `422abaf276484ce893c2733dbcb6401b_MIT14_30s09_exam03_08.pdf` | `275c335ed43005ad0fea614233c0a676_MIT14_30s09_exam03_09.pdf` |

Também na página de provas, sem descrição: `1f87c9b9d001cc4eefd483f98e9cf2c2_MIT14_30s09_tool01.pdf` (abra para ver o que é antes de usar).

---

## 11. 14.32 Econometria (Spring 2007) · material a definir

**BASE:** `https://ocw.mit.edu/courses/14-32-econometrics-spring-2007/`
Professor: Joshua Angrist. Publica **só** listas (sem gabarito), dados e 5 recitations. Sem vídeo, sem notas de aula, sem provas. Páginas: `pages/syllabus/` · `pages/readings/` · `pages/recitations/` · `pages/assignments/`
Livros: Wooldridge, *Introductory Econometrics*; Goldberger, *A Course in Econometrics*.

### 11.1 Listas e dados

| Lista | Enunciado | Dados (formato SAS `.sas7bdat`, página `resources/<slug>/`) |
|---|---|---|
| Revisão | `1796f0de043c6b82905a83f4147c06d6_ps0_07.pdf` | — |
| 1 | `300124445f4e4e08cd6a4a9fb610abf2_psy07n01.pdf` | — |
| 2 | `9865af44aed8e5f2486ed3b2f533fac6_psy07n02.pdf` | `march1992cps`, `wine` |
| 3 | `9e3ca9c6841f9e5bae66ed084c29560c_psy07n03.pdf` | — |
| 4 | `2b022e501127f87b080204c9776c11b6_psy07n04.pdf` | `gpa2`, `nbasal`, `ps4` |
| 5 | `814e678ccd97607bfac586a3c787d48b_psy07n05.pdf` | `oct84` (18 MB), `oct89` (23 MB), `pntsprd`, `ezanders`, `phillips` |
| 6 | `c2f12729f849097ba2dca6ed90d3ff24_psy07n06.pdf` | `qob` (12 MB), `fish` |

### 11.2 Recitations

`241402474de1ad9da3b97c1938788dd7_rec_4_13.pdf` · `c68f54a5cac9d51f45f5916c123a223f_rec_4_20.pdf` · `79b4f5053aa4b0b555869b2bd8d372b5_rec_4_27.pdf` · `915e24f549e0ab99bf904fa14f3d77d5_rec_5_4.pdf` · `f0117ee91741abab8fa97535ac15f0be_rec_5_11.pdf`

### 11.3 Tópicos (da página de leituras)

1. Revisão de probabilidade e estatística: probabilidade e distribuição; esperança e momentos.
2. Revisão de inferência: distribuições amostrais; teorema central do limite; intervalos de confiança.
3. Regressão simples: CEF; distribuição dos estimadores; Gauss-Markov; resíduos e R².
4. Regressão múltipla: causalidade e controle; viés de variável omitida; dummies, interações e testes F; experimentos naturais e diferenças-em-diferenças.
5. Heterocedasticidade (MQP, modelo de probabilidade linear) e autocorrelação (Durbin-Watson).
6. Variáveis instrumentais: variável omitida, erro de medida, regressão descontínua.
7. Equações simultâneas: identificação, forma reduzida, MQO indireto, 2SLS.

> Para a Ementa: manter como "material a definir". Quando houver uma alternativa com vídeo e gabarito, substitui esta seção.

---

## 12. Modelo de dados sugerido

Um formato possível para o app guardar o catálogo (os campos opcionais ficam vazios quando o MIT não publica):

```json
{
  "id": "14.01",
  "titulo": "Princípios de Microeconomia",
  "versao": "Fall 2023",
  "professor": "Jonathan Gruber",
  "base": "https://ocw.mit.edu/courses/14-01-principles-of-microeconomics-fall-2023/",
  "notaMinima": 7.0,
  "etapas": [
    { "tipo": "aula", "n": 1, "titulo": "Introduction to Principles of Microeconomics and Supply & Demand",
      "youtube": "8ssjKR7nNck", "pagina": "resources/lec-1-introduction-to-principles-of-microeconomics-and-supply-demand/",
      "arquivos": { "resumo": "mit14_01_f23_lec1.pdf", "handout": "mit14_01_f23_handout1.pdf" } },
    { "tipo": "lista", "n": 1, "titulo": "Lista 1",
      "enunciado": "mit14_01_f23_pset1.pdf", "gabarito": "mit14_01_f23_pset1sol.pdf" },
    { "tipo": "prova", "titulo": "Prova intermediária",
      "arquivo": "mit14_01_f23_midterm.pdf", "gabaritoNoMesmoArquivo": true }
  ]
}
```

---

## 13. Fontes

Todas as páginas foram lidas direto no MIT OpenCourseWare em 23/10/2026:

- [14.01 Fall 2023](https://ocw.mit.edu/courses/14-01-principles-of-microeconomics-fall-2023/)
- [14.02 Spring 2023](https://ocw.mit.edu/courses/14-02-principles-of-macroeconomics-spring-2023/)
- [18.01SC Fall 2010](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/)
- [18.02SC Fall 2010](https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/)
- [14.04 Fall 2020](https://ocw.mit.edu/courses/14-04-intermediate-microeconomic-theory-fall-2020/)
- [14.06 Spring 2004](https://ocw.mit.edu/courses/14-06-intermediate-macroeconomic-theory-spring-2004/)
- [14.05 Fall 2025](https://ocw.mit.edu/courses/14-05-intermediate-macroeconomics-fall-2025/)
- [14.30 Spring 2009](https://ocw.mit.edu/courses/14-30-introduction-to-statistical-methods-in-economics-spring-2009/)
- [14.32 Spring 2007](https://ocw.mit.edu/courses/14-32-econometrics-spring-2007/)
