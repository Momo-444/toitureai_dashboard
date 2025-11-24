-- Activer Realtime sur les tables
ALTER TABLE public.leads REPLICA IDENTITY FULL;
ALTER TABLE public.devis REPLICA IDENTITY FULL;
ALTER TABLE public.chantiers REPLICA IDENTITY FULL;
ALTER TABLE public.configuration REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.devis;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chantiers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.configuration;