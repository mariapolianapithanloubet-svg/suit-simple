

## Plan: Create GRUPOS management page

### 1. Database Migration

Add DELETE RLS policy for `grupos` table (currently missing):

```sql
CREATE POLICY "Authenticated users can delete grupos"
ON public.grupos FOR DELETE TO authenticated
USING (auth.role() = 'authenticated');
```

### 2. New Component: `src/components/GrupoManager.tsx`

- Full CRUD page for grupos
- List all grupos in a table/card layout
- Inline form to create new grupo (nome field, required)
- Edit button per row: inline edit or dialog
- Delete button with confirmation dialog
- Uses `supabase` client directly for CRUD operations
- On create/edit/delete, calls a `refetch` callback so the hook's `grupos` state stays in sync

### 3. Update `src/hooks/useProcessos.ts`

- Add `deleteGrupo` and `updateGrupo` functions
- Expose them from the hook

### 4. Update `src/components/AppLayout.tsx`

- Add nav item `{ label: 'Grupos', path: '/grupos', icon: Layers }` after "Clientes"

### 5. Update `src/App.tsx`

- Add route `/grupos` rendering `<GrupoManager>` with `grupos`, `addGrupo`, `updateGrupo`, `deleteGrupo`, and `refetch` props
- The `addGrupo` already exists in the hook; after creating a grupo the hook updates state, so the `ProcessForm` select will reflect it immediately via shared state

### No changes to: existing data, authentication, RLS on other tables, database schema beyond the missing DELETE policy

