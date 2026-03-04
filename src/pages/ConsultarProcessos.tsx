import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Processo, getClienteName, COMPETENCIAS } from '@/types/process';
import { CategoriaRow } from '@/hooks/useAdminTables';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Search, X } from 'lucide-react';

interface Props {
  processos: Processo[];
  grupos: { id: string; nome: string }[];
  categorias?: CategoriaRow[];
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

export default function ConsultarProcessos({ processos, grupos, categorias = [] }: Props) {
  const [search, setSearch] = useState('');
  const [filtroCompetencia, setFiltroCompetencia] = useState('all');
  const [filtroFase, setFiltroFase] = useState('all');
  const [filtroCategoria, setFiltroCategoria] = useState('all');
  const [filtroGrupo, setFiltroGrupo] = useState('all');
  const navigate = useNavigate();

  const grupoMap = useMemo(() => new Map(grupos.map(g => [g.id, g.nome])), [grupos]);

  const hasFilters = filtroCompetencia !== 'all' || filtroFase !== 'all' || filtroCategoria !== 'all' || filtroGrupo !== 'all';

  const clearFilters = () => {
    setFiltroCompetencia('all');
    setFiltroFase('all');
    setFiltroCategoria('all');
    setFiltroGrupo('all');
  };

  const filtered = useMemo(() => {
    return processos.filter(p => {
      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const cliente = getClienteName(p).toLowerCase();
        const parteContraria = (p.clienteEscritorio === 'Autor' ? p.reu : p.autor).toLowerCase();
        const grupo = (p.grupoId ? grupoMap.get(p.grupoId) || '' : '').toLowerCase();
        const numero = getNumeroFaseAtual(p).toLowerCase();
        if (!numero.includes(q) && !cliente.includes(q) && !parteContraria.includes(q) && !grupo.includes(q)) return false;
      }
      // Filters
      if (filtroCompetencia !== 'all' && p.competencia !== filtroCompetencia) return false;
      if (filtroFase !== 'all' && p.faseAtual !== filtroFase) return false;
      if (filtroCategoria !== 'all' && p.categoria !== filtroCategoria) return false;
      if (filtroGrupo !== 'all' && (p.grupoId || '') !== filtroGrupo) return false;
      return true;
    });
  }, [search, processos, grupoMap, filtroCompetencia, filtroFase, filtroCategoria, filtroGrupo]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">Consultar Processos</h2>
        <p className="text-sm text-muted-foreground mt-1">Pesquise por número, cliente, parte contrária ou grupo</p>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar processos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={filtroCompetencia} onValueChange={setFiltroCompetencia}>
          <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Competência" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas competências</SelectItem>
            {COMPETENCIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
            {categorias.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
          <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Grupo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos grupos</SelectItem>
            {grupos.map(g => <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>)}
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
          {search ? 'Nenhum processo encontrado para esta pesquisa.' : 'Nenhum processo cadastrado.'}
        </p>
      ) : (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Número do Processo (Fase Atual)</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Fase Atual</TableHead>
                <TableHead>Competência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/consultar/${p.id}`)}
                >
                  <TableCell className="font-medium">{getNumeroFaseAtual(p)}</TableCell>
                  <TableCell>{getClienteName(p)}</TableCell>
                  <TableCell>{p.grupoId ? grupoMap.get(p.grupoId) || '—' : '—'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {FASE_LABELS[p.faseAtual] || p.faseAtual}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.competencia}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
