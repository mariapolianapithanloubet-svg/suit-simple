

## Plan: Refactor form — merge access/contact fields into PRIMEIRA INSTÂNCIA

### Changes to `src/components/ProcessForm.tsx` only

**1. Add fields to PRIMEIRA INSTÂNCIA card (lines 176-189)**
- After Comarca, add two new fields in the same grid:
  - "SISTEMA DE ACESSO" — plain `Input` (free text), bound to `form.sistemaAcesso`
  - "TELEFONES DO JUÍZO" — plain `Input` (free text), bound to `form.telefoneSecretaria` (reuse existing DB column to preserve data)
- Change grid to `sm:grid-cols-2 lg:grid-cols-3` to fit 5 fields

**2. Remove the ACESSO E CONTATOS card entirely (lines 271-299)**
- Delete the whole card including `varaCamaraTurma`, `sistemaAcesso` (Select), `telefoneSecretaria`, `telefoneAssessoria` fields

**3. Remove `SISTEMAS_ACESSO` import (line 3)**
- No longer needed since the dropdown is replaced by free text

**4. Remove form state fields no longer shown**
- Remove `telefoneAssessoria` and `varaCamaraTurma` from form state initialization (but keep them in the submit payload so existing DB columns are not affected — they'll just send empty/existing values)

**No database changes, no type changes, no auth changes.**

