"use client"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { CommissionCards } from "@/components/commission-cards"
import { CommissionDashboard } from "@/components/commission-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState, Suspense, lazy } from "react"
import { fetchUsers } from "@/services/userService"

// Lazy loading des composants lourds
const LazyChartAreaInteractive = lazy(() => import("@/components/chart-area-interactive").then(module => ({ default: module.ChartAreaInteractive })));
const LazyDataTable = lazy(() => import("@/components/data-table").then(module => ({ default: module.DataTable })));
const LazyCommissionDashboard = lazy(() => import("@/components/commission-dashboard").then(module => ({ default: module.CommissionDashboard })));

export default function DashboardHome() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Improved data fetching with error handling
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Parallel data loading for better performance
        const [usersData] = await Promise.allSettled([
          fetchUsers()
        ]);
        
        if (usersData.status === 'fulfilled') {
          setUsers(usersData.value || []);
        } else {
          console.error('Failed to fetch users:', usersData.reason);
          setError('Erreur lors du chargement des utilisateurs');
        }
        
      } catch (error) {
        console.error('Dashboard loading error:', error);
        setError('Erreur lors du chargement du dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-destructive text-lg font-semibold">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="koursier-btn koursier-btn-primary koursier-btn-md"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      {/* Section Commissions - Nouvelle vue principale */}
      <div className="koursier-stats-card">
        <Suspense fallback={
          <div className="koursier-skeleton h-32 rounded-lg animate-pulse" />
        }>
          <CommissionCards />
        </Suspense>
      </div>
      
      <Tabs defaultValue="commissions" className="px-4 lg:px-6">
        <TabsList className="grid w-full grid-cols-3 koursier-interactive">
          <TabsTrigger value="commissions" className="koursier-focus-visible">
            Commissions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="koursier-focus-visible">
            Analytiques
          </TabsTrigger>
          <TabsTrigger value="users" className="koursier-focus-visible">
            Utilisateurs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="commissions" className="space-y-6 mt-6 koursier-scrollable">
          <Suspense fallback={
            <div className="koursier-chart-container">
              <div className="koursier-skeleton h-64 rounded-lg koursier-shimmer" />
            </div>
          }>
            <div className="koursier-chart-container">
              <LazyCommissionDashboard />
            </div>
          </Suspense>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6 mt-6 koursier-scrollable">
          <Suspense fallback={
            <div className="koursier-chart-container">
              <div className="koursier-skeleton h-96 rounded-lg koursier-shimmer" />
            </div>
          }>
            <div className="koursier-chart-container">
              <LazyChartAreaInteractive />
            </div>
          </Suspense>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6 mt-6 koursier-scrollable">
          {isLoading ? (
            <div className="koursier-chart-container">
              <div className="koursier-skeleton h-80 rounded-lg koursier-shimmer" />
            </div>
          ) : users.length > 0 ? (
            <Suspense fallback={
              <div className="koursier-chart-container">
                <div className="koursier-skeleton h-80 rounded-lg koursier-shimmer" />
              </div>
            }>
              <div className="koursier-chart-container overflow-x-auto">
                <LazyDataTable data={users} />
              </div>
            </Suspense>
          ) : (
            <div className="koursier-chart-container">
              <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                <div className="koursier-heading-3 text-muted-foreground">Aucun utilisateur trouvé</div>
                <div className="koursier-body">
                  Il n'y a actuellement aucun utilisateur enregistré dans le système.
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
