import { useMemo, useState } from 'react';
import { Processo, getClienteName, ESFERAS, ESTADOS_BRASIL, CATEGORIAS, Esfera, Categoria } from '@/types/process';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SemaphoreIndicator } from '@/components/SemaphoreIndicator';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, Search, Plus, Filter } from 'lucide-react';

interface ProcessListProps {
  processos: Processo[];
  onDelete: (id: string) => void;
}

export function ProcessList({ processos, onDelete }: ProcessListProps) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Processos</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} processo(s) encontrado(s)</p>
        </div>
        <Link to="/processos/novo">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Processo
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filtros</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar número, parte..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroEsfera} onValueChange={setFiltroEsfera}>
              <SelectTrigger><SelectValue placeholder="Esfera" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas esferas</SelectItem>
                {ESFERAS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos estados</SelectItem>
                {ESTADOS_BRASIL.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroCliente} onValueChange={setFiltroCliente}>
              <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos clientes</SelectItem>
                {clientes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Relevantes */}
      <ProcessSection title="Processos Relevantes" processos={relevantes} onDelete={onDelete} />

      {/* Acompanhamento */}
      <ProcessSection title="Mero Acompanhamento" processos={acompanhamento} onDelete={onDelete} />
    </div>
  );
}

function ProcessSection({ title, processos, onDelete }: { title: string; processos: Processo[]; onDelete: (id: string) => void }) {
  if (processos.length === 0) return null;

  // Group by esfera
  const grouped = ESFERAS.reduce((acc, esfera) => {
    const items = processos.filter(p => p.esfera === esfera);
    if (items.length > 0) acc[esfera] = items;
    return acc;
  }, {} as Record<string, Processo[]>);

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-foreground border-b border-border pb-2">
        {title}
        <Badge variant="secondary" className="ml-3 font-body">{processos.length}</Badge>
      </h3>

      {Object.entries(grouped).map(([esfera, items]) => (
        <div key={esfera} className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-1">
            {esfera === 'Estadual' ? 'Justiça Estadual' :
             esfera === 'Federal' ? 'Justiça Federal' :
             esfera === 'Trabalhista' ? 'Justiça do Trabalho' :
             'Processo Administrativo'}
          </h4>
          <div className="space-y-2">
            {items.map(p => (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <SemaphoreIndicator date={p.dataUltimoAcompanhamento} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-foreground">{p.numero}</span>
                        <Badge variant="outline" className="text-[10px]">{p.tipoAcao}</Badge>
                        <Badge variant="outline" className="text-[10px]">{p.estado}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.autor} <span className="text-muted-foreground/50">×</span> {p.reu}
                        <span className="ml-2 text-primary font-medium">(cliente: {getClienteName(p)})</span>
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground hidden sm:block">
                      <p>{p.status || 'Sem movimentação'}</p>
                      <p>{p.dataUltimoAcompanhamento ? new Date(p.dataUltimoAcompanhamento).toLocaleDateString('pt-BR') : '—'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link to={`/processos/${p.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Link to={`/processos/${p.id}/editar`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(p.id)}>
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
