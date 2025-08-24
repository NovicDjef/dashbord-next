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

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      {/* Section Commissions - Nouvelle vue principale */}
      <CommissionCards />
      
      <Tabs defaultValue="commissions" className="px-4 lg:px-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="commissions" className="space-y-6 mt-6">
          <Suspense fallback={<div className="h-64 bg-muted rounded animate-pulse" />}>
            <LazyCommissionDashboard />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <Suspense fallback={<div className="h-64 bg-muted rounded animate-pulse" />}>
            <LazyChartAreaInteractive />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6 mt-6">
          {users.length > 0 && (
            <Suspense fallback={<div className="h-64 bg-muted rounded animate-pulse" />}>
              <LazyDataTable data={users} />
            </Suspense>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
