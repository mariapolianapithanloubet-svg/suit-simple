import { useParams, useNavigate, Link } from 'react-router-dom';
import { Processo, getClienteName, TIPOS_DOCUMENTO, PASTAS_DOCUMENTO } from '@/types/process';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Pencil, Trash2, FileUp, Eye, EyeOff, Download, X, FolderOpen, ChevronDown } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

interface ProcessDetailProps {
  processos: Processo[];
  onDelete: (id: string) => void;
  onUploadDocumento?: (processoId: string, file: File, tipo: string, pasta: string, observacao?: string) => Promise<any>;
  onDeleteDocumento?: (docId: string, filePath?: string) => Promise<void>;
}

export function ProcessDetail({ processos, onDelete, onUploadDocumento, onDeleteDocumento }: ProcessDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docTipo, setDocTipo] = useState<string>('Petição');
  const [docPasta, setDocPasta] = useState<string>('Petição Inicial');
  const [docObs, setDocObs] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const processo = processos.find(p => p.id === id);

  if (!processo) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-base">Processo não encontrado</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/processos')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          VOLTAR
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
      await onUploadDocumento(processo.id, file, docTipo, docPasta, docObs);
    }
    setUploading(false);
    setDocObs('');
    if (fileRef.current) fileRef.current.value = '';
    toast.success('Documento(s) enviado(s)!');
  };

  const docsByPasta: Record<string, typeof processo.documentos> = {};
  PASTAS_DOCUMENTO.forEach(p => { docsByPasta[p] = []; });
  processo.documentos.forEach(doc => {
    const pasta = doc.pasta || 'Outros';
    if (!docsByPasta[pasta]) docsByPasta[pasta] = [];
    docsByPasta[pasta].push(doc);
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/processos')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            VOLTAR
          </Button>
          <div>
            <h2 className="text-[28px] font-semibold text-foreground tracking-tight">{processo.numero}</h2>
            <p className="text-sm text-muted-foreground">{processo.tipoAcao}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/processos/${processo.id}/editar`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              EDITAR
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            EXCLUIR
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary">{processo.categoria}</Badge>
        <Badge variant="outline">{processo.competencia}</Badge>
        <Badge variant="outline">{processo.estado}</Badge>
        {processo.grupoNome && <Badge variant="outline">{processo.grupoNome}</Badge>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-4"><CardTitle className="text-[18px] font-semibold tracking-[0.02em]">PARTES</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="AUTOR" value={processo.autor} />
            <Field label="RÉU" value={processo.reu} />
            <Field label="CLIENTE DO ESCRITÓRIO" value={`${getClienteName(processo)} (${processo.clienteEscritorio})`} />
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-4"><CardTitle className="text-base font-display tracking-tight">TRAMITAÇÃO</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="VARA / CÂMARA / TURMA" value={processo.varaCamaraTurma} />
            <Field label="SISTEMA DE ACESSO" value={processo.sistemaAcesso} />
            <Field label="TELEFONE DA SECRETARIA" value={processo.telefoneSecretaria} />
            <Field label="TELEFONE DA ASSESSORIA" value={processo.telefoneAssessoria} />
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60 lg:col-span-2">
          <CardHeader className="pb-4"><CardTitle className="text-base font-display tracking-tight">CONTROLE INTERNO</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">SENHA DE ACESSO</p>
                <p className="font-medium text-base mt-0.5">{showPassword ? (processo.senhaAcesso || '—') : '••••••••'}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Field label="INFORMAÇÕES IMPORTANTES" value={processo.status} />
          </CardContent>
        </Card>
      </div>

      {/* Documentos */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-display tracking-tight">DOCUMENTOS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {onUploadDocumento && (
            <div className="flex flex-col sm:flex-row gap-3 p-5 rounded-xl bg-muted/50 border border-border/40">
              <div className="flex-1 space-y-3">
                <input ref={fileRef} type="file" multiple className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Select value={docPasta} onValueChange={setDocPasta}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Pasta" /></SelectTrigger>
                    <SelectContent>
                      {PASTAS_DOCUMENTO.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={docTipo} onValueChange={setDocTipo}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_DOCUMENTO.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input value={docObs} onChange={e => setDocObs(e.target.value)} placeholder="Observação (opcional)" className="h-9 text-sm" />
                </div>
              </div>
              <Button type="button" size="sm" disabled={uploading} onClick={handleUpload} className="self-end h-9">
                <FileUp className="h-4 w-4 mr-1.5" />
                {uploading ? 'Enviando...' : 'ENVIAR'}
              </Button>
            </div>
          )}

          {processo.documentos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum documento anexado</p>
          ) : (
            <div className="space-y-2">
              {PASTAS_DOCUMENTO.map(pasta => {
                const docs = docsByPasta[pasta];
                if (!docs || docs.length === 0) return null;
                return (
                  <Collapsible key={pasta} defaultOpen>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
                      <FolderOpen className="h-4 w-4 text-primary/60" />
                      <span className="text-sm font-semibold text-foreground flex-1">{pasta}</span>
                      <span className="text-xs text-muted-foreground font-medium">{docs.length}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6 space-y-1.5 mt-1">
                      {docs.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/20">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{doc.nome}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{doc.tipo}</Badge>
                              <span className="text-xs text-muted-foreground">{new Date(doc.dataUpload).toLocaleDateString('pt-BR')}</span>
                              {doc.observacao && <span className="text-xs text-muted-foreground truncate">· {doc.observacao}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {doc.arquivoUrl && (
                              <a href={doc.arquivoUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
                              </a>
                            )}
                            {onDeleteDocumento && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDeleteDocumento(doc.id, doc.arquivoPath)}>
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
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
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="font-medium text-foreground text-base mt-0.5">{value || '—'}</p>
    </div>
  );
}
