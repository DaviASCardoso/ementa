// Ícones de traço do protótipo (grade de 24)
export const P = {
  grid: 'M4 5.5A1.5 1.5 0 015.5 4h4A1.5 1.5 0 0111 5.5v4A1.5 1.5 0 019.5 11h-4A1.5 1.5 0 014 9.5zM13 5.5A1.5 1.5 0 0114.5 4h4A1.5 1.5 0 0120 5.5v4a1.5 1.5 0 01-1.5 1.5h-4A1.5 1.5 0 0113 9.5zM4 14.5A1.5 1.5 0 015.5 13h4a1.5 1.5 0 011.5 1.5v4A1.5 1.5 0 019.5 20h-4A1.5 1.5 0 014 18.5zM13 14.5a1.5 1.5 0 011.5-1.5h4a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5h-4a1.5 1.5 0 01-1.5-1.5z',
  path: 'M6 5a2 2 0 100 4 2 2 0 000-4zM18 15a2 2 0 100 4 2 2 0 000-4zM8 7h6a4 4 0 010 8h-4a4 4 0 000 8',
  cards: 'M5 8.5A1.5 1.5 0 016.5 7h9A1.5 1.5 0 0117 8.5v10a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 015 18.5zM8 4h10.5A1.5 1.5 0 0120 5.5V16',
  alert: 'M12 4l8.5 15h-17zM12 10v4M12 16.8v.2',
  list: 'M9 7h10M9 12h10M9 17h10M5 7h.5M5 12h.5M5 17h.5',
  search: 'M10.5 4a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM15.5 15.5L20 20',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  exam: 'M7 3h10v18H7zM10 8h4M10 12h4M10 16h2',
  left: 'M15 6l-6 6 6 6',
  right: 'M9 6l6 6-6 6',
  play: 'M7 4.5v15l13-7.5z',
  pen: 'M4 20h7M14.5 4.5l5 5L10 19H5v-5z',
  ul: 'M9 6h11M9 12h11M9 18h11M4.5 6h.5M4.5 12h.5M4.5 18h.5',
  ol: 'M10 6h10M10 12h10M10 18h10M4 5l1.5-1v5M3.5 18.5h3l-3-3.5a1.5 1.5 0 013-1',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5',
  spark: 'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z',
  palette: 'M12 3a9 9 0 100 18c1 0 1.5-.8 1.5-1.6 0-1.2-1-1.4-1-2.4 0-1 .8-1.5 1.8-1.5H17a4 4 0 004-4c0-4.7-4-8.5-9-8.5zM7.5 11h.01M10 7.5h.01M15 7.5h.01',
  db: 'M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  out: 'M15 4h3.5A1.5 1.5 0 0120 5.5v13a1.5 1.5 0 01-1.5 1.5H15M10 16l-4-4 4-4M6 12h10',
  ext: 'M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 014 18.5v-11A1.5 1.5 0 015.5 6H10',
  trash: 'M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13',
  plus: 'M12 5v14M5 12h14',
  book: 'M5 4.5A1.5 1.5 0 016.5 3H19v15H6.5A1.5 1.5 0 005 19.5zM5 19.5A1.5 1.5 0 006.5 21H19',
};

export function Icon({ d, size = 20, sw = 1.8, fill }: { d: string; size?: number; sw?: number; fill?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function Gear({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
    </svg>
  );
}
