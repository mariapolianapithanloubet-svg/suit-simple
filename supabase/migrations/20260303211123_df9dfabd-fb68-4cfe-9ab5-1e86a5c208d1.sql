
CREATE TABLE public.grupos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE
);

ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read grupos" ON public.grupos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert grupos" ON public.grupos FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update grupos" ON public.grupos FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');

ALTER TABLE public.processos ADD COLUMN grupo_id uuid REFERENCES public.grupos(id) ON DELETE SET NULL;
