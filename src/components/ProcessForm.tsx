import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Processo, ESFERAS, CATEGORIAS, ESTADOS_BRASIL, SISTEMAS_ACESSO, Esfera, Categoria } from '@/types/process';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface ProcessFormProps {
  initialData?: Processo;
  onSubmit: (data: Omit<Processo, 'id' | 'criadoEm' | 'atualizadoEm' | 'documentos'>) => void | Promise<any>;
  mode: 'create' | 'edit';
}

export function ProcessForm({ initialData, onSubmit, mode }: ProcessFormProps) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    numero: initialData?.numero || '',
    tipoAcao: initialData?.tipoAcao || '',
    estado: initialData?.estado || '',
    esfera: (initialData?.esfera || '') as Esfera | '',
    categoria: (initialData?.categoria || '') as Categoria | '',
    autor: initialData?.autor || '',
    reu: initialData?.reu || '',
    clienteEscritorio: (initialData?.clienteEscritorio || '') as 'Autor' | 'Réu' | '',
    varaCamaraTurma: initialData?.varaCamaraTurma || '',
    sistemaAcesso: initialData?.sistemaAcesso || '',
    telefoneSecretaria: initialData?.telefoneSecretaria || '',
    senhaAcesso: initialData?.senhaAcesso || '',
    status: initialData?.status || '',
    ultimaMovimentacao: initialData?.ultimaMovimentacao || '',
    dataUltimoAcompanhamento: initialData?.dataUltimoAcompanhamento || new Date().toISOString().split('T')[0],
    valorExecucao: initialData?.valorExecucao || undefined,
    dataBaseCalculo: initialData?.dataBaseCalculo || '',
  });

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.numero || !form.esfera || !form.categoria || !form.autor || !form.reu || !form.clienteEscritorio) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setSaving(true);
    try {
      await onSubmit(form as any);
      toast.success(mode === 'create' ? 'Processo cadastrado!' : 'Processo atualizado!');
      navigate('/processos');
    } catch {
      toast.error('Erro ao salvar processo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">
            {mode === 'create' ? 'Novo Processo' : 'Editar Processo'}
          </h2>
          <p className="text-sm text-muted-foreground">Preencha os dados do processo</p>
        </div>
        <Button variant="ghost" type="button" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Voltar
        </Button>
      </div>

      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display tracking-tight">Identificação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Número do Processo *</Label>
            <Input value={form.numero} onChange={e => update('numero', e.target.value)} placeholder="0000000-00.0000.0.00.0000" className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo de Ação</Label>
            <Input value={form.tipoAcao} onChange={e => update('tipoAcao', e.target.value)} placeholder="Ex: Indenizatória" className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Estado *</Label>
            <Select value={form.estado} onValueChange={v => update('estado', v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {ESTADOS_BRASIL.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Esfera *</Label>
            <Select value={form.esfera} onValueChange={v => update('esfera', v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {ESFERAS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Categoria *</Label>
            <Select value={form.categoria} onValueChange={v => update('categoria', v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display tracking-tight">Partes</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Autor *</Label>
            <Input value={form.autor} onChange={e => update('autor', e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Réu *</Label>
            <Input value={form.reu} onChange={e => update('reu', e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Cliente do escritório *</Label>
            <Select value={form.clienteEscritorio} onValueChange={v => update('clienteEscritorio', v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Quem é o cliente?" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Autor">Autor</SelectItem>
                <SelectItem value="Réu">Réu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display tracking-tight">Tramitação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Vara / Câmara / Turma</Label>
            <Input value={form.varaCamaraTurma} onChange={e => update('varaCamaraTurma', e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Sistema de Acesso</Label>
            <Select value={form.sistemaAcesso} onValueChange={v => update('sistemaAcesso', v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {SISTEMAS_ACESSO.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Telefone Secretaria</Label>
            <Input value={form.telefoneSecretaria} onChange={e => update('telefoneSecretaria', e.target.value)} placeholder="(00) 0000-0000" className="h-9 text-sm" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display tracking-tight">Controle Interno</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Senha de Acesso</Label>
            <Input type="password" value={form.senhaAcesso} onChange={e => update('senhaAcesso', e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data do último acompanhamento</Label>
            <Input type="date" value={form.dataUltimoAcompanhamento} onChange={e => update('dataUltimoAcompanhamento', e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Status / Última Movimentação</Label>
            <Textarea value={form.status} onChange={e => update('status', e.target.value)} placeholder="Descreva a última movimentação relevante..." rows={3} className="text-sm" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display tracking-tight">Execução (quando aplicável)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Valor em Execução (R$)</Label>
            <Input type="number" step="0.01" value={form.valorExecucao || ''} onChange={e => update('valorExecucao', e.target.value ? parseFloat(e.target.value) : undefined)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data-base do Cálculo</Label>
            <Input type="date" value={form.dataBaseCalculo} onChange={e => update('dataBaseCalculo', e.target.value)} className="h-9 text-sm" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? 'Salvando...' : mode === 'create' ? 'Cadastrar Processo' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
}
