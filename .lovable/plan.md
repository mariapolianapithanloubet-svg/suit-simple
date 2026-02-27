

## Fix: Bulk Import Default Values & Select Component Error

### Root Cause
When processes are imported via Excel/CSV, fields like `esfera`, `categoria`, and `status` are left as empty strings. When these processes are later opened in `ProcessForm.tsx`, the `<Select>` components receive empty string values, which Radix UI rejects — causing the runtime crash.

### Changes

**1. `src/components/ProcessImport.tsx`** — Set default values in the `handleImport` mapped data:
- `categoria` → `'Mero Acompanhamento'`
- `esfera` → `'Estadual'` (matching the existing `ESFERAS` constant)
- `status` → `'Sem movimentação'`
- `clienteEscritorio` → `'Autor'` (already set, keep as-is)

**2. `src/hooks/useProcessos.ts`** — In `bulkImport`, apply the same defaults so the database always receives valid values for required fields.

**3. `src/components/ProcessForm.tsx`** — Defensive fix: when `form.estado`, `form.esfera`, `form.categoria`, `form.sistemaAcesso`, or `form.clienteEscritorio` is an empty string, pass `undefined` to the Select `value` prop instead. This shows the placeholder without crashing.

