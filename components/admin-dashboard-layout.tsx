"use client"

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AdminAuthGuard } from "./admin-auth-guard";
import { useTokenExpiry } from "@/hooks/use-token-expiry";
import { signOutAdmin } from "@/redux/adminAuthSlice";
import { Button } from "@/components/ui/button";
import { 
  IconLogout,
  IconUser,
  IconShield
} from "@tabler/icons-react";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const dispatch = useDispatch();
  const { admin, isAuthenticated } = useSelector((state: any) => state.adminAuth);
  
  // Utiliser le hook pour gérer l'expiration automatique du token
  useTokenExpiry();

  const handleSignOut = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      dispatch(signOutAdmin());
    }
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header d'administration */}
        {isAuthenticated && admin && (
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo et titre */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <IconShield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-800">
                      Dashboard Administrateur
                    </h1>
                    <p className="text-xs text-gray-500">
                      Gestion des restaurants et commandes
                    </p>
                  </div>
                </div>

                {/* Informations admin et déconnexion */}
                <div className="flex items-center gap-4">
                  {/* Infos admin */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <IconUser className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="hidden sm:block">
                      <div className="font-medium text-gray-700">{admin.username}</div>
                      <div className="text-xs text-gray-500">{admin.email}</div>
                    </div>
                  </div>

                  {/* Bouton de déconnexion */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <IconLogout className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Déconnexion</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Contenu principal */}
        <main>
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}