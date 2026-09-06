// Vérification d'identité des livreurs (SUPER_ADMIN) — phase 8 backend.
import { apiClient } from '../apiClient';

export type LivreurVerificationStatus = 'DOCUMENTS_REQUIS' | 'EN_ATTENTE_VALIDATION' | 'VALIDE' | 'REJETE';
export type PieceType = 'CNI' | 'PASSEPORT' | 'PERMIS';
export type OcrStatut = 'EN_COURS' | 'TERMINE' | 'ECHEC';

export interface LivreurVerification {
  id: number;
  username: string;
  prenom: string;
  nom: string | null;
  email: string;
  telephone: string;
  image: string | null;
  createdAt: string;
  bloque?: boolean;
  typeVehicule?: string;
  plaqueVehicule?: string | null;
  verificationStatus: LivreurVerificationStatus;
  pieceType: PieceType | null;
  pieceRecto: string | null;
  pieceVerso: string | null;
  documentsSoumisAt: string | null;
  ocrStatut: OcrStatut | null;
  ocrTexte?: string | null;
  ocrNomCorrespond: boolean | null;
  ocrScore: number | null;
  ocrDetails: { attendus?: string[]; trouves?: string[]; manquants?: string[] } | null;
  verificationMotif: string | null;
  verifiedAt: string | null;
  verifiedById: number | null;
}

export const STATUS_LABEL: Record<LivreurVerificationStatus, string> = {
  EN_ATTENTE_VALIDATION: 'À vérifier',
  DOCUMENTS_REQUIS: 'Sans documents',
  VALIDE: 'Validés',
  REJETE: 'Refusés',
};

export const PIECE_LABEL: Record<PieceType, string> = { CNI: "Carte nationale d'identité", PASSEPORT: 'Passeport', PERMIS: 'Permis de conduire' };

export const livreurVerificationService = {
  list: (status?: LivreurVerificationStatus) =>
    apiClient.get<{ livreurs: LivreurVerification[]; counts: Partial<Record<LivreurVerificationStatus, number>> }>(
      '/admin/livreurs/verification',
      { params: status ? { status } : {} },
    ),
  decide: (id: number, status: 'VALIDE' | 'REJETE' | 'DOCUMENTS_REQUIS', motif?: string) =>
    apiClient.patch(`/admin/livreurs/${id}/verification`, { status, motif }),
  rerunOcr: (id: number) => apiClient.post(`/admin/livreurs/${id}/verification/relire`, {}),
};
