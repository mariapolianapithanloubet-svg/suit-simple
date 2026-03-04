

## Add "Ações" Column to Consultar Processos Table

### Changes

**`src/pages/ConsultarProcessos.tsx`**
- Expand the Props interface to accept `onDelete: (id: string) => void` and `isAdmin: boolean`
- Add an "Ações" column header (non-sortable, right-aligned)
- Add Edit (Pencil) and Delete (Trash2) icon buttons in each row
  - Edit: navigates to `/processos/{id}/editar`
  - Delete: only visible if `isAdmin` is true; opens an AlertDialog confirmation modal, then calls `onDelete(id)`
- Stop the click event propagation on the action buttons so the row click (navigate to detail) doesn't fire
- Import `Pencil`, `Trash2` from lucide-react and AlertDialog components

**`src/App.tsx`**
- Pass `onDelete={deleteProcesso}` and `isAdmin={isAdmin}` to the `<ConsultarProcessos>` component

No database changes needed — the existing RLS policy "Only admin can delete" on `processos` already enforces server-side admin-only deletion. The `deleteProcesso` function from `useProcessos` is already implemented.

