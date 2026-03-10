

## Add "Relevância do Processo" Dropdown

### Changes

**1. `src/types/process.ts`** — Add `relevancia: string` to `Processo` interface

**2. `src/components/ProcessForm.tsx`** — Add to form state and UI
- Add `relevancia: initialData?.relevancia || 'acompanhamento'` to form state (line ~91)
- Add a Select dropdown labeled "RELEVÂNCIA DO PROCESSO" in the Identificação card (after GRUPO, before PARTES), with options:
  - `relevante` → "Relevante"
  - `acompanhamento` → "Mero acompanhamento"
- Include `relevancia` in the `handleSubmit` data passed to `onSubmit`

**3. `src/hooks/useProcessos.ts`** — Map the field
- `rowToProcesso`: add `relevancia: row.relevancia || 'acompanhamento'`
- `addProcesso`: add `relevancia: data.relevancia`
- `updateProcesso`: add `if (data.relevancia !== undefined) updates.relevancia = data.relevancia`

No database migration needed — column already exists with default `'acompanhamento'`.

