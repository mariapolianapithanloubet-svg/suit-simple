import { useState } from 'react';
import { TipoVinculoRow } from '@/hooks/useAdminTables';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Check, X, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  tiposVinculo: TipoVinculoRow[];
  onAdd: (nome: string) => Promise<void>;
  onUpdate: (id: string, nome: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TiposVinculoPage({ tiposVinculo, onAdd, onUpdate, onDelete }: Props) {
  const [newNome, setNewNome] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TipoVinculoRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    const trimmed = newNome.trim();
    if (!trimmed) return;
    if (tiposVinculo.some(t => t.nome.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: 'Erro', description: 'Já existe um tipo de vínculo com esse nome.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try { await onAdd(trimmed); setNewNome(''); toast({ title: 'Tipo de vínculo criado.' }); }
    catch { toast({ title: 'Erro ao criar tipo de vínculo.', variant: 'destructive' }); }
    setSubmitting(false);
  };

  const handleUpdate = async (id: string) => {
    const trimmed = editNome.trim();
    if (!trimmed) return;
    if (tiposVinculo.some(t => t.id !== id && t.nome.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: 'Erro', description: 'Já existe um tipo de vínculo com esse nome.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try { await onUpdate(id, trimmed); setEditingId(null); toast({ title: 'Tipo de vínculo atualizado.' }); }
    catch { toast({ title: 'Erro ao atualizar.', variant: 'destructive' }); }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try { await onDelete(deleteTarget.id); toast({ title: 'Tipo de vínculo excluído.' }); }
    catch { toast({ title: 'Erro ao excluir.', variant: 'destructive' }); }
    setDeleteTarget(null);
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[28px] font-semibold text-foreground tracking-tight">Tipos de Vínculo</h2>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os tipos de vínculo entre processos.</p>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base font-medium">Novo Tipo de Vínculo</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="tv-nome" className="text-xs">Nome</Label>
              <Input id="tv-nome" placeholder="Ex: Embargos à Execução" value={newNome} onChange={e => setNewNome(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            </div>
            <Button onClick={handleAdd} disabled={submitting || !newNome.trim()} size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />Tipos Cadastrados <span className="text-xs font-normal text-muted-foreground">({tiposVinculo.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tiposVinculo.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum tipo cadastrado.</p>
          ) : (
            <div className="divide-y divide-border">
              {tiposVinculo.map(tv => (
                <div key={tv.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  {editingId === tv.id ? (
                    <>
                      <Input value={editNome} onChange={e => setEditNome(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleUpdate(tv.id); if (e.key === 'Escape') setEditingId(null); }} className="flex-1" autoFocus />
                      <Button variant="ghost" size="icon" onClick={() => handleUpdate(tv.id)} disabled={submitting}><Check className="h-4 w-4 text-green-600" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-foreground">{tv.nome}</span>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingId(tv.id); setEditNome(tv.nome); }}><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(tv)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tipo de vínculo</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir "{deleteTarget?.nome}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
