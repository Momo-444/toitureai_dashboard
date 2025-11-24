-- Corriger la fonction pour définir le search_path
CREATE OR REPLACE FUNCTION generate_devis_numero()
RETURNS TRIGGER AS $$
DECLARE
  last_numero TEXT;
  last_number INTEGER;
  new_numero TEXT;
BEGIN
  -- Si le numéro est déjà fourni, ne rien faire
  IF NEW.numero IS NOT NULL AND NEW.numero != '' THEN
    RETURN NEW;
  END IF;

  -- Récupérer le dernier numéro
  SELECT numero INTO last_numero
  FROM devis
  ORDER BY created_at DESC
  LIMIT 1;

  -- Extraire le nombre et incrémenter
  IF last_numero IS NULL THEN
    last_number := 0;
  ELSE
    last_number := CAST(SPLIT_PART(last_numero, '-', 2) AS INTEGER);
  END IF;

  -- Générer le nouveau numéro
  new_numero := 'DEV-' || LPAD((last_number + 1)::TEXT, 4, '0');
  
  NEW.numero := new_numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;