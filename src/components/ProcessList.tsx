import { useMemo, useState } from 'react';
import { Processo, getClienteName, ESFERAS, ESTADOS_BRASIL, CATEGORIAS } from '@/types/process';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SemaphoreIndicator } from '@/components/SemaphoreIndicator';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, Search, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProcessListProps {
  processos: Processo[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function ProcessList({ processos, onDelete, loading }: ProcessListProps) {
  const [busca, setBusca] = useState('');
  const [filtroEsfera, setFiltroEsfera] = useState<string>('all');
  const [filtroEstado, setFiltroEstado] = useState<string>('all');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('all');
  const [filtroCliente, setFiltroCliente] = useState<string>('all');

  const clientes = useMemo(() => {
    const set = new Set(processos.map(getClienteName));
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">Processos</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} processo(s) encontrado(s)</p>
        </div>
        <Link to="/processos/novo">
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Novo Processo
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-border/60">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar número, parte..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroEsfera} onValueChange={setFiltroEsfera}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Esfera" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas esferas</SelectItem>
                {ESFERAS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos estados</SelectItem>
                {ESTADOS_BRASIL.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroCliente} onValueChange={setFiltroCliente}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Cliente" /></SelectTrigger>
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
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">Nenhum processo encontrado</p>
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
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-1">
        <h3 className="font-display text-lg font-semibold text-foreground tracking-tight">{title}</h3>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{processos.length}</span>
      </div>

      {Object.entries(grouped).map(([esfera, items]) => (
        <div key={esfera} className="space-y-2">
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pl-1">
            {esfera === 'Estadual' ? 'Justiça Estadual' :
             esfera === 'Federal' ? 'Justiça Federal' :
             esfera === 'Trabalhista' ? 'Justiça do Trabalho' :
             'Processo Administrativo'}
          </h4>
          <div className="space-y-1.5">
            {items.map(p => (
              <Card key={p.id} className="shadow-card hover:shadow-card-hover transition-shadow duration-200 border-border/50">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <SemaphoreIndicator date={p.dataUltimoAcompanhamento} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[13px] font-semibold text-foreground">{p.numero}</span>
                        <Badge variant="secondary" className="text-[10px] font-medium">{p.tipoAcao}</Badge>
                        <Badge variant="outline" className="text-[10px] font-medium">{p.estado}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.autor} <span className="opacity-40">vs</span> {p.reu}
                        <span className="ml-2 text-primary/80 font-medium">(cliente: {getClienteName(p)})</span>
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground hidden sm:block">
                      <p className="truncate max-w-[180px]">{p.status || 'Sem movimentação'}</p>
                      <p className="tabular-nums">{p.dataUltimoAcompanhamento ? new Date(p.dataUltimoAcompanhamento).toLocaleDateString('pt-BR') : '—'}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Link to={`/processos/${p.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Link to={`/processos/${p.id}/editar`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
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
