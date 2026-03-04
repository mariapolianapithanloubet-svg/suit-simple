import { useMemo } from 'react';
import { Processo, getClienteName, COMPETENCIAS } from '@/types/process';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Scale, FolderOpen, Users } from 'lucide-react';

interface DashboardStatsProps {
  processos: Processo[];
}

export function DashboardStats({ processos }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const total = processos.length;
    const relevantes = processos.filter(p => p.categoria === 'Relevante').length;
    const acompanhamento = processos.filter(p => p.categoria === 'Mero Acompanhamento').length;

    const porCompetencia = COMPETENCIAS.map(c => ({
      label: c,
      count: processos.filter(p => p.competencia === c).length,
    }));

    const porEstado: Record<string, number> = {};
    processos.forEach(p => {
      porEstado[p.estado] = (porEstado[p.estado] || 0) + 1;
    });
    const estadosOrdenados = Object.entries(porEstado).sort((a, b) => b[1] - a[1]);

    const clienteCount: Record<string, number> = {};
    processos.forEach(p => {
      const c = getClienteName(p);
      clienteCount[c] = (clienteCount[c] || 0) + 1;
    });
    const totalClientes = Object.keys(clienteCount).length;

    return { total, relevantes, acompanhamento, porCompetencia, estadosOrdenados, totalClientes };
  }, [processos]);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-[28px] font-semibold text-foreground tracking-tight">PAINEL DE CONTROLE</h2>
        <p className="text-base text-muted-foreground mt-1">Visão geral dos processos do escritório</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={FileText} label="TOTAL DE PROCESSOS" value={stats.total} />
        <StatCard icon={Scale} label="RELEVANTES" value={stats.relevantes} />
        <StatCard icon={FolderOpen} label="ACOMPANHAMENTO" value={stats.acompanhamento} />
        <StatCard icon={Users} label="CLIENTES" value={stats.totalClientes} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-[18px] font-semibold tracking-[0.02em]">DISTRIBUIÇÃO POR COMPETÊNCIA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.porCompetencia.map(({ label, count }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/80">{label}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 rounded-full bg-muted w-32">
                    <div
                      className="h-2 rounded-full bg-primary/70 transition-all duration-500"
                      style={{ width: stats.total ? `${(count / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-7 text-right tabular-nums">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-display tracking-tight">PROCESSOS POR ESTADO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.estadosOrdenados.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum processo cadastrado</p>
            )}
            {stats.estadosOrdenados.slice(0, 8).map(([estado, count]) => (
              <div key={estado} className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/80">{estado}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 rounded-full bg-muted w-32">
                    <div
                      className="h-2 rounded-full bg-primary/70 transition-all duration-500"
                      style={{ width: stats.total ? `${(count / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-7 text-right tabular-nums">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card className="shadow-card border-border/60">
      <CardContent className="pt-6 pb-5 px-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-primary/8">
            <Icon className="h-5 w-5 text-primary/70" />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground tabular-nums leading-none">{value}</p>
            <p className="text-sm text-muted-foreground mt-1.5 font-medium">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
