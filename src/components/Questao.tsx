'use client';

import { useState } from 'react';
import { Partes, Tex } from './Tex';
import { chave, rotulo, type Item, type Questao, type Respondivel } from '@/lib/questoes';
import type { Avaliacao, Resposta } from '@/lib/types';

const VF = ['Verdadeiro', 'Falso', 'Incerto'];
const AVAL: [Avaliacao, string][] = [['certo', 'Acertei'], ['parcial', 'Em parte'], ['errado', 'Errei']];

type Props = {
  q: Questao; k: number; sid: string;
  // banco: só leitura; lista: com respostas
  modo: 'banco' | 'lista';
  resposta?: (chave: string) => Resposta | undefined;
  setResposta?: (chave: string, r: Partial<Resposta>) => void;
  entregue?: boolean;
  destaque?: string | null;
  // conteúdo extra embaixo de cada item respondível (botão de erro, por exemplo)
  extra?: (r: Respondivel) => React.ReactNode;
};

export function QuestaoView({ q, k, sid, modo, resposta, setResposta, entregue, destaque, extra }: Props) {
  const [verSol, setVerSol] = useState(false);
  const itens = q.itens;
  const semItens = !itens.some((it) => it.tipo !== 'grupo');
  const temSol = !!q.solucao?.length || itens.some((it) => it.solucao?.length);
  const solVisivel = modo === 'lista' ? !!entregue : verSol;
  const rq: Respondivel = { chave: chave(k), rotulo: q.n, item: null, questao: q, k };

  return (
    <article className="qz" id={`q-${k}`}>
      <header className="qz-h">
        <span className="qz-n">Questão {q.n}</span>
        {q.titulo && <span className="qz-t">{q.titulo}</span>}
        {modo === 'banco' && temSol && (
          <button type="button" className="btn sm soft" style={{ marginLeft: 'auto' }} onClick={() => setVerSol(!verSol)} aria-expanded={verSol}>
            {verSol ? 'Esconder soluções' : 'Ver soluções'}
          </button>
        )}
      </header>
      <Partes partes={q.partes} sid={sid} />
      {semItens && (
        <Bloco r={rq} item={null} q={q} sid={sid} modo={modo} resposta={resposta} setResposta={setResposta}
          entregue={entregue} sol={solVisivel ? q.solucao : undefined} destaque={destaque} extra={extra} />
      )}
      {itens.map((it) => (
        <div key={it.id} className={'qz-it' + (it.pai ? ' sub' : '') + (destaque === chave(k, it.id) ? ' on' : '')}>
          {it.contexto?.length ? <div className="qz-ctx"><Partes partes={it.contexto} sid={sid} /></div> : null}
          <div className="qz-row">
            <span className="qz-l">{rotuloItem(it)}</span>
            <div className="qz-body">
              <Partes partes={it.partes} sid={sid} />
              {it.tipo === 'grupo' ? (
                solVisivel && it.solucao?.length ? <Solucao partes={it.solucao} sid={sid} /> : null
              ) : (
                <Bloco r={{ chave: chave(k, it.id), rotulo: rotulo(q, it), item: it, questao: q, k }} item={it} q={q} sid={sid} modo={modo}
                  resposta={resposta} setResposta={setResposta} entregue={entregue} sol={solVisivel ? it.solucao : undefined}
                  destaque={destaque} extra={extra} />
              )}
            </div>
          </div>
        </div>
      ))}
    </article>
  );
}

const rotuloItem = (it: Item) => {
  const id = it.pai && it.id.startsWith(it.pai) ? it.id.slice(it.pai.length) : it.id;
  return `${id})`;
};

function Solucao({ partes, sid }: { partes: Item['solucao']; sid: string }) {
  return (
    <div className="qz-sol">
      <span className="caption">Solução</span>
      <Partes partes={partes} sid={sid} />
    </div>
  );
}

function Bloco({ r, item, q, sid, modo, resposta, setResposta, entregue, sol, extra }: {
  r: Respondivel; item: Item | null; q: Questao; sid: string; modo: Props['modo'];
  resposta?: Props['resposta']; setResposta?: Props['setResposta']; entregue?: boolean;
  sol?: Item['solucao']; destaque?: string | null; extra?: Props['extra'];
}) {
  const tipo = item ? item.tipo : q.tipo;
  const opcoes = item ? item.opcoes : q.opcoes;
  if (modo === 'banco') {
    return (
      <>
        {opcoes?.length ? <ul className="qz-op">{opcoes.map((o) => <li key={o.id}><b>{o.id})</b> <Tex texto={o.texto} /></li>)}</ul> : null}
        {sol?.length ? <Solucao partes={sol} sid={sid} /> : null}
      </>
    );
  }
  const resp = resposta?.(r.chave);
  const set = (x: Partial<Resposta>) => setResposta?.(r.chave, x);
  const id = `resp-${r.chave.replace('/', '-')}`;
  return (
    <div className="qz-ans">
      {tipo === 'vf' && (
        <span role="radiogroup" aria-label="Verdadeiro, falso ou incerto" className="seg">
          {VF.map((o) => (
            <button key={o} type="button" role="radio" aria-checked={resp?.escolha === o} disabled={entregue} onClick={() => set({ escolha: o })}>{o}</button>
          ))}
        </span>
      )}
      {tipo === 'alternativa' && opcoes?.length ? (
        <div role="radiogroup" aria-label="Alternativas" className="qz-alt">
          {opcoes.map((o) => (
            <label key={o.id} className={resp?.escolha === o.id ? 'on' : ''}>
              <input type="radio" name={id} checked={resp?.escolha === o.id} disabled={entregue} onChange={() => set({ escolha: o.id })} />
              <b>{o.id})</b> <Tex texto={o.texto} />
            </label>
          ))}
        </div>
      ) : null}
      <label htmlFor={id} className="sr">Resposta da questão {r.rotulo}</label>
      <textarea id={id} className="field" rows={tipo === 'aberta' ? 3 : 2} readOnly={entregue}
        placeholder={tipo === 'vf' ? 'Justificativa' : tipo === 'alternativa' ? 'Raciocínio (opcional)' : 'Raciocínio, contas e resultado'}
        value={resp?.texto || ''} onChange={(e) => set({ texto: e.target.value })} />
      {entregue && (
        <>
          {sol?.length ? <Solucao partes={sol} sid={sid} /> : <p className="caption" style={{ margin: 0 }}>Sem solução por item. Confira no gabarito em PDF.</p>}
          <div className="qz-aval">
            <span role="radiogroup" aria-label="Como foi" className="seg">
              {AVAL.map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={resp?.avaliacao === v} className={'av-' + v}
                  onClick={() => set({ avaliacao: resp?.avaliacao === v ? undefined : v })}>{l}</button>
              ))}
            </span>
            {extra?.(r)}
          </div>
          {resp?.comentario && <p className="qz-ia"><span className="caption">Correção da IA · </span>{resp.comentario}</p>}
        </>
      )}
    </div>
  );
}
