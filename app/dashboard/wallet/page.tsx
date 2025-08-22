"use client"

import { WalletDashboard } from "@/components/wallet-dashboard"

export default function WalletPage() {
  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Wallet Admin</h1>
        <p className="text-muted-foreground">
          Visualisez tous vos gains de commissions par livraison et par repas vendus dans les restaurants
        </p>
      </div>
      
      <WalletDashboard />
    </div>
  )
}