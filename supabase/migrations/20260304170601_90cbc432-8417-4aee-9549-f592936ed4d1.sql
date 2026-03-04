
CREATE TABLE public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL
);

CREATE TABLE public.tipos_vinculo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL
);

CREATE TABLE public.tribunais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  sigla text UNIQUE NOT NULL,
  estado text
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_vinculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribunais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read categorias" ON public.categorias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert categorias" ON public.categorias FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update categorias" ON public.categorias FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete categorias" ON public.categorias FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read tipos_vinculo" ON public.tipos_vinculo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tipos_vinculo" ON public.tipos_vinculo FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update tipos_vinculo" ON public.tipos_vinculo FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete tipos_vinculo" ON public.tipos_vinculo FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read tribunais" ON public.tribunais FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tribunais" ON public.tribunais FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update tribunais" ON public.tribunais FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete tribunais" ON public.tribunais FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

INSERT INTO public.categorias (nome) VALUES ('Relevante'), ('Mero Acompanhamento');
INSERT INTO public.tipos_vinculo (nome) VALUES ('Embargos à Execução'), ('Execução Principal'), ('Apenso'), ('Conexo'), ('Incidente'), ('Outro');
