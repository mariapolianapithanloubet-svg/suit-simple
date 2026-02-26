import { useParams, useNavigate, Link } from 'react-router-dom';
import { Processo, getClienteName } from '@/types/process';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SemaphoreIndicator } from '@/components/SemaphoreIndicator';
import { ArrowLeft, Pencil, Trash2, FileUp, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface ProcessDetailProps {
  processos: Processo[];
  onDelete: (id: string) => void;
}

export function ProcessDetail({ processos, onDelete }: ProcessDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const processo = processos.find(p => p.id === id);

  if (!processo) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Processo não encontrado</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/processos')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este processo?')) {
      onDelete(processo.id);
      navigate('/processos');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/processos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-display font-bold text-foreground">{processo.numero}</h2>
              <SemaphoreIndicator date={processo.dataUltimoAcompanhamento} size="md" />
            </div>
            <p className="text-sm text-muted-foreground">{processo.tipoAcao}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/processos/${processo.id}/editar`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-3.5 w-3.5 mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="text-destructive" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge>{processo.categoria}</Badge>
        <Badge variant="outline">{processo.esfera}</Badge>
        <Badge variant="outline">{processo.estado}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base font-display">Partes</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Field label="Autor" value={processo.autor} />
            <Field label="Réu" value={processo.reu} />
            <Field label="Cliente do Escritório" value={`${getClienteName(processo)} (${processo.clienteEscritorio})`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base font-display">Tramitação</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Field label="Vara / Câmara / Turma" value={processo.varaCamaraTurma} />
            <Field label="Sistema de Acesso" value={processo.sistemaAcesso} />
            <Field label="Telefone Secretaria" value={processo.telefoneSecretaria} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base font-display">Controle Interno</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Senha de Acesso</p>
                <p className="font-medium">{showPassword ? (processo.senhaAcesso || '—') : '••••••••'}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <Field label="Status" value={processo.status} />
            <Field label="Último Acompanhamento" value={processo.dataUltimoAcompanhamento ? new Date(processo.dataUltimoAcompanhamento).toLocaleDateString('pt-BR') : '—'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base font-display">Execução</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Field label="Valor em Execução" value={processo.valorExecucao ? `R$ ${processo.valorExecucao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'} />
            <Field label="Data-base do Cálculo" value={processo.dataBaseCalculo ? new Date(processo.dataBaseCalculo).toLocaleDateString('pt-BR') : '—'} />
          </CardContent>
        </Card>
      </div>

      {/* Documentos placeholder */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display">Documentos</CardTitle>
            <Button variant="outline" size="sm" disabled>
              <FileUp className="h-3.5 w-3.5 mr-2" />
              Upload (em breve)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            A funcionalidade de upload de documentos estará disponível com a integração do backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium text-foreground">{value || '—'}</p>
    </div>
  );
}
