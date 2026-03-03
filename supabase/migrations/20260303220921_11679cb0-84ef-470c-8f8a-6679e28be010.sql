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