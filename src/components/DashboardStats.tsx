import { useMemo } from 'react';
import { Processo, getClienteName, ESFERAS, getSemaphoreStatus } from '@/types/process';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Scale, FolderOpen, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface DashboardStatsProps {
  processos: Processo[];
}

export function DashboardStats({ processos }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const total = processos.length;
    const relevantes = processos.filter(p => p.categoria === 'Relevante').length;
    const acompanhamento = processos.filter(p => p.categoria === 'Mero Acompanhamento').length;

    const porEsfera = ESFERAS.map(e => ({
      label: e,
      count: processos.filter(p => p.esfera === e).length,
    }));

    const porEstado: Record<string, number> = {};
    processos.forEach(p => {
      porEstado[p.estado] = (porEstado[p.estado] || 0) + 1;
    });
    const estadosOrdenados = Object.entries(porEstado).sort((a, b) => b[1] - a[1]);

    const semaphoreStats = {
      green: processos.filter(p => getSemaphoreStatus(p.dataUltimoAcompanhamento) === 'green').length,
      yellow: processos.filter(p => getSemaphoreStatus(p.dataUltimoAcompanhamento) === 'yellow').length,
      red: processos.filter(p => getSemaphoreStatus(p.dataUltimoAcompanhamento) === 'red').length,
    };

    const clienteCount: Record<string, number> = {};
    processos.forEach(p => {
      const c = getClienteName(p);
      clienteCount[c] = (clienteCount[c] || 0) + 1;
    });
    const totalClientes = Object.keys(clienteCount).length;

    return { total, relevantes, acompanhamento, porEsfera, estadosOrdenados, semaphoreStats, totalClientes };
  }, [processos]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">Painel de Controle</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Visão geral dos processos do escritório</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total de Processos" value={stats.total} />
        <StatCard icon={Scale} label="Relevantes" value={stats.relevantes} />
        <StatCard icon={FolderOpen} label="Acompanhamento" value={stats.acompanhamento} />
        <StatCard icon={Users} label="Clientes" value={stats.totalClientes} />
      </div>

      {/* Semaphore Overview */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display tracking-tight">Status de Acompanhamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <SemaphoreCard icon={CheckCircle} count={stats.semaphoreStats.green} label="Em dia" sublabel="≤15 dias" color="green" />
            <SemaphoreCard icon={Clock} count={stats.semaphoreStats.yellow} label="Atenção" sublabel="15-45 dias" color="yellow" />
            <SemaphoreCard icon={AlertTriangle} count={stats.semaphoreStats.red} label="Atrasado" sublabel=">45 dias" color="red" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display tracking-tight">Processos por Esfera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.porEsfera.map(({ label, count }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-foreground/80">{label}</span>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 rounded-full bg-muted w-28">
                    <div
                      className="h-1.5 rounded-full bg-primary/70 transition-all duration-500"
                      style={{ width: stats.total ? `${(count / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-6 text-right tabular-nums">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display tracking-tight">Processos por Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.estadosOrdenados.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum processo cadastrado</p>
            )}
            {stats.estadosOrdenados.slice(0, 8).map(([estado, count]) => (
              <div key={estado} className="flex items-center justify-between">
                <span className="text-sm text-foreground/80">{estado}</span>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 rounded-full bg-muted w-28">
                    <div
                      className="h-1.5 rounded-full bg-primary/70 transition-all duration-500"
                      style={{ width: stats.total ? `${(count / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-6 text-right tabular-nums">{count}</span>
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
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/8">
            <Icon className="h-4 w-4 text-primary/70" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SemaphoreCard({ icon: Icon, count, label, sublabel, color }: { icon: any; count: number; label: string; sublabel: string; color: 'green' | 'yellow' | 'red' }) {
  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border border-border/40 bg-card`}>
      <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${
        color === 'green' ? 'bg-semaphore-green/10' :
        color === 'yellow' ? 'bg-semaphore-yellow/10' :
        'bg-semaphore-red/10'
      }`}>
        <Icon className={`h-4 w-4 ${
          color === 'green' ? 'text-semaphore-green' :
          color === 'yellow' ? 'text-semaphore-yellow' :
          'text-semaphore-red'
        }`} />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground leading-none tabular-nums">{count}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label} <span className="opacity-60">({sublabel})</span></p>
      </div>
    </div>
  );
}
