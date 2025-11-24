-- Modifier la valeur par défaut de la TVA de 20% à 10%
ALTER TABLE devis ALTER COLUMN tva_pct SET DEFAULT 10;

-- Optionnel : Mettre à jour tous les devis existants avec une TVA de 20% vers 10%
-- Si vous préférez garder les anciennes valeurs, commentez cette ligne
UPDATE devis SET tva_pct = 10 WHERE tva_pct = 20;