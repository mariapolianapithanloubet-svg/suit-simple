

## Plan: Change "Sistema de Acesso" from text input to dropdown

### Single file change: `src/components/ProcessForm.tsx`

**1. Add `SISTEMAS_ACESSO` to imports (line 3)**
Add it to the existing import from `@/types/process`.

**2. Replace the Input with a Select (lines 188-191)**
Replace the free text `Input` for "SISTEMA DE ACESSO" with a `Select` dropdown using `SISTEMAS_ACESSO` options, same pattern as other selects in the form.

No other files, database, or data changes.

