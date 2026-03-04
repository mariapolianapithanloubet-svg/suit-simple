import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CategoriaRow { id: string; nome: string; }
export interface TipoVinculoRow { id: string; nome: string; }
export interface TribunalRow { id: string; nome: string; sigla: string; estado: string | null; }

export function useAdminTables() {
  const [categorias, setCategorias] = useState<CategoriaRow[]>([]);
  const [tiposVinculo, setTiposVinculo] = useState<TipoVinculoRow[]>([]);
  const [tribunais, setTribunais] = useState<TribunalRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [catRes, tvRes, tribRes] = await Promise.all([
      supabase.from('categorias').select('*').order('nome'),
      supabase.from('tipos_vinculo').select('*').order('nome'),
      supabase.from('tribunais').select('*').order('sigla'),
    ]);
    if (catRes.data) setCategorias(catRes.data);
    if (tvRes.data) setTiposVinculo(tvRes.data);
    if (tribRes.data) setTribunais(tribRes.data as TribunalRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Categorias CRUD
  const addCategoria = async (nome: string) => {
    const { error } = await supabase.from('categorias').insert({ nome });
    if (error) throw error;
    await fetchAll();
  };
  const updateCategoria = async (id: string, nome: string) => {
    const { error } = await supabase.from('categorias').update({ nome }).eq('id', id);
    if (error) throw error;
    await fetchAll();
  };
  const deleteCategoria = async (id: string) => {
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  // Tipos Vínculo CRUD
  const addTipoVinculo = async (nome: string) => {
    const { error } = await supabase.from('tipos_vinculo').insert({ nome });
    if (error) throw error;
    await fetchAll();
  };
  const updateTipoVinculo = async (id: string, nome: string) => {
    const { error } = await supabase.from('tipos_vinculo').update({ nome }).eq('id', id);
    if (error) throw error;
    await fetchAll();
  };
  const deleteTipoVinculo = async (id: string) => {
    const { error } = await supabase.from('tipos_vinculo').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  // Tribunais CRUD
  const addTribunal = async (data: { nome: string; sigla: string; estado?: string }) => {
    const { error } = await supabase.from('tribunais').insert({
      nome: data.nome,
      sigla: data.sigla,
      estado: data.estado || null,
    } as any);
    if (error) throw error;
    await fetchAll();
  };
  const updateTribunal = async (id: string, data: { nome: string; sigla: string; estado?: string }) => {
    const { error } = await supabase.from('tribunais').update({
      nome: data.nome,
      sigla: data.sigla,
      estado: data.estado || null,
    } as any).eq('id', id);
    if (error) throw error;
    await fetchAll();
  };
  const deleteTribunal = async (id: string) => {
    const { error } = await supabase.from('tribunais').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  return {
    categorias, tiposVinculo, tribunais, loading,
    addCategoria, updateCategoria, deleteCategoria,
    addTipoVinculo, updateTipoVinculo, deleteTipoVinculo,
    addTribunal, updateTribunal, deleteTribunal,
  };
}
