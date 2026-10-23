export const metadata = { title: 'Entrar · Ementa' };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ erro?: string; volta?: string }> }) {
  const { erro, volta } = await searchParams;
  return (
    <main className="login">
      <form method="post" action="/api/entrar">
        <div className="brand" style={{ padding: '0 0 6px' }}>
          <span className="brand-e" style={{ background: 'var(--forest)', color: 'var(--paper)' }}>e</span>
          <span className="brand-t">
            <b style={{ color: 'var(--ink)' }}>ementa</b>
            <span style={{ color: 'var(--faint)' }}>economia pelo MIT</span>
          </span>
        </div>
        <label htmlFor="senha" style={{ fontWeight: 500 }}>Senha</label>
        <input id="senha" name="senha" type="password" className="field" autoComplete="current-password" autoFocus required />
        <input type="hidden" name="volta" value={volta || '/'} />
        {erro && <p role="alert" className="notice warn" style={{ margin: 0 }}>Senha errada. Tente de novo.</p>}
        <button className="btn forest" type="submit" style={{ minHeight: 44 }}>Entrar</button>
      </form>
    </main>
  );
}
