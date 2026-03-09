import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useProcessos } from "@/hooks/useProcessos";
import { useAuth } from "@/hooks/useAuth";
import { useAdminTables } from "@/hooks/useAdminTables";
import { DashboardStats } from "@/components/DashboardStats";
import { ProcessList } from "@/components/ProcessList";
import { ProcessForm } from "@/components/ProcessForm";
import { ProcessDetail } from "@/components/ProcessDetail";
import { ClientRanking } from "@/components/ClientRanking";
import { ProcessImport } from "@/components/ProcessImport";
import { GrupoManager } from "@/components/GrupoManager";
import ConsultarProcessos from "@/pages/ConsultarProcessos";
import ProcessoView from "@/pages/ProcessoView";
import CategoriasPage from "@/pages/CategoriasPage";
import TiposVinculoPage from "@/pages/TiposVinculoPage";
import TribunaisPage from "@/pages/TribunaisPage";
import Auth from "@/pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { session, loading: authLoading, signOut, isAdmin } = useAuth();
  const { processos, grupos, loading, addProcesso, updateProcesso, deleteProcesso, uploadDocumento, deleteDocumento, bulkImport, clearImported, addGrupo, updateGrupo, deleteGrupo, refetch } = useProcessos();
  const admin = useAdminTables();

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
        <Route path="/consultar" element={<ConsultarProcessos processos={processos} grupos={grupos} categorias={admin.categorias} onDelete={deleteProcesso} isAdmin={isAdmin} onRefresh={refetch} />} />
        <Route path="/consultar/:id" element={<ProcessoView processos={processos} grupos={grupos} />} />
        <Route path="/processos" element={<ProcessList processos={processos} onDelete={deleteProcesso} loading={loading} isAdmin={isAdmin} onClearImported={clearImported} />} />
        <Route path="/processos/importar" element={<ProcessImport onImport={bulkImport} />} />
        <Route path="/processos/novo" element={
          <ProcessForm mode="create" onSubmit={addProcesso} grupos={grupos} processos={processos} categorias={admin.categorias} tiposVinculo={admin.tiposVinculo} tribunais={admin.tribunais} />
        } />
        <Route path="/processos/:id" element={
          <ProcessDetail processos={processos} onDelete={deleteProcesso} onUploadDocumento={uploadDocumento} onDeleteDocumento={deleteDocumento} />
        } />
        <Route path="/processos/:id/editar" element={
          <EditProcessPage processos={processos} onUpdate={updateProcesso} grupos={grupos} categorias={admin.categorias} tiposVinculo={admin.tiposVinculo} tribunais={admin.tribunais} />
        } />
        <Route path="/clientes" element={<ClientRanking processos={processos} grupos={grupos} />} />
        <Route path="/grupos" element={<GrupoManager grupos={grupos} onAdd={addGrupo} onUpdate={updateGrupo} onDelete={deleteGrupo} />} />
        <Route path="/admin/categorias" element={<CategoriasPage categorias={admin.categorias} onAdd={admin.addCategoria} onUpdate={admin.updateCategoria} onDelete={admin.deleteCategoria} />} />
        <Route path="/admin/tipos-vinculo" element={<TiposVinculoPage tiposVinculo={admin.tiposVinculo} onAdd={admin.addTipoVinculo} onUpdate={admin.updateTipoVinculo} onDelete={admin.deleteTipoVinculo} />} />
        <Route path="/admin/tribunais" element={<TribunaisPage tribunais={admin.tribunais} onAdd={admin.addTribunal} onUpdate={admin.updateTribunal} onDelete={admin.deleteTribunal} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

function EditProcessPage({ processos, onUpdate, grupos, categorias, tiposVinculo, tribunais }: { processos: any[]; onUpdate: (id: string, data: any) => void; grupos: any[]; categorias: any[]; tiposVinculo: any[]; tribunais: any[] }) {
  const { id } = useParams();
  const processo = processos.find((p: any) => p.id === id);
  if (!processo) return <div className="text-center py-20 text-muted-foreground text-sm">Processo não encontrado</div>;
  return (
    <ProcessForm
      mode="edit"
      initialData={processo}
      onSubmit={(data) => onUpdate(processo.id, data)}
      grupos={grupos}
      processos={processos}
      categorias={categorias}
      tiposVinculo={tiposVinculo}
      tribunais={tribunais}
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
