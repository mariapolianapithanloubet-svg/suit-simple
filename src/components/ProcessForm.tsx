// =====================================================================
// components/ProcessForm.tsx — versão Fase 2A
// Reorganização completa do formulário de cadastro/edição:
// - Identificação enxuta (sem número de processo no topo, sem categoria)
// - Bloco "PROCESSO DE ORIGEM (1ª instância)" com classe, tribunal,
//   órgão julgador, número, sistema de acesso, telefone
// - Blocos "2ª INSTÂNCIA" e "TRIBUNAL SUPERIOR" opcionais (com switch)
// - Classes processuais carregadas do cadastro (em vez de lista fixa)
// - Visual mais limpo, com seções claras
// =====================================================================
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Processo, Grupo, COMPETENCIAS, ESTADOS_BRASIL, SISTEMAS_ACESSO,
  Competencia, FaseAtual, Relevancia, ClienteEscritorio,
} from '@/types/process';
import { TipoVinculoRow, TribunalRow, ClasseProcessualRow } from '@/hooks/useAdminTables';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, ArrowLeft, Plus, Trash2, Link as LinkIcon, Star, Building2, Scale, Gavel } from 'lucide-react';
import { toast } from 'sonner';
import { useProcessosVinculados, ProcessoVinculado } from '@/hooks/useProcessosVinculados';

interface VinculoEntry {
  id?: string;
  processoVinculadoId: string | null;
  numeroManual: string;
  tipoVinculo: string;
  isExisting: boolean;
}

interface ProcessFormProps {
  initialData?: Processo;
  onSubmit: (data: any) => void | Promise<any>;
  mode: 'create' | 'edit';
  grupos?: Grupo[];
  processos?: Processo[];
  classes?: ClasseProcessualRow[];
  tiposVinculo?: TipoVinculoRow[];
  tribunais?: TribunalRow[];
}

export function ProcessForm({
  initialData, onSubmit, mode,
  grupos = [], processos = [], classes = [], tiposVinculo = [], tribunais = [],
}: ProcessFormProps) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const { fetchVinculados, addVinculo, removeVinculo } = useProcessosVinculados();
  const [vinculos, setVinculos] = useState<VinculoEntry[]>([]);
  const [removedVinculos, setRemovedVinculos] = useState<ProcessoVinculado[]>([]);

  // Decide se mostra blocos opcionais com base no que vier preenchido
  const hasInitial2a = !!(initialData?.segundaInstanciaNumero || initialData?.segundaInstanciaClasse || initialData?.segundaInstanciaTribunal);
  const hasInitialSup = !!(initialData?.tribunalSuperiorNumero || initialData?.tribunalSuperiorClasse || initialData?.tribunalSuperiorNome);

  const [showSegunda, setShowSegunda] = useState(hasInitial2a);
  const [showSuperior, setShowSuperior] = useState(hasInitialSup);

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
      });
    }
  }, [mode, initialData?.id, fetchVinculados]);

  const [form, setForm] = useState({
    // Identificação geral
    estado: initialData?.estado || '',
    competencia: (initialData?.competencia || '') as Competencia | '',
    relevancia: (initialData?.relevancia || 'acompanhamento') as Relevancia,
    autor: initialData?.autor || '',
    reu: initialData?.reu || '',
    clienteEscritorio: (initialData?.clienteEscritorio || '') as ClienteEscritorio | '',
    grupoId: initialData?.grupoId || '',
    faseAtual: (initialData?.faseAtual || 'PRIMEIRA_INSTANCIA') as FaseAtual,

    // 1ª instância
    primeiraInstanciaNumero: initialData?.primeiraInstanciaNumero || initialData?.numero || '',
    primeiraInstanciaClasse: initialData?.primeiraInstanciaClasse || initialData?.tipoAcao || '',
    primeiraInstanciaTribunal: initialData?.primeiraInstanciaTribunal || '',
    primeiraInstanciaOrgaoJulgador: initialData?.primeiraInstanciaOrgaoJulgador || initialData?.varaCamaraTurma || '',
    primeiraInstanciaComarca: initialData?.primeiraInstanciaComarca || '',
    primeiraInstanciaTelefone: initialData?.primeiraInstanciaTelefone || initialData?.telefoneSecretaria || '',
    sistemaAcesso: initialData?.sistemaAcesso || '',

    // 2ª instância
    segundaInstanciaNumero: initialData?.segundaInstanciaNumero || '',
    segundaInstanciaClasse: initialData?.segundaInstanciaClasse || initialData?.segundaInstanciaTipoRecurso || '',
    segundaInstanciaTribunal: initialData?.segundaInstanciaTribunal || '',
    segundaInstanciaOrgaoJulgador: initialData?.segundaInstanciaOrgaoJulgador || initialData?.segundaInstanciaTurmaCamara || '',
    segundaInstanciaTelefone: initialData?.segundaInstanciaTelefone || '',

    // Tribunal superior
    tribunalSuperiorNome: (initialData?.tribunalSuperiorNome || '') as 'STJ' | 'STF' | '',
    tribunalSuperiorNumero: initialData?.tribunalSuperiorNumero || '',
    tribunalSuperiorClasse: initialData?.tribunalSuperiorClasse || '',
    tribunalSuperiorOrgaoJulgador: initialData?.tribunalSuperiorOrgaoJulgador || initialData?.tribunalSuperiorTurma || '',
    tribunalSuperiorTelefone: initialData?.tribunalSuperiorTelefone || '',

    // Controle interno
    senhaAcesso: initialData?.senhaAcesso || '',
    ultimaMovimentacao: initialData?.ultimaMovimentacao || '',
    observacoes: initialData?.observacoes || initialData?.status || '',
  });

  const update = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // Classes filtradas por instância
  const classes1a = useMemo(
    () => classes.filter(c => c.instancia === 'PRIMEIRA' || c.instancia === 'TODAS'),
    [classes],
  );
  const classes2a = useMemo(
    () => classes.filter(c => c.instancia === 'SEGUNDA' || c.instancia === 'TODAS'),
    [classes],
  );
  const classesSup = useMemo(
    () => classes.filter(c => c.instancia === 'SUPERIOR' || c.instancia === 'TODAS'),
    [classes],
  );

  const tribunaisOrdenados = useMemo(
    () => [...tribunais].sort((a, b) => a.sigla.localeCompare(b.sigla)),
    [tribunais],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação mínima — só os campos realmente essenciais
    if (!form.primeiraInstanciaNumero) {
      toast.error('Informe o número do processo de origem.');
      return;
    }
    if (!form.competencia) {
      toast.error('Selecione a competência.');
      return;
    }
    if (!form.clienteEscritorio) {
      toast.error('Indique se o cliente é Autor ou Réu.');
      return;
    }
    if (!form.autor) {
      toast.error('Informe o autor.');
      return;
    }

    setSaving(true);
    try {
      // Se o usuário desligou os switches, limpa os campos das instâncias correspondentes
      const dataToSend: any = { ...form };
      if (!showSegunda) {
        dataToSend.segundaInstanciaNumero = null;
        dataToSend.segundaInstanciaClasse = null;
        dataToSend.segundaInstanciaTribunal = null;
        dataToSend.segundaInstanciaOrgaoJulgador = null;
        dataToSend.segundaInstanciaTelefone = null;
      }
      if (!showSuperior) {
        dataToSend.tribunalSuperiorNome = null;
        dataToSend.tribunalSuperiorNumero = null;
        dataToSend.tribunalSuperiorClasse = null;
        dataToSend.tribunalSuperiorOrgaoJulgador = null;
        dataToSend.tribunalSuperiorTelefone = null;
      }
      // Coerência da fase atual com os blocos visíveis
      if (dataToSend.faseAtual === 'SEGUNDA_INSTANCIA' && !showSegunda) {
        dataToSend.faseAtual = 'PRIMEIRA_INSTANCIA';
      }
      if (dataToSend.faseAtual === 'TRIBUNAL_SUPERIOR' && !showSuperior) {
        dataToSend.faseAtual = showSegunda ? 'SEGUNDA_INSTANCIA' : 'PRIMEIRA_INSTANCIA';
      }

      const result = await onSubmit(dataToSend);

      // Salva vínculos
      const processoId = initialData?.id || (result as any)?.id;
      if (processoId) {
        for (const removed of removedVinculos) {
          await removeVinculo(removed.id, removed.processo_origem_id, removed.processo_vinculado_id);
        }
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
      navigate(mode === 'edit' ? '/consultar' : '/processos/novo');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar processo');
    } finally {
      setSaving(false);
    }
  };

  // Vínculos
  const addVinculoEntry = () =>
    setVinculos(prev => [...prev, { processoVinculadoId: null, numeroManual: '', tipoVinculo: '', isExisting: false }]);

  const updateVinculoEntry = (index: number, field: keyof VinculoEntry, value: any) =>
    setVinculos(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));

  const removeVinculoEntry = (index: number) => {
    const entry = vinculos[index];
    if (entry.id) {
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

  // Lista de fases disponíveis no select (depende dos switches)
  const fasesDisponiveis: { value: FaseAtual; label: string }[] = [
    { value: 'PRIMEIRA_INSTANCIA', label: '1ª instância' },
    ...(showSegunda ? [{ value: 'SEGUNDA_INSTANCIA' as FaseAtual, label: '2ª instância' }] : []),
    ...(showSuperior ? [{ value: 'TRIBUNAL_SUPERIOR' as FaseAtual, label: 'Tribunal Superior' }] : []),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl pb-12">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-semibold text-foreground tracking-tight">
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
      <SectionCard icon={<Scale className="h-4.5 w-4.5" />} title="IDENTIFICAÇÃO">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label="AUTOR" required>
            <Input value={form.autor} onChange={e => update('autor', e.target.value)} />
          </Field>

          <Field label="PARTE CONTRÁRIA (RÉU)">
            <Input value={form.reu} onChange={e => update('reu', e.target.value)} />
          </Field>

          <Field label="CLIENTE DO ESCRITÓRIO" required>
            <Select value={form.clienteEscritorio || undefined} onValueChange={v => update('clienteEscritorio', v)}>
              <SelectTrigger><SelectValue placeholder="Quem é o cliente?" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Autor">Autor</SelectItem>
                <SelectItem value="Réu">Réu</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="COMPETÊNCIA" required>
            <Select value={form.competencia || undefined} onValueChange={v => update('competencia', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {COMPETENCIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="ESTADO">
            <Select value={form.estado || undefined} onValueChange={v => update('estado', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {ESTADOS_BRASIL.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="GRUPO">
            <Select value={form.grupoId || 'none'} onValueChange={v => update('grupoId', v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {[...grupos].sort((a, b) => a.nome.localeCompare(b.nome)).map(g =>
                  <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </Field>

          <Field label="RELEVÂNCIA">
            <Select value={form.relevancia} onValueChange={v => update('relevancia', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="relevante">
                  <span className="inline-flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-amber-500" />Relevante
                  </span>
                </SelectItem>
                <SelectItem value="acompanhamento">Mero acompanhamento</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="FASE ATUAL" required>
            <Select value={form.faseAtual} onValueChange={v => update('faseAtual', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {fasesDisponiveis.map(f =>
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </SectionCard>

      {/* PROCESSO DE ORIGEM (1ª INSTÂNCIA) */}
      <SectionCard
        icon={<Building2 className="h-4.5 w-4.5" />}
        title="PROCESSO DE ORIGEM (1ª INSTÂNCIA)"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label="NÚMERO DO PROCESSO" required className="lg:col-span-2">
            <Input
              value={form.primeiraInstanciaNumero}
              onChange={e => update('primeiraInstanciaNumero', e.target.value)}
              placeholder="0000000-00.0000.0.00.0000"
            />
          </Field>

          <Field label="CLASSE PROCESSUAL">
            <Select value={form.primeiraInstanciaClasse || undefined} onValueChange={v => update('primeiraInstanciaClasse', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {classes1a.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="TRIBUNAL">
            <Select value={form.primeiraInstanciaTribunal || undefined} onValueChange={v => update('primeiraInstanciaTribunal', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {tribunaisOrdenados.map(t =>
                  <SelectItem key={t.id} value={t.sigla}>{t.sigla} — {t.nome}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </Field>

          <Field label="ÓRGÃO JULGADOR">
            <Input
              value={form.primeiraInstanciaOrgaoJulgador}
              onChange={e => update('primeiraInstanciaOrgaoJulgador', e.target.value)}
              placeholder="Ex: 6ª Turma do TRF3, 1ª Vara Federal"
            />
          </Field>

          <Field label="COMARCA">
            <Input
              value={form.primeiraInstanciaComarca}
              onChange={e => update('primeiraInstanciaComarca', e.target.value)}
              placeholder="Ex: Campo Grande"
            />
          </Field>

          <Field label="SISTEMA DE ACESSO">
            <Select value={form.sistemaAcesso || undefined} onValueChange={v => update('sistemaAcesso', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {SISTEMAS_ACESSO.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="TELEFONE (VARA / SECRETARIA)">
            <Input
              value={form.primeiraInstanciaTelefone}
              onChange={e => update('primeiraInstanciaTelefone', e.target.value)}
              placeholder="(00) 0000-0000"
            />
          </Field>
        </div>
      </SectionCard>

      {/* 2ª INSTÂNCIA */}
      <ToggleSection
        icon={<Gavel className="h-4.5 w-4.5" />}
        title="2ª INSTÂNCIA"
        description="Apelação, agravo interno, e demais recursos no Tribunal de Justiça/TRF/TRT."
        enabled={showSegunda}
        onToggle={setShowSegunda}
      >
        {showSegunda && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label="NÚMERO DO PROCESSO" hint="Deixe em branco se for o mesmo da 1ª instância">
              <Input
                value={form.segundaInstanciaNumero}
                onChange={e => update('segundaInstanciaNumero', e.target.value)}
                placeholder="0000000-00.0000.0.00.0000"
              />
            </Field>

            <Field label="CLASSE PROCESSUAL">
              <Select value={form.segundaInstanciaClasse || undefined} onValueChange={v => update('segundaInstanciaClasse', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {classes2a.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <Field label="TRIBUNAL">
              <Select value={form.segundaInstanciaTribunal || undefined} onValueChange={v => update('segundaInstanciaTribunal', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {tribunaisOrdenados.map(t =>
                    <SelectItem key={t.id} value={t.sigla}>{t.sigla} — {t.nome}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field label="ÓRGÃO JULGADOR (TURMA / CÂMARA)">
              <Input
                value={form.segundaInstanciaOrgaoJulgador}
                onChange={e => update('segundaInstanciaOrgaoJulgador', e.target.value)}
                placeholder="Ex: 2ª Turma, 4ª Câmara Cível"
              />
            </Field>

            <Field label="TELEFONE">
              <Input
                value={form.segundaInstanciaTelefone}
                onChange={e => update('segundaInstanciaTelefone', e.target.value)}
                placeholder="(00) 0000-0000"
              />
            </Field>
          </div>
        )}
      </ToggleSection>

      {/* TRIBUNAL SUPERIOR */}
      <ToggleSection
        icon={<Scale className="h-4.5 w-4.5" />}
        title="TRIBUNAL SUPERIOR"
        description="STJ, STF — REsp, AREsp, RE, ARE, agravos e reclamações."
        enabled={showSuperior}
        onToggle={setShowSuperior}
      >
        {showSuperior && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label="TRIBUNAL">
              <Select value={form.tribunalSuperiorNome || undefined} onValueChange={v => update('tribunalSuperiorNome', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STJ">STJ</SelectItem>
                  <SelectItem value="STF">STF</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="CLASSE PROCESSUAL">
              <Select value={form.tribunalSuperiorClasse || undefined} onValueChange={v => update('tribunalSuperiorClasse', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {classesSup.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            <Field label="NÚMERO DO PROCESSO">
              <Input
                value={form.tribunalSuperiorNumero}
                onChange={e => update('tribunalSuperiorNumero', e.target.value)}
                placeholder="Ex: AREsp 1667726/MS"
              />
            </Field>

            <Field label="ÓRGÃO JULGADOR (TURMA / SEÇÃO)">
              <Input
                value={form.tribunalSuperiorOrgaoJulgador}
                onChange={e => update('tribunalSuperiorOrgaoJulgador', e.target.value)}
                placeholder="Ex: 2ª Turma, Presidência"
              />
            </Field>

            <Field label="TELEFONE">
              <Input
                value={form.tribunalSuperiorTelefone}
                onChange={e => update('tribunalSuperiorTelefone', e.target.value)}
                placeholder="(00) 0000-0000"
              />
            </Field>
          </div>
        )}
      </ToggleSection>

      {/* PROCESSOS VINCULADOS */}
      <SectionCard icon={<LinkIcon className="h-4.5 w-4.5" />} title="PROCESSOS VINCULADOS">
        <div className="space-y-4">
          {vinculos.map((v, index) => (
            <div key={index} className="flex flex-col gap-3 p-4 rounded-lg border border-border/40 bg-muted/10">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">TIPO DE VÍNCULO</Label>
                    <Select value={v.tipoVinculo || undefined} onValueChange={val => updateVinculoEntry(index, 'tipoVinculo', val)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {[...tiposVinculo].sort((a, b) => a.nome.localeCompare(b.nome)).map(t =>
                          <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">ORIGEM</Label>
                    <Select
                      value={v.isExisting ? 'existing' : 'manual'}
                      onValueChange={val => {
                        updateVinculoEntry(index, 'isExisting', val === 'existing');
                        if (val === 'manual') updateVinculoEntry(index, 'processoVinculadoId', null);
                        if (val === 'existing') updateVinculoEntry(index, 'numeroManual', '');
                      }}
                    >
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="existing">Processo cadastrado</SelectItem>
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
                              <SelectItem key={p.id} value={p.id}>
                                {p.primeiraInstanciaNumero || p.numero}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <>
                        <Label className="text-xs font-medium">NÚMERO DO PROCESSO</Label>
                        <Input
                          value={v.numeroManual}
                          onChange={e => updateVinculoEntry(index, 'numeroManual', e.target.value)}
                          placeholder="0000000-00.0000.0.00.0000"
                          className="h-9"
                        />
                      </>
                    )}
                  </div>
                </div>
                <Button
                  type="button" variant="ghost" size="icon"
                  className="h-9 w-9 mt-5 text-destructive hover:text-destructive"
                  onClick={() => removeVinculoEntry(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addVinculoEntry} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Adicionar vínculo
          </Button>
        </div>
      </SectionCard>

      {/* CONTROLE INTERNO */}
      <SectionCard title="CONTROLE INTERNO">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="SENHA DE ACESSO">
            <Input
              type="text"
              value={form.senhaAcesso}
              onChange={e => update('senhaAcesso', e.target.value)}
              placeholder="Senha do sistema, se houver"
            />
          </Field>
          <Field label="ÚLTIMA MOVIMENTAÇÃO">
            <Input
              value={form.ultimaMovimentacao}
              onChange={e => update('ultimaMovimentacao', e.target.value)}
              placeholder="Opcional"
            />
          </Field>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-sm font-medium">INFORMAÇÕES IMPORTANTES</Label>
            <Textarea
              value={form.observacoes}
              onChange={e => update('observacoes', e.target.value)}
              placeholder="Observações livres sobre o processo"
              rows={3}
            />
          </div>
        </div>
      </SectionCard>

      {/* Submit */}
      <div className="flex justify-end gap-3 sticky bottom-4 z-10">
        <Button
          type="button" variant="outline"
          onClick={() => navigate(-1)}
          className="bg-background"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md h-10 px-8"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : mode === 'create' ? 'CADASTRAR PROCESSO' : 'SALVAR ALTERAÇÕES'}
        </Button>
      </div>
    </form>
  );
}

// ---------- Componentes auxiliares ----------

function SectionCard({
  icon, title, children,
}: { icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-card border-border/60">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-[15px] font-semibold tracking-[0.04em] flex items-center gap-2 text-foreground/85">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  );
}

function ToggleSection({
  icon, title, description, enabled, onToggle, children,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Card className={`shadow-card border-border/60 transition-colors ${enabled ? '' : 'bg-muted/20'}`}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-[15px] font-semibold tracking-[0.04em] flex items-center gap-2 text-foreground/85">
              {icon}
              {title}
            </CardTitle>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Label className="text-xs text-muted-foreground">
              {enabled ? 'Ativo' : 'Desativado'}
            </Label>
            <Switch checked={enabled} onCheckedChange={onToggle} />
          </div>
        </div>
      </CardHeader>
      {enabled && <CardContent className="pt-5">{children}</CardContent>}
    </Card>
  );
}

function Field({
  label, required, hint, className, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className || ''}`}>
      <Label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
