
-- Add new columns
ALTER TABLE public.processos ADD COLUMN IF NOT EXISTS telefone_assessoria text NOT NULL DEFAULT '';
ALTER TABLE public.documentos ADD COLUMN IF NOT EXISTS pasta text NOT NULL DEFAULT 'Outros';

-- Drop old public policies on processos
DROP POLICY IF EXISTS "Allow public delete processos" ON public.processos;
DROP POLICY IF EXISTS "Allow public insert processos" ON public.processos;
DROP POLICY IF EXISTS "Allow public read processos" ON public.processos;
DROP POLICY IF EXISTS "Allow public update processos" ON public.processos;

-- Create authenticated-only policies on processos
CREATE POLICY "Authenticated users can read processos" ON public.processos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert processos" ON public.processos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update processos" ON public.processos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete processos" ON public.processos FOR DELETE USING (auth.role() = 'authenticated');

-- Drop old public policies on documentos
DROP POLICY IF EXISTS "Allow public delete documentos" ON public.documentos;
DROP POLICY IF EXISTS "Allow public insert documentos" ON public.documentos;
DROP POLICY IF EXISTS "Allow public read documentos" ON public.documentos;
DROP POLICY IF EXISTS "Allow public update documentos" ON public.documentos;

-- Create authenticated-only policies on documentos
CREATE POLICY "Authenticated users can read documentos" ON public.documentos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert documentos" ON public.documentos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update documentos" ON public.documentos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete documentos" ON public.documentos FOR DELETE USING (auth.role() = 'authenticated');

-- Update storage policies for documentos bucket
DROP POLICY IF EXISTS "Allow public access to documentos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to documentos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update documentos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete documentos" ON storage.objects;

-- Storage: authenticated access
CREATE POLICY "Authenticated users can read documentos files" ON storage.objects FOR SELECT USING (bucket_id = 'documentos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can upload documentos files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documentos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update documentos files" ON storage.objects FOR UPDATE USING (bucket_id = 'documentos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete documentos files" ON storage.objects FOR DELETE USING (bucket_id = 'documentos' AND auth.role() = 'authenticated');
