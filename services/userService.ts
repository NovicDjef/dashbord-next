import { store } from '../redux/store';
import { fetchAllUsersAsync } from '../redux/authSlice';

export async function fetchUsers() {
  try {
    // Utiliser Redux pour récupérer les utilisateurs
    const result = await store.dispatch(fetchAllUsersAsync());
    
    if (fetchAllUsersAsync.fulfilled.match(result)) {
      console.log('✅ Utilisateurs récupérés via Redux:', result.payload);
      return result.payload;
    } else if (fetchAllUsersAsync.rejected.match(result)) {
      console.error('❌ Erreur Redux:', result.payload);
      throw new Error(result.payload?.message || 'Erreur lors de la récupération des utilisateurs');
    }
  } catch (error) {
    console.error('❌ Erreur dans fetchUsers:', error);
    throw error;
  }
}
