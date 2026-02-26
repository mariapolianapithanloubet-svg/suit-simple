import { useMemo } from 'react';
import { Processo, getClienteName, ESFERAS, CATEGORIAS, ESTADOS_BRASIL, getSemaphoreStatus } from '@/types/process';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, FolderOpen, AlertTriangle, CheckCircle, Clock, FileText, Users, TrendingUp } from 'lucide-react';

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Painel de Controle</h2>
        <p className="text-sm text-muted-foreground">Visão geral dos processos do escritório</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total de Processos" value={stats.total} />
        <StatCard icon={Scale} label="Relevantes" value={stats.relevantes} />
        <StatCard icon={FolderOpen} label="Acompanhamento" value={stats.acompanhamento} />
        <StatCard icon={Users} label="Clientes" value={stats.totalClientes} />
      </div>

      {/* Semaphore Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Status de Acompanhamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-semaphore-green/10">
              <CheckCircle className="h-5 w-5 text-semaphore-green" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.semaphoreStats.green}</p>
                <p className="text-xs text-muted-foreground">Em dia (≤15 dias)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-semaphore-yellow/10">
              <Clock className="h-5 w-5 text-semaphore-yellow" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.semaphoreStats.yellow}</p>
                <p className="text-xs text-muted-foreground">Atenção (15-45 dias)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-semaphore-red/10">
              <AlertTriangle className="h-5 w-5 text-semaphore-red" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.semaphoreStats.red}</p>
                <p className="text-xs text-muted-foreground">Atrasado (&gt;45 dias)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Por Esfera */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Processos por Esfera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.porEsfera.map(({ label, count }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{label}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-primary/20 w-32">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: stats.total ? `${(count / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Por Estado (top 10) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Processos por Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.estadosOrdenados.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum processo cadastrado</p>
            )}
            {stats.estadosOrdenados.slice(0, 8).map(([estado, count]) => (
              <div key={estado} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{estado}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-primary/20 w-32">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: stats.total ? `${(count / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-6 text-right">{count}</span>
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
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
