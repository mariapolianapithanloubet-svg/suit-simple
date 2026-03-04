

## Plan: Refactor Tramitação to Multi-Instance Layout (adjusted migration)

### 1. Database Migration

```sql
ALTER TABLE public.processos
  ADD COLUMN primeira_instancia_numero text,
  ADD COLUMN primeira_instancia_vara text,
  ADD COLUMN primeira_instancia_comarca text,
  ADD COLUMN segunda_instancia_tipo_recurso text,
  ADD COLUMN segunda_instancia_numero text,
  ADD COLUMN segunda_instancia_turma_camara text,
  ADD COLUMN segunda_instancia_tribunal text,
  ADD COLUMN tribunal_superior_nome text,
  ADD COLUMN tribunal_superior_numero text,
  ADD COLUMN tribunal_superior_turma text,
  ADD COLUMN fase_atual text NOT NULL DEFAULT 'PRIMEIRA_INSTANCIA';
```

All new text columns are nullable with no default. `fase_atual` is NOT NULL with default `'PRIMEIRA_INSTANCIA'`. No existing columns removed.

### 2. Type Updates (`src/types/process.ts`)

- Add `FaseAtual` type: `'PRIMEIRA_INSTANCIA' | 'SEGUNDA_INSTANCIA' | 'TRIBUNAL_SUPERIOR'`
- Add new optional fields to `Processo` interface (all `string | null`)
- Add `faseAtual: FaseAtual` (required)
- Add constants: `TIPOS_RECURSO` (7 options) and `TRIBUNAIS_SUPERIORES` (`['STJ', 'STF']`)

### 3. Hook Updates (`src/hooks/useProcessos.ts`)

- `rowToProcesso`: map all new columns (nullable → `null`)
- `addProcesso` / `updateProcesso`: persist new fields, sending `null` for empty values

### 4. Form Updates (`src/components/ProcessForm.tsx`)

Replace current TRAMITAÇÃO card with four cards:

**PRIMEIRA INSTÂNCIA**: Número do Processo, Vara, Comarca (all text inputs, optional)

**SEGUNDA INSTÂNCIA**: Tipo de Recurso (dropdown, 7 options), Número do Processo, Turma/Câmara, Tribunal (all optional)

**TRIBUNAIS SUPERIORES**: Tribunal Superior (dropdown: STJ/STF), Número do Processo, Turma (all optional)

**FASE ATUAL**: Radio group with 3 options, required, validated on submit

Move `sistema_acesso` and `telefone` fields to a separate "ACESSO E CONTATOS" card. All sections visible simultaneously.

### No changes to
Authentication, RLS, other pages, existing data/columns

