'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { useStore } from '@/components/Store';
import { Aula } from '@/components/Aula';
import { Lista } from '@/components/Lista';

export default function Etapa({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = use(params);
  const st = useStore();
  const s = st.step(id.map(decodeURIComponent).join('/'));
  if (!s) notFound();
  // a chave recria a tela ao trocar de etapa (player, caderno e respostas)
  return s.tipo === 'aula' ? <Aula key={s.id} s={s} /> : <Lista key={s.id} s={s} />;
}
