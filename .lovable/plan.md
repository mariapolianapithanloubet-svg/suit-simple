

## Plan: Make password, execution value, and execution date fields optional

### Changes

**1. `src/components/ProcessForm.tsx`**
- Change the password field from `type="password"` to `type="text"` (line ~185)
- Remove the `*` from password label if present (it's already without `*`, so no change needed)
- Ensure `valorExecucao` and `dataBaseCalculo` are not required (they already are optional in the form state — no validation blocks them)
- The form validation on submit (line ~51) only checks `numero`, `esfera`, `categoria`, `autor`, `reu`, `clienteEscritorio` — password and execution fields are already not in the required check, so no validation changes needed

**2. `src/hooks/useProcessos.ts`**
- In `addProcesso`, `senha_acesso` is already passed as-is. Ensure empty string is acceptable (it already is — column default is `''::text`)
- `valor_execucao` and `data_base_calculo` already use `|| null` fallback, so they handle empty values

### Summary of actual code changes:
- **Single change**: In `ProcessForm.tsx` line ~185, change `type="password"` to `type="text"` on the password input field

Everything else is already optional — the form doesn't require these fields in validation, and the database columns have appropriate defaults/nullability.

