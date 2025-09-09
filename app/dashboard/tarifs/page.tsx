"use client"

import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/services/urlApp";
import { 
  IconCurrency,
  IconTruck,
  IconClock,
  IconCalendar,
  IconDeviceFloppy,
  IconRefresh,
  IconCalculator,
  IconSettings
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TarifService {
  prixBase: number;
  parKmSupplementaire?: number;
  parKg?: number;
  majoration: {
    weekend: string;
    nuit: string;
  };
  exemples: { [key: string]: number };
}

interface Tarifs {
  REPAS: TarifService;
  COLIS: TarifService;
  GAZ: {
    info: string;
    majoration: {
      weekend: string;
      nuit: string;
    };
  };
}

interface ConditionsActuelles {
  estWeekend: boolean;
  estNuit: boolean;
  heure: number;
  jourSemaine: string;
  date: string;
}

export default function TarifsPage() {
  const [tarifs, setTarifs] = useState<Tarifs | null>(null);
  const [conditions, setConditions] = useState<ConditionsActuelles | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // États pour les formulaires d'édition
  const [repasForm, setRepasForm] = useState({
    prixBase: 0,
    parKmSupplementaire: 0,
    majorationWeekend: "",
    majorationNuit: ""
  });

  const [colisForm, setColisForm] = useState({
    prixBase: 0,
    parKg: 0,
    majorationWeekend: "",
    majorationNuit: ""
  });

  const [gazForm, setGazForm] = useState({
    majorationWeekend: "",
    majorationNuit: ""
  });

  useEffect(() => {
    loadTarifs();
  }, []);

  const loadTarifs = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.tarifs);
      const data = await response.json();
      
      if (data.success) {
        setTarifs(data.tarifs);
        setConditions(data.conditionsActuelles);
        
        // Initialiser les formulaires avec les données actuelles
        setRepasForm({
          prixBase: data.tarifs.REPAS.prixBase,
          parKmSupplementaire: data.tarifs.REPAS.parKmSupplementaire,
          majorationWeekend: data.tarifs.REPAS.majoration.weekend,
          majorationNuit: data.tarifs.REPAS.majoration.nuit
        });

        setColisForm({
          prixBase: data.tarifs.COLIS.prixBase,
          parKg: data.tarifs.COLIS.parKg,
          majorationWeekend: data.tarifs.COLIS.majoration.weekend,
          majorationNuit: data.tarifs.COLIS.majoration.nuit
        });

        setGazForm({
          majorationWeekend: data.tarifs.GAZ.majoration.weekend,
          majorationNuit: data.tarifs.GAZ.majoration.nuit
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tarifs:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveTarifs = async () => {
    try {
      setSaving(true);
      
      const newTarifs = {
        REPAS: {
          prixBase: repasForm.prixBase,
          parKmSupplementaire: repasForm.parKmSupplementaire,
          majoration: {
            weekend: repasForm.majorationWeekend,
            nuit: repasForm.majorationNuit
          }
        },
        COLIS: {
          prixBase: colisForm.prixBase,
          parKg: colisForm.parKg,
          majoration: {
            weekend: colisForm.majorationWeekend,
            nuit: colisForm.majorationNuit
          }
        },
        GAZ: {
          majoration: {
            weekend: gazForm.majorationWeekend,
            nuit: gazForm.majorationNuit
          }
        }
      };

      const response = await fetch(API_ENDPOINTS.tarifs, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTarifs),
      });

      if (response.ok) {
        await loadTarifs(); // Recharger les données
        setEditMode(false);
        alert("Tarifs mis à jour avec succès !");
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde des tarifs");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculatePrice = (service: 'REPAS' | 'COLIS', params: any) => {
    if (!tarifs) return 0;
    
    let prix = 0;
    
    if (service === 'REPAS') {
      prix = tarifs.REPAS.prixBase + (params.km || 0) * tarifs.REPAS.parKmSupplementaire!;
    } else if (service === 'COLIS') {
      prix = tarifs.COLIS.prixBase + (params.kg || 0) * tarifs.COLIS.parKg!;
    }
    
    // Appliquer les majorations si applicable
    if (conditions?.estWeekend) {
      const majorationPct = parseInt(tarifs[service].majoration.weekend.replace(/[+%]/g, ''));
      prix *= (1 + majorationPct / 100);
    }
    
    if (conditions?.estNuit) {
      const majorationPct = parseInt(tarifs[service].majoration.nuit.replace(/[+%]/g, ''));
      prix *= (1 + majorationPct / 100);
    }
    
    return Math.round(prix);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 bg-muted rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <IconCurrency className="h-6 w-6" />
            Gestion des Tarifs de Livraison
          </h1>
          <p className="text-muted-foreground">
            Configurez les prix et majorations pour tous vos services
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTarifs}>
            <IconRefresh className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Annuler
              </Button>
              <Button onClick={saveTarifs} disabled={saving}>
                {saving ? "Sauvegarde..." : (
                  <>
                    <IconDeviceFloppy className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>
              <IconSettings className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Conditions actuelles */}
      {conditions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5" />
              Conditions Actuelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Badge variant={conditions.estWeekend ? "default" : "outline"}>
                Weekend: {conditions.estWeekend ? "Oui" : "Non"}
              </Badge>
              <Badge variant={conditions.estNuit ? "default" : "outline"}>
                Service nocturne: {conditions.estNuit ? "Oui" : "Non"}
              </Badge>
              <div className="flex items-center gap-1 text-sm">
                <IconClock className="h-4 w-4" />
                {conditions.heure}h - {conditions.jourSemaine}
              </div>
              <div className="text-sm text-muted-foreground">
                {conditions.date}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="repas" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="repas">🍽️ Repas</TabsTrigger>
          <TabsTrigger value="colis">📦 Colis</TabsTrigger>
          <TabsTrigger value="gaz">⛽ Gaz</TabsTrigger>
          <TabsTrigger value="calculateur">🧮 Calculateur</TabsTrigger>
        </TabsList>

        {/* REPAS */}
        <TabsContent value="repas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTruck className="h-5 w-5" />
                Tarifs Livraison de Repas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="repas-prix-base">Prix de base</Label>
                    {editMode ? (
                      <Input
                        id="repas-prix-base"
                        type="number"
                        value={repasForm.prixBase}
                        onChange={(e) => setRepasForm({...repasForm, prixBase: parseInt(e.target.value) || 0})}
                      />
                    ) : (
                      <p className="text-2xl font-bold text-green-600">
                        {tarifs && formatCurrency(tarifs.REPAS.prixBase)}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="repas-par-km">Par km supplémentaire</Label>
                    {editMode ? (
                      <Input
                        id="repas-par-km"
                        type="number"
                        value={repasForm.parKmSupplementaire}
                        onChange={(e) => setRepasForm({...repasForm, parKmSupplementaire: parseInt(e.target.value) || 0})}
                      />
                    ) : (
                      <p className="text-xl font-semibold">
                        {tarifs && formatCurrency(tarifs.REPAS.parKmSupplementaire!)}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label>Majorations</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span>Weekend</span>
                        {editMode ? (
                          <Input
                            className="w-20"
                            value={repasForm.majorationWeekend}
                            onChange={(e) => setRepasForm({...repasForm, majorationWeekend: e.target.value})}
                          />
                        ) : (
                          <Badge variant="outline">
                            {tarifs?.REPAS.majoration.weekend}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Service nocturne</span>
                        {editMode ? (
                          <Input
                            className="w-20"
                            value={repasForm.majorationNuit}
                            onChange={(e) => setRepasForm({...repasForm, majorationNuit: e.target.value})}
                          />
                        ) : (
                          <Badge variant="outline">
                            {tarifs?.REPAS.majoration.nuit}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Exemples de tarifs</Label>
                  {tarifs && (
                    <div className="space-y-3 mt-2">
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>Livraison normale</span>
                        <span className="font-semibold">{formatCurrency(tarifs.REPAS.exemples.normal)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>Avec 5km supplémentaires</span>
                        <span className="font-semibold">{formatCurrency(tarifs.REPAS.exemples.avec5km)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>Avec 10km supplémentaires</span>
                        <span className="font-semibold">{formatCurrency(tarifs.REPAS.exemples.avec10km)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COLIS */}
        <TabsContent value="colis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTruck className="h-5 w-5" />
                Tarifs Expédition de Colis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="colis-prix-base">Prix de base</Label>
                    {editMode ? (
                      <Input
                        id="colis-prix-base"
                        type="number"
                        value={colisForm.prixBase}
                        onChange={(e) => setColisForm({...colisForm, prixBase: parseInt(e.target.value) || 0})}
                      />
                    ) : (
                      <p className="text-2xl font-bold text-blue-600">
                        {tarifs && formatCurrency(tarifs.COLIS.prixBase)}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="colis-par-kg">Par kilogramme</Label>
                    {editMode ? (
                      <Input
                        id="colis-par-kg"
                        type="number"
                        value={colisForm.parKg}
                        onChange={(e) => setColisForm({...colisForm, parKg: parseInt(e.target.value) || 0})}
                      />
                    ) : (
                      <p className="text-xl font-semibold">
                        {tarifs && formatCurrency(tarifs.COLIS.parKg!)}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label>Majorations</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span>Weekend</span>
                        {editMode ? (
                          <Input
                            className="w-20"
                            value={colisForm.majorationWeekend}
                            onChange={(e) => setColisForm({...colisForm, majorationWeekend: e.target.value})}
                          />
                        ) : (
                          <Badge variant="outline">
                            {tarifs?.COLIS.majoration.weekend}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Service nocturne</span>
                        {editMode ? (
                          <Input
                            className="w-20"
                            value={colisForm.majorationNuit}
                            onChange={(e) => setColisForm({...colisForm, majorationNuit: e.target.value})}
                          />
                        ) : (
                          <Badge variant="outline">
                            {tarifs?.COLIS.majoration.nuit}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Exemples de tarifs</Label>
                  {tarifs && (
                    <div className="space-y-3 mt-2">
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>Colis 1kg</span>
                        <span className="font-semibold">{formatCurrency(tarifs.COLIS.exemples.kg1)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>Colis 3kg</span>
                        <span className="font-semibold">{formatCurrency(tarifs.COLIS.exemples.kg3)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>Colis 5kg</span>
                        <span className="font-semibold">{formatCurrency(tarifs.COLIS.exemples.kg5)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>Colis 10kg</span>
                        <span className="font-semibold">{formatCurrency(tarifs.COLIS.exemples.kg10)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GAZ */}
        <TabsContent value="gaz">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTruck className="h-5 w-5" />
                Tarifs Livraison de Gaz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium">
                  {tarifs?.GAZ.info}
                </p>
              </div>

              <div>
                <Label>Majorations</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span>Weekend</span>
                    {editMode ? (
                      <Input
                        className="w-20"
                        value={gazForm.majorationWeekend}
                        onChange={(e) => setGazForm({...gazForm, majorationWeekend: e.target.value})}
                      />
                    ) : (
                      <Badge variant="outline">
                        {tarifs?.GAZ.majoration.weekend}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Service nocturne</span>
                    {editMode ? (
                      <Input
                        className="w-20"
                        value={gazForm.majorationNuit}
                        onChange={(e) => setGazForm({...gazForm, majorationNuit: e.target.value})}
                      />
                    ) : (
                      <Badge variant="outline">
                        {tarifs?.GAZ.majoration.nuit}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CALCULATEUR */}
        <TabsContent value="calculateur">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCalculator className="h-5 w-5" />
                Calculateur de Prix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Repas</h3>
                  <div className="space-y-4">
                    {[0, 5, 10, 15].map(km => (
                      <div key={km} className="flex justify-between p-3 bg-orange-50 rounded-lg">
                        <span>{km === 0 ? "Prix de base" : `Base + ${km}km`}</span>
                        <span className="font-semibold">
                          {formatCurrency(calculatePrice('REPAS', { km }))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Colis</h3>
                  <div className="space-y-4">
                    {[1, 3, 5, 10].map(kg => (
                      <div key={kg} className="flex justify-between p-3 bg-blue-50 rounded-lg">
                        <span>{kg}kg</span>
                        <span className="font-semibold">
                          {formatCurrency(calculatePrice('COLIS', { kg }))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {(conditions?.estWeekend || conditions?.estNuit) && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 font-medium">
                    ℹ️ Les prix ci-dessus incluent les majorations actuelles
                    {conditions.estWeekend && " (weekend)"}
                    {conditions.estNuit && " (service nocturne)"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}