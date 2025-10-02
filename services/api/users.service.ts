import { apiClient } from '../apiClient';

export interface User {
  id: number;
  username: string;
  phone: string;
  email?: string;
  image?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export const usersService = {
  /**
   * Récupérer tous les utilisateurs
   */
  async getAll(filters?: UserFilters): Promise<UsersResponse> {
    return await apiClient.get<UsersResponse>('/users', { params: filters });
  },

  /**
   * Récupérer un utilisateur par ID
   */
  async getById(id: number): Promise<User> {
    return await apiClient.get<User>(`/users/${id}`);
  },

  /**
   * Créer un utilisateur
   */
  async create(data: Partial<User>): Promise<User> {
    return await apiClient.post<User>('/users', data);
  },

  /**
   * Mettre à jour un utilisateur
   */
  async update(id: number, data: Partial<User>): Promise<User> {
    return await apiClient.put<User>(`/users/${id}`, data);
  },

  /**
   * Supprimer un utilisateur
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete(`/users/${id}`);
  },

  /**
   * Vérifier si un numéro de téléphone existe
   */
  async checkPhone(phone: string): Promise<{ exists: boolean }> {
    return await apiClient.get<{ exists: boolean }>('/users/phone/check', {
      params: { phone },
    });
  },
};
