"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  IconUser,
  IconUsers,
  IconUserCheck,
  IconUserX,
  IconShield,
  IconEye,
  IconEdit,
  IconPlus,
  IconFilter,
  IconClock,
  IconMail,
  IconPhone
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchAllUsersAsync } from '@/redux/authSlice';
import { UserDetailModal } from "@/components/user-detail-modal";

interface User {
  id: string;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  dateNaissance?: string;
  status: 'actif' | 'inactif' | 'suspendu' | 'verifie';
  type: 'client' | 'admin' | 'livreur' | 'restaurant';
  dateInscription: string;
  dernierLogin?: string;
  avatar?: string;
  emailVerifie: boolean;
  telephoneVerifie: boolean;
  totalCommandes?: number;
  totalDepenses?: number;
  soldeWallet?: number;
  noteClient?: number;
  preferences?: {
    notifications: boolean;
    marketing: boolean;
    newsletter: boolean;
  };
}

const statusConfig = {
  actif: { label: 'Actif', color: 'bg-green-100 text-green-800' },
  inactif: { label: 'Inactif', color: 'bg-gray-100 text-gray-800' },
  suspendu: { label: 'Suspendu', color: 'bg-red-100 text-red-800' },
  verifie: { label: 'Vérifié', color: 'bg-blue-100 text-blue-800' }
};

const typeConfig = {
  client: { label: 'Client', color: 'bg-blue-100 text-blue-800', icon: '👤' },
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-800', icon: '⚡' },
  livreur: { label: 'Livreur', color: 'bg-orange-100 text-orange-800', icon: '🏍️' },
  restaurant: { label: 'Restaurant', color: 'bg-green-100 text-green-800', icon: '🍽️' }
};

export default function UsersPage() {
  const dispatch = useDispatch();
  
  // Utiliser le bon sélecteur pour authSlice
  const { usersList: users, usersListLoading: loading, usersListError: error } = useSelector((state: any) => state.auth.usersList);
  
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    console.log('🔄 Chargement des utilisateurs...');
    dispatch(fetchAllUsersAsync());
  }, [dispatch]);

  // Transformer les données de l'API en format attendu par le modal
  const transformUserData = (usersList: any[]): User[] => {
    return usersList.map((item: any) => ({
      id: item.id?.toString() || '',
      username: item.username || item.nom || 'Utilisateur',
      nom: item.nom || item.lastName || '',
      prenom: item.prenom || item.firstName || '',
      email: item.email || '',
      telephone: item.telephone || item.phone || '',
      adresse: item.adresse || item.address,
      dateNaissance: item.dateNaissance || item.birthDate,
      status: mapStatus(item.status || item.statut),
      type: mapUserType(item.type || item.role),
      dateInscription: item.createdAt || item.dateInscription || new Date().toISOString(),
      dernierLogin: item.dernierLogin || item.lastLogin,
      avatar: item.avatar || item.profileImage,
      emailVerifie: item.emailVerifie || item.emailVerified || false,
      telephoneVerifie: item.telephoneVerifie || item.phoneVerified || false,
      totalCommandes: item.totalCommandes || item.orderCount,
      totalDepenses: item.totalDepenses || item.totalSpent,
      soldeWallet: item.soldeWallet || item.walletBalance,
      noteClient: item.noteClient || item.rating,
      preferences: item.preferences || {
        notifications: true,
        marketing: false,
        newsletter: false
      }
    }));
  };

  // Mapper les statuts
  const mapStatus = (status: string): User['status'] => {
    const statusMap: { [key: string]: User['status'] } = {
      'active': 'actif',
      'actif': 'actif',
      'inactive': 'inactif',
      'inactif': 'inactif',
      'suspended': 'suspendu',
      'suspendu': 'suspendu',
      'verified': 'verifie',
      'verifie': 'verifie'
    };
    
    return statusMap[status?.toLowerCase()] || 'actif';
  };

  // Mapper les types d'utilisateur
  const mapUserType = (type: string): User['type'] => {
    const typeMap: { [key: string]: User['type'] } = {
      'client': 'client',
      'customer': 'client',
      'user': 'client',
      'admin': 'admin',
      'administrator': 'admin',
      'livreur': 'livreur',
      'delivery': 'livreur',
      'restaurant': 'restaurant',
      'resto': 'restaurant'
    };
    
    return typeMap[type?.toLowerCase()] || 'client';
  };

  // Utiliser les données transformées
  useEffect(() => {
    if (users && users.length > 0) {
      const transformedData = transformUserData(users);
      setFilteredUsers(transformedData);
    }
  }, [users]);

  useEffect(() => {
    let filtered = users ? transformUserData(users) : [];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(u => u.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(u => u.type === filterType);
    }

    setFilteredUsers(filtered);
  }, [users, filterStatus, filterType]);

  // Fonctions pour gérer les actions
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const calculateStats = () => {
    const total = filteredUsers.length;
    const actifs = filteredUsers.filter(u => u.status === 'actif').length;
    const clients = filteredUsers.filter(u => u.type === 'client').length;
    const livreurs = filteredUsers.filter(u => u.type === 'livreur').length;
    const admins = filteredUsers.filter(u => u.type === 'admin').length;
    const restaurants = filteredUsers.filter(u => u.type === 'restaurant').length;

    return { total, actifs, clients, livreurs, admins, restaurants };
  };

  const stats = calculateStats();

  // Afficher une erreur si nécessaire
  if (error) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <Button onClick={() => dispatch(fetchAllUsersAsync())}>Réessayer</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardHeader>
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
            <IconUsers className="h-6 w-6" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Gérez tous les utilisateurs de votre plateforme
          </p>
        </div>
        <Button>
          <IconPlus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Utilisateurs
            </CardTitle>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actifs
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">{stats.actifs}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients
            </CardTitle>
            <div className="text-2xl font-bold text-blue-600">{stats.clients}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Livreurs
            </CardTitle>
            <div className="text-2xl font-bold text-orange-600">{stats.livreurs}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Restaurants
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">{stats.restaurants}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admins
            </CardTitle>
            <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filtres</CardTitle>
            <IconFilter className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
                <SelectItem value="verifie">Vérifié</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type d'utilisateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="livreur">Livreur</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Vérification</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.slice(0, 50).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.prenom?.[0] || 'U'}{user.nom?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.prenom} {user.nom}</div>
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                          <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <IconMail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <IconPhone className="h-3 w-3" />
                          {user.telephone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={typeConfig[user.type].color}>
                        <span className="mr-1">{typeConfig[user.type].icon}</span>
                        {typeConfig[user.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[user.status].color}>
                        {statusConfig[user.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant={user.emailVerifie ? "default" : "secondary"} className="text-xs">
                          {user.emailVerifie ? "✅" : "❌"} Email
                        </Badge>
                        <Badge variant={user.telephoneVerifie ? "default" : "secondary"} className="text-xs">
                          {user.telephoneVerifie ? "✅" : "❌"} Tel
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <IconClock className="h-3 w-3" />
                        {formatDate(user.dateInscription)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.dernierLogin ? (
                        <div className="flex items-center gap-1">
                          <IconClock className="h-3 w-3" />
                          {formatDate(user.dernierLogin)}
                        </div>
                      ) : (
                        <span>Jamais</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          title="Voir les détails"
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          title="Modifier l'utilisateur"
                        >
                          <IconEdit className="h-4 w-4" />
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
              {users && users.length === 0 ? 
                "Aucun utilisateur trouvé. Vérifiez votre connexion API." : 
                "Aucun utilisateur trouvé avec les filtres sélectionnés."
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de détail de l'utilisateur */}
      <UserDetailModal
        open={showDetailModal}
        onOpenChange={handleCloseDetailModal}
        user={selectedUser}
      />
    </div>
  );
}
