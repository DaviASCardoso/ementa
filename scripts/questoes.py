"""Gera o banco de questões a partir das listas e provas do catálogo.

Para cada etapa (lista ou prova) do data/catalog.json: baixa os PDFs (cache em data/raw/pdf/,
fora do git), transcreve o enunciado com scripts/transcrever.py, transcreve o gabarito quando
há um PDF separado e liga cada resposta à sua questão e item. Grava:

  data/questoes/<curso>/<etapa>.json   questões, itens, soluções, avisos
  public/questoes/<curso>/<etapa>/     imagens (figuras, fórmulas e recortes de segurança)
  data/questoes/indice.json            resumo por etapa

Correções feitas à mão ficam em data/questoes/manual/<curso>/<etapa>.json (com as imagens
em public/questoes/<curso>/<etapa>/manual/) e substituem a saída automática.

Uso: python scripts/questoes.py [id-da-etapa ...]   (sem argumentos, todas)
"""
import json
import os
import shutil
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from transcrever import FORMULA, transcrever  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(RAIZ, 'data', 'raw', 'pdf')
SAIDA = os.path.join(RAIZ, 'data', 'questoes')
IMGS = os.path.join(RAIZ, 'public', 'questoes')


def baixar(url):
    nome = url.rstrip('/').split('/')[-1]
    destino = os.path.join(CACHE, nome)
    if not os.path.exists(destino):
        os.makedirs(CACHE, exist_ok=True)
        with urllib.request.urlopen(url) as r, open(destino, 'wb') as f:
            f.write(r.read())
    return destino


def prefixa_imagens(no, pref):
    """Põe a subpasta no nome de cada imagem (um PDF por subpasta)."""
    if isinstance(no, dict):
        if 'img' in no:
            no['img'] = pref + no['img']
        for v in no.values():
            prefixa_imagens(v, pref)
    elif isinstance(no, list):
        for v in no:
            prefixa_imagens(v, pref)


def compacta(caminho):
    """PNG com paleta de 32 cores: texto e gráficos continuam nítidos, o arquivo fica 3x menor."""
    from PIL import Image
    im = Image.open(caminho)
    if im.mode == 'P':
        return
    im.convert('RGB').quantize(colors=32, method=Image.Quantize.MEDIANCUT).save(caminho, 'PNG', optimize=True)


def junta_imgs(no, usadas):
    if isinstance(no, dict):
        if 'img' in no:
            usadas.add(no['img'])
        for v in no.values():
            junta_imgs(v, usadas)
    elif isinstance(no, list):
        for v in no:
            junta_imgs(v, usadas)


def limpa(no):
    """Tira campos internos de depuração."""
    if isinstance(no, dict):
        no.pop('_reg', None)
        for v in no.values():
            limpa(v)
    elif isinstance(no, list):
        for v in no:
            limpa(v)


def sanear(out):
    """Última defesa: fórmula que o KaTeX não desenha vira texto (soluções) ou marca o item para revisão."""
    import subprocess
    import tempfile
    lista, ref = [], []
    for q in out['questoes']:
        for x in [q] + q['itens']:
            for chave in ('partes', 'contexto', 'solucao'):
                for k, parte in enumerate(x.get(chave) or []):
                    for m in FORMULA.finditer(parte.get('p') or ''):
                        lista.append({'tex': m.group(1) or m.group(2), 'display': bool(m.group(1))})
                        ref.append((x, chave, k))
    if not lista:
        return
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f:
        json.dump(lista, f)
    r = subprocess.run(['node', os.path.join(RAIZ, 'scripts', 'katex-check.mjs'), f.name], capture_output=True, text=True, cwd=RAIZ)
    os.unlink(f.name)
    for i in json.loads(r.stdout or '[]'):
        x, chave, k = ref[i]
        parte = x[chave][k]
        if chave == 'solucao':
            parte['p'] = parte['p'].replace('$$', '').replace('$', '')
        elif not x.get('revisar'):
            x['revisar'] = ['fórmula que o KaTeX não desenha']


def aplicar_transcricoes(out, sid):
    """Transcrições feitas à mão de itens que eram recorte: data/questoes/transcricoes/<curso>/<etapa>.json,
    com chaves "<questão>/<item>" ("<questão>/" para o enunciado da questão)."""
    caminho = os.path.join(SAIDA, 'transcricoes', sid + '.json')
    if not os.path.exists(caminho):
        return 0
    trans = json.load(open(caminho, encoding='utf-8'))
    usados = set()
    vistas = {}
    remover = []
    for q in out['questoes']:
        vistas[q['n']] = vistas.get(q['n'], 0) + 1
        ocorr = f"#{vistas[q['n']]}" if vistas[q['n']] > 1 else ''
        for x in [q] + q['itens']:
            sufixo = x.get('id', '') if x is not q else ''
            chave = f"{q['n']}{ocorr}/{sufixo}"
            t = trans.get(chave)
            if t is None and not ocorr:
                t = trans.get(f"{q['n']}#1/{sufixo}")
            if t and t.get('tipo') == 'remover' and x is q:
                usados.add(chave)
                remover.append(q)
                break
            if not t:
                continue
            usados.add(chave)
            for campo in ('partes', 'contexto', 'solucao', 'opcoes'):
                if campo in t:
                    x[campo] = t[campo]
            if 'tipo' in t:
                x['tipo'] = t['tipo']
            x.pop('revisar', None)
            x.pop('recorte', None)
    out['questoes'] = [q for q in out['questoes'] if not any(q is r for r in remover)]
    for chave in set(trans) - usados:
        print(f'  ! transcrição sem item correspondente: {sid} {chave}')
    return len(usados)


def resposta(x):
    """Texto da resposta; se a transcrição do gabarito ficou duvidosa, vai o recorte do PDF."""
    if x.get('revisar') and x.get('recorte'):
        return x['recorte']
    return (x.get('partes') or []) + (x.get('solucao') or [])


def ligar_gabarito(questoes, gab):
    """Copia as respostas do gabarito para as questões e itens com o mesmo número."""
    ligados = 0
    por_n = {}
    for g in gab['questoes']:  # números repetidos (versões da mesma questão) casam pela ordem
        por_n.setdefault(g['n'], []).append(g)
    for q in questoes:
        fila = por_n.get(q['n'])
        g = fila.pop(0) if fila else None
        if not g:
            continue
        itens_g = {it['id']: it for it in g['itens']}
        for it in q['itens']:
            gi = itens_g.get(it['id'])
            if gi and not it.get('solucao'):
                it['solucao'] = resposta(gi)
                ligados += 1
        if not q['itens'] and not q.get('solucao'):
            q['solucao'] = resposta(g)
            ligados += 1
    return ligados


def gerar(step):
    curso, nome = step['id'].split('/')
    dir_img = os.path.join(IMGS, curso, nome)
    manual = os.path.join(SAIDA, 'manual', curso, nome + '.json')
    destino = os.path.join(SAIDA, curso, nome + '.json')
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    if os.path.exists(manual):
        dados = json.load(open(manual, encoding='utf-8'))
        aplicar_transcricoes(dados, step['id'])
        sanear(dados)
        with open(destino, 'w', encoding='utf-8') as f:
            json.dump(dados, f, ensure_ascii=False, indent=1)
        if os.path.isdir(dir_img):  # só as imagens da correção manual ficam
            for nome_arq in os.listdir(dir_img):
                if nome_arq != 'manual':
                    caminho = os.path.join(dir_img, nome_arq)
                    shutil.rmtree(caminho) if os.path.isdir(caminho) else os.remove(caminho)
        r = json.load(open(manual, encoding='utf-8'))
        return {'id': step['id'], 'manual': True, 'questoes': len(r['questoes']), 'avisos': r.get('avisos', [])}

    # imagens antigas da saída automática saem; as da correção manual ficam
    if os.path.isdir(dir_img):
        for nome_arq in os.listdir(dir_img):
            if nome_arq != 'manual':
                caminho = os.path.join(dir_img, nome_arq)
                shutil.rmtree(caminho) if os.path.isdir(caminho) else os.remove(caminho)

    enunciados = [a for a in step['arquivos'] if a['papel'] == 'enunciado' and a['url'].lower().endswith('.pdf')]
    gabaritos = [a for a in step['arquivos'] if a['papel'] == 'gabarito' and a['url'].lower().endswith('.pdf')]
    if not enunciados:
        return None
    out = {'etapa': step['id'], 'fontes': [], 'avisos': [], 'intro': [], 'questoes': []}
    for k, a in enumerate(enunciados):
        pref = f'e{k + 1}/'
        r = transcrever(baixar(a['url']), os.path.join(dir_img, pref))
        prefixa_imagens(r, pref)
        out['fontes'].append({'rotulo': a['rotulo'], 'url': a['url'], 'paginas': r['paginas']})
        out['avisos'] += r['avisos']
        out['intro'] += r['intro']
        for q in r['questoes']:
            q['fonte'] = k
        out['questoes'] += r['questoes']
    ligados = 0
    for k, a in enumerate(gabaritos):
        pref = f'g{k + 1}/'
        g = transcrever(baixar(a['url']), os.path.join(dir_img, pref))
        prefixa_imagens(g, pref)
        ligados += ligar_gabarito(out['questoes'], g)
    if out['questoes']:  # PDF de apoio (código, dados) sem questões não é problema se outro PDF tem
        out['avisos'] = [v for v in out['avisos'] if v not in ('nenhuma questão reconhecida', 'poucas questões para o número de páginas')]
    if gabaritos and not ligados:
        out['avisos'].append('o gabarito não casou com nenhuma questão')
    limpa(out)
    aplicar_transcricoes(out, step['id'])
    sanear(out)
    with open(destino, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    # apaga as imagens que nenhuma questão usa (recortes de segurança do gabarito, por exemplo)
    usadas = set()
    junta_imgs(out, usadas)
    for pasta, _, arquivos in os.walk(dir_img):
        if os.path.relpath(pasta, dir_img).startswith('manual'):
            continue
        for arq in arquivos:
            rel = os.path.relpath(os.path.join(pasta, arq), dir_img).replace(os.sep, '/')
            if rel not in usadas:
                os.remove(os.path.join(pasta, arq))
            else:
                compacta(os.path.join(pasta, arq))
    itens = [it for q in out['questoes'] for it in (q['itens'] or [q]) if it.get('tipo') != 'grupo']
    return {'id': step['id'], 'manual': False, 'questoes': len(out['questoes']), 'itens': len(itens),
            'recorte': sum(1 for it in itens if it.get('revisar')), 'gabarito_ligado': ligados, 'avisos': out['avisos']}


def texto_busca(no):
    """Texto puro para a busca: sem comandos do LaTeX, sem acentos, minúsculo."""
    import re
    import unicodedata
    partes = []

    def anda(n):
        if isinstance(n, dict):
            if isinstance(n.get('p'), str):
                partes.append(n['p'])
            if isinstance(n.get('texto'), str):
                partes.append(n['texto'])
            for k, v in n.items():
                if k not in ('solucao', 'recorte'):
                    anda(v)
        elif isinstance(n, list):
            for v in n:
                anda(v)
    anda(no)
    t = ' '.join(partes)
    t = re.sub(r'\\[a-zA-Z]+', ' ', t)
    t = re.sub(r'[${}^_\\]', ' ', t)
    t = unicodedata.normalize('NFKD', t)
    t = ''.join(c for c in t if not unicodedata.combining(c)).lower()
    return re.sub(r'\s+', ' ', t).strip()


def publicar(cat):
    """Copia cada etapa para public/questoes/<etapa>.json e monta o índice de busca public/questoes/banco.json."""
    rotulo = {s['id']: s for s in cat['steps']}
    cursos = {c['id']: c for c in cat['courses']}
    banco = []
    for st in cat['steps']:
        caminho = os.path.join(SAIDA, st['id'] + '.json')
        if st['tipo'] == 'aula' or not os.path.exists(caminho):
            continue
        r = json.load(open(caminho, encoding='utf-8'))
        destino = os.path.join(IMGS, st['id'] + '.json')
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        with open(destino, 'w', encoding='utf-8') as f:
            json.dump(r, f, ensure_ascii=False, separators=(',', ':'))
        for k, q in enumerate(r['questoes']):
            itens = [it for it in q['itens'] if it.get('tipo') != 'grupo'] or [q]
            resumo, tam = [], 0
            for p in q['partes'] or (q['itens'][0]['partes'] if q['itens'] else []):
                if 'p' in p and tam < 320:
                    resumo.append(p['p'])
                    tam += len(p['p'])
            banco.append({
                'sid': st['id'], 'k': k, 'n': q['n'], 'titulo': q.get('titulo', ''),
                'curso': st['course_id'], 'tipo': st['tipo'], 'etapa': rotulo[st['id']]['titulo'],
                'ordem': cursos[st['course_id']]['ordem'] * 10000 + st['ordem'] * 100 + k,
                'resumo': resumo, 'busca': texto_busca(q),
                'itens': len(itens), 'tipos': sorted({it.get('tipo', 'aberta') for it in itens}),
                'sol': any(it.get('solucao') for it in itens),
                'fig': any('img' in p for x in [q] + q['itens'] for p in x.get('partes', [])),
            })
    banco.sort(key=lambda b: b['ordem'])
    with open(os.path.join(IMGS, 'banco.json'), 'w', encoding='utf-8') as f:
        json.dump(banco, f, ensure_ascii=False, separators=(',', ':'))
    return len(banco)


def main():
    cat = json.load(open(os.path.join(RAIZ, 'data', 'catalog.json'), encoding='utf-8'))
    pedidos = set(sys.argv[1:])
    etapas = [s for s in cat['steps'] if s['tipo'] != 'aula' and (not pedidos or s['id'] in pedidos)]
    caminho_indice = os.path.join(SAIDA, 'indice.json')
    indice = json.load(open(caminho_indice, encoding='utf-8')) if os.path.exists(caminho_indice) else {}
    for s in etapas:
        r = gerar(s)
        if r:
            indice[s['id']] = r
            extra = ' (manual)' if r['manual'] else f" {r['itens']} itens, {r['recorte']} com recorte, gabarito em {r['gabarito_ligado']}"
            aviso = ('  ⚠ ' + '; '.join(r['avisos'])) if r['avisos'] else ''
            print(f"{s['id']}: {r['questoes']} questões{extra}{aviso}")
    with open(caminho_indice, 'w', encoding='utf-8') as f:
        json.dump(dict(sorted(indice.items())), f, ensure_ascii=False, indent=1)
    print('banco de busca:', publicar(cat), 'questões')


if __name__ == '__main__':
    main()
