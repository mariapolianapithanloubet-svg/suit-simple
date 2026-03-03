
-- 1. Rename esfera to competencia
ALTER TABLE public.processos RENAME COLUMN esfera TO competencia;

-- 2. Drop data_ultimo_acompanhamento
ALTER TABLE public.processos DROP COLUMN data_ultimo_acompanhamento;

-- 3. Drop execution columns
ALTER TABLE public.processos DROP COLUMN valor_execucao;
ALTER TABLE public.processos DROP COLUMN data_base_calculo;

-- 4. Make reu nullable
ALTER TABLE public.processos ALTER COLUMN reu DROP NOT NULL;
