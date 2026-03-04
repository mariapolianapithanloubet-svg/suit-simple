

## Plan: Adjust table columns for "Consultar Processos"

This adjusts the column logic defined in the previous plan before implementation.

### Changes to `src/pages/ConsultarProcessos.tsx` (new file, not yet created)

**"Número do Processo (Fase Atual)" column:**
- Use a helper that returns the phase-specific number:
  - `PRIMEIRA_INSTANCIA` → `primeiraInstanciaNumero`
  - `SEGUNDA_INSTANCIA` → `segundaInstanciaNumero`
  - `TRIBUNAL_SUPERIOR` → `tribunalSuperiorNumero`
- Fallback to main `numero` if the phase-specific field is empty
- Column header: "Número do Processo (Fase Atual)"

**"Cliente" column:**
- Use existing `getClienteName(processo)` from `@/types/process` (returns `autor` if `clienteEscritorio === 'Autor'`, otherwise `reu`)

**Remaining columns unchanged:** Grupo, Fase Atual (badge), Competência

### No other file changes needed — this is a design adjustment to be applied when creating the consultation page.

