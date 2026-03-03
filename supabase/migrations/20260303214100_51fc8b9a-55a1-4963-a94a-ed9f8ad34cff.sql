CREATE POLICY "Authenticated users can delete grupos"
ON public.grupos FOR DELETE TO authenticated
USING (auth.role() = 'authenticated');