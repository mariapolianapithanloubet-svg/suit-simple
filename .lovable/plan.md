

## Plan: Configurable Administrative Tables (adjusted)

### 1. Database Migration

```sql
CREATE TABLE public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL
);

CREATE TABLE public.tipos_vinculo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL
);

CREATE TABLE public.tribunais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  sigla text UNIQUE NOT NULL,
  estado text  -- nullable, no NOT NULL
);
```

Enable RLS on all three with authenticated read/insert/update/delete policies.

Seed default data:
- `categorias`: "Relevante", "Mero Acompanhamento"
- `tipos_vinculo`: "Embargos à Execução", "Execução Principal", "Apenso", "Conexo", "Incidente", "Outro"

### 2. New Hook: `src/hooks/useAdminTables.ts`

CRUD operations for categorias, tipos_vinculo, tribunais via Supabase queries.

### 3. New CRUD Pages

- `src/pages/CategoriasPage.tsx` — manage categorias (field: nome)
- `src/pages/TiposVinculoPage.tsx` — manage tipos_vinculo (field: nome)
- `src/pages/TribunaisPage.tsx` — manage tribunais (fields: nome, sigla, estado optional)

### 4. Sidebar (`src/components/AppLayout.tsx`)

Add "ADMINISTRAÇÃO" nav group with links to the three admin pages.

### 5. Routing (`src/App.tsx`)

Add routes, fetch admin data, pass to components.

### 6. Update Dropdowns

- **Categoria** dropdown in ProcessForm and ConsultarProcessos: load from `categorias` table
- **Tipo de Vínculo** dropdown in ProcessForm: load from `tipos_vinculo` table
- **Tribunal** fields (2ª instância, tribunal superior): load from `tribunais` table

### 7. Types (`src/types/process.ts`)

- **Remove** `CATEGORIAS` and `TIPOS_VINCULO` constants (replaced by DB)
- **Keep** `TRIBUNAIS_SUPERIORES` (`['STJ', 'STF']`) — unchanged, hardcoded
- **Keep** `COMPETENCIAS` — unchanged, hardcoded

### Files to create
- `src/hooks/useAdminTables.ts`
- `src/pages/CategoriasPage.tsx`
- `src/pages/TiposVinculoPage.tsx`
- `src/pages/TribunaisPage.tsx`

### Files to edit
- `src/components/AppLayout.tsx`
- `src/App.tsx`
- `src/components/ProcessForm.tsx`
- `src/pages/ConsultarProcessos.tsx`
- `src/types/process.ts`

