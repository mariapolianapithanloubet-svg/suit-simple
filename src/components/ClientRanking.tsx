import { useMemo } from 'react';
import { Processo, getClienteName } from '@/types/process';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Ranking de Clientes</h2>
        <p className="text-sm text-muted-foreground">Clientes ordenados por volume de demandas</p>
      </div>

      {ranking.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhum processo cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {ranking.map((cliente, i) => (
            <Card key={cliente.nome} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4 px-5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary font-display font-bold text-sm">
                    {i + 1}º
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{cliente.nome}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {cliente.relevantes} relevante{cliente.relevantes !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {cliente.acompanhamento} acomp.
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{cliente.total}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">processos</p>
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
