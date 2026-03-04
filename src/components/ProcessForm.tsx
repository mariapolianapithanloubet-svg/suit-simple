import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Processo, Grupo, COMPETENCIAS, ESTADOS_BRASIL, TIPOS_RECURSO, TRIBUNAIS_SUPERIORES, SISTEMAS_ACESSO, Competencia, FaseAtual } from '@/types/process';
import { CategoriaRow, TipoVinculoRow, TribunalRow } from '@/hooks/useAdminTables';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, ArrowLeft, Plus, Trash2, Link } from 'lucide-react';
import { toast } from 'sonner';
import { useProcessosVinculados, ProcessoVinculado } from '@/hooks/useProcessosVinculados';
import { Badge } from '@/components/ui/badge';

interface VinculoEntry {
  id?: string; // existing DB id
  processoVinculadoId: string | null;
  numeroManual: string;
  tipoVinculo: string;
  isExisting: boolean; // true = select from system, false = manual
}

interface ProcessFormProps {
  initialData?: Processo;
  onSubmit: (data: Omit<Processo, 'id' | 'criadoEm' | 'atualizadoEm' | 'documentos'>) => void | Promise<any>;
  mode: 'create' | 'edit';
  grupos?: Grupo[];
  processos?: Processo[];
  categorias?: CategoriaRow[];
  tiposVinculo?: TipoVinculoRow[];
  tribunais?: TribunalRow[];
}

export function ProcessForm({ initialData, onSubmit, mode, grupos = [], processos = [], categorias = [], tiposVinculo = [], tribunais = [] }: ProcessFormProps) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const { fetchVinculados, addVinculo, removeVinculo } = useProcessosVinculados();
  const [vinculos, setVinculos] = useState<VinculoEntry[]>([]);
  const [existingVinculoIds, setExistingVinculoIds] = useState<Set<string>>(new Set());
  const [removedVinculos, setRemovedVinculos] = useState<ProcessoVinculado[]>([]);

  // Load existing vinculos in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData?.id) {
      fetchVinculados(initialData.id).then(data => {
        const entries: VinculoEntry[] = data
          .filter(v => v.processo_origem_id === initialData.id)
          .map(v => ({
            id: v.id,
            processoVinculadoId: v.processo_vinculado_id,
            numeroManual: v.numero_processo_vinculado || '',
            tipoVinculo: v.tipo_vinculo,
            isExisting: !!v.processo_vinculado_id,
          }));
        setVinculos(entries);
        setExistingVinculoIds(new Set(entries.filter(e => e.id).map(e => e.id!)));
      });
    }
  }, [mode, initialData?.id, fetchVinculados]);
  const [form, setForm] = useState({
    numero: initialData?.numero || '',
    tipoAcao: initialData?.tipoAcao || '',
    estado: initialData?.estado || '',
    competencia: (initialData?.competencia || '') as Competencia | '',
    categoria: (initialData?.categoria || '') as string,
    autor: initialData?.autor || '',
    reu: initialData?.reu || '',
    clienteEscritorio: (initialData?.clienteEscritorio || '') as 'Autor' | 'Réu' | '',
    varaCamaraTurma: initialData?.varaCamaraTurma || '',
    sistemaAcesso: initialData?.sistemaAcesso || '',
    telefoneSecretaria: initialData?.telefoneSecretaria || '',
    senhaAcesso: initialData?.senhaAcesso || '',
    status: initialData?.status || '',
    ultimaMovimentacao: initialData?.ultimaMovimentacao || '',
    grupoId: initialData?.grupoId || '',
    // Multi-instance
    primeiraInstanciaNumero: initialData?.primeiraInstanciaNumero || '',
    primeiraInstanciaVara: initialData?.primeiraInstanciaVara || '',
    primeiraInstanciaComarca: initialData?.primeiraInstanciaComarca || '',
    segundaInstanciaTipoRecurso: initialData?.segundaInstanciaTipoRecurso || '',
    segundaInstanciaNumero: initialData?.segundaInstanciaNumero || '',
    segundaInstanciaTurmaCamara: initialData?.segundaInstanciaTurmaCamara || '',
    segundaInstanciaTribunal: initialData?.segundaInstanciaTribunal || '',
    tribunalSuperiorNome: initialData?.tribunalSuperiorNome || '',
    tribunalSuperiorNumero: initialData?.tribunalSuperiorNumero || '',
    tribunalSuperiorTurma: initialData?.tribunalSuperiorTurma || '',
    faseAtual: (initialData?.faseAtual || 'PRIMEIRA_INSTANCIA') as FaseAtual,
  });

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.numero || !form.competencia || !form.categoria || !form.autor || !form.clienteEscritorio || !form.faseAtual) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setSaving(true);
    try {
      const result = await onSubmit(form as any);
      
      // Save vinculos
      const processoId = initialData?.id || (result as any)?.id;
      if (processoId) {
        // Remove deleted vinculos
        for (const removed of removedVinculos) {
          await removeVinculo(removed.id, removed.processo_origem_id, removed.processo_vinculado_id);
        }
        // Add new vinculos (ones without an existing DB id)
        for (const v of vinculos) {
          if (!v.id && v.tipoVinculo) {
            await addVinculo(
              processoId,
              v.isExisting ? v.processoVinculadoId : null,
              v.isExisting ? null : v.numeroManual,
              v.tipoVinculo,
            );
          }
        }
      }
      
      toast.success(mode === 'create' ? 'Processo cadastrado!' : 'Processo atualizado!');
      navigate('/processos');
    } catch {
      toast.error('Erro ao salvar processo');
    } finally {
      setSaving(false);
    }
  };

  const addVinculoEntry = () => {
    setVinculos(prev => [...prev, { processoVinculadoId: null, numeroManual: '', tipoVinculo: '', isExisting: false }]);
  };

  const updateVinculoEntry = (index: number, field: keyof VinculoEntry, value: any) => {
    setVinculos(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const removeVinculoEntry = (index: number) => {
    const entry = vinculos[index];
    if (entry.id) {
      // Track removed existing vinculos for deletion on save
      setRemovedVinculos(prev => [...prev, {
        id: entry.id!,
        processo_origem_id: initialData?.id || '',
        processo_vinculado_id: entry.processoVinculadoId,
        numero_processo_vinculado: entry.numeroManual || null,
        tipo_vinculo: entry.tipoVinculo,
        created_at: '',
      }]);
    }
    setVinculos(prev => prev.filter((_, i) => i !== index));
  };

  const availableProcessos = processos.filter(p => p.id !== initialData?.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">
            {mode === 'create' ? 'Novo Processo' : 'Editar Processo'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Preencha os dados do processo</p>
        </div>
        <Button variant="ghost" type="button" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          VOLTAR
        </Button>
      </div>

      {/* IDENTIFICAÇÃO */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-2 border-b border-border/40">
          <CardTitle className="text-lg font-display font-semibold tracking-tight">IDENTIFICAÇÃO</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">NÚMERO DO PROCESSO *</Label>
            <Input value={form.numero} onChange={e => update('numero', e.target.value)} placeholder="0000000-00.0000.0.00.0000" className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">TIPO DE AÇÃO</Label>
            <Input value={form.tipoAcao} onChange={e => update('tipoAcao', e.target.value)} placeholder="Ex: Indenizatória" className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">ESTADO *</Label>
            <Select value={form.estado || undefined} onValueChange={v => update('estado', v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {ESTADOS_BRASIL.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">COMPETÊNCIA *</Label>
            <Select value={form.competencia || undefined} onValueChange={v => update('competencia', v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {COMPETENCIAS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">CATEGORIA *</Label>
            <Select value={form.categoria || undefined} onValueChange={v => update('categoria', v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {categorias.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">GRUPO</Label>
            <Select value={form.grupoId || 'none'} onValueChange={v => update('grupoId', v === 'none' ? '' : v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Nenhum" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {[...grupos].sort((a, b) => a.nome.localeCompare(b.nome)).map(g => <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* PARTES */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-2 border-b border-border/40">
          <CardTitle className="text-lg font-display font-semibold tracking-tight">PARTES</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">AUTOR *</Label>
            <Input value={form.autor} onChange={e => update('autor', e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">RÉU</Label>
            <Input value={form.reu} onChange={e => update('reu', e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">CLIENTE DO ESCRITÓRIO *</Label>
            <Select value={form.clienteEscritorio || undefined} onValueChange={v => update('clienteEscritorio', v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Quem é o cliente?" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Autor">Autor</SelectItem>
                <SelectItem value="Réu">Réu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* PRIMEIRA INSTÂNCIA */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-2 border-b border-border/40">
          <CardTitle className="text-lg font-display font-semibold tracking-tight">PRIMEIRA INSTÂNCIA</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">NÚMERO DO PROCESSO</Label>
            <Input value={form.primeiraInstanciaNumero} onChange={e => update('primeiraInstanciaNumero', e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">VARA</Label>
            <Input value={form.primeiraInstanciaVara} onChange={e => update('primeiraInstanciaVara', e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">COMARCA</Label>
            <Input value={form.primeiraInstanciaComarca} onChange={e => update('primeiraInstanciaComarca', e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">SISTEMA DE ACESSO</Label>
            <Select value={form.sistemaAcesso || undefined} onValueChange={v => update('sistemaAcesso', v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {SISTEMAS_ACESSO.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">TELEFONES</Label>
            <Input value={form.telefoneSecretaria} onChange={e => update('telefoneSecretaria', e.target.value)} placeholder="(00) 0000-0000, (00) 0000-0000" className="h-10" />
          </div>
        </CardContent>
      </Card>

      {/* SEGUNDA INSTÂNCIA */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-2 border-b border-border/40">
          <CardTitle className="text-lg font-display font-semibold tracking-tight">SEGUNDA INSTÂNCIA</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">TIPO DE RECURSO</Label>
            <Select value={form.segundaInstanciaTipoRecurso || undefined} onValueChange={v => update('segundaInstanciaTipoRecurso', v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {TIPOS_RECURSO.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">NÚMERO DO PROCESSO</Label>
            <Input value={form.segundaInstanciaNumero} onChange={e => update('segundaInstanciaNumero', e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">TURMA / CÂMARA</Label>
            <Input value={form.segundaInstanciaTurmaCamara} onChange={e => update('segundaInstanciaTurmaCamara', e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">TRIBUNAL</Label>
            <Select value={form.segundaInstanciaTribunal || undefined} onValueChange={v => update('segundaInstanciaTribunal', v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {tribunais.map(t => <SelectItem key={t.id} value={t.sigla}>{t.sigla} — {t.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* TRIBUNAIS SUPERIORES */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-2 border-b border-border/40">
          <CardTitle className="text-lg font-display font-semibold tracking-tight">TRIBUNAIS SUPERIORES</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">TRIBUNAL SUPERIOR</Label>
            <Select value={form.tribunalSuperiorNome || undefined} onValueChange={v => update('tribunalSuperiorNome', v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {TRIBUNAIS_SUPERIORES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">NÚMERO DO PROCESSO</Label>
            <Input value={form.tribunalSuperiorNumero} onChange={e => update('tribunalSuperiorNumero', e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">TURMA</Label>
            <Input value={form.tribunalSuperiorTurma} onChange={e => update('tribunalSuperiorTurma', e.target.value)} className="h-10" />
          </div>
        </CardContent>
      </Card>

      {/* FASE ATUAL */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-2 border-b border-border/40">
          <CardTitle className="text-lg font-display font-semibold tracking-tight">FASE ATUAL *</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <RadioGroup value={form.faseAtual} onValueChange={(v: FaseAtual) => update('faseAtual', v)} className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PRIMEIRA_INSTANCIA" id="fase-1" />
              <Label htmlFor="fase-1" className="text-sm font-medium cursor-pointer">Primeira Instância</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SEGUNDA_INSTANCIA" id="fase-2" />
              <Label htmlFor="fase-2" className="text-sm font-medium cursor-pointer">Segunda Instância</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="TRIBUNAL_SUPERIOR" id="fase-3" />
              <Label htmlFor="fase-3" className="text-sm font-medium cursor-pointer">Tribunal Superior</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* PROCESSOS VINCULADOS */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-2 border-b border-border/40">
          <CardTitle className="text-lg font-display font-semibold tracking-tight flex items-center gap-2">
            <Link className="h-4.5 w-4.5" />
            PROCESSOS VINCULADOS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {vinculos.map((v, index) => (
            <div key={index} className="flex flex-col gap-3 p-4 rounded-lg border border-border/40 bg-muted/10">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">TIPO DE VÍNCULO</Label>
                    <Select value={v.tipoVinculo || undefined} onValueChange={val => updateVinculoEntry(index, 'tipoVinculo', val)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {tiposVinculo.map(t => <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">ORIGEM</Label>
                    <Select value={v.isExisting ? 'existing' : 'manual'} onValueChange={val => {
                      updateVinculoEntry(index, 'isExisting', val === 'existing');
                      if (val === 'manual') updateVinculoEntry(index, 'processoVinculadoId', null);
                      if (val === 'existing') updateVinculoEntry(index, 'numeroManual', '');
                    }}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="existing">Processo existente</SelectItem>
                        <SelectItem value="manual">Número manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    {v.isExisting ? (
                      <>
                        <Label className="text-xs font-medium">PROCESSO</Label>
                        <Select value={v.processoVinculadoId || undefined} onValueChange={val => updateVinculoEntry(index, 'processoVinculadoId', val)}>
                          <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {availableProcessos.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.numero}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <>
                        <Label className="text-xs font-medium">NÚMERO DO PROCESSO</Label>
                        <Input value={v.numeroManual} onChange={e => updateVinculoEntry(index, 'numeroManual', e.target.value)} placeholder="0000000-00.0000.0.00.0000" className="h-9" />
                      </>
                    )}
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 mt-5 text-destructive hover:text-destructive" onClick={() => removeVinculoEntry(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addVinculoEntry} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Adicionar vínculo
          </Button>
        </CardContent>
      </Card>


      {/* CONTROLE INTERNO */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-2 border-b border-border/40">
          <CardTitle className="text-lg font-display font-semibold tracking-tight">CONTROLE INTERNO</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">SENHA DE ACESSO</Label>
            <Input type="text" value={form.senhaAcesso} onChange={e => update('senhaAcesso', e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-sm font-medium">INFORMAÇÕES IMPORTANTES</Label>
            <Textarea value={form.status} onChange={e => update('status', e.target.value)} placeholder="" rows={3} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-10 px-6">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : mode === 'create' ? 'CADASTRAR PROCESSO' : 'SALVAR ALTERAÇÕES'}
        </Button>
      </div>
    </form>
  );
}
