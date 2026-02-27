

## Plan: Authentication, Structure, and Usability Refinements

### 1. Database Migration

**Add `telefone_assessoria` column** to `processos` table and **add `pasta` column** to `documentos` table for folder organization.

Update RLS policies from public to authenticated-only access on both `processos` and `documentos` tables, and on the `documentos` storage bucket.

### 2. Authentication System

- Create `src/pages/Auth.tsx` with login and signup forms (email + password)
- Create `src/hooks/useAuth.ts` hook wrapping `supabase.auth` with `onAuthStateChange` listener
- Update `App.tsx` to conditionally render Auth page or AppContent based on session state
- Add logout button to sidebar
- All routes protected behind authentication check
- No auto-confirm on signups — users must verify email

### 3. Process Registration: New Field

- Add `telefoneAssessoria` to `Processo` type and all mapping functions in `useProcessos.ts`
- Add "Telefone da Assessoria" input field in `ProcessForm.tsx` under Tramitação card
- Display the field in `ProcessDetail.tsx` under Tramitação

### 4. Document Folder Organization

Define folder categories constant:
`['Petição Inicial', 'Contestação', 'Réplica', 'Decisões', 'Sentenças', 'Acórdãos', 'Cálculos', 'Outros']`

- Update `ProcessDetail.tsx` document section to group documents by `pasta` field
- Show collapsible folder sections with document count
- Upload form includes folder selector (replacing current "tipo" selector or alongside it)
- `documentos` table gets a `pasta` column; `Documento` type updated accordingly

### 5. Dashboard Restructuring

In `DashboardStats.tsx`:
- Rename "Processos por Esfera" to "Distribuição por Esfera de Tramitação"
- Move "Status de Acompanhamento" (semaphore) below the main stats as a smaller, muted secondary element
- Keep primary focus on: Total, Relevantes, Acompanhamento, Clientes, Distribution by State

### 6. Typography and Spacing Improvements

In `src/index.css` and across components:
- Increase base font sizes (labels from `text-xs` to `text-sm`, body from `text-sm` to `text-base`)
- Increase card padding and spacing between sections
- Use `font-medium` instead of thin weights for better readability
- Increase input heights from `h-9` to `h-10`
- More generous `space-y` gaps throughout

### Technical Details

**Migration SQL** (single migration):
```sql
ALTER TABLE public.processos ADD COLUMN telefone_assessoria text NOT NULL DEFAULT '';
ALTER TABLE public.documentos ADD COLUMN pasta text NOT NULL DEFAULT 'Outros';

-- Drop old public policies, create authenticated-only policies
-- for processos, documentos tables
-- Update storage bucket policies to authenticated only
```

**Files to create:**
- `src/pages/Auth.tsx`
- `src/hooks/useAuth.ts`

**Files to modify:**
- `src/types/process.ts` — add `telefoneAssessoria`, `PASTAS_DOCUMENTO`, update `Documento`
- `src/hooks/useProcessos.ts` — map new columns
- `src/components/ProcessForm.tsx` — new field, larger spacing
- `src/components/ProcessDetail.tsx` — folder-grouped documents, new field display
- `src/components/DashboardStats.tsx` — rename section, reorder layout
- `src/components/AppLayout.tsx` — logout button, larger typography
- `src/components/ProcessList.tsx` — spacing/typography improvements
- `src/components/ClientRanking.tsx` — spacing improvements
- `src/App.tsx` — auth gate
- `src/index.css` — base font size adjustments

