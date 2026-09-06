// Performance et avis des livreurs (SUPER_ADMIN) — phase 9 backend.
import { apiClient } from '../apiClient';

export type Niveau = 'EXCELLENT' | 'CORRECT' | 'A_RECADRER';

export interface LivreurPerf {
  id: number;
  username: string;
  prenom: string;
  nom: string | null;
  telephone: string;
  image: string | null;
  note: number;
  totalLivraisons: number;
  disponible: boolean;
  bloque: boolean;
  verificationStatus: string;
  typeVehicule: string;
  createdAt: string;
  lastOnlineAt: string | null;
  nbAvis: number;
  nbAvisBas: number;
  nbSignalements: number;
  avis30j: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
  acceptees: number;
  refusees: number;
  expirees: number;
  nbPropositions: number;
  tauxAcceptation: number | null;
  livrees30j: number;
  enCours: number;
  alertes: string[];
  niveau: Niveau;
}

export interface AvisLivreur {
  id: number;
  overallRating: number;
  comment: string | null;
  wouldRecommend: boolean;
  hasIssue: boolean;
  issueType: string | null;
  createdAt: string;
  user: { id: number; username: string; phone: string } | null;
  livraison: { id: number; commandeId: number | null; type: string } | null;
}

export interface PerfResume { total: number; excellents: number; aRecadrer: number; noteMoyenne: number | null; seuils: Record<string, number> }

export const ISSUE_LABEL: Record<string, string> = {
  RETARD: 'Retard', IMPOLITESSE: 'Impolitesse', COMMANDE_ABIMEE: 'Commande abîmée', MAUVAISE_ADRESSE: 'Mauvaise adresse', AUTRE: 'Autre problème',
};

export const livreurPerformanceService = {
  list: (jours = 30) => apiClient.get<{ jours: number; resume: PerfResume; livreurs: LivreurPerf[] }>('/admin/livreurs/performance', { params: { jours } }),
  avis: (id: number) => apiClient.get<{ livreur: LivreurPerf; avis: AvisLivreur[] }>(`/admin/livreurs/${id}/avis`),
  // `bloque` explicite : le backend exige un booléen (PATCH /livreur/:id/bloquer)
  bloquer: (id: number, bloque: boolean) => apiClient.patch<{ livreur: { id: number; bloque: boolean } }>(`/livreur/${id}/bloquer`, { bloque }),
};
