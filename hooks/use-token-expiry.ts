"use client"

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forceSignOut } from "@/redux/adminAuthSlice";

export function useTokenExpiry() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state: any) => state.adminAuth);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Nettoyer le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (token && isAuthenticated) {
      try {
        // Décoder le token JWT pour obtenir la date d'expiration
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = tokenData.exp * 1000; // Conversion en millisecondes
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;

        console.log('🔐 Token expiry check:', {
          currentTime: new Date(currentTime).toISOString(),
          expirationTime: new Date(expirationTime).toISOString(),
          timeUntilExpiry: Math.round(timeUntilExpiry / 1000 / 60) + ' minutes'
        });

        if (timeUntilExpiry <= 0) {
          // Token déjà expiré
          console.warn('⚠️ Token déjà expiré, déconnexion automatique');
          dispatch(forceSignOut());
        } else {
          // Programmer la déconnexion automatique
          timeoutRef.current = setTimeout(() => {
            console.warn('⚠️ Token expiré, déconnexion automatique');
            dispatch(forceSignOut());
          }, timeUntilExpiry);

          // Avertir l'utilisateur 5 minutes avant l'expiration
          const warningTime = timeUntilExpiry - (5 * 60 * 1000); // 5 minutes avant
          if (warningTime > 0) {
            setTimeout(() => {
              console.warn('⚠️ Votre session expirera dans 5 minutes');
              // Ici vous pourriez afficher une notification à l'utilisateur
            }, warningTime);
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors du décodage du token:', error);
        dispatch(forceSignOut());
      }
    }

    // Nettoyer le timeout lors du démontage du composant
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [token, isAuthenticated, dispatch]);

  // Fonction pour rafraîchir le token (à implémenter si nécessaire)
  const refreshToken = async () => {
    try {
      // TODO: Implémenter le rafraîchissement du token
      console.log('🔄 Rafraîchissement du token...');
      
      // Exemple d'appel API pour rafraîchir le token
      // const response = await fetch('/admin/refresh-token', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });
      // const data = await response.json();
      // dispatch(updateToken(data.token));
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement du token:', error);
      dispatch(forceSignOut());
    }
  };

  return { refreshToken };
}