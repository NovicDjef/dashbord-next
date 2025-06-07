"use client"
import { useEffect, useState } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fetchUsers } from "@/services/userService";
import { useRouter } from "next/navigation";
import { fetchCommande } from "@/services/commandeService";
import { fetchColis } from "@/services/colisService";

export function SectionCards() {
    const [users, setUsers] = useState([]);
    const [commande, setCommande] = useState([]);
    const [colis, setColis] = useState([]);
    const router = useRouter()

    useEffect(() => {
    fetchUsers().then(setUsers).catch(console.error);
    fetchCommande().then(setCommande).catch(console.error)
    fetchColis().then(setColis).catch(console.error)
  }, []);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            montant total encaisse <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Mise à jour des 3 dernier mois
          </div>
        </CardFooter>
      </Card>
      {/* <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card> */}
       <Card className="@container/card" onClick={() => router.push("/dashboard/users")}>
        <CardHeader>
          <CardDescription>Total Utilisateurs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {users.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{(users.length)/100}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Nombre total d'utilisateurs <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Mise à jour récente
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card" onClick={() => router.push("/dashboard/commande")}>
        <CardHeader>
          <CardDescription>Total commandes </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
           {commande.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
                +{(commande.length)/100}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Nombre total de commande effectuer <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Mise à jour il y'a 3 mois</div>
        </CardFooter>
      </Card>
      <Card className="@container/card" onClick={() => router.push("/dashboard/colis")}>
        <CardHeader>
          <CardDescription>Total colis</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {colis.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{(colis.length)/100}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Nombre total de colis expedier <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Mise à jour il ya 90 jours </div>
        </CardFooter>
      </Card>
    </div>
  )
}
