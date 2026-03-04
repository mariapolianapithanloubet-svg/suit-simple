import { useParams, useNavigate } from 'react-router-dom';
import { Processo, getClienteName, PASTAS_DOCUMENTO } from '@/types/process';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Eye, EyeOff, Download, FolderOpen, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Props {
  processos: Processo[];
  grupos: { id: string; nome: string }[];
}

const FASE_LABELS: Record<string, string> = {
  PRIMEIRA_INSTANCIA: '1ª Instância',
  SEGUNDA_INSTANCIA: '2ª Instância',
  TRIBUNAL_SUPERIOR: 'Tribunal Superior',
};

export default function ProcessoView({ processos, grupos }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const processo = processos.find(p => p.id === id);
  if (!processo) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Processo não encontrado</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/consultar')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />VOLTAR
        </Button>
      </div>
    );
  }

  const grupoNome = processo.grupoId ? grupos.find(g => g.id === processo.grupoId)?.nome : undefined;

  const docsByPasta: Record<string, typeof processo.documentos> = {};
  PASTAS_DOCUMENTO.forEach(p => { docsByPasta[p] = []; });
  processo.documentos.forEach(doc => {
    const pasta = doc.pasta || 'Outros';
    if (!docsByPasta[pasta]) docsByPasta[pasta] = [];
    docsByPasta[pasta].push(doc);
  });

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/consultar')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />VOLTAR
        </Button>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">{processo.numero}</h2>
          <p className="text-sm text-muted-foreground">{processo.tipoAcao}</p>
        </div>
      </div>

      {/* FASE ATUAL - prominent */}
      <Card className="shadow-card border-primary/30 bg-primary/5">
        <CardContent className="py-5 flex items-center gap-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fase Atual</span>
          <Badge className="text-sm px-3 py-1">{FASE_LABELS[processo.faseAtual] || processo.faseAtual}</Badge>
        </CardContent>
      </Card>

      {/* Instâncias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-display tracking-tight">PRIMEIRA INSTÂNCIA</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="NÚMERO" value={processo.primeiraInstanciaNumero} />
            <Field label="VARA" value={processo.primeiraInstanciaVara} />
            <Field label="COMARCA" value={processo.primeiraInstanciaComarca} />
            <Field label="SISTEMA DE ACESSO" value={processo.sistemaAcesso} />
            <Field label="TELEFONES" value={processo.telefoneSecretaria} />
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-display tracking-tight">SEGUNDA INSTÂNCIA</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="TIPO DE RECURSO" value={processo.segundaInstanciaTipoRecurso} />
            <Field label="NÚMERO" value={processo.segundaInstanciaNumero} />
            <Field label="TURMA / CÂMARA" value={processo.segundaInstanciaTurmaCamara} />
            <Field label="TRIBUNAL" value={processo.segundaInstanciaTribunal} />
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-display tracking-tight">TRIBUNAIS SUPERIORES</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="TRIBUNAL" value={processo.tribunalSuperiorNome} />
            <Field label="NÚMERO" value={processo.tribunalSuperiorNumero} />
            <Field label="TURMA" value={processo.tribunalSuperiorTurma} />
          </CardContent>
        </Card>
      </div>

      {/* Informações do Processo */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-4"><CardTitle className="text-base font-display tracking-tight">INFORMAÇÕES DO PROCESSO</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="NÚMERO PRINCIPAL" value={processo.numero} />
            <Field label="TIPO DE AÇÃO" value={processo.tipoAcao} />
            <Field label="COMPETÊNCIA" value={processo.competencia} />
            <Field label="ESTADO" value={processo.estado} />
            <Field label="CATEGORIA" value={processo.categoria} />
            <Field label="AUTOR" value={processo.autor} />
            <Field label="RÉU" value={processo.reu} />
            <Field label="CLIENTE DO ESCRITÓRIO" value={`${getClienteName(processo)} (${processo.clienteEscritorio})`} />
            <Field label="GRUPO" value={grupoNome} />
          </div>
        </CardContent>
      </Card>

      {/* Controle Interno */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-4"><CardTitle className="text-base font-display tracking-tight">CONTROLE INTERNO</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">SENHA DE ACESSO</p>
              <p className="font-medium text-foreground text-base mt-0.5">{showPassword ? (processo.senhaAcesso || '—') : '••••••••'}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <Field label="INFORMAÇÕES IMPORTANTES" value={processo.status} />
        </CardContent>
      </Card>

      {/* Documentos - read-only */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-4"><CardTitle className="text-base font-display tracking-tight">DOCUMENTOS</CardTitle></CardHeader>
        <CardContent>
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
                          {doc.arquivoUrl && (
                            <a href={doc.arquivoUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
                            </a>
                          )}
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

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="font-medium text-foreground text-base mt-0.5">{value || '—'}</p>
    </div>
  );
}
