'use client';

// Carrega a IFrame API do YouTube uma vez e devolve o construtor.
export type YTPlayer = {
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  seekTo(s: number, allowSeekAhead: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
  setPlaybackRate(r: number): void;
  loadVideoById(o: { videoId: string; startSeconds?: number; endSeconds?: number }): void;
  cueVideoById(o: { videoId: string; startSeconds?: number; endSeconds?: number }): void;
  setOption(mod: string, opt: string, val: unknown): void;
  destroy(): void;
};
type YTNamespace = {
  Player: new (el: HTMLElement, o: {
    videoId: string; host?: string;
    playerVars?: Record<string, string | number>;
    events?: { onReady?: () => void; onStateChange?: (e: { data: number }) => void };
  }) => YTPlayer;
};

declare global {
  interface Window { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void }
}

let carregando: Promise<YTNamespace> | null = null;

export function carregarYT(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  carregando ??= new Promise((ok) => {
    const antes = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { antes?.(); ok(window.YT!); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  });
  return carregando;
}

export const ESTADO = { FIM: 0, TOCANDO: 1, PAUSADO: 2 };
export const velocidade = (s: string) => parseFloat(s.replace(',', '.').replace('×', '')) || 1;
