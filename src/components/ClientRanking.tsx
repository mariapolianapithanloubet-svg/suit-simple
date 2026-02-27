import { useMemo } from 'react';
import { Processo, getClienteName } from '@/types/process';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface ClientRankingProps {
  processos: Processo[];
}

export function ClientRanking({ processos }: ClientRankingProps) {
  const ranking = useMemo(() => {
    const counts: Record<string, { total: number; relevantes: number; acompanhamento: number }> = {};
    processos.forEach(p => {
      const cliente = getClienteName(p);
      if (!counts[cliente]) counts[cliente] = { total: 0, relevantes: 0, acompanhamento: 0 };
      counts[cliente].total++;
      if (p.categoria === 'Relevante') counts[cliente].relevantes++;
      else counts[cliente].acompanhamento++;
    });
    return Object.entries(counts)
      .map(([nome, data]) => ({ nome, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [processos]);

  const maxTotal = ranking.length > 0 ? ranking[0].total : 1;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">Ranking de Clientes</h2>
        <p className="text-sm text-muted-foreground mt-1">Clientes ordenados por volume de demandas</p>
      </div>

      {ranking.length === 0 ? (
        <Card className="shadow-card border-border/60">
          <CardContent className="py-20 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-base text-muted-foreground">Nenhum processo cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {ranking.map((cliente, i) => (
            <Card key={cliente.nome} className="shadow-card hover:shadow-card-hover transition-shadow duration-200 border-border/50">
              <CardContent className="py-4 px-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/8 text-primary font-display font-bold text-sm">
                    {i + 1}º
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-foreground truncate">{cliente.nome}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted max-w-[140px]">
                        <div className="h-1.5 rounded-full bg-primary/60 transition-all duration-500" style={{ width: `${(cliente.total / maxTotal) * 100}%` }} />
                      </div>
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
          ))}
        </div>
      )}
    </div>
  );
}
