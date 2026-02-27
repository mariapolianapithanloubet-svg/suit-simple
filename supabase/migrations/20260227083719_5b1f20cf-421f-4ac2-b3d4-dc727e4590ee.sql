
-- Create processos table
CREATE TABLE public.processos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  tipo_acao TEXT NOT NULL DEFAULT '',
  estado TEXT NOT NULL DEFAULT '',
  esfera TEXT NOT NULL CHECK (esfera IN ('Estadual', 'Federal', 'Trabalhista', 'Administrativo')),
  categoria TEXT NOT NULL CHECK (categoria IN ('Relevante', 'Mero Acompanhamento')),
  autor TEXT NOT NULL,
  reu TEXT NOT NULL,
  cliente_escritorio TEXT NOT NULL CHECK (cliente_escritorio IN ('Autor', 'Réu')),
  vara_camara_turma TEXT NOT NULL DEFAULT '',
  sistema_acesso TEXT NOT NULL DEFAULT '',
  telefone_secretaria TEXT NOT NULL DEFAULT '',
  senha_acesso TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  ultima_movimentacao TEXT NOT NULL DEFAULT '',
  data_ultimo_acompanhamento DATE,
  valor_execucao NUMERIC,
  data_base_calculo DATE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;

-- Public read/write for now (no auth yet, multi-user future compatible)
CREATE POLICY "Allow public read processos" ON public.processos FOR SELECT USING (true);
CREATE POLICY "Allow public insert processos" ON public.processos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update processos" ON public.processos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete processos" ON public.processos FOR DELETE USING (true);

-- Create documentos table
CREATE TABLE public.documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Petição', 'Decisão', 'Sentença', 'Acórdão', 'Cálculo', 'Documento Estratégico', 'Outro')),
  observacao TEXT DEFAULT '',
  arquivo_url TEXT,
  arquivo_path TEXT,
  data_upload TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read documentos" ON public.documentos FOR SELECT USING (true);
CREATE POLICY "Allow public insert documentos" ON public.documentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update documentos" ON public.documentos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete documentos" ON public.documentos FOR DELETE USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_processos_updated_at
BEFORE UPDATE ON public.processos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', true);

CREATE POLICY "Allow public upload documentos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documentos');
CREATE POLICY "Allow public read documentos" ON storage.objects FOR SELECT USING (bucket_id = 'documentos');
CREATE POLICY "Allow public delete documentos" ON storage.objects FOR DELETE USING (bucket_id = 'documentos');
