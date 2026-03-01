import { useMemo, useState } from 'react';
import { Processo, getClienteName, ESFERAS, ESTADOS_BRASIL, CATEGORIAS } from '@/types/process';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SemaphoreIndicator } from '@/components/SemaphoreIndicator';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, Search, Plus, Upload, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

interface ProcessListProps {
  processos: Processo[];
  onDelete: (id: string) => void;
  loading?: boolean;
  isAdmin?: boolean;
  onClearImported?: () => Promise<void>;
}

export function ProcessList({ processos, onDelete, loading, isAdmin, onClearImported }: ProcessListProps) {
  const [busca, setBusca] = useState('');
  const [filtroEsfera, setFiltroEsfera] = useState<string>('all');
  const [filtroEstado, setFiltroEstado] = useState<string>('all');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('all');
  const [filtroCliente, setFiltroCliente] = useState<string>('all');

  const clientes = useMemo(() => {
    const set = new Set(processos.map(getClienteName).filter(name => name && name.trim() !== ''));
    return Array.from(set).sort();
  }, [processos]);

  const filtered = useMemo(() => {
    return processos.filter(p => {
      if (busca && !p.numero.toLowerCase().includes(busca.toLowerCase()) &&
          !p.autor.toLowerCase().includes(busca.toLowerCase()) &&
          !p.reu.toLowerCase().includes(busca.toLowerCase())) return false;
      if (filtroEsfera !== 'all' && p.esfera !== filtroEsfera) return false;
      if (filtroEstado !== 'all' && p.estado !== filtroEstado) return false;
      if (filtroCategoria !== 'all' && p.categoria !== filtroCategoria) return false;
      if (filtroCliente !== 'all' && getClienteName(p) !== filtroCliente) return false;
      return true;
    });
  }, [processos, busca, filtroEsfera, filtroEstado, filtroCategoria, filtroCliente]);

  const relevantes = filtered.filter(p => p.categoria === 'Relevante');
  const acompanhamento = filtered.filter(p => p.categoria === 'Mero Acompanhamento');

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">Processos</h2>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} processo(s) encontrado(s)</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isAdmin && onClearImported && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-10 px-5">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Limpar Importação
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar processos importados?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação excluirá todos os processos criados via importação em lote. Processos criados manualmente não serão afetados. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => {
                    try {
                      await onClearImported();
                      toast({ title: 'Importação limpa', description: 'Todos os processos importados foram removidos.' });
                    } catch {
                      toast({ title: 'Erro', description: 'Não foi possível limpar os processos importados.', variant: 'destructive' });
                    }
                  }}>Confirmar exclusão</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Link to="/processos/importar">
            <Button variant="outline" className="h-10 px-5">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
          </Link>
          <Link to="/processos/novo">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-10 px-5">
              <Plus className="h-4 w-4 mr-2" />
              Novo Processo
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-border/60">
        <CardContent className="py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar número, parte..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroEsfera} onValueChange={setFiltroEsfera}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Esfera" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas esferas</SelectItem>
                {ESFERAS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos estados</SelectItem>
                {ESTADOS_BRASIL.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroCliente} onValueChange={setFiltroCliente}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Cliente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos clientes</SelectItem>
                {clientes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <ProcessSection title="Processos Relevantes" processos={relevantes} onDelete={onDelete} />
      <ProcessSection title="Mero Acompanhamento" processos={acompanhamento} onDelete={onDelete} />

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-base">Nenhum processo encontrado</p>
        </div>
      )}
    </div>
  );
}

function ProcessSection({ title, processos, onDelete }: { title: string; processos: Processo[]; onDelete: (id: string) => void }) {
  if (processos.length === 0) return null;

  const grouped = ESFERAS.reduce((acc, esfera) => {
    const items = processos.filter(p => p.esfera === esfera);
    if (items.length > 0) acc[esfera] = items;
    return acc;
  }, {} as Record<string, Processo[]>);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-1">
        <h3 className="font-display text-xl font-semibold text-foreground tracking-tight">{title}</h3>
        <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">{processos.length}</span>
      </div>

      {Object.entries(grouped).map(([esfera, items]) => (
        <div key={esfera} className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">
            {esfera === 'Estadual' ? 'Justiça Estadual' :
             esfera === 'Federal' ? 'Justiça Federal' :
             esfera === 'Trabalhista' ? 'Justiça do Trabalho' :
             'Processo Administrativo'}
          </h4>
          <div className="space-y-2">
            {items.map(p => (
              <Card key={p.id} className="shadow-card hover:shadow-card-hover transition-shadow duration-200 border-border/50">
                <CardContent className="py-4 px-5">
                  <div className="flex items-center gap-4 flex-wrap">
                    <SemaphoreIndicator date={p.dataUltimoAcompanhamento} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-foreground">{p.numero}</span>
                        <Badge variant="secondary" className="text-xs font-medium">{p.tipoAcao}</Badge>
                        <Badge variant="outline" className="text-xs font-medium">{p.estado}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {p.autor} <span className="opacity-40">vs</span> {p.reu}
                        <span className="ml-2 text-primary/80 font-medium">(cliente: {getClienteName(p)})</span>
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground hidden sm:block">
                      <p className="truncate max-w-[200px]">{p.status || 'Sem movimentação'}</p>
                      <p className="tabular-nums text-xs mt-0.5">{p.dataUltimoAcompanhamento ? new Date(p.dataUltimoAcompanhamento).toLocaleDateString('pt-BR') : '—'}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Link to={`/processos/${p.id}`}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/processos/${p.id}/editar`}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => onDelete(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
