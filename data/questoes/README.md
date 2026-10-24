# Banco de questões

Gerado por `npm run questoes` (`scripts/questoes.py`), a partir dos PDFs de listas e provas do catálogo. Não edite os arquivos de `data/questoes/<curso>/`: eles são sobrescritos.

- `<curso>/<etapa>.json`: questões da etapa. Cada questão tem `n`, `titulo`, `partes` e `itens`; cada item tem `id` (`a`, `2b`, `B3`…), `pai` quando é subitem, `tipo` (`aberta`, `vf`, `alternativa`, `grupo`), `partes`, `contexto` (texto da questão que vem antes do item), `opcoes` e `solucao`.
- Uma parte é `{"p": texto}` (fórmulas entre `$...$` ou `$$...$$`, para o KaTeX) ou `{"img": caminho}` (imagem em `public/questoes/<curso>/<etapa>/`).
- `revisar` + `recorte`: a transcrição do item parece duvidosa; o app mostra o `recorte` (a região do PDF) no lugar do texto.
- `indice.json`: resumo por etapa, com os avisos de estrutura.

Correções à mão ficam em `manual/<curso>/<etapa>.json` (imagens em `public/questoes/<curso>/<etapa>/manual/`) e têm precedência sobre a saída automática.

Transcrições feitas à mão de itens que o script não conseguiu transcrever com segurança ficam em `transcricoes/<curso>/<etapa>.json`. A chave é `"<questão>/<item>"` (ou `"<questão>/"` para o enunciado da questão; `"<questão>#2/"` para a segunda questão com o mesmo número) e o valor traz `partes`, e opcionalmente `contexto`, `solucao`, `opcoes` e `tipo` (`"remover"` apaga a questão). Elas são aplicadas por cima da saída automática a cada `npm run questoes`. Figuras recortadas à mão ficam em `public/questoes/<curso>/<etapa>/manual/`.
