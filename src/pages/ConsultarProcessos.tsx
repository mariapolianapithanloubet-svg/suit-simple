import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Processo, getClienteName, COMPETENCIAS } from '@/types/process';
import { CategoriaRow } from '@/hooks/useAdminTables';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2, FileUp, Star } from 'lucide-react';
import { CsvImportDialog } from '@/components/CsvImportDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
  processos: Processo[];
  grupos: { id: string; nome: string }[];
  categorias?: CategoriaRow[];
  onDelete: (id: string) => void;
  isAdmin: boolean;
  onRefresh?: () => void;
}

function getNumeroFaseAtual(p: Processo): string {
  switch (p.faseAtual) {
    case 'SEGUNDA_INSTANCIA':
      return p.segundaInstanciaNumero || p.numero;
    case 'TRIBUNAL_SUPERIOR':
      return p.tribunalSuperiorNumero || p.numero;
    default:
      return p.primeiraInstanciaNumero || p.numero;
  }
}

const FASE_LABELS: Record<string, string> = {
  PRIMEIRA_INSTANCIA: '1ª Instância',
  SEGUNDA_INSTANCIA: '2ª Instância',
  TRIBUNAL_SUPERIOR: 'Tribunal Superior',
};

type SortKey = 'numero' | 'cliente' | 'grupo' | 'fase' | 'competencia';
type SortDir = 'asc' | 'desc';

export default function ConsultarProcessos({ processos, grupos, categorias = [], onDelete, isAdmin, onRefresh }: Props) {
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filtroCompetencia, setFiltroCompetencia] = useState('all');
  const [filtroFase, setFiltroFase] = useState('all');
  const [filtroCategoria, setFiltroCategoria] = useState('all');
  const [filtroGrupo, setFiltroGrupo] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('numero');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const navigate = useNavigate();

  const grupoMap = useMemo(() => new Map(grupos.map(g => [g.id, g.nome])), [grupos]);
  const sortedGrupos = useMemo(() => [...grupos].sort((a, b) => a.nome.localeCompare(b.nome)), [grupos]);
  const sortedCategorias = useMemo(() => [...categorias].sort((a, b) => a.nome.localeCompare(b.nome)), [categorias]);

  const hasFilters = filtroCompetencia !== 'all' || filtroFase !== 'all' || filtroCategoria !== 'all' || filtroGrupo !== 'all';

  const clearFilters = () => {
    setFiltroCompetencia('all');
    setFiltroFase('all');
    setFiltroCategoria('all');
    setFiltroGrupo('all');
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1 opacity-70" />
      : <ArrowDown className="h-3 w-3 ml-1 opacity-70" />;
  };

  const filtered = useMemo(() => {
    let result = processos.filter(p => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const cliente = getClienteName(p).toLowerCase();
        const parteContraria = (p.clienteEscritorio === 'Autor' ? p.reu : p.autor).toLowerCase();
        const grupo = (p.grupoId ? grupoMap.get(p.grupoId) || '' : '').toLowerCase();
        const numero = getNumeroFaseAtual(p).toLowerCase();
        if (!numero.includes(q) && !cliente.includes(q) && !parteContraria.includes(q) && !grupo.includes(q)) return false;
      }
      if (filtroCompetencia !== 'all' && p.competencia !== filtroCompetencia) return false;
      if (filtroFase !== 'all' && p.faseAtual !== filtroFase) return false;
      if (filtroCategoria !== 'all' && p.categoria !== filtroCategoria) return false;
      if (filtroGrupo !== 'all' && (p.grupoId || '') !== filtroGrupo) return false;
      return true;
    });

    // Sort
    const dir = sortDir === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      let va = '', vb = '';
      switch (sortKey) {
        case 'numero': va = getNumeroFaseAtual(a); vb = getNumeroFaseAtual(b); break;
        case 'cliente': va = getClienteName(a); vb = getClienteName(b); break;
        case 'grupo': va = grupoMap.get(a.grupoId || '') || ''; vb = grupoMap.get(b.grupoId || '') || ''; break;
        case 'fase': va = FASE_LABELS[a.faseAtual] || a.faseAtual; vb = FASE_LABELS[b.faseAtual] || b.faseAtual; break;
        case 'competencia': va = a.competencia; vb = b.competencia; break;
      }
      return va.localeCompare(vb) * dir;
    });

    return result;
  }, [search, processos, grupoMap, filtroCompetencia, filtroFase, filtroCategoria, filtroGrupo, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[28px] font-semibold text-foreground tracking-tight">Consultar Processos</h2>
          <p className="text-sm text-muted-foreground mt-1">Pesquise por número, cliente, parte contrária ou grupo</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setCsvDialogOpen(true)}>
          <FileUp className="h-4 w-4" />Importar Planilha
        </Button>
      </div>

      <CsvImportDialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen} onImportComplete={() => onRefresh?.()} />

      {/* Enhanced search bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por número, cliente, parte contrária ou grupo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-12 h-12 text-base border-2 border-border/80 focus:border-primary/50 rounded-xl shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/60 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={filtroCompetencia} onValueChange={setFiltroCompetencia}>
          <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Competência" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas competências</SelectItem>
            {[...COMPETENCIAS].sort().map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroFase} onValueChange={setFiltroFase}>
          <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Fase" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas fases</SelectItem>
            {Object.entries(FASE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {sortedCategorias.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
          <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Grupo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos grupos</SelectItem>
            {sortedGrupos.map(g => <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs">
            <X className="h-3.5 w-3.5" />Limpar filtros
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          {search || hasFilters ? 'Nenhum processo encontrado para esta pesquisa.' : 'Nenhum processo cadastrado.'}
        </p>
      ) : (
        <div className="rounded-lg border border-border/60 overflow-auto max-h-[70vh]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              <TableRow className="border-b-2 border-border/60">
                <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors text-[13px] font-semibold uppercase tracking-[0.03em]" onClick={() => toggleSort('numero')}>
                  <span className="inline-flex items-center">Número do Processo<SortIcon col="numero" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors text-[13px] font-semibold uppercase tracking-[0.03em]" onClick={() => toggleSort('cliente')}>
                  <span className="inline-flex items-center">Cliente<SortIcon col="cliente" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors text-[13px] font-semibold uppercase tracking-[0.03em]" onClick={() => toggleSort('grupo')}>
                  <span className="inline-flex items-center">Grupo<SortIcon col="grupo" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors text-[13px] font-semibold uppercase tracking-[0.03em]" onClick={() => toggleSort('fase')}>
                  <span className="inline-flex items-center">Fase Atual<SortIcon col="fase" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors text-[13px] font-semibold uppercase tracking-[0.03em]" onClick={() => toggleSort('competencia')}>
                  <span className="inline-flex items-center">Competência<SortIcon col="competencia" /></span>
                </TableHead>
                <TableHead className="text-right text-[13px] font-semibold uppercase tracking-[0.03em]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow
                  key={p.id}
                  className={`cursor-pointer ${p.relevancia === 'relevante' ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}
                  onClick={() => navigate(`/consultar/${p.id}`)}
                >
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {p.relevancia === 'relevante' && <Star className="h-4 w-4 text-yellow-500 fill-yellow-400 shrink-0" />}
                      {getNumeroFaseAtual(p)}
                    </span>
                  </TableCell>
                  <TableCell>{getClienteName(p)}</TableCell>
                  <TableCell>{p.grupoId ? grupoMap.get(p.grupoId) || '—' : '—'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {FASE_LABELS[p.faseAtual] || p.faseAtual}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.competencia}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/processos/${p.id}/editar`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir processo</AlertDialogTitle>
                              <AlertDialogDescription>Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
