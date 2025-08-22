// Utilitaire de notifications pour la Web App
export const showNotification = (title, message, type = 'info') => {
  console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  
  // Dans un vrai projet, vous pourriez utiliser une bibliothèque comme react-toastify
  // ou implémenter votre propre système de notification
};