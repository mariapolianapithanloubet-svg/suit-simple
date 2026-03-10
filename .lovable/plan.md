

## Fix Segunda Instância layout and label

**`src/components/ProcessForm.tsx`** (lines 339-365):

1. Change grid from `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` to `grid-cols-1 md:grid-cols-2`
2. Reorder fields: Tipo de Recurso, Tribunal, Número do Processo, Turma/Câmara
3. Rename label `TURMA / CÂMARA JULGADORA` → `TURMA / CÂMARA`

