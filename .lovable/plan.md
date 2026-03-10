

## Fix Process Update Failures

### Root Cause

**Issue 1 — Database CHECK constraint**: The `processos` table has a CHECK constraint `processos_categoria_check` that only allows old hardcoded values ('Relevante', 'Mero Acompanhamento'). But categories are now loaded dynamically from the `categorias` table (e.g., "Cível", "Administrativo", "Tributário"). The network logs confirm this: the PATCH returns HTTP 400 with `"violates check constraint \"processos_categoria_check\""`.

**Issue 2 — No error handling**: `updateProcesso` doesn't check the error response from the database call. It always proceeds to `fetchProcessos()`, giving the impression it succeeded. The form then shows "Processo atualizado!" even though the DB rejected the update.

### Changes

**1. Database migration** — Drop the outdated check constraint:
```sql
ALTER TABLE public.processos DROP CONSTRAINT IF EXISTS processos_categoria_check;
```

**2. `src/hooks/useProcessos.ts`** — Add error handling and debug logging to `updateProcesso` (lines 151-185):
- Add `console.log('updateProcesso updates:', updates)` before the call
- Capture the `{ error }` from the update call
- Throw the error if present, so the form's `catch` block shows "Erro ao salvar processo" instead of a false success

