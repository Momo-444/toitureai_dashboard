// Types pour la base de données ToitureAI

export type AppRole = 'admin' | 'secretaire' | 'lecteur';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Lead {
  id: string;
  nom: string;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  source: string | null;
  statut: string;
  type_projet: string | null;
  surface: number | null;
  description: string | null;
  ai_notes: string | null;
  ai_raw: string | null;
  score_qualification: number | null;
  budget_estime: number | null;
  delai: string | null;
  urgence: string | null;
  created_at: string;
  updated_at: string;
}

export interface Devis {
  id: string;
  numero: string;
  lead_id: string | null;
  client_nom: string;
  client_email: string | null;
  client_telephone: string | null;
  client_adresse: string | null;
  montant_ht: number;
  tva_pct: number;
  montant_ttc: number;
  statut: string;
  url_pdf: string | null;
  date_creation: string;
  date_validite: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chantier {
  id: string;
  lead_id: string | null;
  devis_id: string | null;
  nom_client: string;
  type_projet: string | null;
  adresse: string | null;
  statut: string;
  avancement_pct: number;
  date_debut: string | null;
  date_fin_prevue: string | null;
  date_fin_reelle: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  devis?: Devis;
}

export interface Configuration {
  id: string;
  nom_entreprise: string;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  siret: string | null;
  tva_numero: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}
