export type Course = {
  id: string;
  ordem: number;
  titulo: string;
  versao: string;
  professor: string;
  base: string;
  nota_minima: number;
  tem: string[];
  falta: string;
  aviso: string;
  alternativa: boolean;
};

export type Video = { yt: string; start: number | null; end: number | null; titulo: string };
export type Arquivo = { rotulo: string; url: string; papel: 'leitura' | 'material' | 'enunciado' | 'gabarito' | 'transcricao' | 'dados' };

export type Step = {
  id: string;
  course_id: string;
  ordem: number;
  tipo: 'aula' | 'lista' | 'prova';
  n: string | null;
  titulo: string;
  titulo_original: string | null;
  grupo: string | null;
  sub: string | null;
  sugestao: boolean;
  opcional: boolean;
  revisao: boolean;
  treino: boolean;
  final: boolean;
  pagina: string | null;
  videos: Video[];
  arquivos: Arquivo[];
  gabarito_junto: boolean;
};

export type Progress = { step_id: string; feito: boolean; feito_em: string | null; posicao: number; clip: number; updated_at?: string };
export type Note = { step_id: string; html: string; marcas: number[]; updated_at?: string };
export type Card = {
  id: string; step_id: string | null; frente: string; verso: string; criada_em: string;
  vence: string; intervalo: number; facilidade: number; repeticoes: number; lapsos: number; revisada_em: string | null;
};
export type Resposta = { q: string; texto: string };
export type Submission = { step_id: string; respostas: Resposta[]; entregue_em: string | null; nota: number | null; correcao: string | null; updated_at?: string };
export type Mistake = { id: string; step_id: string | null; origem: string; descricao: string; vence: string; resolvido: boolean; criado_em: string };

export type Settings = {
  minGrade: string; lockdown: boolean; hideKey: boolean;
  speed: string; autoDone: string; subs: string; foldNav: boolean;
  nbFont: string; nbSize: string; autoStamp: boolean; pauseTyping: boolean;
  newCards: string; perSession: string; typing: boolean; redo: string;
  rigor: string; scale: string; calm: boolean;
};

export const PADRAO: Settings = {
  minGrade: '7,0', lockdown: true, hideKey: true,
  speed: '1,5×', autoDone: '90%', subs: 'Inglês', foldNav: true,
  nbFont: 'Serifada', nbSize: 'Médio', autoStamp: true, pauseTyping: true,
  newCards: '20', perSession: 'Todas', typing: false, redo: '7 dias',
  rigor: 'Padrão', scale: '100%', calm: false,
};

export type Dados = {
  progress: Progress[];
  notes: Pick<Note, 'step_id' | 'marcas'>[];
  cards: Card[];
  submissions: Submission[];
  mistakes: Mistake[];
  settings: Partial<Settings>;
};
