import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useProcessos } from "@/hooks/useProcessos";
import { useAuth } from "@/hooks/useAuth";
import { DashboardStats } from "@/components/DashboardStats";
import { ProcessList } from "@/components/ProcessList";
import { ProcessForm } from "@/components/ProcessForm";
import { ProcessDetail } from "@/components/ProcessDetail";
import { ClientRanking } from "@/components/ClientRanking";
import Auth from "@/pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { session, loading: authLoading, signOut } = useAuth();
  const { processos, loading, addProcesso, updateProcesso, deleteProcesso, uploadDocumento, deleteDocumento } = useProcessos();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <AppLayout onSignOut={signOut} userEmail={session.user?.email}>
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
