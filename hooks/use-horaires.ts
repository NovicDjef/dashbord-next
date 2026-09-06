import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllHoraires, 
  fetchHorairesByRestaurant, 
  createHorairesForRestaurant,
  updateHoraireById,
  deleteHoraireById 
} from '@/redux/horaireSlice';

export interface Horaire {
  id: number;
  jour: string;
  heures: string;
  restaurantId: number;
}

export interface HoraireFormData {
  jour: string;
  heures: string;
}

export const useHoraires = () => {
  const dispatch = useDispatch();
  const { data, byRestaurant, status, error, restaurantStatus } = useSelector(
    (state: any) => state.horaires
  );

  // Récupérer tous les horaires
  const fetchHoraires = () => {
    dispatch(fetchAllHoraires());
  };

  // Récupérer les horaires d'un restaurant spécifique
  const fetchRestaurantHoraires = (restaurantId: number) => {
    dispatch(fetchHorairesByRestaurant(restaurantId));
  };

  // Créer/mettre à jour les horaires en bulk pour un restaurant
  const createHoraires = (restaurantId: number, horaires: HoraireFormData[]) => {
    dispatch(createHorairesForRestaurant({ restaurantId, horaires }));
  };

  // Mettre à jour un horaire spécifique
  const updateHoraire = (id: number, data: Partial<Horaire>) => {
    dispatch(updateHoraireById({ id, data }));
  };

  // Supprimer un horaire
  const deleteHoraire = (id: number) => {
    dispatch(deleteHoraireById(id));
  };

  // Obtenir les horaires d'un restaurant spécifique.
  // Le backend renvoie 200 [] quand aucun horaire n'est enregistré : une liste
  // vide est un état normal, pas une erreur.
  const getHorairesByRestaurant = (restaurantId: number): Horaire[] => {
    const list = byRestaurant[restaurantId];
    return Array.isArray(list) ? list : [];
  };

  // Obtenir le statut de chargement pour un restaurant
  const getRestaurantStatus = (restaurantId: number) => {
    return restaurantStatus[restaurantId] || 'idle';
  };

  // Formater les horaires pour l'affichage
  const formatHoraires = (horaires: Horaire[]) => {
    const jourOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    return [...(horaires || [])]
      .sort((a, b) => jourOrder.indexOf(a.jour) - jourOrder.indexOf(b.jour))
      .map(horaire => ({
        ...horaire,
        formatted: `${horaire.jour}: ${horaire.heures}`
      }));
  };

  // Créer des horaires par défaut pour un restaurant
  const createDefaultHoraires = (restaurantId: number) => {
    const defaultHoraires: HoraireFormData[] = [
      { jour: 'Lundi', heures: '08:00-18:00' },
      { jour: 'Mardi', heures: '08:00-18:00' },
      { jour: 'Mercredi', heures: '08:00-18:00' },
      { jour: 'Jeudi', heures: '08:00-18:00' },
      { jour: 'Vendredi', heures: '08:00-18:00' },
      { jour: 'Samedi', heures: '08:00-15:00' },
      { jour: 'Dimanche', heures: 'Fermé' }
    ];

    createHoraires(restaurantId, defaultHoraires);
  };

  // Vérifier si un restaurant est ouvert à une heure donnée
  const isRestaurantOpen = (restaurantId: number, date?: Date): boolean => {
    const horaires = getHorairesByRestaurant(restaurantId);
    const currentDate = date || new Date();
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const currentJour = jours[currentDate.getDay()];
    
    const horaireJour = horaires.find(h => h.jour === currentJour);
    if (!horaireJour || horaireJour.heures === 'Fermé') {
      return false;
    }

    const [ouverture, fermeture] = horaireJour.heures.split('-');
    const currentTime = currentDate.toTimeString().slice(0, 5);
    
    return currentTime >= ouverture && currentTime <= fermeture;
  };

  const horaires: Horaire[] = Array.isArray(data) ? data : [];

  return {
    // Data
    horaires,
    horairesByRestaurant: byRestaurant,
    status,
    error,
    
    // Actions
    fetchHoraires,
    fetchRestaurantHoraires,
    createHoraires,
    updateHoraire,
    deleteHoraire,
    
    // Helpers
    getHorairesByRestaurant,
    getRestaurantStatus,
    formatHoraires,
    createDefaultHoraires,
    isRestaurantOpen,
    
    // Loading states
    isLoading: status === 'loading',
    // Une liste vide n'est pas une erreur : seul un vrai échec réseau/API l'est.
    isError: status === 'failed',
    isEmpty: status === 'succeeded' && horaires.length === 0
  };
};