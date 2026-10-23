// A chave do Gemini fica só neste aparelho (localStorage) e não vai para o banco nem para o backup.
const K = 'ementa.gemini';
export const lerChave = () => { try { return localStorage.getItem(K) || ''; } catch { return ''; } };
export const gravarChave = (v: string) => { try { if (v) localStorage.setItem(K, v); else localStorage.removeItem(K); } catch {} };
