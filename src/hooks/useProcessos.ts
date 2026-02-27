import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Processo, Documento } from '@/types/process';

function rowToProcesso(row: any): Processo {
  return {
    id: row.id,
    numero: row.numero,
    tipoAcao: row.tipo_acao,
    estado: row.estado,
    esfera: row.esfera,
    categoria: row.categoria,
    autor: row.autor,
    reu: row.reu,
    clienteEscritorio: row.cliente_escritorio,
    varaCamaraTurma: row.vara_camara_turma,
    sistemaAcesso: row.sistema_acesso,
    telefoneSecretaria: row.telefone_secretaria,
    telefoneAssessoria: row.telefone_assessoria || '',
    senhaAcesso: row.senha_acesso,
    status: row.status,
    ultimaMovimentacao: row.ultima_movimentacao,
    dataUltimoAcompanhamento: row.data_ultimo_acompanhamento || '',
    valorExecucao: row.valor_execucao ? Number(row.valor_execucao) : undefined,
    dataBaseCalculo: row.data_base_calculo || '',
    documentos: [],
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

export function useProcessos() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProcessos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('processos')
      .select('*')
      .order('criado_em', { ascending: false });

    if (!error && data) {
      const mapped = data.map(rowToProcesso);
      const { data: docs } = await supabase.from('documentos').select('*');
      if (docs) {
        const docsByProcesso: Record<string, Documento[]> = {};
        docs.forEach((d: any) => {
          if (!docsByProcesso[d.processo_id]) docsByProcesso[d.processo_id] = [];
          docsByProcesso[d.processo_id].push({
            id: d.id,
            nome: d.nome,
            tipo: d.tipo,
            pasta: d.pasta || 'Outros',
            observacao: d.observacao || '',
            dataUpload: d.data_upload,
            arquivoUrl: d.arquivo_url,
            arquivoPath: d.arquivo_path,
          });
        });
        mapped.forEach(p => {
          p.documentos = docsByProcesso[p.id] || [];
        });
      }
      setProcessos(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProcessos();
  }, [fetchProcessos]);

  const addProcesso = useCallback(async (data: Omit<Processo, 'id' | 'criadoEm' | 'atualizadoEm' | 'documentos'>) => {
    const { data: row, error } = await supabase.from('processos').insert({
      numero: data.numero,
      tipo_acao: data.tipoAcao,
      estado: data.estado,
      esfera: data.esfera,
      categoria: data.categoria,
      autor: data.autor,
      reu: data.reu,
      cliente_escritorio: data.clienteEscritorio,
      vara_camara_turma: data.varaCamaraTurma,
      sistema_acesso: data.sistemaAcesso,
      telefone_secretaria: data.telefoneSecretaria,
      telefone_assessoria: data.telefoneAssessoria || '',
      senha_acesso: data.senhaAcesso,
      status: data.status,
      ultima_movimentacao: data.ultimaMovimentacao,
      data_ultimo_acompanhamento: data.dataUltimoAcompanhamento || null,
      valor_execucao: data.valorExecucao || null,
      data_base_calculo: data.dataBaseCalculo || null,
    }).select().single();

    if (!error && row) {
      await fetchProcessos();
      return rowToProcesso(row);
    }
    return null;
  }, [fetchProcessos]);

  const updateProcesso = useCallback(async (id: string, data: Partial<Processo>) => {
    const updates: any = {};
    if (data.numero !== undefined) updates.numero = data.numero;
    if (data.tipoAcao !== undefined) updates.tipo_acao = data.tipoAcao;
    if (data.estado !== undefined) updates.estado = data.estado;
    if (data.esfera !== undefined) updates.esfera = data.esfera;
    if (data.categoria !== undefined) updates.categoria = data.categoria;
    if (data.autor !== undefined) updates.autor = data.autor;
    if (data.reu !== undefined) updates.reu = data.reu;
    if (data.clienteEscritorio !== undefined) updates.cliente_escritorio = data.clienteEscritorio;
    if (data.varaCamaraTurma !== undefined) updates.vara_camara_turma = data.varaCamaraTurma;
    if (data.sistemaAcesso !== undefined) updates.sistema_acesso = data.sistemaAcesso;
    if (data.telefoneSecretaria !== undefined) updates.telefone_secretaria = data.telefoneSecretaria;
    if (data.telefoneAssessoria !== undefined) updates.telefone_assessoria = data.telefoneAssessoria;
    if (data.senhaAcesso !== undefined) updates.senha_acesso = data.senhaAcesso;
    if (data.status !== undefined) updates.status = data.status;
    if (data.ultimaMovimentacao !== undefined) updates.ultima_movimentacao = data.ultimaMovimentacao;
    if (data.dataUltimoAcompanhamento !== undefined) updates.data_ultimo_acompanhamento = data.dataUltimoAcompanhamento || null;
    if (data.valorExecucao !== undefined) updates.valor_execucao = data.valorExecucao || null;
    if (data.dataBaseCalculo !== undefined) updates.data_base_calculo = data.dataBaseCalculo || null;

    await supabase.from('processos').update(updates).eq('id', id);
    await fetchProcessos();
  }, [fetchProcessos]);

  const deleteProcesso = useCallback(async (id: string) => {
    await supabase.from('processos').delete().eq('id', id);
    await fetchProcessos();
  }, [fetchProcessos]);

  const uploadDocumento = useCallback(async (processoId: string, file: File, tipo: string, pasta: string, observacao?: string) => {
    const filePath = `${processoId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documentos').upload(filePath, file);
    if (uploadError) return null;

    const { data: publicUrl } = supabase.storage.from('documentos').getPublicUrl(filePath);

    const { error } = await supabase.from('documentos').insert({
      processo_id: processoId,
      nome: file.name,
      tipo,
      pasta,
      observacao: observacao || '',
      arquivo_url: publicUrl.publicUrl,
      arquivo_path: filePath,
    });

    if (!error) await fetchProcessos();
    return !error;
  }, [fetchProcessos]);

  const deleteDocumento = useCallback(async (docId: string, filePath?: string) => {
    if (filePath) {
      await supabase.storage.from('documentos').remove([filePath]);
    }
    await supabase.from('documentos').delete().eq('id', docId);
    await fetchProcessos();
  }, [fetchProcessos]);

  return { processos, loading, addProcesso, updateProcesso, deleteProcesso, uploadDocumento, deleteDocumento, refetch: fetchProcessos };
}
