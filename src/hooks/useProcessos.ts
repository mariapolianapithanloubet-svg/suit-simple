import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Processo, Documento, Grupo } from '@/types/process';

function rowToProcesso(row: any): Processo {
  return {
    id: row.id,
    numero: row.numero,
    tipoAcao: row.tipo_acao,
    estado: row.estado,
    competencia: row.competencia,
    categoria: row.categoria,
    autor: row.autor,
    reu: row.reu || '',
    clienteEscritorio: row.cliente_escritorio,
    varaCamaraTurma: row.vara_camara_turma,
    sistemaAcesso: row.sistema_acesso,
    telefoneSecretaria: row.telefone_secretaria,
    telefoneAssessoria: row.telefone_assessoria || '',
    senhaAcesso: row.senha_acesso,
    status: row.status,
    ultimaMovimentacao: row.ultima_movimentacao,
    grupoId: row.grupo_id || undefined,
    documentos: [],
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

export function useProcessos() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGrupos = useCallback(async () => {
    const { data } = await supabase.from('grupos').select('*').order('nome');
    if (data) setGrupos(data.map((g: any) => ({ id: g.id, nome: g.nome })));
  }, []);

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

      // Enrich with grupo names
      if (grupos.length > 0) {
        const grupoMap = new Map(grupos.map(g => [g.id, g.nome]));
        mapped.forEach(p => {
          if (p.grupoId) p.grupoNome = grupoMap.get(p.grupoId);
        });
      }

      setProcessos(mapped);
    }
    setLoading(false);
  }, [grupos]);

  useEffect(() => {
    fetchGrupos();
  }, [fetchGrupos]);

  useEffect(() => {
    fetchProcessos();
  }, [fetchProcessos]);

  const addGrupo = useCallback(async (nome: string) => {
    const { data, error } = await supabase.from('grupos').insert({ nome }).select().single();
    if (error) throw error;
    const grupo: Grupo = { id: data.id, nome: data.nome };
    setGrupos(prev => [...prev, grupo].sort((a, b) => a.nome.localeCompare(b.nome)));
    return grupo;
  }, []);

  const addProcesso = useCallback(async (data: Omit<Processo, 'id' | 'criadoEm' | 'atualizadoEm' | 'documentos'>) => {
    const { data: row, error } = await supabase.from('processos').insert({
      numero: data.numero,
      tipo_acao: data.tipoAcao,
      estado: data.estado,
      competencia: data.competencia,
      categoria: data.categoria,
      autor: data.autor,
      reu: data.reu || null,
      cliente_escritorio: data.clienteEscritorio,
      vara_camara_turma: data.varaCamaraTurma,
      sistema_acesso: data.sistemaAcesso,
      telefone_secretaria: data.telefoneSecretaria,
      telefone_assessoria: data.telefoneAssessoria || '',
      senha_acesso: data.senhaAcesso,
      status: data.status,
      ultima_movimentacao: data.ultimaMovimentacao,
      grupo_id: data.grupoId || null,
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
    if (data.competencia !== undefined) updates.competencia = data.competencia;
    if (data.categoria !== undefined) updates.categoria = data.categoria;
    if (data.autor !== undefined) updates.autor = data.autor;
    if (data.reu !== undefined) updates.reu = data.reu || null;
    if (data.clienteEscritorio !== undefined) updates.cliente_escritorio = data.clienteEscritorio;
    if (data.varaCamaraTurma !== undefined) updates.vara_camara_turma = data.varaCamaraTurma;
    if (data.sistemaAcesso !== undefined) updates.sistema_acesso = data.sistemaAcesso;
    if (data.telefoneSecretaria !== undefined) updates.telefone_secretaria = data.telefoneSecretaria;
    if (data.telefoneAssessoria !== undefined) updates.telefone_assessoria = data.telefoneAssessoria;
    if (data.senhaAcesso !== undefined) updates.senha_acesso = data.senhaAcesso;
    if (data.status !== undefined) updates.status = data.status;
    if (data.ultimaMovimentacao !== undefined) updates.ultima_movimentacao = data.ultimaMovimentacao;
    if (data.grupoId !== undefined) updates.grupo_id = data.grupoId || null;

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

  const bulkImport = useCallback(async (rows: Omit<Processo, 'id' | 'criadoEm' | 'atualizadoEm' | 'documentos'>[]) => {
    const { data: existing } = await supabase.from('processos').select('numero');
    const existingNumbers = new Set((existing || []).map((r: any) => r.numero));
    const uniqueRows = rows.filter(r => !existingNumbers.has(r.numero));
    const skipped = rows.length - uniqueRows.length;

    if (uniqueRows.length > 0) {
      const inserts = uniqueRows.map(data => ({
        numero: data.numero,
        tipo_acao: data.tipoAcao,
        estado: data.estado,
        competencia: data.competencia || 'Estadual',
        categoria: data.categoria || 'Mero Acompanhamento',
        autor: data.autor,
        reu: data.reu || null,
        cliente_escritorio: data.clienteEscritorio || 'Autor',
        vara_camara_turma: data.varaCamaraTurma,
        sistema_acesso: data.sistemaAcesso,
        telefone_secretaria: data.telefoneSecretaria,
        telefone_assessoria: data.telefoneAssessoria || '',
        senha_acesso: data.senhaAcesso,
        status: data.status || '',
        ultima_movimentacao: data.ultimaMovimentacao,
        origem: 'importacao',
      }));
      const { error } = await supabase.from('processos').insert(inserts);
      if (error) throw error;
      await fetchProcessos();
    }

    return { imported: uniqueRows.length, skipped };
  }, [fetchProcessos]);

  const clearImported = useCallback(async () => {
    const { error } = await supabase.from('processos').delete().eq('origem', 'importacao');
    if (error) throw error;
    await fetchProcessos();
  }, [fetchProcessos]);

  const updateGrupo = useCallback(async (id: string, nome: string) => {
    const { error } = await supabase.from('grupos').update({ nome }).eq('id', id);
    if (error) throw error;
    setGrupos(prev => prev.map(g => g.id === id ? { ...g, nome } : g).sort((a, b) => a.nome.localeCompare(b.nome)));
  }, []);

  const deleteGrupo = useCallback(async (id: string) => {
    const { error } = await supabase.from('grupos').delete().eq('id', id);
    if (error) throw error;
    setGrupos(prev => prev.filter(g => g.id !== id));
  }, []);

  return { processos, grupos, loading, addProcesso, updateProcesso, deleteProcesso, uploadDocumento, deleteDocumento, bulkImport, clearImported, addGrupo, updateGrupo, deleteGrupo, refetch: fetchProcessos };
}
