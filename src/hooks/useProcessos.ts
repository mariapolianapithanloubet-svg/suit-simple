// =====================================================================
// hooks/useProcessos.ts — versão Fase 1
// Faz a leitura/gravação alinhada com o novo modelo:
// - relevância em vez de categoria
// - classe/tribunal/órgão julgador/telefone por instância
// - observacoes substitui o uso confuso de status
// =====================================================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Processo, Documento, Grupo, Relevancia, FaseAtual, Competencia, ClienteEscritorio,
} from '@/types/process';

function rowToProcesso(row: any): Processo {
  const numeroOrigem = row.primeira_instancia_numero || row.numero || '';
  return {
    id: row.id,
    estado: row.estado || '',
    competencia: (row.competencia || 'Estadual') as Competencia,
    relevancia: ((row.relevancia || 'acompanhamento') as Relevancia),
    autor: row.autor || '',
    reu: row.reu || '',
    clienteEscritorio: (row.cliente_escritorio || 'Autor') as ClienteEscritorio,
    grupoId: row.grupo_id || undefined,
    faseAtual: (row.fase_atual || 'PRIMEIRA_INSTANCIA') as FaseAtual,

    primeiraInstanciaNumero: numeroOrigem,
    primeiraInstanciaClasse: row.primeira_instancia_classe ?? row.tipo_acao ?? null,
    primeiraInstanciaTribunal: row.tribunal_primeira_instancia ?? null,
    primeiraInstanciaOrgaoJulgador: row.primeira_instancia_orgao_julgador ?? row.primeira_instancia_vara ?? null,
    primeiraInstanciaComarca: row.primeira_instancia_comarca ?? null,
    primeiraInstanciaTelefone: row.primeira_instancia_telefone ?? row.telefone_secretaria ?? null,
    sistemaAcesso: row.sistema_acesso || null,

    segundaInstanciaNumero: row.segunda_instancia_numero ?? null,
    segundaInstanciaClasse: row.segunda_instancia_classe ?? row.segunda_instancia_tipo_recurso ?? null,
    segundaInstanciaTribunal: row.segunda_instancia_tribunal ?? null,
    segundaInstanciaOrgaoJulgador: row.segunda_instancia_orgao_julgador ?? row.segunda_instancia_turma_camara ?? null,
    segundaInstanciaTelefone: row.segunda_instancia_telefone ?? null,

    tribunalSuperiorNome: (row.tribunal_superior_nome ?? null) as 'STJ' | 'STF' | null,
    tribunalSuperiorNumero: row.tribunal_superior_numero ?? null,
    tribunalSuperiorClasse: row.tribunal_superior_classe ?? null,
    tribunalSuperiorOrgaoJulgador: row.tribunal_superior_orgao_julgador ?? row.tribunal_superior_turma ?? null,
    tribunalSuperiorTelefone: row.tribunal_superior_telefone ?? null,

    senhaAcesso: row.senha_acesso || '',
    ultimaMovimentacao: row.ultima_movimentacao || '',
    observacoes: row.observacoes ?? row.status ?? '',

    documentos: [],
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,

    numero: numeroOrigem,
    categoria: row.categoria,
    tipoAcao: row.primeira_instancia_classe ?? row.tipo_acao,
    varaCamaraTurma: row.primeira_instancia_orgao_julgador ?? row.primeira_instancia_vara ?? '',
    telefoneSecretaria: row.primeira_instancia_telefone ?? row.telefone_secretaria ?? '',
    telefoneAssessoria: row.telefone_assessoria || '',
    primeiraInstanciaVara: row.primeira_instancia_orgao_julgador ?? row.primeira_instancia_vara ?? null,
    segundaInstanciaTipoRecurso: row.segunda_instancia_classe ?? row.segunda_instancia_tipo_recurso ?? null,
    segundaInstanciaTurmaCamara: row.segunda_instancia_orgao_julgador ?? row.segunda_instancia_turma_camara ?? null,
    tribunalSuperiorTurma: row.tribunal_superior_orgao_julgador ?? row.tribunal_superior_turma ?? null,
    status: row.observacoes ?? row.status ?? '',
  };
}

function processoToRow(data: any) {
  const out: Record<string, any> = {};

  const v = (...keys: string[]) => {
    for (const k of keys) {
      if (data[k] !== undefined) return data[k];
    }
    return undefined;
  };

  const numeroOrigem = v('primeiraInstanciaNumero', 'numero');
  if (numeroOrigem !== undefined) {
    out.numero = numeroOrigem || '';
    out.primeira_instancia_numero = numeroOrigem || null;
  }

  if (v('estado') !== undefined) out.estado = data.estado || '';
  if (v('competencia') !== undefined) out.competencia = data.competencia;
  if (v('relevancia') !== undefined) out.relevancia = data.relevancia;
  if (v('autor') !== undefined) out.autor = data.autor || '';
  if (v('reu') !== undefined) out.reu = data.reu || null;
  if (v('clienteEscritorio') !== undefined) out.cliente_escritorio = data.clienteEscritorio;
  if (v('grupoId') !== undefined) out.grupo_id = data.grupoId || null;
  if (v('faseAtual') !== undefined) out.fase_atual = data.faseAtual;

  const cls1 = v('primeiraInstanciaClasse', 'tipoAcao');
  if (cls1 !== undefined) {
    out.primeira_instancia_classe = cls1 || null;
    out.tipo_acao = cls1 || '';
  }

  if (v('primeiraInstanciaTribunal', 'tribunalPrimeiraInstancia') !== undefined) {
    out.tribunal_primeira_instancia = v('primeiraInstanciaTribunal', 'tribunalPrimeiraInstancia') || null;
  }

  const org1 = v('primeiraInstanciaOrgaoJulgador', 'primeiraInstanciaVara', 'varaCamaraTurma');
  if (org1 !== undefined) {
    out.primeira_instancia_orgao_julgador = org1 || null;
    out.primeira_instancia_vara = org1 || null;
    out.vara_camara_turma = org1 || '';
  }

  if (v('primeiraInstanciaComarca') !== undefined) {
    out.primeira_instancia_comarca = data.primeiraInstanciaComarca || null;
  }

  const tel1 = v('primeiraInstanciaTelefone', 'telefoneSecretaria');
  if (tel1 !== undefined) {
    out.primeira_instancia_telefone = tel1 || null;
    out.telefone_secretaria = tel1 || '';
  }
  if (v('telefoneAssessoria') !== undefined) out.telefone_assessoria = data.telefoneAssessoria || '';

  if (v('sistemaAcesso') !== undefined) out.sistema_acesso = data.sistemaAcesso || null;

  if (v('segundaInstanciaNumero') !== undefined) out.segunda_instancia_numero = data.segundaInstanciaNumero || null;

  const cls2 = v('segundaInstanciaClasse', 'segundaInstanciaTipoRecurso');
  if (cls2 !== undefined) {
    out.segunda_instancia_classe = cls2 || null;
    out.segunda_instancia_tipo_recurso = cls2 || null;
  }

  if (v('segundaInstanciaTribunal') !== undefined) out.segunda_instancia_tribunal = data.segundaInstanciaTribunal || null;

  const org2 = v('segundaInstanciaOrgaoJulgador', 'segundaInstanciaTurmaCamara');
  if (org2 !== undefined) {
    out.segunda_instancia_orgao_julgador = org2 || null;
    out.segunda_instancia_turma_camara = org2 || null;
  }

  if (v('segundaInstanciaTelefone') !== undefined) out.segunda_instancia_telefone = data.segundaInstanciaTelefone || null;

  if (v('tribunalSuperiorNome') !== undefined) out.tribunal_superior_nome = data.tribunalSuperiorNome || null;
  if (v('tribunalSuperiorNumero') !== undefined) out.tribunal_superior_numero = data.tribunalSuperiorNumero || null;
  if (v('tribunalSuperiorClasse') !== undefined) out.tribunal_superior_classe = data.tribunalSuperiorClasse || null;

  const orgS = v('tribunalSuperiorOrgaoJulgador', 'tribunalSuperiorTurma');
  if (orgS !== undefined) {
    out.tribunal_superior_orgao_julgador = orgS || null;
    out.tribunal_superior_turma = orgS || null;
  }

  if (v('tribunalSuperiorTelefone') !== undefined) out.tribunal_superior_telefone = data.tribunalSuperiorTelefone || null;

  if (v('senhaAcesso') !== undefined) out.senha_acesso = data.senhaAcesso || '';
  if (v('ultimaMovimentacao') !== undefined) out.ultima_movimentacao = data.ultimaMovimentacao || '';

  const obs = v('observacoes', 'status');
  if (obs !== undefined) {
    out.observacoes = obs || '';
    out.status = obs || '';
  }

  if (data.relevancia !== undefined) {
    out.categoria = data.relevancia === 'relevante' ? 'Relevante' : 'Mero Acompanhamento';
  } else if (data.categoria !== undefined) {
    out.categoria = data.categoria;
    const c = String(data.categoria).toLowerCase();
    if (c.includes('relevante')) out.relevancia = 'relevante';
    else out.relevancia = 'acompanhamento';
  }

  return out;
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
      const { data: gruposData } = await supabase.from('grupos').select('*');
      if (gruposData) {
        const grupoMap = new Map(gruposData.map((g: any) => [g.id, g.nome]));
        mapped.forEach(p => {
          if (p.grupoId) p.grupoNome = grupoMap.get(p.grupoId);
        });
      }
      setProcessos(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchGrupos(); }, [fetchGrupos]);
  useEffect(() => { fetchProcessos(); }, [fetchProcessos]);

  const addGrupo = useCallback(async (nome: string) => {
    const { data, error } = await supabase.from('grupos').insert({ nome }).select().single();
    if (error) throw error;
    const grupo: Grupo = { id: data.id, nome: data.nome };
    setGrupos(prev => [...prev, grupo].sort((a, b) => a.nome.localeCompare(b.nome)));
    return grupo;
  }, []);

  const addProcesso = useCallback(async (data: any) => {
    const row = processoToRow(data);
    if (!row.competencia) row.competencia = data.competencia || 'Estadual';
    if (!row.cliente_escritorio) row.cliente_escritorio = data.clienteEscritorio || 'Autor';
    if (!row.autor) row.autor = data.autor || '';
    if (!row.numero) row.numero = data.primeiraInstanciaNumero || data.numero || '';
    if (!row.categoria) row.categoria = (data.relevancia === 'relevante') ? 'Relevante' : 'Mero Acompanhamento';
    if (!row.fase_atual) row.fase_atual = data.faseAtual || 'PRIMEIRA_INSTANCIA';

    const { data: inserted, error } = await supabase.from('processos').insert(row).select().single();
    if (error) throw error;
    await fetchProcessos();
    return inserted ? rowToProcesso(inserted) : null;
  }, [fetchProcessos]);

  const updateProcesso = useCallback(async (id: string, data: any) => {
    const updates = processoToRow(data);
    if (Object.keys(updates).length === 0) return;
    const { error } = await supabase.from('processos').update(updates).eq('id', id);
    if (error) throw error;
    await fetchProcessos();
  }, [fetchProcessos]);

  const deleteProcesso = useCallback(async (id: string) => {
    await supabase.from('processos').delete().eq('id', id);
    await fetchProcessos();
  }, [fetchProcessos]);

  const uploadDocumento = useCallback(async (
    processoId: string, file: File, tipo: string, pasta: string, observacao?: string,
  ) => {
    const filePath = `${processoId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documentos').upload(filePath, file);
    if (uploadError) return null;
    const { data: publicUrl } = supabase.storage.from('documentos').getPublicUrl(filePath);
    const { error } = await supabase.from('documentos').insert({
      processo_id: processoId, nome: file.name, tipo, pasta,
      observacao: observacao || '',
      arquivo_url: publicUrl.publicUrl, arquivo_path: filePath,
    });
    if (!error) await fetchProcessos();
    return !error;
  }, [fetchProcessos]);

  const deleteDocumento = useCallback(async (docId: string, filePath?: string) => {
    if (filePath) await supabase.storage.from('documentos').remove([filePath]);
    await supabase.from('documentos').delete().eq('id', docId);
    await fetchProcessos();
  }, [fetchProcessos]);

  const bulkImport = useCallback(async (rows: Array<Record<string, any>>) => {
    const { data: existing } = await supabase.from('processos').select('numero');
    const existingNumbers = new Set((existing || []).map((r: any) => r.numero));
    const uniqueRows = rows.filter(r => !existingNumbers.has(r.numero));
    const skipped = rows.length - uniqueRows.length;
    if (uniqueRows.length > 0) {
      const inserts = uniqueRows.map(r => ({ ...r, origem: 'importacao' }));
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

  return {
    processos, grupos, loading,
    addProcesso, updateProcesso, deleteProcesso,
    uploadDocumento, deleteDocumento,
    bulkImport, clearImported,
    addGrupo, updateGrupo, deleteGrupo,
    refetch: fetchProcessos,
  };
}
