

## Plan: Admin Clear Import + Duplicate Prevention

### 1. Track Imported Processes

Add an `origem` column to the `processos` table (default `'manual'`) so we can distinguish bulk-imported processes (`'importacao'`) from manually created ones.

**Migration SQL:**
```sql
ALTER TABLE public.processos ADD COLUMN origem text NOT NULL DEFAULT 'manual';
```

### 2. Duplicate Prevention in Bulk Import

Update `useProcessos.ts` `bulkImport` function:
- Before inserting, query existing process numbers: `SELECT numero FROM processos`
- Filter out rows whose `numero` already exists
- Set `origem: 'importacao'` on all inserted rows
- Return a count of skipped duplicates to show in the UI

Update `ProcessImport.tsx` to display how many were skipped vs imported in the success toast.

### 3. Admin Role Setup

Create a `user_roles` table with RLS and a `has_role` security definer function (following the standard pattern). Manually assign admin role to specific users via the database.

**Migration SQL:**
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### 4. useAuth Hook Update

Add an `isAdmin` flag to `useAuth.ts` by querying `user_roles` after auth state changes.

### 5. "Limpar Importação" Button

In `ProcessList.tsx`:
- Show a "Limpar Importação" button only when `isAdmin` is true
- With confirmation dialog before executing
- Calls a new `clearImported` function in `useProcessos.ts` that deletes all rows where `origem = 'importacao'`

### 6. Files Changed

- **New migration** — `origem` column + `user_roles` table + `has_role` function
- **`src/hooks/useAuth.ts`** — add `isAdmin` state
- **`src/hooks/useProcessos.ts`** — add `clearImported`, update `bulkImport` with duplicate check and `origem` tag
- **`src/components/ProcessImport.tsx`** — show skipped count in toast
- **`src/components/ProcessList.tsx`** — add admin-only "Limpar Importação" button with confirmation
- **`src/App.tsx`** — pass `isAdmin` through to ProcessList

