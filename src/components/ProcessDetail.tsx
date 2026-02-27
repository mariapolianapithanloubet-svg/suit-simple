import { useParams, useNavigate, Link } from 'react-router-dom';
import { Processo, getClienteName, TIPOS_DOCUMENTO } from '@/types/process';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SemaphoreIndicator } from '@/components/SemaphoreIndicator';
import { ArrowLeft, Pencil, Trash2, FileUp, Eye, EyeOff, Download, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

interface ProcessDetailProps {
  processos: Processo[];
  onDelete: (id: string) => void;
  onUploadDocumento?: (processoId: string, file: File, tipo: string, observacao?: string) => Promise<any>;
  onDeleteDocumento?: (docId: string, filePath?: string) => Promise<void>;
}

export function ProcessDetail({ processos, onDelete, onUploadDocumento, onDeleteDocumento }: ProcessDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docTipo, setDocTipo] = useState<string>('Petição');
  const [docObs, setDocObs] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const processo = processos.find(p => p.id === id);

  if (!processo) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-sm">Processo não encontrado</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/processos')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
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

  const handleUpload = async () => {
    const files = fileRef.current?.files;
    if (!files?.length || !onUploadDocumento) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      await onUploadDocumento(processo.id, file, docTipo, docObs);
    }
    setUploading(false);
    setDocObs('');
    if (fileRef.current) fileRef.current.value = '';
    toast.success('Documento(s) enviado(s)!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/processos')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Voltar
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-display font-bold text-foreground tracking-tight">{processo.numero}</h2>
              <SemaphoreIndicator date={processo.dataUltimoAcompanhamento} size="md" />
            </div>
            <p className="text-xs text-muted-foreground">{processo.tipoAcao}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/processos/${processo.id}/editar`}>
            <Button variant="outline" size="sm" className="text-xs">
              <Pencil className="h-3 w-3 mr-1.5" />
              Editar
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="h-3 w-3 mr-1.5" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs">{processo.categoria}</Badge>
        <Badge variant="outline" className="text-xs">{processo.esfera}</Badge>
        <Badge variant="outline" className="text-xs">{processo.estado}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-display tracking-tight">Partes</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Autor" value={processo.autor} />
            <Field label="Réu" value={processo.reu} />
            <Field label="Cliente do Escritório" value={`${getClienteName(processo)} (${processo.clienteEscritorio})`} />
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-display tracking-tight">Tramitação</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Vara / Câmara / Turma" value={processo.varaCamaraTurma} />
            <Field label="Sistema de Acesso" value={processo.sistemaAcesso} />
            <Field label="Telefone Secretaria" value={processo.telefoneSecretaria} />
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-display tracking-tight">Controle Interno</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-[11px]">Senha de Acesso</p>
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

        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-display tracking-tight">Execução</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Valor em Execução" value={processo.valorExecucao ? `R$ ${processo.valorExecucao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'} />
            <Field label="Data-base do Cálculo" value={processo.dataBaseCalculo ? new Date(processo.dataBaseCalculo).toLocaleDateString('pt-BR') : '—'} />
          </CardContent>
        </Card>
      </div>

      {/* Documentos */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display tracking-tight">Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload area */}
          {onUploadDocumento && (
            <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-muted/50 border border-border/40">
              <div className="flex-1 space-y-2">
                <input ref={fileRef} type="file" multiple className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer" />
                <div className="flex gap-2">
                  <Select value={docTipo} onValueChange={setDocTipo}>
                    <SelectTrigger className="h-8 text-xs w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_DOCUMENTO.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input value={docObs} onChange={e => setDocObs(e.target.value)} placeholder="Observação (opcional)" className="h-8 text-xs" />
                </div>
              </div>
              <Button type="button" size="sm" disabled={uploading} onClick={handleUpload} className="self-end">
                <FileUp className="h-3.5 w-3.5 mr-1.5" />
                {uploading ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          )}

          {/* Document list */}
          {processo.documentos.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Nenhum documento anexado</p>
          ) : (
            <div className="space-y-1.5">
              {processo.documentos.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{doc.nome}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[9px]">{doc.tipo}</Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(doc.dataUpload).toLocaleDateString('pt-BR')}</span>
                      {doc.observacao && <span className="text-[10px] text-muted-foreground truncate">· {doc.observacao}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {doc.arquivoUrl && (
                      <a href={doc.arquivoUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3 w-3" /></Button>
                      </a>
                    )}
                    {onDeleteDocumento && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDeleteDocumento(doc.id, doc.arquivoPath)}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <p className="text-muted-foreground text-[11px]">{label}</p>
      <p className="font-medium text-foreground text-sm">{value || '—'}</p>
    </div>
  );
}
