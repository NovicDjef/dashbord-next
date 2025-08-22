"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  getUsersAsync, 
  createUserAsync, 
  updateUserAsync, 
  resetUserPasswordAsync 
} from "@/redux/usersSlice";
import {
  IconUsers,
  IconUser,
  IconMail,
  IconPhone,
  IconEdit,
  IconKey,
  IconPlus,
  IconDeviceFloppy,
  IconX,
  IconEye,
  IconEyeOff,
  IconSearch,
  IconCalendar
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: number;
  username: string;
  phone: string;
  email?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

interface UserFormData {
  username: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  image?: string;
}

interface EditUserFormData {
  username: string;
  phone: string;
  email: string;
}

export function UsersManagement() {
  const dispatch = useDispatch();
  const { usersList, status, error, resetPasswordStatus, resetPasswordError } = useSelector(
    (state: any) => state.users
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Formulaire de création
  const [createFormData, setCreateFormData] = useState<UserFormData>({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    image: ''
  });
  
  // Formulaire d'édition
  const [editFormData, setEditFormData] = useState<EditUserFormData>({
    username: '',
    phone: '',
    email: ''
  });
  
  // Formulaire de reset password
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formErrors, setFormErrors] = useState<any>({});
  const loading = status === 'loading';
  const resetPasswordLoading = resetPasswordStatus === 'loading';

  useEffect(() => {
    dispatch(getUsersAsync());
  }, [dispatch]);

  // Filtrage des utilisateurs
  const filteredUsers = (usersList || []).filter((user: User) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Fonctions utilitaires
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const resetCreateForm = () => {
    setCreateFormData({
      username: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      image: ''
    });
    setFormErrors({});
  };

  const resetEditForm = () => {
    setEditFormData({
      username: '',
      phone: '',
      email: ''
    });
    setFormErrors({});
  };

  const resetPasswordForm = () => {
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormErrors({});
  };

  // Validation du formulaire de création
  const validateCreateForm = (): boolean => {
    const errors: any = {};

    if (!createFormData.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est requis';
    }

    if (!createFormData.phone.trim()) {
      errors.phone = 'Le téléphone est requis';
    } else if (!/^[0-9+\-\s()]{8,}$/.test(createFormData.phone)) {
      errors.phone = 'Format de téléphone invalide';
    }

    if (createFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createFormData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    if (!createFormData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (createFormData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (createFormData.password !== createFormData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validation du formulaire d'édition
  const validateEditForm = (): boolean => {
    const errors: any = {};

    if (!editFormData.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est requis';
    }

    if (!editFormData.phone.trim()) {
      errors.phone = 'Le téléphone est requis';
    } else if (!/^[0-9+\-\s()]{8,}$/.test(editFormData.phone)) {
      errors.phone = 'Format de téléphone invalide';
    }

    if (editFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validation du reset password
  const validatePasswordReset = (): boolean => {
    const errors: any = {};

    if (!newPassword) {
      errors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = 'Les mots de passe ne correspondent pas';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    const userData = {
      username: createFormData.username.trim(),
      phone: createFormData.phone.trim(),
      password: createFormData.password,
      ...(createFormData.email.trim() && { email: createFormData.email.trim() }),
      ...(createFormData.image && { image: createFormData.image })
    };

    try {
      await dispatch(createUserAsync(userData));
      if (status !== 'failed') {
        setShowCreateForm(false);
        resetCreateForm();
        dispatch(getUsersAsync()); // Recharger la liste
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username,
      phone: user.phone,
      email: user.email || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !validateEditForm()) return;

    const updateData = {
      username: editFormData.username.trim(),
      phone: editFormData.phone.trim(),
      ...(editFormData.email.trim() && { email: editFormData.email.trim() })
    };

    try {
      await dispatch(updateUserAsync({ id: selectedUser.id, data: updateData }));
      if (status !== 'failed') {
        setShowEditForm(false);
        setSelectedUser(null);
        resetEditForm();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setShowResetPasswordForm(true);
  };

  const handleSubmitPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !validatePasswordReset()) return;

    try {
      await dispatch(resetUserPasswordAsync({ 
        userId: selectedUser.id, 
        newPassword 
      }));
      if (resetPasswordStatus !== 'failed') {
        setShowResetPasswordForm(false);
        setSelectedUser(null);
        resetPasswordForm();
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
    }
  };

  if (loading && !usersList.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Chargement des utilisateurs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <IconUsers className="h-6 w-6" />
            Gestion des Utilisateurs
          </h2>
          <p className="text-muted-foreground">
            Gérez les comptes utilisateurs de la plateforme
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Utilisateurs
            </CardTitle>
            <div className="text-2xl font-bold">{usersList.length}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actifs
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">
              {usersList.filter((u: User) => u.isActive !== false).length}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avec Email
            </CardTitle>
            <div className="text-2xl font-bold">
              {usersList.filter((u: User) => u.email).length}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, téléphone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.image} />
                          <AvatarFallback>
                            {user.username[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <IconPhone className="h-3 w-3" />
                          {user.phone}
                        </div>
                        {user.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <IconMail className="h-3 w-3" />
                            {user.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive !== false ? "default" : "secondary"}>
                        {user.isActive !== false ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <IconCalendar className="h-3 w-3" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          title="Modifier l'utilisateur"
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleResetPassword(user)}
                          title="Réinitialiser le mot de passe"
                        >
                          <IconKey className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              {usersList.length === 0 ? 
                "Aucun utilisateur trouvé. Créez le premier utilisateur." : 
                "Aucun utilisateur trouvé avec les critères de recherche."
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création d'utilisateur */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Créer un nouvel utilisateur
            </DialogTitle>
            <DialogDescription>
              Créez un compte utilisateur pour accéder à la plateforme.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-username">Nom d'utilisateur *</Label>
                <Input
                  id="create-username"
                  value={createFormData.username}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="johndoe"
                  className={formErrors.username ? 'border-red-500' : ''}
                />
                {formErrors.username && (
                  <p className="text-sm text-red-500">{formErrors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-phone">Téléphone *</Label>
                <Input
                  id="create-phone"
                  value={createFormData.phone}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="690123456"
                  className={formErrors.phone ? 'border-red-500' : ''}
                />
                {formErrors.phone && (
                  <p className="text-sm text-red-500">{formErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-password">Mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="create-password"
                    type={showPassword ? "text" : "password"}
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className={formErrors.password ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                  </Button>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-confirm-password">Confirmer *</Label>
                <div className="relative">
                  <Input
                    id="create-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={createFormData.confirmPassword}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                    className={formErrors.confirmPassword ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                  </Button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  resetCreateForm();
                }}
                disabled={loading}
              >
                <IconX className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                <IconDeviceFloppy className="h-4 w-4 mr-2" />
                {loading ? 'Création...' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition d'utilisateur */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconEdit className="h-5 w-5" />
              Modifier l'utilisateur
            </DialogTitle>
            <DialogDescription>
              Modifiez les informations de {selectedUser?.username}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Nom d'utilisateur *</Label>
                <Input
                  id="edit-username"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                  className={formErrors.username ? 'border-red-500' : ''}
                />
                {formErrors.username && (
                  <p className="text-sm text-red-500">{formErrors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Téléphone *</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={formErrors.phone ? 'border-red-500' : ''}
                />
                {formErrors.phone && (
                  <p className="text-sm text-red-500">{formErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedUser(null);
                  resetEditForm();
                }}
                disabled={loading}
              >
                <IconX className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                <IconDeviceFloppy className="h-4 w-4 mr-2" />
                {loading ? 'Modification...' : 'Modifier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de réinitialisation de mot de passe */}
      <Dialog open={showResetPasswordForm} onOpenChange={setShowResetPasswordForm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconKey className="h-5 w-5" />
              Réinitialiser le mot de passe
            </DialogTitle>
            <DialogDescription>
              Définir un nouveau mot de passe pour {selectedUser?.username}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPasswordReset} className="space-y-4">
            {resetPasswordError && (
              <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg">
                {resetPasswordError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe *</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={formErrors.newPassword ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </Button>
              </div>
              {formErrors.newPassword && (
                <p className="text-sm text-red-500">{formErrors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirmer le mot de passe *</Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={formErrors.confirmNewPassword ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </Button>
              </div>
              {formErrors.confirmNewPassword && (
                <p className="text-sm text-red-500">{formErrors.confirmNewPassword}</p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResetPasswordForm(false);
                  setSelectedUser(null);
                  resetPasswordForm();
                }}
                disabled={resetPasswordLoading}
              >
                <IconX className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button type="submit" disabled={resetPasswordLoading}>
                <IconKey className="h-4 w-4 mr-2" />
                {resetPasswordLoading ? 'Réinitialisation...' : 'Réinitialiser'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}