import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProcessoVinculado {
  id: string;
  processo_origem_id: string;
  processo_vinculado_id: string | null;
  numero_processo_vinculado: string | null;
  tipo_vinculo: string;
  created_at: string;
}

export function useProcessosVinculados() {
  const fetchVinculados = useCallback(async (processoId: string): Promise<ProcessoVinculado[]> => {
    const { data, error } = await supabase
      .from('processos_vinculados' as any)
      .select('*')
      .or(`processo_origem_id.eq.${processoId},processo_vinculado_id.eq.${processoId}`);

    if (error) {
      console.error('Error fetching vinculados:', error);
      return [];
    }
    return (data as any[]) || [];
  }, []);

  const addVinculo = useCallback(async (
    origemId: string,
    vinculadoId: string | null,
    numeroManual: string | null,
    tipoVinculo: string,
  ) => {
    // Insert the main link
    const { error } = await supabase
      .from('processos_vinculados' as any)
      .insert({
        processo_origem_id: origemId,
        processo_vinculado_id: vinculadoId,
        numero_processo_vinculado: numeroManual,
        tipo_vinculo: tipoVinculo,
      } as any);

    if (error) throw error;

    // If linking to an existing process, create reverse link
    if (vinculadoId) {
      const { error: reverseError } = await supabase
        .from('processos_vinculados' as any)
        .insert({
          processo_origem_id: vinculadoId,
          processo_vinculado_id: origemId,
          numero_processo_vinculado: null,
          tipo_vinculo: tipoVinculo,
        } as any);

      if (reverseError) console.error('Error creating reverse link:', reverseError);
    }
  }, []);

  const removeVinculo = useCallback(async (
    vinculoId: string,
    origemId: string,
    vinculadoId: string | null,
  ) => {
    // Delete the main link
    await supabase.from('processos_vinculados' as any).delete().eq('id', vinculoId);

    // Delete the reverse link if it exists
    if (vinculadoId) {
      await supabase
        .from('processos_vinculados' as any)
        .delete()
        .eq('processo_origem_id', vinculadoId)
        .eq('processo_vinculado_id', origemId);
    }
  }, []);

  return { fetchVinculados, addVinculo, removeVinculo };
}
