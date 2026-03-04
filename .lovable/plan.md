

## Add "Tribunal" Text Field to Primeira Instância

### 1. Database Migration
Add column `tribunal_primeira_instancia` (text, nullable) to `processos`:
```sql
ALTER TABLE public.processos ADD COLUMN tribunal_primeira_instancia text;
```

### 2. Type Updates (`src/types/process.ts`)
Add `tribunalPrimeiraInstancia: string | null` to the `Processo` interface.

### 3. Form Updates (`src/components/ProcessForm.tsx`)
- Add `tribunalPrimeiraInstancia` to form state (line ~81, initialized from `initialData`)
- Insert a new text Input field labeled "TRIBUNAL" above the "VARA" field in the Primeira Instância card (before line 265)

### 4. Hook Updates (`src/hooks/useProcessos.ts`)
- Map `tribunal_primeira_instancia` in `rowToProcesso`
- Include `tribunal_primeira_instancia` in `addProcesso`, `updateProcesso`, and `bulkImport`

### 5. Import Updates (`src/components/ProcessImport.tsx`)
- Add `tribunalPrimeiraInstancia` to the import row mapping so CSV imports can include this column

