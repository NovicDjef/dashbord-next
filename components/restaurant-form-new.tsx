"use client"

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  IconTag,
  IconPhone,
  IconMapPin,
  IconX,
  IconDeviceFloppy,
  IconPercentage,
  IconFileText,
  IconWorld,
  IconCurrencyDollar,
  IconCamera,
  IconStar,
  IconClock,
  IconUpload,
  IconPhoto,
  IconTrash
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createRestaurant } from "@/redux/restaurantSlice";

interface RestaurantFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Fonction utilitaire pour formatter les devises en Franc CFA
const formatCFA = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export function RestaurantForm({ open, onOpenChange }: RestaurantFormProps) {
  const dispatch = useDispatch();
  const { admin } = useSelector((state: any) => state.adminAuth);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    adresse: "",
    description: "",
    latitude: "",
    longitude: "",
    villeId: "",
    adminCommissionPercent: "0.1",
    restaurantCommissionPercent: "0.9",
    image: ""
  });

  const [errors, setErrors] = useState<any>({});

  // Liste des villes du Cameroun
  const villes = [
    { id: 1, name: "Douala", region: "Littoral" },
    { id: 2, name: "Yaoundé", region: "Centre" },
    { id: 3, name: "Bafoussam", region: "Ouest" },
    { id: 4, name: "Bamenda", region: "Nord-Ouest" },
    { id: 5, name: "Garoua", region: "Nord" },
    { id: 6, name: "Maroua", region: "Extrême-Nord" },
    { id: 7, name: "Ngaoundéré", region: "Adamaoua" },
    { id: 8, name: "Bertoua", region: "Est" },
    { id: 9, name: "Ebolowa", region: "Sud" },
    { id: 10, name: "Kribi", region: "Sud" }
  ];

  const totalSteps = 4;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Veuillez sélectionner un fichier image valide' }));
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'L\'image ne doit pas dépasser 5MB' }));
        return;
      }

      setSelectedImageFile(file);
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Effacer les erreurs
      setErrors(prev => ({ ...prev, image: null }));
    }
  };

  const removeImage = () => {
    setSelectedImageFile(null);
    setImagePreview("");
    setFormData(prev => ({ ...prev, image: "" }));
  };

  const validateStep = (step: number) => {
    const newErrors: any = {};

    switch(step) {
      case 1: // Informations de base
        if (!formData.name.trim()) newErrors.name = "Nom du restaurant requis";
        if (!formData.phone.trim()) newErrors.phone = "Téléphone requis";
        if (!formData.description.trim()) newErrors.description = "Description requise";
        
        // Validation du téléphone
        const phoneRegex = /^(237)?[6][0-9]{8}$/;
        if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
          newErrors.phone = "Format de téléphone invalide (ex: 6XXXXXXXX)";
        }
        break;

      case 2: // Localisation
        if (!formData.adresse.trim()) newErrors.adresse = "Adresse requise";
        if (!formData.latitude.trim()) newErrors.latitude = "Latitude requise";
        if (!formData.longitude.trim()) newErrors.longitude = "Longitude requise";
        if (!formData.villeId) newErrors.villeId = "Ville requise";

        // Validation des coordonnées
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (formData.latitude && (isNaN(lat) || lat < -90 || lat > 90)) {
          newErrors.latitude = "Latitude invalide (-90 à 90)";
        }
        if (formData.longitude && (isNaN(lng) || lng < -180 || lng > 180)) {
          newErrors.longitude = "Longitude invalide (-180 à 180)";
        }
        break;

      case 3: // Commissions
        const adminComm = parseFloat(formData.adminCommissionPercent);
        const restComm = parseFloat(formData.restaurantCommissionPercent);
        if (isNaN(adminComm) || adminComm < 0 || adminComm > 1) {
          newErrors.adminCommissionPercent = "Pourcentage admin invalide (0 à 1)";
        }
        if (isNaN(restComm) || restComm < 0 || restComm > 1) {
          newErrors.restaurantCommissionPercent = "Pourcentage restaurant invalide (0 à 1)";
        }
        if (Math.abs((adminComm + restComm) - 1) > 0.001) {
          newErrors.commissions = "La somme des commissions doit être égale à 100%";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      let imageUrl = "";
      
      // Upload de l'image si une image a été sélectionnée
      if (selectedImageFile) {
        console.log('📤 Upload de l\'image en cours...');
        
        const formDataImage = new FormData();
        formDataImage.append('image', selectedImageFile);
        
        // TODO: Implémenter l'upload d'image vers votre serveur
        // const uploadResponse = await fetch('/api/upload-image', {
        //   method: 'POST',
        //   body: formDataImage,
        // });
        // const uploadResult = await uploadResponse.json();
        // imageUrl = uploadResult.imageUrl;
        
        // Simuler l'upload pour l'instant
        await new Promise(resolve => setTimeout(resolve, 1000));
        imageUrl = `images/restaurant_${Date.now()}.jpg`; // URL simulée
        
        console.log('✅ Image uploadée:', imageUrl);
      }

      // Préparer les données pour l'API
      const restaurantData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        adresse: formData.adresse.trim(),
        description: formData.description.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        villeId: parseInt(formData.villeId),
        adminId: admin?.id || 1, // Utiliser l'ID de l'admin connecté
        adminCommissionPercent: parseFloat(formData.adminCommissionPercent),
        restaurantCommissionPercent: parseFloat(formData.restaurantCommissionPercent),
        image: imageUrl // Utiliser l'URL de l'image uploadée
      };

      console.log('🔄 Création du restaurant:', restaurantData);
      
      // TODO: Implémenter l'appel API pour créer le restaurant
      dispatch(createRestaurant(restaurantData));
      // console.log('✅ Restaurant créé:', response.data);

      // Simuler la création pour l'instant
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Réinitialiser le formulaire
      setFormData({
        name: "",
        phone: "",
        adresse: "",
        description: "",
        latitude: "",
        longitude: "",
        villeId: "",
        adminCommissionPercent: "0.1",
        restaurantCommissionPercent: "0.9",
        image: ""
      });

      // Réinitialiser les états d'image
      setSelectedImageFile(null);
      setImagePreview("");
      setCurrentStep(1);
      onOpenChange(false);

    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error);
      setErrors({
        submit: error.response?.data?.message || error.message || 'Erreur lors de la création du restaurant'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedVille = villes.find(v => v.id.toString() === formData.villeId);
  const adminCommissionCFA = (parseFloat(formData.adminCommissionPercent) * 1000000) || 0; // Exemple sur 1M XAF
  const restaurantCommissionCFA = (parseFloat(formData.restaurantCommissionPercent) * 1000000) || 0;

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200
              ${currentStep >= step 
                ? 'bg-green-500 text-white' 
                : currentStep === step - 1 
                  ? 'bg-green-100 text-green-600 border-2 border-green-300' 
                  : 'bg-gray-200 text-gray-500'
              }
            `}>
              {step}
            </div>
            {step < 4 && (
              <div className={`
                w-16 h-1 mx-2 transition-all duration-200
                ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                  <IconTag className="h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Nom du restaurant *</Label>
                    <div className="relative">
                      <IconTag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                      <Input
                        id="name"
                        placeholder="Frend's Food"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`pl-10 border-green-200 focus:border-green-400 focus:ring-green-400 ${errors.name ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Téléphone *</Label>
                    <div className="relative">
                      <IconPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                      <Input
                        id="phone"
                        placeholder="653297055"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`pl-10 border-green-200 focus:border-green-400 focus:ring-green-400 ${errors.phone ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.phone && <p className="text-sm text-red-500 font-medium">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description *</Label>
                  <div className="relative">
                    <IconFileText className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre restaurant, ses spécialités et son ambiance..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={`pl-10 min-h-[120px] border-green-200 focus:border-green-400 focus:ring-green-400 ${errors.description ? 'border-red-500' : ''}`}
                      rows={4}
                    />
                  </div>
                  {errors.description && <p className="text-sm text-red-500 font-medium">{errors.description}</p>}
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700">Photo du restaurant</Label>
                  
                  {/* Zone de prévisualisation */}
                  {imagePreview ? (
                    <div className="relative">
                      <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-green-200">
                        <img
                          src={imagePreview}
                          alt="Prévisualisation du restaurant"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={removeImage}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <IconCamera className="h-8 w-8 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-1">
                            Ajouter une photo du restaurant
                          </h3>
                          <p className="text-xs text-gray-500 mb-4">
                            Choisissez une belle photo qui met en valeur votre établissement
                          </p>
                          
                          {/* Input file caché */}
                          <input
                            type="file"
                            id="restaurant-image"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          
                          <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('restaurant-image')?.click()}
                              className="border-green-300 text-green-700 hover:bg-green-50"
                            >
                              <IconPhoto className="h-4 w-4 mr-2" />
                              Galerie
                            </Button>
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const input = document.getElementById('restaurant-image') as HTMLInputElement;
                                if (input) {
                                  input.setAttribute('capture', 'environment');
                                  input.click();
                                }
                              }}
                              className="border-green-300 text-green-700 hover:bg-green-50"
                            >
                              <IconCamera className="h-4 w-4 mr-2" />
                              Appareil photo
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {errors.image && (
                    <p className="text-sm text-red-500 font-medium">{errors.image}</p>
                  )}
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="text-green-600 font-medium text-sm">
                        📷 Conseils photo :
                      </div>
                      <div className="text-green-800 text-sm space-y-1">
                        <div>• Prenez la photo de jour pour un meilleur éclairage</div>
                        <div>• Montrez la façade ou l'intérieur de votre restaurant</div>
                        <div>• Maximum 5MB - Formats: JPG, PNG, WebP</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                  <IconMapPin className="h-5 w-5" />
                  Localisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="villeId" className="text-sm font-semibold text-gray-700">Ville *</Label>
                  <Select value={formData.villeId} onValueChange={(value) => handleInputChange('villeId', value)}>
                    <SelectTrigger className={`border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${errors.villeId ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Sélectionner une ville du Cameroun" />
                    </SelectTrigger>
                    <SelectContent>
                      {villes.map((ville) => (
                        <SelectItem key={ville.id} value={ville.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ville.name}</span>
                            <Badge variant="secondary" className="text-xs">{ville.region}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.villeId && <p className="text-sm text-red-500 font-medium">{errors.villeId}</p>}
                  {selectedVille && (
                    <p className="text-sm text-blue-600 font-medium">
                      📍 Région: {selectedVille.region}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adresse" className="text-sm font-semibold text-gray-700">Adresse complète *</Label>
                  <div className="relative">
                    <IconMapPin className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                    <Textarea
                      id="adresse"
                      placeholder="Quartier, rue, numéro... (ex: Akwa, Rue Joss, à côté du marché central)"
                      value={formData.adresse}
                      onChange={(e) => handleInputChange('adresse', e.target.value)}
                      className={`pl-10 min-h-[100px] border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${errors.adresse ? 'border-red-500' : ''}`}
                      rows={3}
                    />
                  </div>
                  {errors.adresse && <p className="text-sm text-red-500 font-medium">{errors.adresse}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-sm font-semibold text-gray-700">Latitude *</Label>
                    <Input
                      id="latitude"
                      placeholder="4.04827"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      className={`border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${errors.latitude ? 'border-red-500' : ''}`}
                    />
                    {errors.latitude && <p className="text-sm text-red-500 font-medium">{errors.latitude}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-sm font-semibold text-gray-700">Longitude *</Label>
                    <Input
                      id="longitude"
                      placeholder="9.70428"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      className={`border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${errors.longitude ? 'border-red-500' : ''}`}
                    />
                    {errors.longitude && <p className="text-sm text-red-500 font-medium">{errors.longitude}</p>}
                  </div>
                </div>

                <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-600 font-medium text-sm">
                      💡 Astuce :
                    </div>
                    <div className="text-blue-800 text-sm">
                      Vous pouvez utiliser Google Maps pour obtenir les coordonnées GPS exactes de votre restaurant.
                      Clic droit sur la carte → "Plus d'infos sur cet endroit" → Coordonnées affichées.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                  <IconCurrencyDollar className="h-5 w-5" />
                  Configuration des commissions
                </CardTitle>
                <p className="text-sm text-orange-600 mt-2">
                  Répartition des revenus en Franc CFA (XAF)
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminCommissionPercent" className="text-sm font-semibold text-gray-700">Commission Plateforme</Label>
                      <div className="relative">
                        <IconPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
                        <Input
                          id="adminCommissionPercent"
                          placeholder="0.1"
                          value={formData.adminCommissionPercent}
                          onChange={(e) => handleInputChange('adminCommissionPercent', e.target.value)}
                          className={`pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400 ${errors.adminCommissionPercent ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.adminCommissionPercent && <p className="text-sm text-red-500 font-medium">{errors.adminCommissionPercent}</p>}
                      
                      <div className="bg-orange-100 rounded-lg p-3">
                        <div className="text-sm">
                          <span className="font-medium text-orange-800">Commission plateforme:</span>
                          <div className="text-lg font-bold text-orange-900 mt-1">
                            {formatCFA(adminCommissionCFA)} 
                            <span className="text-sm font-normal ml-2">
                              ({(parseFloat(formData.adminCommissionPercent) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurantCommissionPercent" className="text-sm font-semibold text-gray-700">Commission Restaurant</Label>
                      <div className="relative">
                        <IconPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
                        <Input
                          id="restaurantCommissionPercent"
                          placeholder="0.9"
                          value={formData.restaurantCommissionPercent}
                          onChange={(e) => handleInputChange('restaurantCommissionPercent', e.target.value)}
                          className={`pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400 ${errors.restaurantCommissionPercent ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.restaurantCommissionPercent && <p className="text-sm text-red-500 font-medium">{errors.restaurantCommissionPercent}</p>}
                      
                      <div className="bg-green-100 rounded-lg p-3">
                        <div className="text-sm">
                          <span className="font-medium text-green-800">Revenus restaurant:</span>
                          <div className="text-lg font-bold text-green-900 mt-1">
                            {formatCFA(restaurantCommissionCFA)} 
                            <span className="text-sm font-normal ml-2">
                              ({(parseFloat(formData.restaurantCommissionPercent) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {errors.commissions && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {errors.commissions}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-600 font-medium text-sm">
                      💰 Exemple de calcul :
                    </div>
                    <div className="text-blue-800 text-sm space-y-1">
                      <div>Commande de <strong>{formatCFA(1000000)}</strong></div>
                      <div>• Plateforme: <strong>{formatCFA(adminCommissionCFA)}</strong></div>
                      <div>• Restaurant: <strong>{formatCFA(restaurantCommissionCFA)}</strong></div>
                      <div className="text-xs text-blue-600 mt-2">
                        Les pourcentages doivent être entre 0 et 1 (ex: 0.1 = 10%) et leur somme = 1.0
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
                  <IconStar className="h-5 w-5" />
                  Récapitulatif
                </CardTitle>
                <p className="text-sm text-purple-600 mt-2">
                  Vérifiez les informations avant de créer le restaurant
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* Photo du restaurant */}
                    {imagePreview && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">📷 Photo du restaurant</h4>
                        <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={imagePreview}
                            alt="Restaurant"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">🏪 Informations générales</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Nom:</span> {formData.name}</p>
                        <p><span className="font-medium">Téléphone:</span> {formData.phone}</p>
                        <p><span className="font-medium">Description:</span> {formData.description.substring(0, 100)}...</p>
                        {!imagePreview && (
                          <p className="text-gray-500 italic">• Aucune photo sélectionnée</p>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">📍 Localisation</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Ville:</span> {selectedVille?.name} ({selectedVille?.region})</p>
                        <p><span className="font-medium">Adresse:</span> {formData.adresse}</p>
                        <p><span className="font-medium">Coordonnées:</span> {formData.latitude}, {formData.longitude}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">💰 Commissions (XAF)</h4>
                      <div className="space-y-2">
                        <div className="bg-orange-100 rounded p-3">
                          <p className="text-sm font-medium">Plateforme: {(parseFloat(formData.adminCommissionPercent) * 100).toFixed(1)}%</p>
                          <p className="text-lg font-bold text-orange-700">{formatCFA(adminCommissionCFA)}</p>
                        </div>
                        <div className="bg-green-100 rounded p-3">
                          <p className="text-sm font-medium">Restaurant: {(parseFloat(formData.restaurantCommissionPercent) * 100).toFixed(1)}%</p>
                          <p className="text-lg font-bold text-green-700">{formatCFA(restaurantCommissionCFA)}</p>
                        </div>
                        <p className="text-xs text-gray-600">*Exemple sur une commande de {formatCFA(1000000)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
              <IconTag className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">Nouveau Restaurant</div>
              <div className="text-sm text-gray-500">
                Étape {currentStep} sur {totalSteps} - Créer un restaurant au Cameroun
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}

          {errors.submit && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errors.submit}
            </div>
          )}

          <DialogFooter className="pt-6 border-t">
            <div className="flex justify-between w-full">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Précédent
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  <IconX className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} className="bg-green-600 hover:bg-green-700">
                    Suivant
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                    <IconDeviceFloppy className="h-4 w-4 mr-2" />
                    {loading ? 'Création...' : 'Créer le restaurant'}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}