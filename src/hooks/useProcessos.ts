import { useState, useEffect, useCallback } from 'react';
import { Processo } from '@/types/process';


const STORAGE_KEY = 'juridico_processos';

function loadProcessos(): Processo[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveProcessos(processos: Processo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(processos));
}

export function useProcessos() {
  const [processos, setProcessos] = useState<Processo[]>(loadProcessos);

  useEffect(() => {
    saveProcessos(processos);
  }, [processos]);

  const addProcesso = useCallback((data: Omit<Processo, 'id' | 'criadoEm' | 'atualizadoEm' | 'documentos'>) => {
    const now = new Date().toISOString();
    const novo: Processo = {
      ...data,
      id: crypto.randomUUID(),
      documentos: [],
      criadoEm: now,
      atualizadoEm: now,
    };
    setProcessos(prev => [...prev, novo]);
    return novo;
  }, []);

  const updateProcesso = useCallback((id: string, data: Partial<Processo>) => {
    setProcessos(prev => prev.map(p =>
      p.id === id ? { ...p, ...data, atualizadoEm: new Date().toISOString() } : p
    ));
  }, []);

  const deleteProcesso = useCallback((id: string) => {
    setProcessos(prev => prev.filter(p => p.id !== id));
  }, []);

  return { processos, addProcesso, updateProcesso, deleteProcesso };
}
