import { useState } from 'react';
import { TribunalRow } from '@/hooks/useAdminTables';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ESTADOS_BRASIL } from '@/types/process';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Check, X, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  tribunais: TribunalRow[];
  onAdd: (data: { nome: string; sigla: string; estado?: string }) => Promise<void>;
  onUpdate: (id: string, data: { nome: string; sigla: string; estado?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TribunaisPage({ tribunais, onAdd, onUpdate, onDelete }: Props) {
  const [form, setForm] = useState({ nome: '', sigla: '', estado: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nome: '', sigla: '', estado: '' });
  const [deleteTarget, setDeleteTarget] = useState<TribunalRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!form.nome.trim() || !form.sigla.trim()) {
      toast({ title: 'Erro', description: 'Nome e sigla são obrigatórios.', variant: 'destructive' });
      return;
    }
    if (tribunais.some(t => t.sigla.toLowerCase() === form.sigla.trim().toLowerCase())) {
      toast({ title: 'Erro', description: 'Já existe um tribunal com essa sigla.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({ nome: form.nome.trim(), sigla: form.sigla.trim().toUpperCase(), estado: form.estado || undefined });
      setForm({ nome: '', sigla: '', estado: '' });
      toast({ title: 'Tribunal criado.' });
    } catch { toast({ title: 'Erro ao criar tribunal.', variant: 'destructive' }); }
    setSubmitting(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.nome.trim() || !editForm.sigla.trim()) return;
    if (tribunais.some(t => t.id !== id && t.sigla.toLowerCase() === editForm.sigla.trim().toLowerCase())) {
      toast({ title: 'Erro', description: 'Já existe um tribunal com essa sigla.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await onUpdate(id, { nome: editForm.nome.trim(), sigla: editForm.sigla.trim().toUpperCase(), estado: editForm.estado || undefined });
      setEditingId(null);
      toast({ title: 'Tribunal atualizado.' });
    } catch { toast({ title: 'Erro ao atualizar.', variant: 'destructive' }); }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try { await onDelete(deleteTarget.id); toast({ title: 'Tribunal excluído.' }); }
    catch { toast({ title: 'Erro ao excluir tribunal.', variant: 'destructive' }); }
    setDeleteTarget(null);
    setSubmitting(false);
  };

  const startEdit = (t: TribunalRow) => {
    setEditingId(t.id);
    setEditForm({ nome: t.nome, sigla: t.sigla, estado: t.estado || '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[28px] font-semibold text-foreground tracking-tight">Tribunais</h2>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os tribunais disponíveis no sistema.</p>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base font-medium">Novo Tribunal</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome *</Label>
              <Input placeholder="Ex: Tribunal de Justiça do RS" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sigla *</Label>
              <Input placeholder="Ex: TJRS" value={form.sigla} onChange={e => setForm(f => ({ ...f, sigla: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Estado (opcional)</Label>
              <Select value={form.estado || 'none'} onValueChange={v => setForm(f => ({ ...f, estado: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {ESTADOS_BRASIL.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} disabled={submitting || !form.nome.trim() || !form.sigla.trim()} size="sm">
              <Plus className="h-4 w-4 mr-1" />Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />Tribunais Cadastrados <span className="text-xs font-normal text-muted-foreground">({tribunais.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tribunais.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum tribunal cadastrado.</p>
          ) : (
            <div className="divide-y divide-border">
              {tribunais.map(trib => (
                <div key={trib.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  {editingId === trib.id ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                      <Input value={editForm.nome} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome" />
                      <Input value={editForm.sigla} onChange={e => setEditForm(f => ({ ...f, sigla: e.target.value }))} placeholder="Sigla" />
                      <Select value={editForm.estado || 'none'} onValueChange={v => setEditForm(f => ({ ...f, estado: v === 'none' ? '' : v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {ESTADOS_BRASIL.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleUpdate(trib.id)} disabled={submitting}><Check className="h-4 w-4 text-green-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground">{trib.sigla}</span>
                        <span className="text-sm text-muted-foreground ml-2">— {trib.nome}</span>
                        {trib.estado && <span className="text-xs text-muted-foreground ml-2">({trib.estado})</span>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => startEdit(trib)}><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(trib)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
            <AlertDialogTitle>Excluir tribunal</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir "{deleteTarget?.sigla} — {deleteTarget?.nome}"?</AlertDialogDescription>
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
