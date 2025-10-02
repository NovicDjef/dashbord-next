import { apiClient } from '../apiClient';

export interface Restaurant {
  id: number;
  name: string;
  phone?: string;
  adresse: string;
  image: string;
  description: string;
  ratings: number;
  latitude: number;
  longitude: number;
  adminId?: number;
  villeId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  id: number;
  name: string;
  restaurantId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Categorie {
  id: number;
  name: string;
  image: string;
  description?: string;
  menuId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Plat {
  id: number;
  name: string;
  image: string;
  description?: string;
  prix: number;
  ratings: number;
  categorieId?: number;
  createdAt: string;
  updatedAt: string;
}

export const restaurantsService = {
  /**
   * Récupérer tous les restaurants
   */
  async getAll(): Promise<Restaurant[]> {
    return await apiClient.get<Restaurant[]>('/restaurants');
  },

  /**
   * Récupérer un restaurant par ID
   */
  async getById(id: number): Promise<Restaurant> {
    return await apiClient.get<Restaurant>(`/restaurants/${id}`);
  },

  /**
   * Créer un restaurant
   */
  async create(data: Partial<Restaurant>): Promise<Restaurant> {
    return await apiClient.post<Restaurant>('/restaurants', data);
  },

  /**
   * Mettre à jour un restaurant
   */
  async update(id: number, data: Partial<Restaurant>): Promise<Restaurant> {
    return await apiClient.put<Restaurant>(`/restaurants/${id}`, data);
  },

  /**
   * Supprimer un restaurant
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete(`/restaurants/${id}`);
  },

  /**
   * Récupérer les menus d'un restaurant
   */
  async getMenus(restaurantId: number): Promise<Menu[]> {
    return await apiClient.get<Menu[]>(`/restaurants/${restaurantId}/menus`);
  },

  /**
   * Récupérer les catégories
   */
  async getCategories(menuId?: number): Promise<Categorie[]> {
    const url = menuId ? `/categories?menuId=${menuId}` : '/categories';
    return await apiClient.get<Categorie[]>(url);
  },

  /**
   * Récupérer les plats
   */
  async getPlats(categorieId?: number): Promise<Plat[]> {
    const url = categorieId ? `/repas?categorieId=${categorieId}` : '/repas';
    return await apiClient.get<Plat[]>(url);
  },

  /**
   * Créer un menu
   */
  async createMenu(data: Partial<Menu>): Promise<Menu> {
    return await apiClient.post<Menu>('/menu', data);
  },

  /**
   * Créer une catégorie
   */
  async createCategorie(data: Partial<Categorie>): Promise<Categorie> {
    return await apiClient.post<Categorie>('/categorie', data);
  },

  /**
   * Créer un plat
   */
  async createPlat(data: Partial<Plat>): Promise<Plat> {
    return await apiClient.post<Plat>('/repas', data);
  },

  /**
   * Mettre à jour un plat
   */
  async updatePlat(id: number, data: Partial<Plat>): Promise<Plat> {
    return await apiClient.put<Plat>(`/repas/${id}`, data);
  },

  /**
   * Supprimer un plat
   */
  async deletePlat(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete(`/repas/${id}`);
  },
};
