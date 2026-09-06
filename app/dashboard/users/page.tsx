"use client"

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IconUsers,
  IconUserCheck,
  IconShoppingCart,
  IconEye,
  IconEdit,
  IconPlus,
  IconClock,
  IconPhone,
  IconSearch
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchAllUsersAsync } from '@/redux/authSlice';
import { UserDetailModal } from "@/components/user-detail-modal";
import { UserForm } from "@/components/user-form";
import { UserEditForm } from "@/components/user-edit-form";
import { getImageUrl } from "@/services/urlApp";

// GET /users (admin) renvoie un tableau de
// { id, username, phone, image, createdAt, _count: { commandes } }.
// Aucun autre champ n'existe côté backend : email, statut, type de compte et
// vérifications ont été retirés plutôt qu'inventés.
interface User {
  id: string;
  username: string;
  phone: string;
  image?: string | null;
  createdAt: string;
  totalCommandes: number;
}

const transformUserData = (usersList: any[]): User[] => {
  if (!Array.isArray(usersList)) return [];
  return usersList.map((item: any) => ({
    id: item.id?.toString() || '',
    username: item.username || 'Utilisateur',
    phone: item.phone || '',
    image: item.image || null,
    createdAt: item.createdAt || new Date().toISOString(),
    totalCommandes: Number(item._count?.commandes) || 0,
  }));
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));

export default function UsersPage() {
  const dispatch: any = useDispatch();

  // usersList vient de authSlice (GET /users, tableau brut).
  const { usersList: users, usersListLoading: loading, usersListError: error } = useSelector((state: any) => state.Auth);

  const [search, setSearch] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  useEffect(() => {
    dispatch(fetchAllUsersAsync());
  }, [dispatch]);

  const allUsers = useMemo(() => transformUserData(users || []), [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((u) => u.username.toLowerCase().includes(q) || u.phone.includes(q) || u.id === q);
  }, [allUsers, search]);

  const stats = useMemo(() => {
    const total = allUsers.length;
    const avecCommande = allUsers.filter((u) => u.totalCommandes > 0).length;
    const commandes = allUsers.reduce((sum, u) => sum + u.totalCommandes, 0);
    const seuil = Date.now() - 30 * 24 * 3600 * 1000;
    const nouveaux = allUsers.filter((u) => +new Date(u.createdAt) >= seuil).length;
    return { total, avecCommande, commandes, nouveaux };
  }, [allUsers]);

  const handleViewUser = (user: User) => { setSelectedUser(user); setShowDetailModal(true); };
  const handleCloseDetailModal = () => { setShowDetailModal(false); setSelectedUser(null); };
  const handleEditUser = (user: User) => { setUserToEdit(user); setShowEditForm(true); };
  const handleCloseEditForm = () => { setShowEditForm(false); setUserToEdit(null); };

  if (error) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Erreur: {String(error)}</p>
          <Button onClick={() => dispatch(fetchAllUsersAsync())}>Réessayer</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
            <IconUsers className="h-8 w-8 animate-pulse text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Chargement des clients...</p>
            <p className="text-sm text-muted-foreground">Veuillez patienter</p>
          </div>
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
            <IconUsers className="h-8 w-8" />
            Gestion des Clients
          </h1>
          <p className="koursier-heading-description">
            Gérez tous les clients de votre plateforme
          </p>
        </div>
        <Button onClick={() => setShowUserForm(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="koursier-metric-card bg-gradient-to-br from-purple-500/5 to-purple-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-500/10 rounded-xl"><IconUsers className="h-6 w-6 text-purple-600" /></div>
            <div>
              <div className="koursier-stats-value text-purple-600">{stats.total}</div>
              <div className="koursier-stats-label text-purple-500/80">Total clients</div>
            </div>
          </div>
        </div>
        <div className="koursier-metric-card bg-gradient-to-br from-green-500/5 to-green-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-500/10 rounded-xl"><IconUserCheck className="h-6 w-6 text-green-600" /></div>
            <div>
              <div className="koursier-stats-value text-green-600">{stats.avecCommande}</div>
              <div className="koursier-stats-label text-green-500/80">Ont déjà commandé</div>
            </div>
          </div>
        </div>
        <div className="koursier-metric-card bg-gradient-to-br from-blue-500/5 to-blue-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-500/10 rounded-xl"><IconShoppingCart className="h-6 w-6 text-blue-600" /></div>
            <div>
              <div className="koursier-stats-value text-blue-600">{stats.commandes}</div>
              <div className="koursier-stats-label text-blue-500/80">Commandes cumulées</div>
            </div>
          </div>
        </div>
        <div className="koursier-metric-card bg-gradient-to-br from-amber-500/5 to-amber-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-amber-500/10 rounded-xl"><IconClock className="h-6 w-6 text-amber-600" /></div>
            <div>
              <div className="koursier-stats-value text-amber-600">{stats.nouveaux}</div>
              <div className="koursier-stats-label text-amber-500/80">Inscrits (30 jours)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des clients */}
      <div className="koursier-stats-card">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <h2 className="koursier-heading-3">Clients ({filteredUsers.length})</h2>
          <div className="relative w-full sm:w-72">
            <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Nom d'utilisateur, téléphone, ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="koursier-data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Commandes</th>
                <th>Inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, 100).map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="koursier-avatar">
                        <Avatar>
                          <AvatarImage src={user.image ? getImageUrl(user.image) : undefined} />
                          <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="koursier-label font-medium">{user.username}</div>
                        <div className="koursier-caption text-muted-foreground">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 koursier-caption text-muted-foreground">
                      <IconPhone className="h-3 w-3" />
                      {user.phone || '—'}
                    </div>
                  </td>
                  <td className="koursier-label font-semibold tabular-nums">{user.totalCommandes}</td>
                  <td className="koursier-caption text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <IconClock className="h-3 w-3" />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)} title="Voir les détails">
                        <IconEye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} title="Modifier le client">
                        <IconEdit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
                <IconUsers className="h-8 w-8 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Aucun client trouvé</p>
              <p className="text-sm text-muted-foreground">
                {allUsers.length === 0 ? "Aucun client enregistré pour le moment." : "Essayez une autre recherche."}
              </p>
            </div>
          )}
        </div>
      </div>

      <UserDetailModal open={showDetailModal} onOpenChange={handleCloseDetailModal} user={selectedUser} />
      <UserForm open={showUserForm} onOpenChange={setShowUserForm} />
      <UserEditForm open={showEditForm} onOpenChange={handleCloseEditForm} user={userToEdit} />
    </div>
  );
}
