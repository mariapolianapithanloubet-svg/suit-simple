

## Plan: Linked Processes + Consultation Filters

### PART 1 — Database Migration

Create `processos_vinculados` table with **NO CASCADE** on foreign keys (ON DELETE RESTRICT):

```sql
CREATE TABLE public.processos_vinculados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processo_origem_id uuid NOT NULL REFERENCES public.processos(id) ON DELETE RESTRICT,
  processo_vinculado_id uuid REFERENCES public.processos(id) ON DELETE RESTRICT,
  numero_processo_vinculado text,
  tipo_vinculo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.processos_vinculados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read vinculados" ON public.processos_vinculados FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert vinculados" ON public.processos_vinculados FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete vinculados" ON public.processos_vinculados FOR DELETE TO authenticated USING (auth.role() = 'authenticated');
```

### PART 1 — Type & Constants

Add to `src/types/process.ts`:
```ts
export const TIPOS_VINCULO = [
  'Embargos à Execução',
  'Execução Principal',
  'Apenso',
  'Conexo',
  'Incidente',
  'Outro',
];
```

### PART 1 — Hook: `src/hooks/useProcessosVinculados.ts` (new)

- `fetchVinculados(processoId)` — fetches links where origem OR vinculado matches
- `addVinculo(origemId, vinculadoId | null, numeroManual, tipoVinculo)` — inserts row; if `vinculadoId` provided, also inserts reverse link
- `removeVinculo(id)` — deletes link and its reverse if bidirectional

### PART 1 — ProcessForm: "PROCESSOS VINCULADOS" section

New card with:
- List of added links (tipo + número)
- "Adicionar vínculo" button showing:
  - `tipo_vinculo` as a **Select dropdown** with options: Embargos à Execução, Execução Principal, Apenso, Conexo, Incidente, Outro
  - Toggle: existing process (searchable select) vs manual number (text input)
- Links saved on form submit; in edit mode, load existing and allow add/remove

### PART 1 — ProcessoView: "PROCESSOS VINCULADOS" section

Read-only card showing each link's tipo + número. If linked process exists in system, show "Abrir processo" button navigating to `/consultar/:id`.

### PART 2 — Consultation Filters (`src/pages/ConsultarProcessos.tsx`)

Add filter dropdowns between search bar and table:
- Competência, Fase Atual, Categoria, Grupo
- Each with "Todos" default option
- "Limpar filtros" button to reset all
- Filters combine with text search via AND logic

### Files to create
- `src/hooks/useProcessosVinculados.ts`

### Files to edit
- `src/types/process.ts` — add `TIPOS_VINCULO`
- `src/components/ProcessForm.tsx` — add vinculados section with dropdown
- `src/pages/ProcessoView.tsx` — add vinculados display
- `src/pages/ConsultarProcessos.tsx` — add filter dropdowns
- `src/App.tsx` — pass processos to ProcessForm

