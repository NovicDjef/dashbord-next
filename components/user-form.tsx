"use client"

import { useState } from "react";
import { useDispatch } from "react-redux";
import { 
  IconUser,
  IconMail,
  IconPhone,
  IconLock,
  IconMapPin,
  IconCalendar,
  IconX,
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
  IconUserPlus
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAllUsersAsync } from "@/redux/authSlice";
import { createUserAsync } from "@/services/routeApi";

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const userTypes = [
  { value: 'client', label: 'Client', icon: '👤', color: 'bg-blue-100 text-blue-800' },
  { value: 'admin', label: 'Administrateur', icon: '⚡', color: 'bg-purple-100 text-purple-800' },
  { value: 'livreur', label: 'Livreur', icon: '🏍️', color: 'bg-orange-100 text-orange-800' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️', color: 'bg-green-100 text-green-800' }
];

// Composant Switch simple intégré
const Switch = ({ checked, onCheckedChange, id, ...props }: any) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      id={id}
      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      {...props}
    />
  </div>
);

export function UserForm({ open, onOpenChange }: UserFormProps) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
    adresse: "",
    dateNaissance: "",
    type: "client",
    status: "actif",
    emailVerifie: false,
    telephoneVerifie: false,
    // Préférences par défaut
    preferences: {
      notifications: true,
      marketing: false,
      newsletter: false
    }
  });

  const [errors, setErrors] = useState<any>({});

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

  const handlePreferenceChange = (preference: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Validation des champs requis - Seulement les 3 champs essentiels
    if (!formData.username.trim()) newErrors.username = "Nom d'utilisateur requis";
    if (!formData.telephone.trim()) newErrors.telephone = "Téléphone requis";
    if (!formData.password.trim()) newErrors.password = "Mot de passe requis";

    // Validation du format email (seulement si renseigné)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation du téléphone (format Cameroun)
    const phoneRegex = /^(237)?[6][0-9]{8}$/;
    if (formData.telephone && !phoneRegex.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = "Format de téléphone invalide (ex: 6XXXXXXXX)";
    }

    // Validation du mot de passe
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    // Validation de la confirmation du mot de passe (seulement si renseignée)
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Préparer les données pour l'API selon le format requis
      const userData = {
        username: formData.username.trim(),
        phone: formData.telephone.startsWith('237') ? formData.telephone : formData.telephone,
        password: formData.password
      };

      console.log('🔄 Création de l\'utilisateur:', userData);
      const response = await createUserAsync(userData);
      console.log('✅ Utilisateur créé:', response.data);

      // Recharger la liste des utilisateurs
      dispatch(fetchAllUsersAsync());

      // Réinitialiser le formulaire
      setFormData({
        username: "",
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        password: "",
        confirmPassword: "",
        adresse: "",
        dateNaissance: "",
        type: "client",
        status: "actif",
        emailVerifie: false,
        telephoneVerifie: false,
        preferences: {
          notifications: true,
          marketing: false,
          newsletter: false
        }
      });

      // Fermer le modal
      onOpenChange(false);

    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error);
      setErrors({
        submit: error.response?.data?.message || error.message || 'Erreur lors de la création de l\'utilisateur'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedType = userTypes.find(type => type.value === formData.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <IconUserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold">Nouvel Utilisateur</div>
              <div className="text-sm text-muted-foreground">
                Créer un compte utilisateur
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations pour créer un nouveau compte utilisateur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type d'utilisateur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Type de compte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Type d'utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedType && (
                  <Badge className={selectedType.color}>
                    <span className="mr-1">{selectedType.icon}</span>
                    {selectedType.label}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur *</Label>
                  <div className="relative">
                    <IconUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`pl-10 ${errors.username ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <IconMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com (optionnel)"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    placeholder="John (optionnel)"
                    value={formData.prenom}
                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                    className={errors.prenom ? 'border-red-500' : ''}
                  />
                  {errors.prenom && <p className="text-sm text-red-500">{errors.prenom}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    placeholder="Doe (optionnel)"
                    value={formData.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                    className={errors.nom ? 'border-red-500' : ''}
                  />
                  {errors.nom && <p className="text-sm text-red-500">{errors.nom}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone *</Label>
                  <div className="relative">
                    <IconPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="telephone"
                      placeholder="677123456"
                      value={formData.telephone}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                      className={`pl-10 ${errors.telephone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.telephone && <p className="text-sm text-red-500">{errors.telephone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateNaissance">Date de naissance</Label>
                  <div className="relative">
                    <IconCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dateNaissance"
                      type="date"
                      value={formData.dateNaissance}
                      onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <div className="relative">
                  <IconMapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="adresse"
                    placeholder="Adresse complète"
                    value={formData.adresse}
                    onChange={(e) => handleInputChange('adresse', e.target.value)}
                    className="pl-10 min-h-[80px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconLock className="h-5 w-5" />
                Sécurité et accès
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <IconLock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer mot de passe</Label>
                  <div className="relative">
                    <IconLock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="•••••••• (optionnel)"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Vérifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailVerifie" className="text-sm">Email vérifié</Label>
                      <Switch
                        id="emailVerifie"
                        checked={formData.emailVerifie}
                        onCheckedChange={(value) => handleInputChange('emailVerifie', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="telephoneVerifie" className="text-sm">Téléphone vérifié</Label>
                      <Switch
                        id="telephoneVerifie"
                        checked={formData.telephoneVerifie}
                        onCheckedChange={(value) => handleInputChange('telephoneVerifie', value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Préférences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Notifications</Label>
                      <Switch
                        checked={formData.preferences.notifications}
                        onCheckedChange={(value) => handlePreferenceChange('notifications', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Marketing</Label>
                      <Switch
                        checked={formData.preferences.marketing}
                        onCheckedChange={(value) => handlePreferenceChange('marketing', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Newsletter</Label>
                      <Switch
                        checked={formData.preferences.newsletter}
                        onCheckedChange={(value) => handlePreferenceChange('newsletter', value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {errors.submit && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-md">
              {errors.submit}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <IconX className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              <IconDeviceFloppy className="h-4 w-4 mr-2" />
              {loading ? 'Création...' : 'Créer l\'utilisateur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}