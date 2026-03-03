import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Processo, COMPETENCIAS, CATEGORIAS, ESTADOS_BRASIL, SISTEMAS_ACESSO, Competencia, Categoria } from '@/types/process';
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
    competencia: (initialData?.competencia || '') as Competencia | '',
    categoria: (initialData?.categoria || '') as Categoria | '',
    autor: initialData?.autor || '',
    reu: initialData?.reu || '',
    clienteEscritorio: (initialData?.clienteEscritorio || '') as 'Autor' | 'Réu' | '',
    varaCamaraTurma: initialData?.varaCamaraTurma || '',
    sistemaAcesso: initialData?.sistemaAcesso || '',
    telefoneSecretaria: initialData?.telefoneSecretaria || '',
    telefoneAssessoria: initialData?.telefoneAssessoria || '',
    senhaAcesso: initialData?.senhaAcesso || '',
    status: initialData?.status || '',
    ultimaMovimentacao: initialData?.ultimaMovimentacao || '',
  });

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.numero || !form.competencia || !form.categoria || !form.autor || !form.clienteEscritorio) {
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
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

      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-display tracking-tight">IDENTIFICAÇÃO</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-display tracking-tight">PARTES</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-display tracking-tight">TRAMITAÇÃO</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">VARA / CÂMARA / TURMA</Label>
            <Input value={form.varaCamaraTurma} onChange={e => update('varaCamaraTurma', e.target.value)} className="h-10" />
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
            <Label className="text-sm font-medium">TELEFONE DA SECRETARIA</Label>
            <Input value={form.telefoneSecretaria} onChange={e => update('telefoneSecretaria', e.target.value)} placeholder="(00) 0000-0000" className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">TELEFONE DA ASSESSORIA</Label>
            <Input value={form.telefoneAssessoria} onChange={e => update('telefoneAssessoria', e.target.value)} placeholder="(00) 0000-0000" className="h-10" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-display tracking-tight">CONTROLE INTERNO</CardTitle>
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
