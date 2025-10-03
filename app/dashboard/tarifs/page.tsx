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
  IconSettings,
  IconCheck,
  IconX
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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

  // États pour les erreurs de validation
  const [repasErrors, setRepasErrors] = useState<{[key: string]: string}>({});
  const [colisErrors, setColisErrors] = useState<{[key: string]: string}>({});
  const [gazErrors, setGazErrors] = useState<{[key: string]: string}>({});

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
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les tarifs"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForms = (): boolean => {
    const repasErrs: {[key: string]: string} = {};
    const colisErrs: {[key: string]: string} = {};
    const gazErrs: {[key: string]: string} = {};

    // Validation REPAS
    if (!repasForm.prixBase || repasForm.prixBase <= 0) {
      repasErrs.prixBase = "Le prix de base doit être supérieur à 0";
    }
    if (!repasForm.parKmSupplementaire || repasForm.parKmSupplementaire < 0) {
      repasErrs.parKmSupplementaire = "Le prix par km doit être positif ou nul";
    }
    if (!repasForm.majorationWeekend || !repasForm.majorationWeekend.match(/^\+?\d+%?$/)) {
      repasErrs.majorationWeekend = "Format invalide (ex: +20% ou 20)";
    }
    if (!repasForm.majorationNuit || !repasForm.majorationNuit.match(/^\+?\d+%?$/)) {
      repasErrs.majorationNuit = "Format invalide (ex: +20% ou 20)";
    }

    // Validation COLIS
    if (!colisForm.prixBase || colisForm.prixBase <= 0) {
      colisErrs.prixBase = "Le prix de base doit être supérieur à 0";
    }
    if (!colisForm.parKg || colisForm.parKg < 0) {
      colisErrs.parKg = "Le prix par kg doit être positif ou nul";
    }
    if (!colisForm.majorationWeekend || !colisForm.majorationWeekend.match(/^\+?\d+%?$/)) {
      colisErrs.majorationWeekend = "Format invalide (ex: +20% ou 20)";
    }
    if (!colisForm.majorationNuit || !colisForm.majorationNuit.match(/^\+?\d+%?$/)) {
      colisErrs.majorationNuit = "Format invalide (ex: +20% ou 20)";
    }

    // Validation GAZ
    if (!gazForm.majorationWeekend || !gazForm.majorationWeekend.match(/^\+?\d+%?$/)) {
      gazErrs.majorationWeekend = "Format invalide (ex: +20% ou 20)";
    }
    if (!gazForm.majorationNuit || !gazForm.majorationNuit.match(/^\+?\d+%?$/)) {
      gazErrs.majorationNuit = "Format invalide (ex: +20% ou 20)";
    }

    setRepasErrors(repasErrs);
    setColisErrors(colisErrs);
    setGazErrors(gazErrs);

    return Object.keys(repasErrs).length === 0 &&
           Object.keys(colisErrs).length === 0 &&
           Object.keys(gazErrs).length === 0;
  };

  const saveTarifs = async () => {
    if (!validateForms()) {
      toast({
        variant: "destructive",
        title: "Erreurs de validation",
        description: "Veuillez corriger les erreurs avant de sauvegarder"
      });
      return;
    }

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
        toast({
          title: "Succès",
          description: (
            <div className="flex items-center gap-2">
              <IconCheck className="h-4 w-4 text-green-600" />
              <span>Tarifs mis à jour avec succès</span>
            </div>
          )
        });
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la sauvegarde des tarifs"
      });
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
        <div className="koursier-skeleton h-8 rounded w-1/3 koursier-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="koursier-metric-card">
              <div className="koursier-skeleton h-6 rounded w-1/2 koursier-shimmer" />
              <div className="space-y-3 mt-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="koursier-skeleton h-4 rounded koursier-shimmer" />
                ))}
              </div>
            </div>
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
          <h1 className="koursier-heading-1 flex items-center gap-2">
            <IconCurrency className="h-7 w-7" />
            Gestion des Tarifs
          </h1>
          <p className="koursier-body text-muted-foreground">
            Configurez les prix et majorations pour tous vos services de livraison
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTarifs} className="koursier-btn">
            <IconRefresh className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => {
                setEditMode(false);
                setRepasErrors({});
                setColisErrors({});
                setGazErrors({});
              }} className="koursier-btn">
                <IconX className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={saveTarifs} disabled={saving} className="koursier-btn koursier-btn-primary">
                {saving ? "Sauvegarde..." : (
                  <>
                    <IconDeviceFloppy className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)} className="koursier-btn koursier-btn-primary">
              <IconSettings className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Conditions actuelles */}
      {conditions && (
        <div className="koursier-metric-card bg-gradient-to-br from-purple-500/5 to-purple-600/10 border-purple-200 dark:border-purple-800">
          <h3 className="koursier-stats-label text-purple-600 dark:text-purple-400 flex items-center gap-2 mb-4">
            <IconCalendar className="h-5 w-5" />
            Conditions Actuelles
          </h3>
          <div className="flex flex-wrap gap-4 items-center">
            <Badge
              variant={conditions.estWeekend ? "default" : "outline"}
              className={conditions.estWeekend ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              Weekend: {conditions.estWeekend ? "Oui" : "Non"}
            </Badge>
            <Badge
              variant={conditions.estNuit ? "default" : "outline"}
              className={conditions.estNuit ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              Service nocturne: {conditions.estNuit ? "Oui" : "Non"}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-purple-700 dark:text-purple-300">
              <IconClock className="h-4 w-4" />
              {conditions.heure}h - {conditions.jourSemaine}
            </div>
            <div className="text-sm text-muted-foreground">
              {conditions.date}
            </div>
          </div>
        </div>
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
          <div className="koursier-metric-card bg-gradient-to-br from-green-500/5 to-green-600/10 border-0">
            <h3 className="koursier-stats-label text-green-600 dark:text-green-400 flex items-center gap-2 mb-6">
              <IconTruck className="h-5 w-5" />
              Tarifs Livraison de Repas
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="repas-prix-base" className="koursier-label">Prix de base</Label>
                    {editMode ? (
                      <div>
                        <Input
                          id="repas-prix-base"
                          type="number"
                          value={repasForm.prixBase}
                          onChange={(e) => {
                            setRepasForm({...repasForm, prixBase: parseInt(e.target.value) || 0});
                            if (repasErrors.prixBase) {
                              setRepasErrors({...repasErrors, prixBase: ""});
                            }
                          }}
                          className={repasErrors.prixBase ? "border-red-500" : ""}
                        />
                        {repasErrors.prixBase && (
                          <p className="text-sm text-red-500 mt-1">{repasErrors.prixBase}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {tarifs && formatCurrency(tarifs.REPAS.prixBase)}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="repas-par-km" className="koursier-label">Par km supplémentaire</Label>
                    {editMode ? (
                      <div>
                        <Input
                          id="repas-par-km"
                          type="number"
                          value={repasForm.parKmSupplementaire}
                          onChange={(e) => {
                            setRepasForm({...repasForm, parKmSupplementaire: parseInt(e.target.value) || 0});
                            if (repasErrors.parKmSupplementaire) {
                              setRepasErrors({...repasErrors, parKmSupplementaire: ""});
                            }
                          }}
                          className={repasErrors.parKmSupplementaire ? "border-red-500" : ""}
                        />
                        {repasErrors.parKmSupplementaire && (
                          <p className="text-sm text-red-500 mt-1">{repasErrors.parKmSupplementaire}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xl font-semibold">
                        {tarifs && formatCurrency(tarifs.REPAS.parKmSupplementaire!)}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label className="koursier-label">Majorations</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="koursier-caption">Weekend</span>
                        {editMode ? (
                          <div>
                            <Input
                              className={`w-24 ${repasErrors.majorationWeekend ? "border-red-500" : ""}`}
                              value={repasForm.majorationWeekend}
                              onChange={(e) => {
                                setRepasForm({...repasForm, majorationWeekend: e.target.value});
                                if (repasErrors.majorationWeekend) {
                                  setRepasErrors({...repasErrors, majorationWeekend: ""});
                                }
                              }}
                              placeholder="+20%"
                            />
                            {repasErrors.majorationWeekend && (
                              <p className="text-sm text-red-500 mt-1">{repasErrors.majorationWeekend}</p>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="dark:bg-gray-800">
                            {tarifs?.REPAS.majoration.weekend}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="koursier-caption">Service nocturne</span>
                        {editMode ? (
                          <div>
                            <Input
                              className={`w-24 ${repasErrors.majorationNuit ? "border-red-500" : ""}`}
                              value={repasForm.majorationNuit}
                              onChange={(e) => {
                                setRepasForm({...repasForm, majorationNuit: e.target.value});
                                if (repasErrors.majorationNuit) {
                                  setRepasErrors({...repasErrors, majorationNuit: ""});
                                }
                              }}
                              placeholder="+30%"
                            />
                            {repasErrors.majorationNuit && (
                              <p className="text-sm text-red-500 mt-1">{repasErrors.majorationNuit}</p>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="dark:bg-gray-800">
                            {tarifs?.REPAS.majoration.nuit}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="koursier-label">Exemples de tarifs</Label>
                  {tarifs && (
                    <div className="space-y-3 mt-2">
                      <div className="flex justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="koursier-caption">Livraison normale</span>
                        <span className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(tarifs.REPAS.exemples.normal)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="koursier-caption">Avec 5km supplémentaires</span>
                        <span className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(tarifs.REPAS.exemples.avec5km)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="koursier-caption">Avec 10km supplémentaires</span>
                        <span className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(tarifs.REPAS.exemples.avec10km)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* COLIS */}
        <TabsContent value="colis">
          <div className="koursier-metric-card bg-gradient-to-br from-blue-500/5 to-blue-600/10 border-0">
            <h3 className="koursier-stats-label text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-6">
              <IconTruck className="h-5 w-5" />
              Tarifs Expédition de Colis
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="colis-prix-base" className="koursier-label">Prix de base</Label>
                    {editMode ? (
                      <div>
                        <Input
                          id="colis-prix-base"
                          type="number"
                          value={colisForm.prixBase}
                          onChange={(e) => {
                            setColisForm({...colisForm, prixBase: parseInt(e.target.value) || 0});
                            if (colisErrors.prixBase) {
                              setColisErrors({...colisErrors, prixBase: ""});
                            }
                          }}
                          className={colisErrors.prixBase ? "border-red-500" : ""}
                        />
                        {colisErrors.prixBase && (
                          <p className="text-sm text-red-500 mt-1">{colisErrors.prixBase}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {tarifs && formatCurrency(tarifs.COLIS.prixBase)}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="colis-par-kg" className="koursier-label">Par kilogramme</Label>
                    {editMode ? (
                      <div>
                        <Input
                          id="colis-par-kg"
                          type="number"
                          value={colisForm.parKg}
                          onChange={(e) => {
                            setColisForm({...colisForm, parKg: parseInt(e.target.value) || 0});
                            if (colisErrors.parKg) {
                              setColisErrors({...colisErrors, parKg: ""});
                            }
                          }}
                          className={colisErrors.parKg ? "border-red-500" : ""}
                        />
                        {colisErrors.parKg && (
                          <p className="text-sm text-red-500 mt-1">{colisErrors.parKg}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xl font-semibold">
                        {tarifs && formatCurrency(tarifs.COLIS.parKg!)}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label className="koursier-label">Majorations</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="koursier-caption">Weekend</span>
                        {editMode ? (
                          <div>
                            <Input
                              className={`w-24 ${colisErrors.majorationWeekend ? "border-red-500" : ""}`}
                              value={colisForm.majorationWeekend}
                              onChange={(e) => {
                                setColisForm({...colisForm, majorationWeekend: e.target.value});
                                if (colisErrors.majorationWeekend) {
                                  setColisErrors({...colisErrors, majorationWeekend: ""});
                                }
                              }}
                              placeholder="+20%"
                            />
                            {colisErrors.majorationWeekend && (
                              <p className="text-sm text-red-500 mt-1">{colisErrors.majorationWeekend}</p>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="dark:bg-gray-800">
                            {tarifs?.COLIS.majoration.weekend}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="koursier-caption">Service nocturne</span>
                        {editMode ? (
                          <div>
                            <Input
                              className={`w-24 ${colisErrors.majorationNuit ? "border-red-500" : ""}`}
                              value={colisForm.majorationNuit}
                              onChange={(e) => {
                                setColisForm({...colisForm, majorationNuit: e.target.value});
                                if (colisErrors.majorationNuit) {
                                  setColisErrors({...colisErrors, majorationNuit: ""});
                                }
                              }}
                              placeholder="+30%"
                            />
                            {colisErrors.majorationNuit && (
                              <p className="text-sm text-red-500 mt-1">{colisErrors.majorationNuit}</p>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="dark:bg-gray-800">
                            {tarifs?.COLIS.majoration.nuit}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="koursier-label">Exemples de tarifs</Label>
                  {tarifs && (
                    <div className="space-y-3 mt-2">
                      <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <span className="koursier-caption">Colis 1kg</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-400">{formatCurrency(tarifs.COLIS.exemples.kg1)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <span className="koursier-caption">Colis 3kg</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-400">{formatCurrency(tarifs.COLIS.exemples.kg3)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <span className="koursier-caption">Colis 5kg</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-400">{formatCurrency(tarifs.COLIS.exemples.kg5)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <span className="koursier-caption">Colis 10kg</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-400">{formatCurrency(tarifs.COLIS.exemples.kg10)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* GAZ */}
        <TabsContent value="gaz">
          <div className="koursier-metric-card bg-gradient-to-br from-orange-500/5 to-orange-600/10 border-0">
            <h3 className="koursier-stats-label text-orange-600 dark:text-orange-400 flex items-center gap-2 mb-6">
              <IconTruck className="h-5 w-5" />
              Tarifs Livraison de Gaz
            </h3>
            <div className="space-y-6">
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-orange-800 dark:text-orange-300 font-medium">
                  {tarifs?.GAZ.info}
                </p>
              </div>

              <div>
                <Label className="koursier-label">Majorations</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="koursier-caption">Weekend</span>
                    {editMode ? (
                      <div>
                        <Input
                          className={`w-24 ${gazErrors.majorationWeekend ? "border-red-500" : ""}`}
                          value={gazForm.majorationWeekend}
                          onChange={(e) => {
                            setGazForm({...gazForm, majorationWeekend: e.target.value});
                            if (gazErrors.majorationWeekend) {
                              setGazErrors({...gazErrors, majorationWeekend: ""});
                            }
                          }}
                          placeholder="+20%"
                        />
                        {gazErrors.majorationWeekend && (
                          <p className="text-sm text-red-500 mt-1">{gazErrors.majorationWeekend}</p>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="dark:bg-gray-800">
                        {tarifs?.GAZ.majoration.weekend}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="koursier-caption">Service nocturne</span>
                    {editMode ? (
                      <div>
                        <Input
                          className={`w-24 ${gazErrors.majorationNuit ? "border-red-500" : ""}`}
                          value={gazForm.majorationNuit}
                          onChange={(e) => {
                            setGazForm({...gazForm, majorationNuit: e.target.value});
                            if (gazErrors.majorationNuit) {
                              setGazErrors({...gazErrors, majorationNuit: ""});
                            }
                          }}
                          placeholder="+30%"
                        />
                        {gazErrors.majorationNuit && (
                          <p className="text-sm text-red-500 mt-1">{gazErrors.majorationNuit}</p>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="dark:bg-gray-800">
                        {tarifs?.GAZ.majoration.nuit}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* CALCULATEUR */}
        <TabsContent value="calculateur">
          <div className="koursier-metric-card bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 border-0">
            <h3 className="koursier-stats-label text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-6">
              <IconCalculator className="h-5 w-5" />
              Calculateur de Prix
            </h3>
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="koursier-stats-label text-green-600 dark:text-green-400 mb-4">🍽️ Repas</h3>
                  <div className="space-y-3">
                    {[0, 5, 10, 15].map(km => (
                      <div key={km} className="flex justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="koursier-caption">{km === 0 ? "Prix de base" : `Base + ${km}km`}</span>
                        <span className="font-semibold text-green-700 dark:text-green-400">
                          {formatCurrency(calculatePrice('REPAS', { km }))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="koursier-stats-label text-blue-600 dark:text-blue-400 mb-4">📦 Colis</h3>
                  <div className="space-y-3">
                    {[1, 3, 5, 10].map(kg => (
                      <div key={kg} className="flex justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <span className="koursier-caption">{kg}kg</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-400">
                          {formatCurrency(calculatePrice('COLIS', { kg }))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {(conditions?.estWeekend || conditions?.estNuit) && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-300 font-medium flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>Les prix ci-dessus incluent les majorations actuelles
                    {conditions.estWeekend && " (weekend)"}
                    {conditions.estNuit && " (service nocturne)"}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}