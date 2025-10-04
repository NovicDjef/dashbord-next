"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconPackage,
  IconPlus,
  IconMinus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconTrendingDown,
  IconTrendingUp,
  IconDownload,
  IconRefresh,
  IconSearch,
  IconFilter,
  IconClock,
  IconChartBar,
  IconCheck
} from "@tabler/icons-react";
import { useToast } from "@/hooks/use-toast";
import { stockService } from '@/services/api';
import type { StockItem, StockAlert, StockMovement } from '@/services/api/stock.service';

export default function StockPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<StockItem[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  });

  // Dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  // Selected item
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  // Form data
  const [formData, setFormData] = useState<Partial<StockItem>>({
    name: '',
    sku: '',
    category: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 100,
    unit: 'unité',
    unitPrice: 0,
  });

  const [movementData, setMovementData] = useState({
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    quantity: 0,
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stockData, alertsData, statsData] = await Promise.all([
        stockService.getAll(),
        stockService.getAlerts(),
        stockService.getStats(),
      ]);

      setItems(stockData.items);
      setAlerts(alertsData.alerts);
      setStats(stockData.stats);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de stock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      await stockService.create(formData);
      toast({
        title: "Succès",
        description: "Article ajouté avec succès",
      });
      setAddDialogOpen(false);
      setFormData({
        name: '',
        sku: '',
        category: '',
        currentStock: 0,
        minStock: 0,
        maxStock: 100,
        unit: 'unité',
        unitPrice: 0,
      });
      loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de l'article",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    try {
      await stockService.update(selectedItem.id, formData);
      toast({
        title: "Succès",
        description: "Article mis à jour",
      });
      setEditDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    }
  };

  const handleMovement = async () => {
    if (!selectedItem) return;

    try {
      if (movementData.type === 'IN') {
        await stockService.addStock(selectedItem.id, movementData);
      } else if (movementData.type === 'OUT') {
        await stockService.removeStock(selectedItem.id, movementData);
      } else {
        await stockService.adjustStock(selectedItem.id, {
          newQuantity: movementData.quantity,
          reason: movementData.reason,
        });
      }

      toast({
        title: "Succès",
        description: "Mouvement de stock enregistré",
      });
      setMovementDialogOpen(false);
      setMovementData({ type: 'IN', quantity: 0, reason: '' });
      loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du mouvement de stock",
        variant: "destructive",
      });
    }
  };

  const handleViewHistory = async (item: StockItem) => {
    setSelectedItem(item);
    try {
      const data = await stockService.getMovements(item.id);
      setMovements(data.movements);
      setHistoryDialogOpen(true);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      await stockService.delete(id);
      toast({
        title: "Succès",
        description: "Article supprimé",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const exportInventory = async () => {
    try {
      const blob = await stockService.exportInventory();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventaire-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Succès",
        description: "Inventaire exporté",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export",
        variant: "destructive",
      });
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStock = stockFilter === 'all' ||
                        (stockFilter === 'low' && item.currentStock <= item.minStock) ||
                        (stockFilter === 'out' && item.currentStock === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = Array.from(new Set(items.map(item => item.category)));

  const getStockStatus = (item: StockItem) => {
    if (item.currentStock === 0) return {
      label: 'Rupture',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
    };
    if (item.currentStock <= item.minStock) return {
      label: 'Stock bas',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
    };
    if (item.currentStock >= item.maxStock) return {
      label: 'Stock plein',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    };
    return {
      label: 'Normal',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <IconRefresh className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Chargement du stock...</p>
            <p className="text-sm text-muted-foreground">Veuillez patienter</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconPackage className="h-8 w-8" />
            <div>
              <h1 className="koursier-heading-1">Gestion de Stock</h1>
              <p className="koursier-heading-description">
                Gérez votre inventaire et suivez les mouvements de stock
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <IconRefresh className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline" onClick={exportInventory}>
              <IconDownload className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={() => setAddDialogOpen(true)}>
              <IconPlus className="h-4 w-4 mr-2" />
              Ajouter un article
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="koursier-metric-card bg-gradient-to-br from-blue-500/5 to-blue-600/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <IconPackage className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="koursier-stats-value text-blue-600">{stats.totalItems}</div>
                <div className="koursier-stats-label text-blue-500/80">Total Articles</div>
              </div>
            </div>
          </div>

          <div className="koursier-metric-card bg-gradient-to-br from-green-500/5 to-green-600/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <IconChartBar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="koursier-stats-value text-green-600">
                  {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(stats.totalValue)} F
                </div>
                <div className="koursier-stats-label text-green-500/80">Valeur Totale</div>
              </div>
            </div>
          </div>

          <div className="koursier-metric-card bg-gradient-to-br from-yellow-500/5 to-yellow-600/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <IconAlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="koursier-stats-value text-yellow-600">{stats.lowStockItems}</div>
                <div className="koursier-stats-label text-yellow-500/80">Stock Bas</div>
              </div>
            </div>
          </div>

          <div className="koursier-metric-card bg-gradient-to-br from-red-500/5 to-red-600/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <IconTrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="koursier-stats-value text-red-600">{stats.outOfStockItems}</div>
                <div className="koursier-stats-label text-red-500/80">Rupture de Stock</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="px-4 lg:px-6">
          <div className="koursier-stats-card border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <IconAlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              </div>
              <h3 className="koursier-heading-3 text-yellow-900 dark:text-yellow-100">
                Alertes Stock ({alerts.length})
              </h3>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:shadow-sm transition-shadow"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{alert.message}</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    {alert.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stock Table */}
      <div className="px-4 lg:px-6">
        <div className="koursier-stats-card">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <h2 className="koursier-heading-3">Inventaire ({filteredItems.length})</h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="koursier-search-container max-w-md">
                <IconSearch className="koursier-search-icon" />
                <input
                  className="koursier-search-input"
                  placeholder="Rechercher par nom ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="État du stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les états</SelectItem>
                  <SelectItem value="low">Stock bas</SelectItem>
                  <SelectItem value="out">Rupture</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="koursier-data-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>SKU</th>
                  <th>Catégorie</th>
                  <th className="text-right">Stock</th>
                  <th className="text-right">Min/Max</th>
                  <th>Statut</th>
                  <th className="text-right">Prix Unitaire</th>
                  <th className="text-right">Valeur</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id}>
                      <td className="koursier-label font-medium">{item.name}</td>
                      <td className="koursier-caption text-muted-foreground">{item.sku}</td>
                      <td className="koursier-label">{item.category}</td>
                      <td className="text-right font-semibold">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="text-right koursier-caption">
                        {item.minStock} / {item.maxStock}
                      </td>
                      <td>
                        <Badge className={status.color}>{status.label}</Badge>
                      </td>
                      <td className="text-right koursier-caption">
                        {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(item.unitPrice)} F
                      </td>
                      <td className="text-right font-semibold">
                        {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(item.totalValue)} F
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedItem(item);
                                setMovementData({ type: 'IN', quantity: 0, reason: '' });
                                setMovementDialogOpen(true);
                              }}
                              className="hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600"
                              title="Ajouter un mouvement"
                            >
                              <IconPlus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewHistory(item)}
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600"
                              title="Historique"
                            >
                              <IconClock className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedItem(item);
                                setFormData(item);
                                setEditDialogOpen(true);
                              }}
                              className="hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600"
                              title="Modifier"
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteItem(item.id)}
                              className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                              title="Supprimer"
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredItems.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
                  <IconPackage className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Aucun article trouvé
                </p>
                <p className="text-sm text-muted-foreground">
                  Essayez de modifier vos critères de recherche ou ajoutez un nouvel article
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un article</DialogTitle>
            <DialogDescription>
              Créez un nouvel article dans votre inventaire
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom de l&apos;article *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>SKU *</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Unité</Label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Stock actuel</Label>
              <Input
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Stock minimum</Label>
              <Input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Stock maximum</Label>
              <Input
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Prix unitaire (F)</Label>
              <Input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddItem}>
              <IconPlus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;article</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de l&apos;article
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom de l&apos;article</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>SKU</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Unité</Label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Stock minimum</Label>
              <Input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Stock maximum</Label>
              <Input
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Prix unitaire (F)</Label>
              <Input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateItem}>
              <IconEdit className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Movement Dialog */}
      <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mouvement de stock</DialogTitle>
            <DialogDescription>
              {selectedItem?.name} - Stock actuel: {selectedItem?.currentStock} {selectedItem?.unit}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type de mouvement</Label>
              <Select
                value={movementData.type}
                onValueChange={(value: 'IN' | 'OUT' | 'ADJUSTMENT') =>
                  setMovementData({ ...movementData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">Entrée</SelectItem>
                  <SelectItem value="OUT">Sortie</SelectItem>
                  <SelectItem value="ADJUSTMENT">Ajustement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantité</Label>
              <Input
                type="number"
                value={movementData.quantity}
                onChange={(e) =>
                  setMovementData({ ...movementData, quantity: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Raison</Label>
              <Input
                value={movementData.reason}
                onChange={(e) => setMovementData({ ...movementData, reason: e.target.value })}
                placeholder="Ex: Réapprovisionnement, Vente, Inventaire..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMovementDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleMovement}>
              <IconCheck className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historique des mouvements</DialogTitle>
            <DialogDescription>
              {selectedItem?.name} - {selectedItem?.sku}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead>Raison</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {new Date(movement.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          movement.type === 'IN'
                            ? 'bg-green-100 text-green-800'
                            : movement.type === 'OUT'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {movement.type === 'IN' ? 'Entrée' : movement.type === 'OUT' ? 'Sortie' : 'Ajustement'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {movement.type === 'IN' && '+'}
                      {movement.type === 'OUT' && '-'}
                      {movement.quantity}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{movement.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {movements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun mouvement enregistré
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
