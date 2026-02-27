import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useProcessos } from "@/hooks/useProcessos";
import { DashboardStats } from "@/components/DashboardStats";
import { ProcessList } from "@/components/ProcessList";
import { ProcessForm } from "@/components/ProcessForm";
import { ProcessDetail } from "@/components/ProcessDetail";
import { ClientRanking } from "@/components/ClientRanking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { processos, loading, addProcesso, updateProcesso, deleteProcesso, uploadDocumento, deleteDocumento } = useProcessos();

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardStats processos={processos} />} />
        <Route path="/processos" element={<ProcessList processos={processos} onDelete={deleteProcesso} loading={loading} />} />
        <Route path="/processos/novo" element={
          <ProcessForm mode="create" onSubmit={addProcesso} />
        } />
        <Route path="/processos/:id" element={
          <ProcessDetail processos={processos} onDelete={deleteProcesso} onUploadDocumento={uploadDocumento} onDeleteDocumento={deleteDocumento} />
        } />
        <Route path="/processos/:id/editar" element={
          <EditProcessPage processos={processos} onUpdate={updateProcesso} />
        } />
        <Route path="/clientes" element={<ClientRanking processos={processos} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

function EditProcessPage({ processos, onUpdate }: { processos: any[]; onUpdate: (id: string, data: any) => void }) {
  const { id } = useParams();
  const processo = processos.find((p: any) => p.id === id);
  if (!processo) return <div className="text-center py-20 text-muted-foreground text-sm">Processo não encontrado</div>;
  return (
    <ProcessForm
      mode="edit"
      initialData={processo}
      onSubmit={(data) => onUpdate(processo.id, data)}
    />
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
