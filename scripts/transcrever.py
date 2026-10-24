"""Transcreve listas e provas em PDF para questões estruturadas, sem IA.

Lê cada caractere com fonte, tamanho e posição (PyMuPDF), remonta expoentes, índices,
frações, acentos e setas de vetor, escreve a matemática em LaTeX ($...$), separa questões,
itens, alternativas e soluções e recorta como imagem o que não dá para transcrever com
segurança (figuras, somatórios, matrizes, fórmulas que só existem como imagem).

Cada item passa por uma verificação. Se algo parece errado, o item ganha o recorte da sua
região no PDF e o app mostra o recorte no lugar do texto (o texto fica para busca).

Uso: python scripts/transcrever.py saida_dir arquivo.pdf [arquivo2.pdf ...]
Gera saida_dir/<nome>.json e as imagens em saida_dir/<nome>/.
"""
import json
import os
import re
import statistics
import sys

import unicodedata

import pymupdf

# ---------- matemática ----------

FONTE_MAT = re.compile(r'^(cmmi|cmsy|cmex|cmmib|cmbsy|msbm|msam|rsfs|eufm|symbol|mt(mi|sy|ex)|stix.*math|cambria.?math|rawmath)', re.I)
FONTE_SY = re.compile(r'^(cmsy|cmbsy)', re.I)
FONTE_NEGRITO = re.compile(r'(bold|bx|-b$|black|heavy|semibold|cmmib)', re.I)
FONTE_EXTENSIVEL = re.compile(r'^cmex', re.I)
ACENTOS = {'¯': r'\bar', 'ˉ': r'\bar', '˜': r'\tilde', 'ˆ': r'\hat', '˙': r'\dot', '¨': r'\ddot', '⃗': r'\vec'}
SETA = re.compile(r'^[−-]*[→⟶]$')
LIGADURAS = {'ﬁ': 'fi', 'ﬀ': 'ff', 'ﬂ': 'fl', 'ﬃ': 'ffi', 'ﬄ': 'ffl', '’': "'", '‘': "'", '“': '"', '”': '"', ' ': ' '}
# caracteres da fonte de símbolos do TeX quando o PDF não traz a tabela de conversão
CMSY_ASCII = {'f': r'\{', 'g': r'\}', 'h': r'\langle ', 'i': r'\rangle ', 'j': '|', 'k': r'\|', 'p': r'\surd ', 'r': r'\nabla ',
              '0': "'", '1': r'\infty ', '2': r'\in ', '6': r'\pm ', '¢': r'\cdot ', '¡': '-', '¸': r'\leq ', '¹': r'\geq '}

GREGO = {
    'α': r'\alpha', 'β': r'\beta', 'γ': r'\gamma', 'δ': r'\delta', 'ε': r'\varepsilon', 'ϵ': r'\epsilon', 'ζ': r'\zeta',
    'η': r'\eta', 'θ': r'\theta', 'ϑ': r'\vartheta', 'ι': r'\iota', 'κ': r'\kappa', 'λ': r'\lambda', 'μ': r'\mu', 'µ': r'\mu', 'ν': r'\nu',
    'ξ': r'\xi', 'π': r'\pi', 'ρ': r'\rho', 'σ': r'\sigma', 'τ': r'\tau', 'υ': r'\upsilon', 'φ': r'\phi', 'ϕ': r'\phi',
    'χ': r'\chi', 'ψ': r'\psi', 'ω': r'\omega', 'Γ': r'\Gamma', 'Δ': r'\Delta', 'Θ': r'\Theta', 'Λ': r'\Lambda',
    'Ξ': r'\Xi', 'Π': r'\Pi', 'Σ': r'\Sigma', 'Φ': r'\Phi', 'Ψ': r'\Psi', 'Ω': r'\Omega',
}
SIMBOLOS = {
    '−': '-', '–': '-', '≥': r'\geq ', '≤': r'\leq ', '≠': r'\neq ', '≈': r'\approx ', '×': r'\times ', '·': r'\cdot ',
    '⋅': r'\cdot ', '∞': r'\infty ', '∂': r'\partial ', '∑': r'\sum ', '∫': r'\int ', '→': r'\to ', '⇒': r'\Rightarrow ',
    '⇔': r'\Leftrightarrow ', '∈': r'\in ', '∉': r'\notin ', '⊂': r'\subset ', '⊆': r'\subseteq ', '∪': r'\cup ',
    '∩': r'\cap ', '±': r'\pm ', '∇': r'\nabla ', '√': r'\surd ', '′': "'", '∗': '*', '∼': r'\sim ', '≡': r'\equiv ',
    '∀': r'\forall ', '∃': r'\exists ', '∅': r'\emptyset ', '{': r'\{', '}': r'\}', '%': r'\%', '#': r'\#',
    '&': r'\&', '_': r'\_', '⟨': r'\langle ', '⟩': r'\rangle ', '÷': r'\div ', 'ℓ': r'\ell ', '∘': r'\circ ',
    '∝': r'\propto ', '≪': r'\ll ', '≫': r'\gg ', '↦': r'\mapsto ', '’': "'", '≻': r'\succ ', '≺': r'\prec ',
    '≽': r'\succeq ', '≼': r'\preceq ', '%': r'\%', '…': r'\ldots ', '⋯': r'\cdots ', '∥': r'\|', '≅': r'\cong ',
    '⊥': r'\perp ', '∧': r'\wedge ', '∨': r'\vee ', '¬': r'\neg ', '∖': r'\setminus ', 'ı': r'\imath ', 'ȷ': r'\jmath ',
    '′': "'", '←': r'\leftarrow ', '↔': r'\leftrightarrow ', '⇐': r'\Leftarrow ', '∪': r'\cup ', '⊇': r'\supseteq ',
    '$': r'\$', '⊃': r'\supset ', '⇤': '*', '⇥': r'\times ', '⌊': r'\lfloor ', '⌋': r'\rfloor ', '⌈': r'\lceil ', '⌉': r'\rceil ', '°': r'^\circ ',
}
NEUTRO = re.compile(r'^[\s0-9.,;:=+\-−–()\[\]/<>≤≥×·|!\']*$')


def latex(texto, fonte=''):
    if fonte == 'RAWMATH':
        return texto
    if FONTE_SY.match(fonte):
        return ''.join(CMSY_ASCII.get(c, (GREGO[c] + ' ') if c in GREGO else SIMBOLOS.get(c, (r'\mathcal{' + c + '}') if c.isupper() else c)) for c in texto)
    return ''.join((GREGO[c] + ' ') if c in GREGO else SIMBOLOS.get(c, c) for c in texto)


VOCAB_LIG = set('''firm firms first final finally finance financial financing find finding findings fixed figure figures fiscal
profit profits profitable specific specifically efficient efficiency inefficient benefit benefits define defined definition
definitions inflation deflation flow flows flat flexible fluctuation fluctuations effect effects offer offers differ different
difference differences differentiate differentiable afford suffer coefficient coefficients sufficient field fill filled fit
fitted fitting five fix flight flights floor influence conflict reflect reflects affect affects affected effort tariff tariffs
staff off buffer traffic sacrifice significant significance signify classification identify identified identification verify
justify simplify simplified modify specify specified qualified satisfy satisfies satisfied artificial beneficial confidence
confident definite infinite infinity finite flux outflow inflow flip official officials sufficiently efficiently effective
effectively difficult difficulty office offset fifty fifteen financed profitability diffusion affine fine finer finest
financing shift shifts shifted shifting fiftieth flowers flower flies fly flying fluid ﬁxed coffee waffle offspring'''.split())
LIG_FALTANDO = re.compile(r'\b[A-Za-z]+\b')


def conserta_ligadura(palavra):
    if len(palavra) < 3 or palavra.lower() in VOCAB_LIG:
        return palavra
    for lig in ('fi', 'fl', 'ff', 'ffi', 'ffl', 'i', 'l', 'f'):
        for i in range(len(palavra) + 1):
            if len(lig) == 1 and (i == 0 or palavra[i - 1].lower() != 'f'):
                continue  # só some a segunda letra da ligadura, logo depois de um "f"
            cand = palavra[:i] + lig + palavra[i:]
            if cand.lower() in VOCAB_LIG:
                return cand
    return palavra


def limpa_txt(t):
    t = ''.join(LIGADURAS.get(c, c) for c in t).replace('$', r'\$')
    return LIG_FALTANDO.sub(lambda m: conserta_ligadura(m.group(0)), t)


FONTE_ITALICA = re.compile(r'(ital|oblique|^cmti\d|[-,]it(mt)?$)', re.I)


def eh_mat(span):
    if FONTE_ITALICA.search(span['font']) and re.fullmatch(r"\s*[A-Za-z]\d*['′]?\s*", span['text']):
        return True
    return bool(FONTE_MAT.match(span['font'])) or any(c in GREGO for c in span['text'])


def eh_acento(s):
    return s['text'].strip() in ACENTOS or bool(SETA.match(s['text'].strip()))


# ---------- leitura da página ----------

def novo_span(texto, fonte, tam, y, rect, chars=None):
    rect = pymupdf.Rect(rect)
    if rect.height > 1.4 * tam and fonte != 'RAWMATH' and not FONTE_EXTENSIVEL.match(fonte):
        rect = pymupdf.Rect(rect.x0, y - 0.75 * tam, rect.x1, y + 0.25 * tam)  # caixa inflada: refaz pela linha de base
    return {'text': texto, 'font': fonte, 'size': tam, 'y': y, 'bbox': pymupdf.Rect(rect), 'x0': rect[0], 'x1': rect[2], 'chars': chars}


def partir(spans, s, x):
    """Divide o trecho na posição x (pelo centro de cada caractere); devolve True se dividiu."""
    if not s.get('chars') or not (s['x0'] < x < s['x1']):
        return False
    esq = [c for c in s['chars'] if (c['bbox'][0] + c['bbox'][2]) / 2 <= x]
    dir_ = [c for c in s['chars'] if (c['bbox'][0] + c['bbox'][2]) / 2 > x]
    if not esq or not dir_:
        return False
    i = spans.index(s)
    novos = []
    for g in (esq, dir_):
        r = pymupdf.Rect(g[0]['bbox'])
        for c in g[1:]:
            r |= c['bbox']
        novos.append(novo_span(''.join(c['c'] for c in g), s['font'], s['size'], s['y'], r, g))
    spans[i:i + 1] = novos
    return True


def spans_da_pagina(pagina):
    """Trechos de texto não vazios. Acentos e setas viram trechos próprios, para achar a letra que cobrem."""
    out = []
    for b in pagina.get_text('rawdict')['blocks']:
        for l in b.get('lines', []):
            if l['dir'][0] < 0.99:  # texto girado (marcas laterais)
                continue
            for s in l['spans']:
                fonte = s['font'].split('+')[-1]
                chars = s['chars']
                grupos, atual = [], []
                i = 0
                while i < len(chars):
                    c = chars[i]['c']
                    if 0x1D400 <= ord(c) <= 0x1D7FF:
                        c = unicodedata.normalize('NFKC', c)
                        chars[i] = dict(chars[i], c=c)
                        if fonte and not FONTE_MAT.match(fonte):
                            fonte = 'cmmi-unicode'  # letra de fórmula
                    cat = unicodedata.category(c) if not FONTE_EXTENSIVEL.match(fonte) else 'L'
                    if cat in ('Co', 'Cn'):
                        chars[i] = dict(chars[i], c='\uFFFD')
                        c = '\uFFFD'
                    elif cat in ('Cc', 'Cf'):
                        i += 1
                        continue
                    if c == '~' and re.match(r'^cmmi', fonte, re.I):  # acento de vetor na fonte do TeX
                        chars[i] = dict(chars[i], c='⃗')
                        c = '⃗'
                    if c in ACENTOS:
                        grupos += [atual, [chars[i]]] if atual else [[chars[i]]]
                        atual = []
                        i += 1
                        continue
                    if c in '−-' and i + 1 < len(chars) and chars[i + 1]['c'] in '→⟶' and FONTE_SY.match(fonte):
                        j = i + 1
                        if atual:
                            grupos.append(atual)
                        grupos.append(chars[i:j + 1])
                        atual = []
                        i = j + 1
                        continue
                    atual.append(chars[i])
                    i += 1
                if atual:
                    grupos.append(atual)
                for g in grupos:
                    t = ''.join(c['c'] for c in g)
                    if not t.strip():
                        continue
                    r = pymupdf.Rect(g[0]['bbox'])
                    for c in g[1:]:
                        r |= c['bbox']
                    out.append(novo_span(t, fonte, s['size'], s['origin'][1], r, g))
    return out


def pode_sobrepor(a, b, tam):
    """Dois trechos podem dividir a mesma faixa horizontal quando um é índice/expoente, acento ou fração."""
    return (min(a['size'], b['size']) < 0.85 * max(a['size'], b['size'], tam)
            or eh_acento(a) or eh_acento(b) or a['font'] == 'RAWMATH' or b['font'] == 'RAWMATH')


# ---------- frações ----------

def tracos(pagina):
    """Traços horizontais finos (candidatos a barra de fração)."""
    out = []
    for d in pagina.get_drawings():
        r = d['rect']
        if r.height < 1.6 and 3 < r.width < 320:
            out.append(r)
    return out


def montar_mini(spans):
    l = {'spans': [dict(s) for s in spans], 'y0': min(s['bbox'].y0 for s in spans), 'y1': max(s['bbox'].y1 for s in spans)}
    fecha_linha(l)
    return montar_linha(l).replace('$', '').strip()


def fileira(candidatos, colado):
    grupo = [s for s in candidatos if colado(s)]
    mudou = True
    while mudou:
        mudou = False
        for s in candidatos:
            if s in grupo:
                continue
            for t in grupo:
                comum = min(s['bbox'].y1, t['bbox'].y1) - max(s['bbox'].y0, t['bbox'].y0)
                sobrepoe = comum > 0.3 * min(s['bbox'].height, t['bbox'].height)
                lado = s['x0'] >= t['x1'] - 1 or s['x1'] <= t['x0'] + 1
                vizinho = lado and min(abs(s['x0'] - t['x1']), abs(t['x0'] - s['x1'])) < 0.5 * max(s['size'], t['size'])
                if sobrepoe and vizinho:
                    grupo.append(s)
                    mudou = True
                    break
    return grupo


def converter_fracoes(pagina, spans, corpo):
    """Troca numerador + traço + denominador por um trecho \\frac{..}{..}. Devolve os traços que não deram certo."""
    falhas = []
    radicais = [s for s in spans if s['text'].strip() == '√' or (FONTE_SY.match(s['font']) and s['text'].strip() == 'p')]
    tem_raiz = lambda b: any(abs(r['x1'] - b.x0) < 2.5 and r['bbox'].y0 - 2 <= b.y0 <= r['bbox'].y1 for r in radicais)
    for bar in sorted(tracos(pagina), key=lambda b: (not tem_raiz(b), b.width)):
        for s in list(spans):
            perto = -1 < s['bbox'].y0 - bar.y1 < 0.5 * s['size'] or -1 < bar.y0 - s['bbox'].y1 < 0.5 * s['size']
            if perto and s['font'] != 'RAWMATH':
                partir(spans, s, bar.x1 + 0.5) or partir(spans, s, bar.x0 - 0.5)
        dentro = lambda s: bar.x0 - 2 <= (s['x0'] + s['x1']) / 2 <= bar.x1 + 2 and s['x0'] >= bar.x0 - 4
        # raiz: o sinal fica à esquerda do traço e o radicando logo abaixo dele
        rad = next((r for r in radicais if r in spans and abs(r['x1'] - bar.x0) < 2.5 and r['bbox'].y0 - 2 <= bar.y0 <= r['bbox'].y1), None)
        if rad:
            sob = [s for s in spans if s is not rad and dentro(s) and s['bbox'].y0 >= bar.y1 - 1.5 and s['bbox'].y0 - bar.y1 < 0.9 * s['size'] and s['font'] != 'RAWMATH']
            if sob:
                tam = max(s['size'] for s in sob)
                base = statistics.median(s['y'] for s in sob if s['size'] >= 0.9 * tam)
                dentro_raiz = montar_mini(sob)
                for x in sob + [rad]:
                    spans.remove(x)
                spans.append(novo_span(r'\sqrt{' + dentro_raiz + '}', 'RAWMATH', tam, base, (rad['x0'], base - 0.75 * tam, bar.x1, base + 0.25 * tam)))
            continue
        acima = [s for s in spans if dentro(s) and s['bbox'].y1 <= bar.y0 + 1.5 and bar.y0 - s['bbox'].y1 < 1.3 * s['size']]
        abaixo = [s for s in spans if dentro(s) and s['bbox'].y0 >= bar.y1 - 1.5 and s['bbox'].y0 - bar.y1 < 1.3 * s['size']]
        if not acima and not abaixo:
            continue  # sublinhado, régua, borda de tabela
        if not acima or not abaixo:
            continue
        # só a fileira mais próxima do traço (com os seus índices)
        # só a fileira colada no traço, mais os expoentes e índices dela (lado a lado, não empilhados)
        acima = fileira(acima, lambda s: bar.y0 - s['bbox'].y1 < 0.6 * s['size'])
        abaixo = fileira(abaixo, lambda s: s['bbox'].y0 - bar.y1 < 0.6 * s['size'])
        if not acima or not abaixo:
            continue
        if any(FONTE_EXTENSIVEL.match(s['font']) for s in acima + abaixo):
            falhas.append(pymupdf.Rect(bar.x0, min(s['bbox'].y0 for s in acima), bar.x1, max(s['bbox'].y1 for s in abaixo)))
            continue
        tam = max(s['size'] for s in acima + abaixo)
        palavras = lambda g: any(not eh_mat(s) and re.search(r'[A-Za-z]{4,}', s['text']) for s in g)
        if palavras(acima) or palavras(abaixo):
            continue

        def colunas(g):
            g = sorted(g, key=lambda s: s['x0'])
            return any(b['x0'] - a['x1'] > 1.5 * tam for a, b in zip(g, g[1:]))
        largura = max(max(s['x1'] for s in g) - min(s['x0'] for s in g) for g in (acima, abaixo))
        if colunas(acima) or colunas(abaixo) or bar.width > 2.5 * largura + 10:
            continue
        num, den = montar_mini(acima), montar_mini(abaixo)
        if not num or not den:
            continue
        for s in acima + abaixo:
            spans.remove(s)
        r = pymupdf.Rect(bar.x0, min(s['bbox'].y0 for s in acima), bar.x1, max(s['bbox'].y1 for s in abaixo))
        meio = (r.y0 + r.y1) / 2
        spans.append(novo_span(r'\frac{' + num + '}{' + den + '}', 'RAWMATH', tam, bar.y0 + 0.3 * tam, (r.x0, meio - 0.5 * tam, r.x1, meio + 0.5 * tam)))

    pequenos = sorted((s for s in spans if s['size'] < 0.8 * corpo and s['font'] != 'RAWMATH'), key=lambda s: (round((s['bbox'].y0 + s['bbox'].y1) / 2), s['x0']))
    fileiras = []
    for s in pequenos:
        meio = (s['bbox'].y0 + s['bbox'].y1) / 2
        f = next((f for f in fileiras if abs(f['meio'] - meio) < 2 and s['x0'] - f['x1'] < 1.5 * s['size']), None)
        if f:
            f['spans'].append(s)
            f['x1'] = max(f['x1'], s['x1'])
        else:
            fileiras.append({'spans': [s], 'meio': meio, 'x0': s['x0'], 'x1': s['x1']})
    usadas = set()
    for a in fileiras:
        for b in fileiras:
            if a is b or id(a) in usadas or id(b) in usadas:
                continue
            ya1 = max(x['bbox'].y1 for x in a['spans'])
            yb0 = min(x['bbox'].y0 for x in b['spans'])
            sobrep = min(a['x1'], b['x1']) - max(a['x0'], b['x0'])
            ca = sum(len(x['text'].strip()) for x in a['spans'])
            cb = sum(len(x['text'].strip()) for x in b['spans'])
            if -1.5 <= yb0 - ya1 <= 0.6 * a['spans'][0]['size'] and sobrep > 0.6 * min(a['x1'] - a['x0'], b['x1'] - b['x0']) and ca >= 3 and cb >= 3:
                num, den = montar_mini(a['spans']), montar_mini(b['spans'])
                for x in a['spans'] + b['spans']:
                    spans.remove(x)
                r = pymupdf.Rect(min(a['x0'], b['x0']), min(x['bbox'].y0 for x in a['spans']), max(a['x1'], b['x1']), max(x['bbox'].y1 for x in b['spans']))
                meio = (ya1 + yb0) / 2
                spans.append(novo_span(r'\frac{' + num + '}{' + den + '}', 'RAWMATH', corpo, meio + 0.3 * corpo, (r.x0, meio - 0.5 * corpo, r.x1, meio + 0.5 * corpo)))
                usadas.update((id(a), id(b)))
    return falhas


# ---------- linhas ----------

def linhas_visuais(spans, corpo):
    """Agrupa trechos na mesma linha visual: expoentes, índices e acentos ficam junto da sua base."""
    expoentes = [s for s in spans if s['font'] == 'RAWMATH' and s['size'] < 0.85 * corpo]
    acentos = [s for s in spans if eh_acento(s)]
    spans = sorted((s for s in spans if not eh_acento(s) and s not in expoentes), key=lambda s: (s['bbox'].y0 + s['bbox'].y1) / 2)
    linhas = []
    for s in spans:
        meio = (s['bbox'].y0 + s['bbox'].y1) / 2
        alvo = None
        for l in linhas[-5:]:
            folga = 0.25 * l['h']
            if l['y0'] - folga <= meio <= l['y1'] + folga and not any(
                    o['x0'] < s['x1'] - 1 and s['x0'] < o['x1'] - 1 and not pode_sobrepor(o, s, l['tam_max']) for o in l['spans']):
                alvo = l
                break
        if alvo is None:
            linhas.append({'spans': [s], 'y0': s['bbox'].y0, 'y1': s['bbox'].y1, 'h': s['bbox'].height, 'tam_max': s['size']})
        else:
            alvo['tam_max'] = max(alvo['tam_max'], s['size'])
            alvo['spans'].append(s)
            alvo['y0'] = min(alvo['y0'], s['bbox'].y0)
            alvo['y1'] = max(alvo['y1'], s['bbox'].y1)
            alvo['h'] = max(alvo['h'], s['bbox'].height)
    # cada acento vai para a linha logo abaixo dele que tem letras na mesma faixa horizontal
    for a in acentos:
        meio = (a['bbox'].y0 + a['bbox'].y1) / 2
        melhor, dist = None, None
        for l in linhas:
            if not any(min(o['x1'], a['x1']) - max(o['x0'], a['x0']) > 0 for o in l['spans']):
                continue
            centro = (l['y0'] + l['y1']) / 2
            d = centro - meio
            if -0.35 * l['h'] <= d <= 1.2 * l['h'] and (dist is None or abs(d) < dist):
                melhor, dist = l, abs(d)
        if melhor:
            melhor['spans'].append(a)
        elif SETA.match(a['text'].strip()):
            dentro = next((l for l in linhas if l['y0'] <= meio <= l['y1']), None)
            if dentro:
                a['vira_texto'] = True
                dentro['spans'].append(a)
    for e in expoentes:
        meio = (e['bbox'].y0 + e['bbox'].y1) / 2
        melhor = None
        for l in linhas:
            if l['y0'] - 0.9 * corpo <= meio <= l['y1'] + 0.3 * corpo and any(abs(e['x0'] - o['x1']) < 3 * corpo or abs(o['x0'] - e['x1']) < 3 * corpo for o in l['spans']):
                if melhor is None or abs((l['y0'] + l['y1']) / 2 - meio) < abs((melhor['y0'] + melhor['y1']) / 2 - meio):
                    melhor = l
        if melhor:
            melhor['spans'].append(e)
        else:
            linhas.append({'spans': [e], 'y0': e['bbox'].y0, 'y1': e['bbox'].y1, 'h': e['bbox'].height, 'tam_max': e['size']})
    for l in linhas:
        # número da equação, sozinho na direita: "(3)"
        if len(l['spans']) > 1:
            ult = max(l['spans'], key=lambda s: s['x0'])
            resto = [s for s in l['spans'] if s is not ult]
            if re.fullmatch(r'\s*\(\d{1,2}[a-z]?\)\s*', ult['text']) and ult['x0'] - max(s['x1'] for s in resto) > 3 * corpo:
                l['spans'] = resto
        fecha_linha(l)
    linhas.sort(key=lambda l: l['base'])

    # fração pequena empilhada num expoente: a linha de cima só tem numeradores pequenos
    for i in range(len(linhas) - 1):
        cima, baixo = linhas[i], linhas[i + 1]
        if cima.get('fora') or not all(s['size'] < 0.85 * corpo for s in cima['spans']):
            continue
        if baixo['y0'] - cima['y1'] > corpo:
            continue
        casou = 0
        for a in cima['spans']:
            for b in baixo['spans']:
                if b['size'] < 0.85 * baixo['tam'] and b['x0'] < a['x1'] and a['x0'] < b['x1'] and 'num' not in b:
                    b['num'] = a['text'].strip()
                    casou += 1
                    break
        if casou == len(cima['spans']):
            cima['fora'] = True
    return [l for l in linhas if not l.get('fora')]


def fecha_linha(l):
    l['spans'].sort(key=lambda s: s['x0'])
    normais = [s for s in l['spans'] if not eh_acento(s)] or l['spans']
    maior = max(s['size'] for s in normais)
    base = [s for s in normais if s['size'] >= maior * 0.9]
    l['tam'] = maior
    l['base'] = statistics.median(s['y'] for s in base)
    l['x0'] = min(s['x0'] for s in l['spans'])
    l['x1'] = max(s['x1'] for s in l['spans'])
    l['rect'] = pymupdf.Rect(l['x0'], l['y0'], l['x1'], l['y1'])
    total = sum(len(s['text']) for s in normais)
    l['negrito'] = sum(len(s['text']) for s in normais if FONTE_NEGRITO.search(s['font'])) > 0.6 * total


def montar_linha(l):
    """Texto da linha com a matemática em $...$; expoentes e índices pela altura e pelo tamanho."""
    spans = l['spans']
    # acentos e setas: marcam o primeiro e o último trecho que cobrem
    for a in spans:
        if not eh_acento(a):
            continue
        t = a['text'].strip()
        seta = bool(SETA.match(t))
        if seta and (a['bbox'].y0 + a['bbox'].y1) / 2 > l['base'] - 0.45 * l['tam']:
            a['vira_texto'] = True  # seta na linha: "tende a"
            continue
        cobre = [s for s in spans if s is not a and not eh_acento(s)
                 and min(s['x1'], a['x1']) - max(s['x0'], a['x0']) > 0.4 * min(s['x1'] - s['x0'], a['x1'] - a['x0'])]
        if cobre:
            cobre[0]['ac_ini'] = cobre[0].get('ac_ini', '') + (r'\overrightarrow' if seta else ACENTOS[t]) + '{'
            cobre[-1]['ac_fim'] = cobre[-1].get('ac_fim', '') + '}'
        elif seta:
            a['vira_texto'] = True

    pecas = []  # [tipo, texto, nivel, fonte]  tipo: txt | mat | esp
    anterior = None
    for s in spans:
        if eh_acento(s) and not s.get('vira_texto'):
            continue
        t = s['text']
        menor = s['size'] < l['tam'] * 0.85
        nivel = 0
        if menor and s['y'] < l['base'] - 0.12 * l['tam']:
            nivel = 1
        elif menor and s['y'] > l['base'] + 0.08 * l['tam']:
            nivel = -1
        mat = eh_mat(s) or nivel != 0 or 'ac_ini' in s or s.get('vira_texto')
        folga = 0.1 if (eh_mat(s) != eh_mat(anterior or s)) else 0.18
        if anterior is not None and s['x0'] - anterior['x1'] > folga * l['tam'] and not t.startswith(' ') and not anterior['text'].endswith(' ') and not re.match(r'[.,;:!?)\]]', t):
            pecas.append(['esp', ' ', 0, ''])
        if 'num' in s:
            corpo = r'\frac{' + latex(s['num']) + '}{' + latex(t.strip()) + '}'
            nivel = nivel or 1
        elif FONTE_SY.match(s['font']) and t.strip() == '0' and nivel == 1:
            corpo = "'"  # o apóstrofo (′) das fontes TeX sai como "0"
        elif s.get('vira_texto'):
            corpo = r'\to '
        else:
            corpo = latex(t.strip() if nivel else t, s['font'])
        if FONTE_NEGRITO.search(s['font']) and (mat or 'ac_ini' in s) and re.fullmatch(r'\s*[A-Za-z]{1,2}\s*', t):
            corpo = r'\mathbf{' + t.strip() + '}'
            mat = True
        if 'ac_ini' in s:
            corpo = s['ac_ini'] + corpo.strip()
        if 'ac_fim' in s:
            corpo = corpo.rstrip() + s['ac_fim']
        pecas.append(['mat' if mat else 'txt', corpo if (mat or nivel) else t, nivel, s['font']])
        anterior = s

    # trechos neutros (números, sinais) e letras em negrito colados em matemática viram matemática
    for i, (k, t, nv, f) in enumerate(pecas):
        if k != 'txt':
            continue
        viz = [pecas[j][0] for j in (i - 1, i + 1) if 0 <= j < len(pecas)]
        viz2 = [pecas[j][0] for j in (i - 2, i + 2) if 0 <= j < len(pecas)]
        perto = 'mat' in viz or ('esp' in viz and 'mat' in viz2)
        if perto and NEUTRO.match(t):
            pecas[i] = ['mat', latex(t), 0, f]
        elif perto and FONTE_NEGRITO.search(f) and re.fullmatch(r'\s*[A-Za-z]\s*', t):
            pecas[i] = ['mat', r'\mathbf{' + t.strip() + '}', 0, f]

    saida, buf = [], []

    def fecha():
        if not buf:
            return
        # índices e expoentes vizinhos do mesmo nível viram um só: ^{1}^{-}^{\alpha} -> ^{1-\alpha}
        m, sub, sup = '', '', ''

        def solta_scripts():
            nonlocal m, sub, sup
            if sub:
                m += '_{' + sub + '}'
            if sup:
                m += '^{' + sup + '}'
            sub = sup = ''
        for t, nv in buf:
            if nv < 0:
                sub += t
            elif nv > 0:
                sup += t
            else:
                solta_scripts()
                m += t
        solta_scripts()
        fim = re.search(r'[\s.,;:]+$', m)
        resto = ''
        if fim:
            resto, m = fim.group(0), m[:fim.start()]
        m = re.sub(r'\s+([\^_}])', r'\1', re.sub(r'\s+', ' ', m)).strip()
        m = re.sub(r'(\d)\.\s+(\d)', r'\1.\2', m)
        # expoente "'" vira apóstrofo simples
        m = m.replace("^{'}", "'")
        if m:
            saida.append('$' + m + '$')
        saida.append(resto)
        buf.clear()

    for k, t, nv, f in pecas:
        if k == 'mat':
            buf.append((t, nv))
        elif k == 'esp':
            if buf:
                buf.append((' ', 0))
            else:
                saida.append(' ')
        else:
            fecha()
            saida.append(limpa_txt(t))
    fecha()
    texto = ''.join(saida)
    texto = re.sub(r'(?<!\\)\$([\d\s.,;:()\[\]]+)(?<!\\)\$', lambda m: m.group(1).replace(' ', '') if not re.fullmatch(r'\s*\d+\s*', m.group(1)) else m.group(0), texto)
    texto = re.sub(r'(\d)\$\.\s?(\d+)', r'\1.\2$', texto)  # "= 0$. 4" -> "= 0.4$"
    texto = re.sub(r'\$([.,;:])(?=\w)', r'$\1 ', texto)
    texto = re.sub(r'\$ \$', ' ', texto)
    return re.sub(r'[ \t]+', ' ', texto).strip()


# ---------- estrutura ----------

RUIDO = re.compile(r'(Copyright (?:\(c\)|©)?\s*\w|MIT OpenCourseWare|ocw\.mit\.edu|For information about citing|Terms of Use|^Cite as:|^Page \d+|^\d+ of \d+$|^\d{1,3}$|^-\s*\d+\s*-$)', re.I)
EXTENSO = {'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'}
POR_EXTENSO = re.compile(r'^((?:Problem|Question|Exercise)\s+)(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)\b', re.I)
CAB_Q = [
    re.compile(r'^(?:Problem|Question|Exercise|Exerc[ií]cio|Quest[ãa]o)\s*#?\s*(\d+)\b[\s.:)]*(.*)$', re.I),
    re.compile(r'^(\d+)\s*[.)]?\s+(?:([A-Z][^.]{2,80}?)\s*)?[\[(]\s*\d+\s*(?:points?|pts?)\s*[\])]', re.I),
    re.compile(r'^(\d+[A-Z]-\d+)\*?\s+(.*)$'),
    re.compile(r'^(\d+)[.)]?(?:\s+|(?=\())(.*)$'),
]
CAB_ITEM = re.compile(r'^\(?([a-h]|i{1,3}|iv|v|vi{1,3})\)\s*(.*)$|^([a-h])\.\s+(.*)$')
CAB_ITEM_NUM = re.compile(r'^(\d{1,2})[.)]\s+(.*)$')
CAB_OPCAO = re.compile(r'^\(?([A-E])[.)]\s+(.*)$')
CAB_SECAO = re.compile(r'^(?:Part\s+)?([A-H])[.):]\s+(.+?)\s*[\[(]\s*\d+\s*(?:points?|pts?)\s*[\])]\s*$', re.I)
VF = re.compile(r'true["”’\']?\s*,?\s*(or\s*)?["“‘\']?false|true or false|verdadeiro ou falso|false,?\s*or\s*uncertain', re.I)
SOLUCAO = re.compile(r'\b(Solution|Answer|Soluç[ãa]o|Resposta)\s*:', re.I)


def cabecalho_questao(l, txt, estilo=None):
    """Devolve (match, estilo): 0 "Problem N", 1 "N Título [pontos]", 2 "2A-1", 3 "N." numerado."""
    txt = POR_EXTENSO.sub(lambda m: m.group(1) + EXTENSO[m.group(2).lower()], txt)
    for i, rx in enumerate(CAB_Q):
        m = rx.match(txt)
        if m and (estilo is None or i == estilo):
            destaque = l['negrito'] or l['tam'] > 1.1 * l.get('corpo', l['tam'])
            if i == 1 and not m.group(2) and not destaque:
                continue  # "1. (5 points)" sem título e sem destaque é item, não questão
            if i == 3 and re.match(r'^\d+[.)]?\s+(\$|[a-z])', txt) and not l['negrito']:
                continue
            if i == 3 and re.match(r'^\d+\s', txt) and not (l['negrito'] or l['tam'] > 1.1 * l.get('corpo', l['tam'])):
                continue
            return m, i
    return None, None


def tem_tinta(pagina, r):
    """Há algo escuro na região (numa página escaneada, a fórmula que o OCR não leu)?"""
    pix = pagina.get_pixmap(clip=r, dpi=40, colorspace=pymupdf.csGRAY)
    escuros = sum(1 for v in pix.samples if v < 128)
    return escuros > 0.001 * max(len(pix.samples), 1)


def regioes_para_recortar(pagina, linhas, escaneada, corpo, falhas):
    """Imagens, frações que não deu para montar, delimitadores grandes e lacunas (fórmula ou figura sem texto)."""
    area = pagina.rect.get_area()
    regioes = list(falhas)
    for info in pagina.get_image_info():
        r = pymupdf.Rect(info['bbox'])
        if r.width > 15 and r.height > 8 and r.get_area() < 0.6 * area:
            regioes.append(r)
    desenhos = [d['rect'] for d in pagina.get_drawings()]
    for l in linhas:
        if any(FONTE_EXTENSIVEL.match(s['font']) for s in l['spans']):
            regioes.append(pymupdf.Rect(l['rect']))
    # figura vetorial (gráfico): vários traços agrupados numa área grande
    figuras = []
    for d in pagina.get_drawings():
        r = d['rect']
        if r.height < 1.6 and r.width < 320:  # traço de fração ou régua horizontal
            continue
        if r.width < 1.6 and r.height < 40:  # régua vertical de tabela
            continue
        r = pymupdf.Rect(r.x0 - 6, r.y0 - 6, r.x1 + 6, r.y1 + 6)
        for f in figuras:
            if f['r'].intersects(r):
                f['r'] |= r
                f['n'] += len(d['items'])
                break
        else:
            figuras.append({'r': r, 'n': len(d['items'])})
    for f in figuras:
        if f['n'] >= 4 and f['r'].width > 50 and f['r'].height > 50 and f['r'].get_area() < 0.7 * area:
            regioes.append(f['r'])
    # tabela com réguas: traços verticais que cruzam linhas de texto
    verticais = [d['rect'] for d in pagina.get_drawings() if d['rect'].width < 1.6 and d['rect'].height > 6]
    if verticais:
        grupos = []
        for v in sorted(verticais, key=lambda r: r.y0):
            for g in grupos:
                if v.y0 <= g.y1 + 2 and v.x0 >= g.x0 - 250 and v.x1 <= g.x1 + 250:
                    g |= v
                    break
            else:
                grupos.append(pymupdf.Rect(v))
        for g in grupos:
            dentro = [l for l in linhas if l['rect'].intersects(pymupdf.Rect(g.x0 - 200, g.y0, g.x1 + 200, g.y1)) and l['y0'] >= g.y0 - 3 and l['y1'] <= g.y1 + 3]
            if len(dentro) >= 2:
                r = pymupdf.Rect(g)
                for l in dentro:
                    r |= l['rect']
                regioes.append(r)
    # tabela sem réguas: três ou mais linhas seguidas com colunas no mesmo lugar
    def colunas(l):
        g = [s for s in l['spans'] if s['size'] >= 0.85 * l['tam']]
        return [round(b['x0']) for a, b in zip(g, g[1:]) if b['x0'] - a['x1'] > 1.1 * corpo]
    tabela = []
    for l in linhas + [None]:
        cols = colunas(l) if l else []
        if len(cols) >= 1 and (not tabela or sum(1 for c in cols if any(abs(c - d) < 4 for d in tabela[-1][1])) >= 1):
            tabela.append((l, cols))
            continue
        if len(tabela) >= 3:
            r = pymupdf.Rect(tabela[0][0]['rect'])
            for t, _ in tabela[1:]:
                r |= t['rect']
            regioes.append(r)
        tabela = [(l, cols)] if l and cols else []
    if linhas:
        esq = min(l['x0'] for l in linhas)
        dir_ = max(l['x1'] for l in linhas)
        for a, b in zip(linhas, linhas[1:]):
            gap = pymupdf.Rect(esq, a['y1'] + 1, dir_, b['y0'] - 1)
            if gap.height < 2.2 * corpo:
                continue
            tem_desenho = sum(1 for d in desenhos if d.intersects(gap) and (d.get_area() > 2 or d.width > 20 or d.height > 20)) >= 2
            if (escaneada and tem_tinta(pagina, gap)) or tem_desenho:
                regioes.append(gap)
    return regioes


def pagina_do_ocw(pagina):
    """Capa ou página final do OCW (licença), sem conteúdo da lista."""
    t = pagina.get_text()
    return 'MIT OpenCourseWare' in t and len(t) < 700 and 'ocw.mit.edu/terms' in t.replace(' ', '')


SUSPEITO = [
    (re.compile(r'\$\$\s*[^$]{0,3}\s*\$\$'), 'fórmula curta solta'),
    (re.compile(r'[a-z] [.,;](\s|$)'), 'algo sumiu antes da pontuação'),
    (re.compile(r'[ˆ¯˜˙¨→]'), 'acento solto'),
    (re.compile(r'\b(h[a-z], [a-z], [a-z]i)\b'), 'colchete angular perdido'),
    (re.compile(r'�'), 'caractere ilegível'),
]


def suspeitas(alvo):
    motivos = []
    texto = ' '.join(p.get('p', '') for p in alvo['partes'])
    for rx, m in SUSPEITO:
        if any(rx.search(p.get('p', '')) for p in alvo['partes']):
            motivos.append(m)
    for p in alvo['partes']:
        for seg in re.findall(r'(?<!\\)\$\$?(.*?)(?<!\\)\$\$?', p.get('p', '')):
            limpo = seg.replace(r'\{', '').replace(r'\}', '')
            if limpo.count('{') != limpo.count('}'):
                motivos.append('chaves desbalanceadas')
            if not seg.strip():
                motivos.append('fórmula vazia')
    if not texto.strip() and not any('img' in p for p in alvo['partes']) and not alvo.get('itens') and not alvo.get('titulo'):
        motivos.append('sem texto')
    return motivos


def transcrever(caminho, pasta_img):
    doc = pymupdf.open(caminho)
    os.makedirs(pasta_img, exist_ok=True)
    todas = []
    paginas_escaneadas = set()
    for np, pagina in enumerate(doc):
        if pagina_do_ocw(pagina):
            continue
        spans = spans_da_pagina(pagina)
        if not spans:
            continue
        corpo = statistics.median([s['size'] for s in spans for _ in s['text']])
        falhas = converter_fracoes(pagina, spans, corpo)
        linhas = linhas_visuais(spans, corpo)
        altura = pagina.rect.height
        escaneada = any(pymupdf.Rect(i['bbox']).get_area() > 0.6 * pagina.rect.get_area() for i in pagina.get_image_info())
        if escaneada:
            paginas_escaneadas.add(np)
        for l in linhas:
            l['pagina'] = np
            l['corpo'] = corpo
            l['txt'] = montar_linha(l)
            borda = l['y1'] < altura * 0.06 or l['y0'] > altura * 0.93 or (l['y0'] > altura * 0.88 and l['tam'] < corpo * 0.95)
            perto_borda = l['y1'] < altura * 0.12 or l['y0'] > altura * 0.86
            numero = re.fullmatch(r'\d{1,3}', l['txt'])
            if (RUIDO.search(l['txt']) and not numero) or (numero and perto_borda) or not re.search(r'[A-Za-z0-9\\]', l['txt']) or (borda and len(l['txt']) < 90):
                l['ruido'] = True
            elif len(l['txt']) <= 10 and not re.search(r'[A-Za-z]{3,}', l['txt']):
                l['solta'] = True  # pedaço de fórmula separado do resto (fração antiga, expoente perdido)
            if any(re.search(r'symbol|greek|wp ?math', s['font'], re.I) and re.search(r'[^\sA-Za-z0-9α-ωΑ-Ω().,]', s['text']) for s in l['spans']):
                l['solta'] = True  # letra grega da fonte Symbol que veio como pontuação
        uteis = [l for l in linhas if not l.get('ruido')]
        # linha só de fórmula colada numa linha de texto: sistema de equações ou expressão empilhada
        for a, b in zip(uteis, uteis[1:]):
            for x, y in ((a, b), (b, a)):
                so = '$' in x['txt'] and len(re.sub(r'\$[^$]*\$', '', x['txt']).strip(' .,;')) < 4
                if so and b['y0'] - a['y1'] < 0.45 * corpo and x['x0'] > y['x0'] + 30 and x['x1'] < y['x1'] + 5:
                    x['apertada'] = y['apertada'] = True
        regioes = regioes_para_recortar(pagina, uteis, escaneada, corpo, falhas)
        largura = pagina.rect.width
        blocos = []
        for r in sorted(regioes, key=lambda r: r.y0):
            r = pymupdf.Rect(r)
            for _ in range(2):  # a equação inteira, não só o pedaço problemático
                for l in uteis:
                    perto = l['y0'] < r.y1 + 0.9 * corpo and l['y1'] > r.y0 - 0.9 * corpo
                    curta = l['x0'] > largura * 0.15 and (l['x1'] - l['x0']) < largura * 0.5 and '$' in l['txt'] and len(re.sub(r'\$[^$]*\$', '', l['txt']).strip()) < 6
                    if (l['y0'] < r.y1 - 1 and l['y1'] > r.y0 + 1 and l['x0'] > largura * 0.15) or (perto and curta and l['x0'] < r.x1 and l['x1'] > r.x0):
                        r |= l['rect']
            if blocos and r.y0 - blocos[-1].y1 < 4:
                blocos[-1] |= r
            else:
                blocos.append(r)
        for i, b in enumerate(blocos):
            todas.append({'img': True, 'pagina': np, 'rect': b, 'y0': b.y0, 'id': f'p{np + 1}-{i + 1}'})
        for l in uteis:
            l['borda'] = l['y1'] < altura * 0.15 or l['y0'] > altura * 0.85
            if not any((l['rect'] & b).get_area() > 0.5 * max(l['rect'].get_area(), 1) for b in blocos):
                todas.append(l)
            elif any(rx.match(l['txt']) for rx in CAB_Q[:3]) or CAB_ITEM.match(l['txt']) or re.match(r'^\d+[.)]\s', l['txt'])                     or (re.fullmatch(r'\d{1,2}', l['txt']) and (l['negrito'] or l['tam'] > 1.1 * corpo)):
                l['solta'] = True  # o cabeçalho fica; o conteúdo vai no recorte
                todas.append(l)
    # linha de borda repetida em duas ou mais páginas (com outros números) é cabeçalho ou rodapé
    norm = lambda t: re.sub(r'\d+', '#', t).strip()
    vezes = {}
    for l in todas:
        if not l.get('img') and l.get('borda'):
            vezes.setdefault(norm(l['txt']), set()).add(l['pagina'])
    todas = [l for l in todas if l.get('img') or not l.get('borda') or len(vezes.get(norm(l['txt']), ())) < 2]
    todas.sort(key=lambda x: (x['pagina'], x['y0']))

    xs = [round(l['x0']) for l in todas if not l.get('img')]
    margem = statistics.mode(xs) if xs else 72

    # estilo dos cabeçalhos de questão: o primeiro que aparecer entre "Problem N", "N Título [pontos]"
    # e "2A-1"; senão, "1.", "2.", ... em sequência, alinhados na mesma margem
    estilo, x_q = None, None
    linhas_txt = [l for l in todas if not l.get('img')]
    for l in linhas_txt:
        m, i = cabecalho_questao(l, l['txt'])
        if m and i < 3:
            estilo = i
            break
    if estilo is None:
        def numerada(l, n):
            if re.match(rf'^{n}[.)]', l['txt']):
                return True
            return bool(re.match(rf'^{n}\s+[A-Z]', l['txt'])) and (l['negrito'] or l['tam'] > 1.1 * l['corpo'])
        for l in linhas_txt:
            if numerada(l, 1) and any(numerada(o, 2) and abs(o['x0'] - l['x0']) < 12 for o in linhas_txt):
                estilo, x_q = 3, l['x0']
                break
        if estilo is None:
            for i, l in enumerate(linhas_txt):
                if numerada(l, 1) and any(CAB_ITEM.match(o['txt']) for o in linhas_txt[i + 1:i + 12]):
                    estilo, x_q = 3, l['x0']
                    break
    proxima_q = 1
    secao = None
    reinicia = set()
    com_solucao = any(SOLUCAO.search(l['txt']) or re.search(r'solutions?', l['txt'], re.I) for l in linhas_txt)

    intro, questoes = {'partes': [], 'reg': []}, []
    pendente = []
    q = item = None
    ult_base = None
    em_solucao = False

    def destino():
        return item if item else q if q else intro

    def despeja(qq):
        if qq is not None and pendente:
            ub = None
            for y in pendente:
                junta(qq, 'partes', y['txt'], y, ub, margem)
                ub = y['base']
        pendente.clear()

    def anota(alvo, x):
        alvo.setdefault('reg', []).append((x['pagina'], pymupdf.Rect(x['rect'])))
        if x.get('apertada'):
            alvo['apertada'] = True
        if x.get('solta'):
            alvo['solta'] = True
        if x['pagina'] in paginas_escaneadas:
            alvo['escaneada'] = True

    for x in todas:
        alvo = destino()
        lista = 'solucao' if em_solucao else 'partes'
        if x.get('img'):
            r = x['rect']
            nome = f"{x['id']}.png"
            pix = doc[x['pagina']].get_pixmap(clip=pymupdf.Rect(r.x0 - 3, r.y0 - 3, r.x1 + 3, r.y1 + 3), dpi=200)
            pix.save(os.path.join(pasta_img, nome))
            alvo.setdefault(lista, []).append({'img': nome, 'w': round(r.width), 'h': round(r.height)})
            if not em_solucao:
                anota(alvo, x)
            ult_base = None
            continue
        txt = x['txt']
        cab_item = False
        if estilo == 2 and re.match(r'^\d+[A-Z]\.\s+[A-Z]', txt):
            q = item = None
            em_solucao = False
            ult_base = None
            continue
        m, i = cabecalho_questao(x, txt, estilo) if estilo is not None else (None, None)
        mt = re.fullmatch(r'(\d+)(?:\s+([A-Z].{2,80}))?', txt)
        if not m and estilo in (1, 3) and mt and (x['negrito'] or x['tam'] > 1.1 * x['corpo'])                 and questoes and questoes[-1]['n'].isdigit() and int(mt.group(1)) == int(questoes[-1]['n']) + 1:
            m, i = mt, estilo  # "4" ou "4 Título" em destaque, com os pontos na linha de baixo
        if m and estilo == 3 and (not m.group(1).isdigit() or int(m.group(1)) != proxima_q or abs(x['x0'] - x_q) > 12):
            m = None
        if m and (x['x0'] <= margem + 40 or estilo == 3):
            if estilo == 3:
                proxima_q += 1
            titulo = (m.group(2) or '').strip() if m.lastindex and m.lastindex >= 2 else ''
            sol = SOLUCAO.search(titulo)
            if sol:
                titulo = titulo[:sol.start()].strip()
            # texto do enunciado na mesma linha do "Problem N." não é título
            destaque = (x['negrito'] or x['tam'] > 1.1 * x['corpo']) and len(titulo) < 70 and '$' not in titulo
            corrido = titulo and not destaque and (estilo in (2, 3) or '$' in titulo or len(titulo) > 70 or (len(titulo.split()) > 6 and re.search(r'[.?]$', titulo)))
            despeja(q)
            q = {'n': m.group(1), 'titulo': '' if corrido else titulo.strip(' .:-'), 'partes': [], 'itens': []}
            questoes.append(q)
            secao = None
            item = None
            em_solucao = False
            anota(q, x)
            if corrido:
                mi = CAB_ITEM.match(titulo)
                if mi:  # "1. (a) ..." : o primeiro item vem na mesma linha
                    item = {'id': mi.group(1) or mi.group(3), 'partes': [{'p': mi.group(2) or mi.group(4)}]}
                    q['itens'].append(item)
                    anota(item, x)
                    ult_base = x['base']
                    continue
                q['partes'].append({'p': titulo})
                ult_base = x['base']
                continue
            ult_base = None
            continue
        mi = CAB_ITEM.match(txt) if q else None
        idi = txti = None
        if mi:
            idi, txti = (mi.group(1), mi.group(2)) if mi.group(1) else (mi.group(3), mi.group(4))
        elif q and estilo is not None:
            mn = CAB_ITEM_NUM.match(txt)
            if mn:
                idi, txti = mn.group(1), mn.group(2)
        romano = idi and re.fullmatch(r'i{1,3}|iv|vi{0,3}', idi) and any(re.fullmatch(r'\d*[a-h]', it['id']) for it in q['itens'])
        if idi and romano and not (idi == 'i' and item and item['id'] == 'h'):
            idi = None
        # hierarquia pelo recuo: item mais recuado que o anterior é filho dele ("c1", "2a")
        pai = None
        irma = None
        if idi and q:
            # sucessor de um item da pilha (a -> b, 1 -> 2): é irmão dele, mesmo com o recuo um pouco diferente
            ant = str(int(idi) - 1) if idi.isdigit() else (chr(ord(idi) - 1) if len(idi) == 1 else None)
            formato = '(' if txt.startswith('(') else ('.' if re.match(r'^\w+\.', txt) else ')')
            for k in range(len(q.setdefault('_pilha', [])) - 1, -1, -1):
                if ant and q['_pilha'][k][2] == ant and q['_pilha'][k][4] == formato:
                    irma = k
                    break
            if irma is not None:
                pai = q['_pilha'][irma][3]
            else:
                pilha = [p for p in q['_pilha'] if p[0] < x['x0'] - 3]
                pai = pilha[-1][1] if pilha else (secao if secao and idi.isdigit() else None)
        cheio = lambda i: (pai or '') + i
        # dentro de uma solução, letra que já existe no grupo é a solução daquele item, não um item novo
        if idi and em_solucao and any(it['id'] == cheio(idi) for it in q['itens']):
            idi = None
            txt = x['txt']
        if idi and x['x0'] <= margem + 60 and re.fullmatch(r'[a-g]', idi) and txti:
            # itens lado a lado na mesma linha: "a) ...   b) ..."
            prox = chr(ord(idi) + 1)
            m2 = re.search(r'\s\(?' + prox + r'\)\s+', txti)
            if m2 and len(re.findall(r'(?<!\\)\$', txti[:m2.start()])) % 2 == 0:
                antes, depois = txti[:m2.start()].strip(), txti[m2.end():].strip()
                item = {'id': cheio(idi), 'partes': [{'p': antes}], 'opcoes': [], '_x': x['x0']}
                q['itens'].append(item)
                anota(item, x)
                idi, txti = prox, depois
        id_cheio = cheio(idi) if idi else None
        ja = next((it for it in q['itens'] if it['id'] == id_cheio), None) if idi and q and com_solucao else None
        if ja is not None and x['x0'] <= margem + 60:
            item = ja
            em_solucao = True
            item.setdefault('_xs', x['x0'])
            if txti:
                sol = SOLUCAO.match(txti)
                junta(item, 'solucao', txti[sol.end():].strip() if sol else txti, x, None, margem)
            ult_base = x['base']
            continue
        if idi and x['x0'] <= margem + 60:
            while any(it['id'] == id_cheio for it in q['itens']):
                id_cheio += "'"  # numeração que recomeça na mesma questão
                reinicia.add(q['n'])
            item = {'id': id_cheio, 'partes': [], 'opcoes': [], '_x': x['x0']}
            if pai:
                item['pai'] = pai
            q['itens'].append(item)
            base = q['_pilha'][:irma] if irma is not None else [p for p in q['_pilha'] if p[0] < x['x0'] - 3]
            q['_pilha'] = base + [(x['x0'], id_cheio, idi, pai, formato)]
            if pendente:
                ub = None
                for y in pendente:
                    junta(item, 'contexto', y['txt'], y, ub, margem)
                    ub = y['base']
                pendente.clear()
            em_solucao = False
            anota(item, x)
            alvo, lista = item, 'partes'
            cab_item = True
            txt = txti or ''
            if not txt:
                ult_base = x['base']
                continue
            ult_base = None
        else:
            ms = CAB_SECAO.match(txt) if q and not em_solucao else None
            if ms:
                secao = ms.group(1).upper()
                item = {'id': secao, 'partes': [{'p': ms.group(2).strip()}], '_secao': True, '_x': x['x0']}
                q['itens'].append(item)
                q['_pilha'] = [p for p in q.get('_pilha', []) if p[0] < x['x0'] - 3] + [(x['x0'], secao, secao, None, 'secao')]
                anota(item, x)
                ult_base = x['base']
                continue
            mo = CAB_OPCAO.match(txt)
            if mo and q and not em_solucao:
                (item or q).setdefault('opcoes', []).append({'id': mo.group(1), 'texto': mo.group(2)})
                anota(item or q, x)
                ult_base = x['base']
                continue
        # solução embutida no PDF: o resto do item vai para "solucao"
        sol = SOLUCAO.search(txt) if not em_solucao else None
        if sol:
            antes, depois = txt[:sol.start()].strip(), txt[sol.end():].strip()
            if antes:
                junta(alvo, 'partes', antes, x, ult_base, margem)
                anota(alvo, x)
            em_solucao = True
            if item is not None and '_xs' not in item:
                item['_xs'] = x['x0']
            ult_base = None
            if depois:
                junta(alvo, 'solucao', depois, x, None, margem)
            ult_base = x['base']
            continue
        if item and not em_solucao and '_xc' not in item and not item.get('_fim') and not cab_item:
            item['_xc'] = x['x0']
        recuo = item.get('_xc', item.get('_x', -1e9)) if item else -1e9
        xb = q.get('_xb') if q else None
        sol_na_margem = em_solucao and item is not None and item.get('_xs', 1e9) <= (xb if xb is not None else -1e9) + 6
        if item and xb is not None and xb - 3 < x['x0'] < recuo - 6 and not sol_na_margem:
            item['_fim'] = True  # o item acabou; o texto é da questão e vai antes do próximo item
            em_solucao = False
            pendente.append(x)
            ult_base = x['base']
            continue
        if item and item.get('_fim') and not em_solucao:
            pendente.append(x)
            ult_base = x['base']
            continue
        junta(alvo, lista, txt, x, ult_base, margem)
        if alvo is q and not item and '_xb' not in q and not em_solucao:
            q['_xb'] = x['x0']  # margem do enunciado da questão
        if not em_solucao:
            anota(alvo, x)
        ult_base = x['base']

    despeja(q)
    for qq in questoes:
        qq.pop('_xb', None)
        qq.pop('_pilha', None)
        for it in qq['itens']:
            it.pop('_x', None)
            it.pop('_xc', None)
            it.pop('_xs', None)
            it.pop('_fim', None)

    # tipo, verificação e recorte de segurança
    def recortar(alvo, prefixo):
        por_pagina = {}
        for np, r in alvo.get('reg', []):
            por_pagina[np] = por_pagina[np] | r if np in por_pagina else pymupdf.Rect(r)
        out = []
        for np, r in sorted(por_pagina.items()):
            r = pymupdf.Rect(r.x0 - 4, r.y0 - 4, r.x1 + 6, r.y1 + 4) & doc[np].rect
            nome = f'{prefixo}-p{np + 1}.png'
            doc[np].get_pixmap(clip=r, dpi=170).save(os.path.join(pasta_img, nome))
            out.append({'img': nome, 'w': round(r.width), 'h': round(r.height)})
        return out

    def verifica(alvo, prefixo):
        motivos = suspeitas(alvo)
        if alvo.get('apertada'):
            motivos.append('fórmula empilhada junto do texto')
        if alvo.get('escaneada'):
            motivos.append('página escaneada')
        if alvo.get('solta'):
            motivos.append('pedaço de fórmula solto')
        if alvo.get('katex'):
            motivos.append('fórmula que o KaTeX não desenha')
        if motivos:
            alvo['revisar'] = sorted(set(motivos))
            alvo['recorte'] = recortar(alvo, prefixo)
        if os.environ.get('TRANSCREVER_DEBUG'):  # regiões no PDF, para a prévia de conferência
            alvo['_reg'] = [[np, r.x0, r.y0, r.x1, r.y1] for np, r in alvo.get('reg', [])]
        for k in ('reg', 'apertada', 'escaneada', 'solta', 'katex'):
            alvo.pop(k, None)

    validar_katex([intro] + questoes + [it for q in questoes for it in q['itens']])
    for q in questoes:
        cab = q['titulo'] + ' ' + ' '.join(p.get('p', '') for p in q['partes'][:2])
        vf = bool(VF.search(cab))
        q['tipo'] = 'vf' if vf and not q['itens'] else 'aberta'
        verifica(q, f"q{q['n']}")
        ids = [it['id'] for it in q['itens']]
        vf_secao = {it['id'] for it in q['itens'] if it.get('_secao') and VF.search(' '.join(p.get('p', '') for p in it['partes'][:2]))}
        for it in q['itens']:
            vf_it = vf or (it['id'][:1] in vf_secao and not it.get('_secao'))
            it['tipo'] = 'alternativa' if it.get('opcoes') else ('vf' if vf_it else 'aberta')
            if any(o.get('pai') == it['id'] for o in q['itens']):
                it['tipo'] = 'grupo'
            if it.pop('_secao', False):
                it['tipo'] = 'grupo'
            if not it.get('opcoes'):
                it.pop('opcoes', None)
            verifica(it, f"q{q['n']}{it['id']}")
    intro.pop('reg', None)
    for k in ('apertada', 'escaneada', 'solta', 'katex'):
        intro.pop(k, None)
    avisos = []
    palavras = re.findall(r'\S+', ' '.join(l['txt'] for l in todas if not l.get('img')))
    boas = [w for w in palavras if re.fullmatch(r"[A-Za-z][a-z]+[.,;:?]?", w)]
    if palavras and len(boas) < 0.3 * len(palavras):
        avisos.append('texto do PDF ilegível (fonte sem tabela de conversão)')
    nums = [int(q['n']) for q in questoes if q['n'].isdigit()]
    if nums and nums != list(range(nums[0], nums[0] + len(nums))):
        avisos.append('questões fora de sequência: ' + ', '.join(q['n'] for q in questoes))
    def maior_grupo(q):
        cont = {}
        for it in q['itens']:
            if it['tipo'] != 'grupo':
                g = re.match(r'[A-H]|\d+(?=[a-h])', it['id'])
                cont[g.group(0) if g else ''] = cont.get(g.group(0) if g else '', 0) + 1
        return max(cont.values(), default=0)
    if any(maior_grupo(q) > 14 for q in questoes):
        avisos.append('questão com muitos itens')
    if len(doc) >= 4 and len(questoes) <= 1:
        avisos.append('poucas questões para o número de páginas')
    if not questoes:
        avisos.append('nenhuma questão reconhecida')
    if reinicia:
        avisos.append('numeração de itens recomeça nas questões ' + ', '.join(sorted(reinicia)))
    for q in questoes:
        ids = [it['id'] for it in q['itens']]
        if len(ids) != len(set(ids)):
            avisos.append(f"itens repetidos na questão {q['n']}")
    return {'arquivo': os.path.basename(caminho), 'paginas': len(doc), 'avisos': avisos, 'intro': intro.get('partes', []), 'questoes': questoes}


FORMULA = re.compile(r'(?<!\\)\$\$(.+?)(?<!\\)\$\$|(?<!\\)\$(.+?)(?<!\\)\$')


def validar_katex(alvos):
    """Marca os alvos com fórmula que o KaTeX não consegue desenhar."""
    import subprocess
    import tempfile
    lista, dono = [], []
    for a in alvos:
        for chave in ('partes', 'solucao'):
            for p in a.get(chave, []) or []:
                for m in FORMULA.finditer(p.get('p', '')):
                    lista.append({'tex': m.group(1) or m.group(2), 'display': bool(m.group(1))})
                    dono.append(a)
    if not lista:
        return
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f:
        json.dump(lista, f)
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    r = subprocess.run(['node', os.path.join(raiz, 'scripts', 'katex-check.mjs'), f.name], capture_output=True, text=True, cwd=raiz)
    os.unlink(f.name)
    for i in json.loads(r.stdout or '[]'):
        dono[i]['katex'] = True


def junta(alvo, lista, txt, x, ult_base, margem):
    """Acrescenta a linha ao último parágrafo ou abre um novo (fórmula centralizada vira $$...$$)."""
    partes = alvo.setdefault(lista, [])
    so_mat = '$' in txt and len(re.sub(r'\$[^$]*\$', '', txt).strip(' .,;')) < 4
    centrada = so_mat and x['x0'] > margem + 30
    novo = (ult_base is None or x['base'] - ult_base > x['tam'] * 1.9 or not partes or 'p' not in partes[-1] or partes[-1].get('display'))
    if centrada:
        pedacos = re.split(r'(?<!\\)\$', txt)
        conteudo = ''.join(p if i % 2 else (r'\text{' + p + '}' if re.search(r'[A-Za-z]{2,}', p) else p) for i, p in enumerate(pedacos)).strip(' .,;')
        if conteudo:
            partes.append({'p': '$$' + conteudo + '$$', 'display': True})
    elif novo:
        partes.append({'p': txt})
    else:
        ant = partes[-1]['p']
        if re.search(r'[a-z]-$', ant):
            partes[-1]['p'] = ant[:-1] + txt
        elif re.search(r'[=+\-(]\s*\$$', ant) and txt.startswith('$') and not txt.startswith('$$'):
            partes[-1]['p'] = ant[:-1] + ' ' + txt[1:]
        else:
            partes[-1]['p'] = ant + ' ' + txt


if __name__ == '__main__':
    saida = sys.argv[1]
    os.makedirs(saida, exist_ok=True)
    for arq in sys.argv[2:]:
        nome = os.path.splitext(os.path.basename(arq))[0]
        r = transcrever(arq, os.path.join(saida, nome))
        with open(os.path.join(saida, nome + '.json'), 'w', encoding='utf-8') as f:
            json.dump(r, f, ensure_ascii=False, indent=1)
        itens = [it for q in r['questoes'] for it in (q['itens'] or [q])]
        revisar = sum(1 for it in itens if it.get('revisar'))
        aviso = ('  ⚠ ' + '; '.join(r['avisos'])) if r['avisos'] else ''
        print(f"{nome}: {len(r['questoes'])} questões, {len(itens)} itens, {revisar} com recorte de segurança{aviso}")
