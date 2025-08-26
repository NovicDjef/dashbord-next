"use client"

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAdminAuth } from "@/redux/adminAuthSlice";
import { AdminLoginForm } from "./admin-login-form";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, isInitialized } = useSelector(
    (state: any) => state.adminAuth
  );

  useEffect(() => {
    // Vérifier l'état d'authentification au démarrage
    if (!isInitialized) {
      dispatch(checkAdminAuth());
    }
  }, [dispatch, isInitialized]);

  // Afficher un loader pendant la vérification initiale
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Vérification de l'authentification...
          </h2>
          <p className="text-gray-500 text-sm">
            Veuillez patienter un instant
          </p>
        </div>
      </div>
    );
  }

  // Si non authentifié, afficher le formulaire de connexion
  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  // Si authentifié, afficher le contenu protégé
  return <>{children}</>;
}