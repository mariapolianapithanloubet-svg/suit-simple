

## Reorganize Process Form into 3 Logical Sections

### Current State
The form has separate cards for "Primeira Instância", "Segunda Instância", "Tribunais Superiores", and "Fase Atual" (lines 267-387). This is confusing because Brazilian cases typically keep the same process number across instances.

### New Structure

**Replace lines 267-387** (4 cards) with 3 new cards:

#### 1. PROCESSO PRINCIPAL
Merges the old "Primeira Instância" and "Fase Atual" cards. Fields:
- Número do Processo → maps to `primeiraInstanciaNumero`
- Tribunal → maps to `tribunalPrimeiraInstancia`
- Comarca → maps to `primeiraInstanciaComarca`
- Vara / Câmara / Turma → maps to `primeiraInstanciaVara`
- Sistema de Acesso → maps to `sistemaAcesso`
- Telefones → maps to `telefoneSecretaria`
- **Instância Atual** (dropdown with 4 options):
  - `1ª instância` → `PRIMEIRA_INSTANCIA`
  - `2ª instância` → `SEGUNDA_INSTANCIA`
  - `STJ` → `TRIBUNAL_SUPERIOR` (with `tribunalSuperiorNome` = 'STJ')
  - `STF` → `TRIBUNAL_SUPERIOR` (with `tribunalSuperiorNome` = 'STF')

The "Instância Atual" replaces the old radio group + tribunal superior dropdown. When STJ/STF is selected, `faseAtual` is set to `TRIBUNAL_SUPERIOR` and `tribunalSuperiorNome` is auto-set.

#### 2. SEGUNDA INSTÂNCIA (optional)
Simplified to focus on judging body:
- Tribunal da Segunda Instância → `segundaInstanciaTribunal` (dropdown from `tribunais` table)
- Turma / Câmara Julgadora → `segundaInstanciaTurmaCamara`

Keeps `segundaInstanciaTipoRecurso` and `segundaInstanciaNumero` fields as well for data completeness.

#### 3. TRIBUNAIS SUPERIORES (optional)
Four fields in a 2x2 grid:
- Número no STJ → `tribunalSuperiorNumero` (when nome=STJ)
- Turma STJ → `tribunalSuperiorTurma` (when nome=STJ)
- Número no STF → new fields needed? 

**Problem**: The DB only has single `tribunal_superior_numero` and `tribunal_superior_turma` columns, not separate ones for STJ and STF.

### Revised Approach (no DB changes)
Since we only have one set of tribunal superior columns, the "Tribunais Superiores" section will keep the existing fields:
- Número do Processo → `tribunalSuperiorNumero`
- Turma → `tribunalSuperiorTurma`

The tribunal name (STJ/STF) is determined by the "Instância Atual" dropdown selection.

### Changes

**`src/components/ProcessForm.tsx`** (lines 267-387):

Replace 4 cards with 3:

1. **PROCESSO PRINCIPAL** — grid with: Tribunal (`tribunalPrimeiraInstancia`), Comarca, Vara/Câmara/Turma, Sistema de Acesso, Telefones, and a new `Select` dropdown for "Instância Atual" with 4 options. On change, update both `faseAtual` and `tribunalSuperiorNome` accordingly.

2. **SEGUNDA INSTÂNCIA** — grid with: Tipo de Recurso, Número, Tribunal (dropdown), Turma/Câmara.

3. **TRIBUNAIS SUPERIORES** — grid with: Número do Processo, Turma. The tribunal name is shown as read-only based on "Instância Atual" selection.

**`src/types/process.ts`**: Update `FaseAtual` to also accept mapped values if needed (no change needed — existing values work).

No database migration required. All fields map to existing columns.

