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
import { fetchRestaurant } from "@/services/restaurantService";
import { fetchRepas } from "@/services/repasService";

export function SectionCards() {
    const [users, setUsers] = useState([]);
    const [restaurant, setRestaurant] = useState([]);
    const [repas, setRepas] = useState([]);
    const router = useRouter()

    useEffect(() => {
    fetchUsers().then(setUsers).catch(console.error);
    fetchRestaurant().then(setRestaurant).catch(console.error)
    fetchRepas().then(setRepas).catch(console.error)
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
            Trending up this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Visitors for the last 6 months
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
      <Card className="@container/card" onClick={() => router.push("/dashboard/restaurant")}>
        <CardHeader>
          <CardDescription>Total Restaurants </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
           {restaurant.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
                +{(restaurant.length)/100}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Nombre total de restaurants <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Mise à jour récente</div>
        </CardFooter>
      </Card>
      <Card className="@container/card" onClick={() => router.push("/dashboard/repas")}>
        <CardHeader>
          <CardDescription>Total Repas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {repas.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{(repas.length)/100}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Nombre total repas <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Mise à jour il ya deux jours </div>
        </CardFooter>
      </Card>
    </div>
  )
}
