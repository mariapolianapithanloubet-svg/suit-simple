import { useState } from 'react';
import { Grupo } from '@/types/process';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Check, X, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GrupoManagerProps {
  grupos: Grupo[];
  onAdd: (nome: string) => Promise<Grupo>;
  onUpdate: (id: string, nome: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function GrupoManager({ grupos, onAdd, onUpdate, onDelete }: GrupoManagerProps) {
  const [newNome, setNewNome] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Grupo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    const trimmed = newNome.trim();
    if (!trimmed) return;
    if (grupos.some(g => g.nome.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: 'Erro', description: 'Já existe um grupo com esse nome.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await onAdd(trimmed);
      setNewNome('');
      toast({ title: 'Grupo criado com sucesso.' });
    } catch {
      toast({ title: 'Erro ao criar grupo.', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const handleUpdate = async (id: string) => {
    const trimmed = editNome.trim();
    if (!trimmed) return;
    if (grupos.some(g => g.id !== id && g.nome.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: 'Erro', description: 'Já existe um grupo com esse nome.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await onUpdate(id, trimmed);
      setEditingId(null);
      toast({ title: 'Grupo atualizado.' });
    } catch {
      toast({ title: 'Erro ao atualizar grupo.', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await onDelete(deleteTarget.id);
      toast({ title: 'Grupo excluído.' });
    } catch {
      toast({ title: 'Erro ao excluir grupo. Verifique se há processos vinculados.', variant: 'destructive' });
    }
    setDeleteTarget(null);
    setSubmitting(false);
  };

  const startEdit = (grupo: Grupo) => {
    setEditingId(grupo.id);
    setEditNome(grupo.nome);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">Grupos</h2>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os grupos de clientes do escritório.</p>
      </div>

      {/* Create form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Novo Grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="grupo-nome" className="text-xs">Nome do Grupo</Label>
              <Input
                id="grupo-nome"
                placeholder="Ex: Grupo Empresarial ABC"
                value={newNome}
                onChange={e => setNewNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <Button onClick={handleAdd} disabled={submitting || !newNome.trim()} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            Grupos Cadastrados
            <span className="text-xs font-normal text-muted-foreground">({grupos.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {grupos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum grupo cadastrado.</p>
          ) : (
            <div className="divide-y divide-border">
              {grupos.map(grupo => (
                <div key={grupo.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  {editingId === grupo.id ? (
                    <>
                      <Input
                        value={editNome}
                        onChange={e => setEditNome(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleUpdate(grupo.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleUpdate(grupo.id)} disabled={submitting}>
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-foreground">{grupo.nome}</span>
                      <Button variant="ghost" size="icon" onClick={() => startEdit(grupo)}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(grupo)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o grupo "{deleteTarget?.nome}"? Processos vinculados perderão a associação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
