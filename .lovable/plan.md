

## Rename "Tipo de Recurso" to "Classe Processual" and update options

### Changes

**1. `src/types/process.ts`** — Replace `TIPOS_RECURSO` array contents with:
- Apelação
- Agravo de Instrumento
- Embargos de Declaração
- Incidente de Arguição de Inconstitucionalidade Cível
- Precatório
- RPV

**2. `src/components/ProcessForm.tsx`** (line 341) — Change label `TIPO DE RECURSO` → `CLASSE PROCESSUAL`

**3. `src/pages/ProcessoView.tsx`** (line 93) — Change label `TIPO DE RECURSO` → `CLASSE PROCESSUAL`

No database or logic changes needed — just label and dropdown options.

