import { useState } from 'react';
import { CategoriaRow } from '@/hooks/useAdminTables';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Check, X, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  categorias: CategoriaRow[];
  onAdd: (nome: string) => Promise<void>;
  onUpdate: (id: string, nome: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function CategoriasPage({ categorias, onAdd, onUpdate, onDelete }: Props) {
  const [newNome, setNewNome] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CategoriaRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    const trimmed = newNome.trim();
    if (!trimmed) return;
    if (categorias.some(c => c.nome.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: 'Erro', description: 'Já existe uma categoria com esse nome.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try { await onAdd(trimmed); setNewNome(''); toast({ title: 'Categoria criada.' }); }
    catch { toast({ title: 'Erro ao criar categoria.', variant: 'destructive' }); }
    setSubmitting(false);
  };

  const handleUpdate = async (id: string) => {
    const trimmed = editNome.trim();
    if (!trimmed) return;
    if (categorias.some(c => c.id !== id && c.nome.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: 'Erro', description: 'Já existe uma categoria com esse nome.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try { await onUpdate(id, trimmed); setEditingId(null); toast({ title: 'Categoria atualizada.' }); }
    catch { toast({ title: 'Erro ao atualizar.', variant: 'destructive' }); }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try { await onDelete(deleteTarget.id); toast({ title: 'Categoria excluída.' }); }
    catch { toast({ title: 'Erro ao excluir categoria.', variant: 'destructive' }); }
    setDeleteTarget(null);
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">Categorias</h2>
        <p className="text-sm text-muted-foreground mt-1">Gerencie as categorias de processos.</p>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base font-medium">Nova Categoria</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="cat-nome" className="text-xs">Nome</Label>
              <Input id="cat-nome" placeholder="Ex: Relevante" value={newNome} onChange={e => setNewNome(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            </div>
            <Button onClick={handleAdd} disabled={submitting || !newNome.trim()} size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />Categorias Cadastradas <span className="text-xs font-normal text-muted-foreground">({categorias.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categorias.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma categoria cadastrada.</p>
          ) : (
            <div className="divide-y divide-border">
              {categorias.map(cat => (
                <div key={cat.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  {editingId === cat.id ? (
                    <>
                      <Input value={editNome} onChange={e => setEditNome(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleUpdate(cat.id); if (e.key === 'Escape') setEditingId(null); }} className="flex-1" autoFocus />
                      <Button variant="ghost" size="icon" onClick={() => handleUpdate(cat.id)} disabled={submitting}><Check className="h-4 w-4 text-green-600" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-foreground">{cat.nome}</span>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingId(cat.id); setEditNome(cat.nome); }}><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(cat)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
            <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
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
