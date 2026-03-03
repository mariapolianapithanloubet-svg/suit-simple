

## Plan: Add "grupos" table, link to processos, update form and list

### 1. Database Migration

Create table `grupos` and add `grupo_id` column to `processos`:

```sql
CREATE TABLE public.grupos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE
);

ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;

-- Same RLS pattern as processos: authenticated can read/insert/update
CREATE POLICY "Authenticated users can read grupos" ON public.grupos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert grupos" ON public.grupos FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update grupos" ON public.grupos FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');

ALTER TABLE public.processos ADD COLUMN grupo_id uuid REFERENCES public.grupos(id) ON DELETE SET NULL;
```

### 2. Type Updates (`src/types/process.ts`)

- Add `Grupo` interface (`id`, `nome`)
- Add optional `grupoId` and `grupoNome` fields to `Processo`

### 3. Hook Updates (`src/hooks/useProcessos.ts`)

- Add `grupos` state and `fetchGrupos` function querying `grupos` table
- Update `rowToProcesso` to map `grupo_id`
- Update `addProcesso` / `updateProcesso` to handle `grupo_id`
- Expose `grupos` and an `addGrupo` function from the hook

### 4. Form Updates (`src/components/ProcessForm.tsx`)

- Accept `grupos` prop (list of available groups)
- Add optional "GRUPO" select field in the IDENTIFICAÇÃO card
- Add `grupoId` to form state, pass it through on submit

### 5. Process List Updates (`src/components/ProcessList.tsx`)

- Sort items within each competência group alphabetically by client name (`getClienteName`)
- Rearrange each process card to show client name as the first/primary info, followed by process number

### 6. Wire Up

- Update pages that use `ProcessForm` to pass `grupos` from the hook
- Update `ProcessDetail` to show grupo name if present

