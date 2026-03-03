import { useMemo, useState } from 'react';
import { Processo, Grupo, getClienteName } from '@/types/process';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface ClientRankingProps {
  processos: Processo[];
  grupos: Grupo[];
}

interface ClientData {
  nome: string;
  total: number;
  relevantes: number;
  acompanhamento: number;
}

function ClientCard({ cliente }: { cliente: ClientData }) {
  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200 border-border/50">
      <CardContent className="py-4 px-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-foreground truncate">{cliente.nome}</h4>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs font-medium">
                {cliente.relevantes} rel.
              </Badge>
              <Badge variant="outline" className="text-xs font-medium">
                {cliente.acompanhamento} acomp.
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{cliente.total}</p>
            <p className="text-xs text-muted-foreground mt-1">processos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GroupSection({ title, clients, defaultOpen = true }: { title: string; clients: ClientData[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-1 group cursor-pointer">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-muted-foreground tracking-widest uppercase">{title}</h3>
          <Badge variant="secondary" className="text-xs">{clients.length}</Badge>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2.5 pb-6">
          {clients.map(c => (
            <ClientCard key={c.nome} cliente={c} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ClientRanking({ processos, grupos }: ClientRankingProps) {
  const { grouped, individual } = useMemo(() => {
    // Build client data keyed by nome, tracking grupoId
    const clientMap: Record<string, ClientData & { grupoId?: string }> = {};

    processos.forEach(p => {
      const cliente = getClienteName(p);
      if (!clientMap[cliente]) {
        clientMap[cliente] = { nome: cliente, total: 0, relevantes: 0, acompanhamento: 0, grupoId: p.grupoId };
      }
      clientMap[cliente].total++;
      if (p.categoria === 'Relevante') clientMap[cliente].relevantes++;
      else clientMap[cliente].acompanhamento++;
    });

    const allClients = Object.values(clientMap);
    const grupoMap = new Map(grupos.map(g => [g.id, g.nome]));

    // Group by grupoId
    const sections: Record<string, ClientData[]> = {};
    const indiv: ClientData[] = [];

    allClients.forEach(c => {
      if (c.grupoId && grupoMap.has(c.grupoId)) {
        const gName = grupoMap.get(c.grupoId)!;
        if (!sections[gName]) sections[gName] = [];
        sections[gName].push(c);
      } else {
        indiv.push(c);
      }
    });

    // Sort clients alphabetically within each section
    Object.values(sections).forEach(list => list.sort((a, b) => a.nome.localeCompare(b.nome)));
    indiv.sort((a, b) => a.nome.localeCompare(b.nome));

    // Sort groups alphabetically
    const sortedGroups = Object.entries(sections).sort(([a], [b]) => a.localeCompare(b));

    return { grouped: sortedGroups, individual: indiv };
  }, [processos, grupos]);

  const isEmpty = grouped.length === 0 && individual.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">Ranking de Clientes</h2>
        <p className="text-sm text-muted-foreground mt-1">Clientes ordenados por grupo e volume de demandas</p>
      </div>

      {isEmpty ? (
        <Card className="shadow-card border-border/60">
          <CardContent className="py-20 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-base text-muted-foreground">Nenhum processo cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {grouped.map(([gName, clients]) => (
            <GroupSection key={gName} title={gName} clients={clients} />
          ))}
          {individual.length > 0 && (
            <GroupSection title="Clientes Individuais" clients={individual} />
          )}
        </div>
      )}
    </div>
  );
}
