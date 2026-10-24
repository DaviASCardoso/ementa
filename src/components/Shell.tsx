'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from './Store';
import { Gear, Icon, P } from './icons';
import { feita } from '@/lib/progresso';

export function Shell({ children }: { children: React.ReactNode }) {
  const st = useStore();
  const path = usePathname();
  const naEtapa = path.startsWith('/etapa/');
  const aberto = st.navOpen;
  const atual = st.atual ? st.courses.find((c) => c.id === st.atual) : null;
  const passos = atual ? st.porCurso[atual.id] || [] : [];
  const cur = atual ? st.atualEtapa(atual.id) : null;
  const feitas = passos.filter((s) => feita(s, st.mapas)).length;

  const ativo = path.startsWith('/materias') ? 'materias' : path.startsWith('/revisao') ? 'revisao' : path.startsWith('/erros') ? 'erros' : path.startsWith('/banco') ? 'banco'
    : path.startsWith('/config') ? 'config' : 'trilha';
  const itens = [
    { id: 'trilha', href: atual ? `/trilha/${atual.id}` : '/', label: 'Trilha', icon: P.path, badge: 0 },
    { id: 'materias', href: '/materias', label: 'Matérias', icon: P.grid, badge: 0 },
    { id: 'banco', href: '/banco', label: 'Banco de questões', icon: P.search, badge: 0 },
    { id: 'revisao', href: '/revisao', label: 'Revisão', icon: P.cards, badge: st.pendentes.fichas },
    { id: 'erros', href: '/erros', label: 'Caderno de erros', icon: P.alert, badge: st.pendentes.erros },
  ];

  return (
    <div className="app">
      <nav aria-label="Seções" className={'rail' + (aberto ? '' : ' closed')}>
        {st.travado ? (
          <div className="rail-sticky"><span className="brand" title="Prova sem consulta"><span className="brand-e">e</span></span></div>
        ) : (
        <div className="rail-sticky">
          <Link href="/" className="brand" aria-label="Ementa, início">
            <span className="brand-e">e</span>
            {aberto && <span className="brand-t"><b>ementa</b><span>economia pelo MIT</span></span>}
          </Link>
          {itens.map((n) => (
            <Link key={n.id} href={n.href} className="rail-btn" aria-current={ativo === n.id ? 'page' : undefined}
              aria-label={n.label + (n.badge ? `, ${n.badge} pendentes` : '')} title={n.label}>
              <span className="rail-ic"><Icon d={n.icon} />{!aberto && n.badge > 0 && <span className="rail-dot" />}</span>
              {aberto && <span className="lbl" style={{ flexGrow: 1 }}>{n.label}</span>}
              {aberto && n.badge > 0 && <span className="badge">{n.badge}</span>}
            </Link>
          ))}
          {aberto && atual && (
            <Link href={cur ? `/etapa/${cur.id}` : `/trilha/${atual.id}`} className="now-box">
              <span className="l">Estudando agora</span>
              <span className="c"><b>{atual.id}</b><span>{atual.titulo.replace(/^Princípios de /, '')}</span></span>
              <span className="segs" role="img" aria-label={`${feitas} de ${passos.length} etapas`}>
                {passos.map((s) => <span key={s.id} className={feita(s, st.mapas) ? 'on' : s.id === cur?.id ? 'cur' : ''} />)}
              </span>
              <span className="l">{feitas} de {passos.length} etapas</span>
            </Link>
          )}
          <div className="grow" style={{ flexGrow: 1 }} />
          <button className="rail-btn foot toggle" onClick={() => st.setNavOpen(!aberto)} aria-label={aberto ? 'Recolher menu' : 'Abrir menu'} title={aberto ? 'Recolher menu' : 'Abrir menu'}>
            <Icon d={aberto ? P.left : P.right} />{aberto && <span>Recolher</span>}
          </button>
          <Link href="/config" className="rail-btn foot" aria-current={ativo === 'config' ? 'page' : undefined} aria-label="Configurações" title="Configurações">
            <Gear />{aberto && <span className="lbl">Configurações</span>}
          </Link>
        </div>
        )}
      </nav>
      <main className={'main' + (naEtapa ? ' full' : '')}>{children}</main>
    </div>
  );
}
