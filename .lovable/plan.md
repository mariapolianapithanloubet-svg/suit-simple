

## Fix: Resilient Column Matching for Bulk Import

### Current State
`normalizeHeader` in `ProcessImport.tsx` (lines 42-50) already normalizes accents and lowercases, but doesn't replace spaces/underscores, so `numero_processo` or `parte_contraria` won't match.

### Changes

**`src/components/ProcessImport.tsx`** — Update `normalizeHeader` function:

1. Add: replace spaces, underscores, hyphens with empty string (so both `parte contraria` and `parte_contraria` collapse to `partecontraria`)
2. Update matching logic to use collapsed strings:
   - Contains `cliente` (but not `escritorio`) → `cliente`
   - Contains `contraria` or `parte` (but not `cliente`) → `parteContraria`  
   - Contains `numero` or `processo` → `numero`
   - Contains `orgao` or `julgador` or `vara` → `orgaoJulgador`
   - Contains `classe` or `tipo` or `acao` → `classe`
3. Guard against missing columns: when accessing `row[mapping.xxx]`, if `mapping.xxx` is undefined, default to empty string (already done with `|| ''` but ensure no crash if key is `undefined`)

Single file change, ~10 lines modified.

