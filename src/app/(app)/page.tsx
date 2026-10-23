'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/Store';

// O início é a trilha da matéria que você está estudando.
export default function Inicio() {
  const { atual } = useStore();
  const router = useRouter();
  useEffect(() => { router.replace(atual ? `/trilha/${atual}` : '/materias'); }, [atual, router]);
  return null;
}
