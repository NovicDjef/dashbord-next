"use client"

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  IconSettings,
  IconDeviceMobile,
  IconTruck,
  IconCurrencyDollar,
  IconPercentage,
  IconBell,
  IconDeviceFloppy,
  IconRefresh,
  IconCheck,
  IconAlertCircle
} from "@tabler/icons-react";
import { useToast } from "@/hooks/use-toast";
import { configService } from '@/services/api';

interface TarifConfig {
  id: number;
  serviceType: 'REPAS' | 'COLIS' | 'GAZ';
  basePrice: number;
  pricePerKm?: number;
  pricePerKg?: number;
  minimumPrice: number;
  maximumPrice?: number;
  isActive: boolean;
}

interface CommissionConfig {
  id: number;
  serviceType: 'REPAS' | 'COLIS' | 'GAZ';
  commissionRate: number;
  fixedAmount?: number;
  isActive: boolean;
}

interface AppSettings {
  maintenanceMode: boolean;
  minimumAppVersion: string;
  forceUpdate: boolean;
  enableNotifications: boolean;
  enableGPS: boolean;
  maxDeliveryRadius: number;
  autoAssignOrders: boolean;
  orderTimeout: number;
}

export default function ConfigurationPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // States
  const [tarifs, setTarifs] = useState<TarifConfig[]>([]);
  const [commissions, setCommissions] = useState<CommissionConfig[]>([]);
  const [clientSettings, setClientSettings] = useState<AppSettings>({
    maintenanceMode: false,
    minimumAppVersion: '1.0.0',
    forceUpdate: false,
    enableNotifications: true,
    enableGPS: true,
    maxDeliveryRadius: 50,
    autoAssignOrders: false,
    orderTimeout: 15,
  });
  const [livreurSettings, setLivreurSettings] = useState<AppSettings>({
    maintenanceMode: false,
    minimumAppVersion: '1.0.0',
    forceUpdate: false,
    enableNotifications: true,
    enableGPS: true,
    maxDeliveryRadius: 50,
    autoAssignOrders: true,
    orderTimeout: 5,
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tarifsData, commissionsData, clientData, livreurData] = await Promise.all([
        configService.getTarifs(),
        configService.getCommissions(),
        configService.getClientSettings(),
        configService.getLivreurSettings(),
      ]);

      setTarifs(tarifsData);
      setCommissions(commissionsData);
      setClientSettings(clientData as AppSettings);
      setLivreurSettings(livreurData as AppSettings);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save tarifs
  const saveTarifs = async () => {
    setSaving(true);
    try {
      for (const tarif of tarifs) {
        await configService.updateTarif(tarif.id, tarif);
      }
      toast({
        title: "Succès",
        description: "Tarifs mis à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour des tarifs",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Save commissions
  const saveCommissions = async () => {
    setSaving(true);
    try {
      for (const commission of commissions) {
        await configService.updateCommission(commission.id, commission);
      }
      toast({
        title: "Succès",
        description: "Commissions mises à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour des commissions",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Save client settings
  const saveClientSettings = async () => {
    setSaving(true);
    try {
      await configService.updateClientSettings(clientSettings);
      toast({
        title: "Succès",
        description: "Paramètres Client mis à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Save livreur settings
  const saveLivreurSettings = async () => {
    setSaving(true);
    try {
      await configService.updateLivreurSettings(livreurSettings);
      toast({
        title: "Succès",
        description: "Paramètres Livreur mis à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <IconRefresh className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Chargement des configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <IconSettings className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuration Générale</h1>
            <p className="text-muted-foreground">
              Gérez les paramètres des applications Client et Livreur
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 lg:px-6">
        <Tabs defaultValue="tarifs" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tarifs" className="flex items-center gap-2">
              <IconCurrencyDollar className="h-4 w-4" />
              Tarifs
            </TabsTrigger>
            <TabsTrigger value="commissions" className="flex items-center gap-2">
              <IconPercentage className="h-4 w-4" />
              Commissions
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center gap-2">
              <IconDeviceMobile className="h-4 w-4" />
              App Client
            </TabsTrigger>
            <TabsTrigger value="livreur" className="flex items-center gap-2">
              <IconTruck className="h-4 w-4" />
              App Livreur
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <IconBell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Tarifs Tab */}
          <TabsContent value="tarifs" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration des Tarifs</CardTitle>
                <CardDescription>
                  Définissez les tarifs pour chaque type de service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {tarifs.map((tarif, index) => (
                  <div key={tarif.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{tarif.serviceType}</h3>
                      <Switch
                        checked={tarif.isActive}
                        onCheckedChange={(checked) => {
                          const newTarifs = [...tarifs];
                          newTarifs[index].isActive = checked;
                          setTarifs(newTarifs);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Prix de base (F)</Label>
                        <Input
                          type="number"
                          value={tarif.basePrice}
                          onChange={(e) => {
                            const newTarifs = [...tarifs];
                            newTarifs[index].basePrice = Number(e.target.value);
                            setTarifs(newTarifs);
                          }}
                        />
                      </div>

                      {tarif.serviceType !== 'GAZ' && (
                        <div className="space-y-2">
                          <Label>Prix par km (F)</Label>
                          <Input
                            type="number"
                            value={tarif.pricePerKm || 0}
                            onChange={(e) => {
                              const newTarifs = [...tarifs];
                              newTarifs[index].pricePerKm = Number(e.target.value);
                              setTarifs(newTarifs);
                            }}
                          />
                        </div>
                      )}

                      {tarif.serviceType === 'COLIS' && (
                        <div className="space-y-2">
                          <Label>Prix par kg (F)</Label>
                          <Input
                            type="number"
                            value={tarif.pricePerKg || 0}
                            onChange={(e) => {
                              const newTarifs = [...tarifs];
                              newTarifs[index].pricePerKg = Number(e.target.value);
                              setTarifs(newTarifs);
                            }}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Prix minimum (F)</Label>
                        <Input
                          type="number"
                          value={tarif.minimumPrice}
                          onChange={(e) => {
                            const newTarifs = [...tarifs];
                            newTarifs[index].minimumPrice = Number(e.target.value);
                            setTarifs(newTarifs);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Prix maximum (F)</Label>
                        <Input
                          type="number"
                          value={tarif.maximumPrice || 0}
                          onChange={(e) => {
                            const newTarifs = [...tarifs];
                            newTarifs[index].maximumPrice = Number(e.target.value);
                            setTarifs(newTarifs);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button onClick={saveTarifs} disabled={saving} className="w-full md:w-auto">
                  {saving ? (
                    <IconRefresh className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="h-4 w-4 mr-2" />
                  )}
                  Sauvegarder les tarifs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration des Commissions</CardTitle>
                <CardDescription>
                  Définissez les taux de commission pour chaque service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {commissions.map((commission, index) => (
                  <div key={commission.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{commission.serviceType}</h3>
                      <Switch
                        checked={commission.isActive}
                        onCheckedChange={(checked) => {
                          const newCommissions = [...commissions];
                          newCommissions[index].isActive = checked;
                          setCommissions(newCommissions);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Taux de commission (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={commission.commissionRate}
                          onChange={(e) => {
                            const newCommissions = [...commissions];
                            newCommissions[index].commissionRate = Number(e.target.value);
                            setCommissions(newCommissions);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Montant fixe (F) - Optionnel</Label>
                        <Input
                          type="number"
                          value={commission.fixedAmount || 0}
                          onChange={(e) => {
                            const newCommissions = [...commissions];
                            newCommissions[index].fixedAmount = Number(e.target.value);
                            setCommissions(newCommissions);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button onClick={saveCommissions} disabled={saving} className="w-full md:w-auto">
                  {saving ? (
                    <IconRefresh className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="h-4 w-4 mr-2" />
                  )}
                  Sauvegarder les commissions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Settings Tab */}
          <TabsContent value="client" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres Application Client</CardTitle>
                <CardDescription>
                  Configuration de l&apos;application mobile pour les clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">Mode Maintenance</Label>
                      <p className="text-sm text-muted-foreground">
                        Désactiver l&apos;application temporairement
                      </p>
                    </div>
                    <Switch
                      checked={clientSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setClientSettings({ ...clientSettings, maintenanceMode: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">Forcer la mise à jour</Label>
                      <p className="text-sm text-muted-foreground">
                        Obliger les utilisateurs à mettre à jour l&apos;app
                      </p>
                    </div>
                    <Switch
                      checked={clientSettings.forceUpdate}
                      onCheckedChange={(checked) =>
                        setClientSettings({ ...clientSettings, forceUpdate: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifications push</Label>
                      <p className="text-sm text-muted-foreground">
                        Activer les notifications pour les clients
                      </p>
                    </div>
                    <Switch
                      checked={clientSettings.enableNotifications}
                      onCheckedChange={(checked) =>
                        setClientSettings({ ...clientSettings, enableNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">GPS requis</Label>
                      <p className="text-sm text-muted-foreground">
                        Exiger la localisation GPS
                      </p>
                    </div>
                    <Switch
                      checked={clientSettings.enableGPS}
                      onCheckedChange={(checked) =>
                        setClientSettings({ ...clientSettings, enableGPS: checked })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Version minimale requise</Label>
                      <Input
                        type="text"
                        value={clientSettings.minimumAppVersion}
                        onChange={(e) =>
                          setClientSettings({ ...clientSettings, minimumAppVersion: e.target.value })
                        }
                        placeholder="1.0.0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Rayon de livraison max (km)</Label>
                      <Input
                        type="number"
                        value={clientSettings.maxDeliveryRadius}
                        onChange={(e) =>
                          setClientSettings({
                            ...clientSettings,
                            maxDeliveryRadius: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Timeout commande (minutes)</Label>
                      <Input
                        type="number"
                        value={clientSettings.orderTimeout}
                        onChange={(e) =>
                          setClientSettings({
                            ...clientSettings,
                            orderTimeout: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={saveClientSettings} disabled={saving} className="w-full md:w-auto">
                  {saving ? (
                    <IconRefresh className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="h-4 w-4 mr-2" />
                  )}
                  Sauvegarder les paramètres Client
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Livreur Settings Tab */}
          <TabsContent value="livreur" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres Application Livreur</CardTitle>
                <CardDescription>
                  Configuration de l&apos;application mobile pour les livreurs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">Mode Maintenance</Label>
                      <p className="text-sm text-muted-foreground">
                        Désactiver l&apos;application temporairement
                      </p>
                    </div>
                    <Switch
                      checked={livreurSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setLivreurSettings({ ...livreurSettings, maintenanceMode: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">Assignation automatique</Label>
                      <p className="text-sm text-muted-foreground">
                        Assigner automatiquement les commandes aux livreurs
                      </p>
                    </div>
                    <Switch
                      checked={livreurSettings.autoAssignOrders}
                      onCheckedChange={(checked) =>
                        setLivreurSettings({ ...livreurSettings, autoAssignOrders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifications push</Label>
                      <p className="text-sm text-muted-foreground">
                        Activer les notifications pour les livreurs
                      </p>
                    </div>
                    <Switch
                      checked={livreurSettings.enableNotifications}
                      onCheckedChange={(checked) =>
                        setLivreurSettings({ ...livreurSettings, enableNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">GPS requis</Label>
                      <p className="text-sm text-muted-foreground">
                        Exiger le tracking GPS en temps réel
                      </p>
                    </div>
                    <Switch
                      checked={livreurSettings.enableGPS}
                      onCheckedChange={(checked) =>
                        setLivreurSettings({ ...livreurSettings, enableGPS: checked })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Version minimale requise</Label>
                      <Input
                        type="text"
                        value={livreurSettings.minimumAppVersion}
                        onChange={(e) =>
                          setLivreurSettings({
                            ...livreurSettings,
                            minimumAppVersion: e.target.value,
                          })
                        }
                        placeholder="1.0.0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Rayon d&apos;action max (km)</Label>
                      <Input
                        type="number"
                        value={livreurSettings.maxDeliveryRadius}
                        onChange={(e) =>
                          setLivreurSettings({
                            ...livreurSettings,
                            maxDeliveryRadius: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Timeout acceptation (minutes)</Label>
                      <Input
                        type="number"
                        value={livreurSettings.orderTimeout}
                        onChange={(e) =>
                          setLivreurSettings({
                            ...livreurSettings,
                            orderTimeout: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={saveLivreurSettings} disabled={saving} className="w-full md:w-auto">
                  {saving ? (
                    <IconRefresh className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="h-4 w-4 mr-2" />
                  )}
                  Sauvegarder les paramètres Livreur
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration des Notifications</CardTitle>
                <CardDescription>
                  Gérez les notifications système (À venir)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <div className="text-center space-y-2">
                    <IconAlertCircle className="h-12 w-12 mx-auto" />
                    <p>Configuration des notifications disponible bientôt</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
