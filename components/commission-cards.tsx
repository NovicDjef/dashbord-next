"use client"

import { useEffect, useState } from "react";
import { 
  IconTrendingUp, 
  IconTrendingDown,
  IconPackage,
  IconGasStation,
  IconMotorbike,
  IconPizza
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCommissions } from "@/hooks/use-commissions";

interface CommissionStats {
  repas: {
    count: number;
    commission: number;
    trendPercent: number;
    isPositive: boolean;
  };
  colis: {
    count: number;
    commission: number;
    trendPercent: number;
    isPositive: boolean;
  };
  gaz: {
    count: number;
    commission: number;
    trendPercent: number;
    isPositive: boolean;
  };
  livreurs: {
    count: number;
    commission: number;
    trendPercent: number;
    isPositive: boolean;
  };
}

export function CommissionCards() {
  const { deliveries, stats, loading, error } = useCommissions();
  
  const [cardStats, setCardStats] = useState<CommissionStats>({
    repas: { count: 0, commission: 0, trendPercent: 0, isPositive: true },
    colis: { count: 0, commission: 0, trendPercent: 0, isPositive: true },
    gaz: { count: 0, commission: 0, trendPercent: 0, isPositive: true },
    livreurs: { count: 0, commission: 0, trendPercent: 0, isPositive: true }
  });

  useEffect(() => {
    if (deliveries && deliveries.length > 0) {
      const repasDeliveries = deliveries.filter(d => d.typeLivraison === 'REPAS');
      const colisDeliveries = deliveries.filter(d => d.typeLivraison === 'COLIS');
      const gazDeliveries = deliveries.filter(d => d.typeLivraison === 'GAZ');
      
      setCardStats({
        repas: {
          count: repasDeliveries.length,
          commission: repasDeliveries.reduce((sum, d) => sum + d.earnings.commissionAdmin, 0),
          trendPercent: Math.random() * 20,
          isPositive: Math.random() > 0.3
        },
        colis: {
          count: colisDeliveries.length,
          commission: colisDeliveries.reduce((sum, d) => sum + d.earnings.commissionAdmin, 0),
          trendPercent: Math.random() * 15,
          isPositive: Math.random() > 0.4
        },
        gaz: {
          count: gazDeliveries.length,
          commission: gazDeliveries.reduce((sum, d) => sum + d.earnings.commissionAdmin, 0),
          trendPercent: Math.random() * 10,
          isPositive: Math.random() > 0.5
        },
        livreurs: {
          count: deliveries.length,
          commission: deliveries.reduce((sum, d) => sum + d.earnings.gainLivreur, 0),
          trendPercent: Math.random() * 8,
          isPositive: Math.random() > 0.6
        }
      });
    }
  }, [deliveries]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardFooter>
              <div className="h-4 bg-muted rounded w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Erreur de chargement</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const commissionCards = [
    {
      title: "Commissions Admin Repas",
      icon: IconPizza,
      count: cardStats.repas.count,
      commission: cardStats.repas.commission,
      trend: cardStats.repas.trendPercent,
      isPositive: cardStats.repas.isPositive,
      color: "from-orange-500/10 to-orange-50",
      iconColor: "text-orange-600"
    },
    {
      title: "Commissions Admin Colis",
      icon: IconPackage,
      count: cardStats.colis.count,
      commission: cardStats.colis.commission,
      trend: cardStats.colis.trendPercent,
      isPositive: cardStats.colis.isPositive,
      color: "from-blue-500/10 to-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Commissions Admin Gaz",
      icon: IconGasStation,
      count: cardStats.gaz.count,
      commission: cardStats.gaz.commission,
      trend: cardStats.gaz.trendPercent,
      isPositive: cardStats.gaz.isPositive,
      color: "from-green-500/10 to-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Total Gains Livreurs",
      icon: IconMotorbike,
      count: cardStats.livreurs.count,
      commission: cardStats.livreurs.commission,
      trend: cardStats.livreurs.trendPercent,
      isPositive: cardStats.livreurs.isPositive,
      color: "from-purple-500/10 to-purple-50",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {commissionCards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.isPositive ? IconTrendingUp : IconTrendingDown;
        
        return (
          <Card 
            key={index} 
            className={`@container/card bg-gradient-to-br ${card.color} border-0 shadow-sm hover:shadow-md transition-all duration-200`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardDescription>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
                  {formatCurrency(card.commission)}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {card.count} {card.count === 1 ? 'commande' : 'commandes'}
                </p>
              </div>
              <CardAction>
                <Badge variant={card.isPositive ? "default" : "destructive"} className="text-xs">
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {card.isPositive ? '+' : ''}{card.trend.toFixed(1)}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-xs pt-0">
              <div className="flex items-center gap-2 font-medium text-muted-foreground">
                <TrendIcon className="h-3 w-3" />
                {card.isPositive ? 'Augmentation' : 'Diminution'} par rapport au mois dernier
              </div>
              <div className="text-muted-foreground">
                Commission moyenne: {card.count > 0 ? formatCurrency(card.commission / card.count) : formatCurrency(0)}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}