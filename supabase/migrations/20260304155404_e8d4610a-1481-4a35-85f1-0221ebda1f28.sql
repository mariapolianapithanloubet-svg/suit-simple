CREATE TABLE public.processos_vinculados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processo_origem_id uuid NOT NULL REFERENCES public.processos(id) ON DELETE RESTRICT,
  processo_vinculado_id uuid REFERENCES public.processos(id) ON DELETE RESTRICT,
  numero_processo_vinculado text,
  tipo_vinculo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.processos_vinculados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read vinculados" ON public.processos_vinculados FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert vinculados" ON public.processos_vinculados FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete vinculados" ON public.processos_vinculados FOR DELETE TO authenticated USING (auth.role() = 'authenticated');