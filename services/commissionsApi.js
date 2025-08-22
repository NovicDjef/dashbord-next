import apiService from './Api';
import logger from '../app/utils/logger';

/**
 * Service API pour la gestion des commissions et gains
 * Inclut la gestion en temps réel des gains des livreurs
 */
export const commissionsApi = {
  // ===== COMMISSIONS GÉNÉRALES =====
  
  // Récupérer toutes les commissions
  getAllCommissions: async () => {
    try {
      logger.network('GET', '/commissions');
      const response = await apiService.get('/commissions');
      logger.success('Commissions récupérées:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Erreur récupération commissions:', error);
      throw error;
    }
  },

  // Récupérer les commissions par type de service
  getCommissionsByType: async (serviceType) => {
    try {
      logger.network('GET', `/commissions/${serviceType}`);
      const response = await apiService.get(`/commissions/${serviceType}`);
      logger.success(`Commissions ${serviceType} récupérées:`, response.data);
      return response.data;
    } catch (error) {
      logger.error(`Erreur récupération commissions ${serviceType}:`, error);
      throw error;
    }
  },

  // Récupérer les commissions REPAS
  getRepasCommissions: async () => {
    return commissionsApi.getCommissionsByType('REPAS');
  },

  // Récupérer les commissions COLIS
  getColisCommissions: async () => {
    return commissionsApi.getCommissionsByType('COLIS');
  },

  // Récupérer les commissions GAZ
  getGazCommissions: async () => {
    return commissionsApi.getCommissionsByType('GAZ');
  },

  // ===== GAINS DES LIVREURS =====

  /**
   * Récupérer les gains d'un livreur avec pagination
   * @param {number} livreurId - ID du livreur
   * @param {number} page - Numéro de page (défaut: 1)
   * @param {number} limit - Limite par page (défaut: 20)
   * @returns {Promise} Données des gains
   */
  getGainsLivreur: async (livreurId, page = 1, limit = 20) => {
    try {
      logger.network('GET', `/livreur/${livreurId}/gains`, { page, limit });
      
      const response = await apiService.get(`/livreur/${livreurId}/gains`, {
        params: { page, limit }
      });
      
      const data = response.data;
      logger.success('Gains récupérés:', {
        nombreGains: data.gains?.length || 0,
        totalGains: data.livreur?.totalGains || 0,
        gainsDisponibles: data.livreur?.gainsDisponibles || 0,
        totalLivraisons: data.livreur?.totalLivraisons || 0,
        page: data.page || 1
      });
      
      return data;
    } catch (error) {
      logger.error('Erreur récupération gains:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Récupérer les statistiques des gains d'un livreur
   * @param {number} livreurId - ID du livreur
   * @returns {Promise} Statistiques des gains
   */
  getStatsGains: async (livreurId) => {
    try {
      logger.network('GET', `/livreur/${livreurId}/gains/stats`);
      
      const response = await apiService.get(`/livreur/${livreurId}/gains/stats`);
      
      const data = response.data;
      logger.success('Stats gains récupérées:', {
        statsParType: data.statsParType?.length || 0,
        statsParMois: data.statsParMois?.length || 0,
        periode: data.periode || 'N/A'
      });
      
      return data;
    } catch (error) {
      logger.error('Erreur récupération stats gains:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Retirer des gains
   * @param {number} livreurId - ID du livreur
   * @param {number} montant - Montant à retirer
   * @returns {Promise} Résultat du retrait
   */
  retirerGains: async (livreurId, montant) => {
    try {
      logger.network('POST', `/livreur/${livreurId}/gains/retirer`, { montant });
      
      const response = await apiService.post(`/livreur/${livreurId}/gains/retirer`, { 
        montant 
      });
      
      logger.success('Retrait effectué:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Erreur retrait gains:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Mettre à jour les commissions d'un livreur
   * @param {number} livreurId - ID du livreur
   * @param {Object} commissions - Nouvelles commissions
   * @returns {Promise} Commissions mises à jour
   */
  updateLivreurCommissions: async (livreurId, commissions) => {
    try {
      logger.network('PATCH', `/livreur/${livreurId}/commissions`, commissions);
      
      const response = await apiService.patch(`/livreur/${livreurId}/commissions`, commissions);
      
      logger.success('Commissions mises à jour:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Erreur mise à jour commissions:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Récupérer les gains et stats en une seule requête
   * @param {number} livreurId - ID du livreur
   * @param {number} page - Numéro de page
   * @param {number} limit - Limite par page
   * @returns {Promise} Données complètes des gains
   */
  getGainsComplets: async (livreurId, page = 1, limit = 20) => {
    try {
      logger.debug(`Récupération complète données livreur ${livreurId}`);
      
      const [gainsData, statsData] = await Promise.all([
        commissionsApi.getGainsLivreur(livreurId, page, limit),
        commissionsApi.getStatsGains(livreurId)
      ]);
      
      const combinedData = {
        ...gainsData,
        stats: statsData,
        timestamp: new Date().toISOString()
      };
      
      logger.success('Données complètes récupérées:', {
        gains: combinedData.gains?.length || 0,
        statsTypes: combinedData.stats?.statsParType?.length || 0,
        statsMois: combinedData.stats?.statsParMois?.length || 0
      });
      
      return combinedData;
    } catch (error) {
      logger.error('Erreur récupération données complètes:', error.message);
      throw error;
    }
  }
};

/**
 * Gestionnaire de mise à jour en temps réel des gains
 */
class GainsRealTimeManager {
  constructor() {
    this.intervalId = null;
    this.subscribers = new Map(); // livreurId -> { callbacks: [], interval }
    this.defaultInterval = 30000; // 30 secondes
  }

  /**
   * S'abonner aux mises à jour temps réel des gains d'un livreur
   * @param {number} livreurId - ID du livreur
   * @param {Function} callback - Fonction appelée lors des mises à jour
   * @param {number} interval - Intervalle de mise à jour en ms
   * @returns {Function} Fonction de désabonnement
   */
  subscribe(livreurId, callback, interval = this.defaultInterval) {
    logger.debug(`Abonnement temps réel livreur ${livreurId} (interval: ${interval}ms)`);
    
    if (!this.subscribers.has(livreurId)) {
      this.subscribers.set(livreurId, {
        callbacks: [],
        interval,
        lastUpdate: null
      });
    }
    
    const subscriber = this.subscribers.get(livreurId);
    subscriber.callbacks.push(callback);
    
    // Première récupération immédiate
    this.fetchAndNotify(livreurId);
    
    // Démarrer le timer si ce n'est pas déjà fait
    this.startTimer();
    
    // Retourner la fonction de désabonnement
    return () => this.unsubscribe(livreurId, callback);
  }

  /**
   * Se désabonner des mises à jour
   * @param {number} livreurId - ID du livreur
   * @param {Function} callback - Callback à supprimer
   */
  unsubscribe(livreurId, callback) {
    logger.debug(`Désabonnement temps réel livreur ${livreurId}`);
    
    const subscriber = this.subscribers.get(livreurId);
    if (subscriber) {
      subscriber.callbacks = subscriber.callbacks.filter(cb => cb !== callback);
      
      // Supprimer complètement si plus de callbacks
      if (subscriber.callbacks.length === 0) {
        this.subscribers.delete(livreurId);
      }
    }
    
    // Arrêter le timer si plus d'abonnés
    if (this.subscribers.size === 0) {
      this.stopTimer();
    }
  }

  /**
   * Démarrer le timer de mise à jour
   */
  startTimer() {
    if (this.intervalId) return;
    
    logger.debug('Démarrage timer mise à jour temps réel');
    
    this.intervalId = setInterval(() => {
      this.subscribers.forEach((subscriber, livreurId) => {
        const now = Date.now();
        const lastUpdate = subscriber.lastUpdate || 0;
        
        if (now - lastUpdate >= subscriber.interval) {
          this.fetchAndNotify(livreurId);
        }
      });
    }, 5000); // Vérification toutes les 5 secondes
  }

  /**
   * Arrêter le timer de mise à jour
   */
  stopTimer() {
    logger.debug('Arrêt timer mise à jour temps réel');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Récupérer les données et notifier les abonnés
   * @param {number} livreurId - ID du livreur
   */
  async fetchAndNotify(livreurId) {
    const subscriber = this.subscribers.get(livreurId);
    if (!subscriber) return;
    
    try {
      logger.debug(`Mise à jour données temps réel livreur ${livreurId}`);
      
      const data = await commissionsApi.getGainsComplets(livreurId);
      subscriber.lastUpdate = Date.now();
      
      // Notifier tous les callbacks
      subscriber.callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (callbackError) {
          logger.error(`Erreur callback temps réel livreur ${livreurId}:`, callbackError);
        }
      });
      
    } catch (error) {
      logger.error(`Erreur mise à jour temps réel livreur ${livreurId}:`, error.message);
      
      // Notifier l'erreur aux callbacks
      const errorData = {
        error: error.response?.data || error.message,
        timestamp: new Date().toISOString(),
        livreurId
      };
      
      subscriber.callbacks.forEach(callback => {
        try {
          callback(errorData);
        } catch (callbackError) {
          logger.error(`Erreur callback erreur temps réel livreur ${livreurId}:`, callbackError);
        }
      });
    }
  }

  /**
   * Forcer une mise à jour manuelle pour un livreur
   * @param {number} livreurId - ID du livreur (optionnel, tous si non spécifié)
   */
  forceUpdate(livreurId = null) {
    if (livreurId) {
      logger.debug(`Force mise à jour temps réel livreur ${livreurId}`);
      this.fetchAndNotify(livreurId);
    } else {
      logger.debug('Force mise à jour temps réel tous les livreurs');
      this.subscribers.forEach((_, id) => {
        this.fetchAndNotify(id);
      });
    }
  }

  /**
   * Obtenir les statistiques du gestionnaire
   */
  getStats() {
    const stats = {
      subscribersCount: this.subscribers.size,
      isRunning: !!this.intervalId,
      subscribers: []
    };
    
    this.subscribers.forEach((subscriber, livreurId) => {
      stats.subscribers.push({
        livreurId,
        callbacksCount: subscriber.callbacks.length,
        interval: subscriber.interval,
        lastUpdate: subscriber.lastUpdate
      });
    });
    
    return stats;
  }

  /**
   * Nettoyer toutes les souscriptions
   */
  cleanup() {
    logger.debug('Nettoyage complet gestionnaire temps réel');
    this.stopTimer();
    this.subscribers.clear();
  }
}

// Instance unique du gestionnaire temps réel
export const gainsRealTimeManager = new GainsRealTimeManager();

export default commissionsApi;