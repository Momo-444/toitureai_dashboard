-- ============================================
-- TOITUREAI DATABASE SCHEMA
-- ============================================

-- 1) Enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'secretaire', 'lecteur');

-- 2) Table profiles (liée à auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3) Table user_roles (système de rôles sécurisé)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4) Fonction security definer pour vérifier les rôles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Fonction helper pour obtenir le rôle de l'utilisateur courant
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'secretaire' THEN 2
      WHEN 'lecteur' THEN 3
    END
  LIMIT 1;
$$;

-- 5) Table leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  prenom TEXT,
  email TEXT,
  telephone TEXT,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  source TEXT,
  statut TEXT NOT NULL DEFAULT 'nouveau',
  type_projet TEXT,
  surface_m2 NUMERIC,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 6) Table devis
CREATE TABLE public.devis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  client_nom TEXT NOT NULL,
  client_email TEXT,
  client_telephone TEXT,
  client_adresse TEXT,
  montant_ht NUMERIC NOT NULL DEFAULT 0,
  tva_pct NUMERIC NOT NULL DEFAULT 20,
  montant_ttc NUMERIC NOT NULL DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'brouillon',
  url_pdf TEXT,
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_validite TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;

-- 7) Table chantiers
CREATE TABLE public.chantiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  devis_id UUID REFERENCES public.devis(id) ON DELETE SET NULL,
  nom_client TEXT NOT NULL,
  type_projet TEXT,
  adresse TEXT,
  statut TEXT NOT NULL DEFAULT 'planifie',
  avancement_pct NUMERIC DEFAULT 0,
  date_debut DATE,
  date_fin_prevue DATE,
  date_fin_reelle DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chantiers ENABLE ROW LEVEL SECURITY;

-- 8) Table configuration (single row)
CREATE TABLE public.configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_entreprise TEXT NOT NULL DEFAULT 'ToitureAI',
  adresse TEXT,
  telephone TEXT,
  email TEXT,
  siret TEXT,
  tva_numero TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.configuration ENABLE ROW LEVEL SECURITY;

-- Insérer une ligne de configuration par défaut
INSERT INTO public.configuration (nom_entreprise) VALUES ('ToitureAI');

-- ============================================
-- RLS POLICIES
-- ============================================

-- Policies pour profiles
CREATE POLICY "Utilisateurs authentifiés peuvent voir tous les profils"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Utilisateurs peuvent mettre à jour leur propre profil"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Policies pour user_roles
CREATE POLICY "Tout le monde peut voir les rôles"
ON public.user_roles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Seuls les admins peuvent gérer les rôles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policies pour leads
CREATE POLICY "Utilisateurs authentifiés peuvent voir les leads"
ON public.leads FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin et secrétaire peuvent créer des leads"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'secretaire')
);

CREATE POLICY "Admin et secrétaire peuvent modifier les leads"
ON public.leads FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'secretaire')
);

CREATE POLICY "Seuls les admins peuvent supprimer les leads"
ON public.leads FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policies pour devis
CREATE POLICY "Utilisateurs authentifiés peuvent voir les devis"
ON public.devis FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin et secrétaire peuvent créer des devis"
ON public.devis FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'secretaire')
);

CREATE POLICY "Admin et secrétaire peuvent modifier les devis"
ON public.devis FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'secretaire')
);

CREATE POLICY "Seuls les admins peuvent supprimer les devis"
ON public.devis FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policies pour chantiers
CREATE POLICY "Utilisateurs authentifiés peuvent voir les chantiers"
ON public.chantiers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin et secrétaire peuvent créer des chantiers"
ON public.chantiers FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'secretaire')
);

CREATE POLICY "Admin et secrétaire peuvent modifier les chantiers"
ON public.chantiers FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'secretaire')
);

CREATE POLICY "Seuls les admins peuvent supprimer les chantiers"
ON public.chantiers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policies pour configuration
CREATE POLICY "Tout le monde peut voir la configuration"
ON public.configuration FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Seuls les admins peuvent modifier la configuration"
ON public.configuration FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- TRIGGERS pour updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_leads
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_devis
  BEFORE UPDATE ON public.devis
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_chantiers
  BEFORE UPDATE ON public.chantiers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_configuration
  BEFORE UPDATE ON public.configuration
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- TRIGGER pour créer automatiquement un profil
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assigner le rôle "lecteur" par défaut
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'lecteur');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();