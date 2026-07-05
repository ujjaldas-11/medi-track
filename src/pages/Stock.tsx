import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Plus, MagnifyingGlass, Trash, Pencil } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';

const stockItemSchema = z.object({
  centerId: z.string().min(1, 'Please select a health centre'),
  medicineName: z.string().min(2, 'Medicine name is required'),
  currentStock: z.number().min(0, 'Must be 0 or more'),
  minStock: z.number().min(1, 'Must be 1 or more'),
  reorderThreshold: z.number().min(1, 'Must be 1 or more'),
  usedToday: z.number().min(0, 'Must be 0 or more')
});

type StockItemFormData = z.infer<typeof stockItemSchema>;

export default function Stock() {
  const { stock, centers, addStockItem, updateStockItem, deleteStockItem } = useData();
  const { canEditStock } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'NORMAL'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StockItemFormData>({
    resolver: zodResolver(stockItemSchema),
    defaultValues: {
      currentStock: 100,
      minStock: 50,
      reorderThreshold: 100,
      usedToday: 10
    }
  });

  const handleAddClick = () => {
    setSelectedItem(null);
    reset({
      centerId: selectedCenter !== 'ALL' ? selectedCenter : '',
      medicineName: '',
      currentStock: 100,
      minStock: 50,
      reorderThreshold: 100,
      usedToday: 10
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (item: any) => {
    if (!canEditStock) return;
    setSelectedItem(item);
    reset({
      centerId: item.centerId,
      medicineName: item.medicineName,
      currentStock: item.currentStock,
      minStock: item.minStock,
      reorderThreshold: item.reorderThreshold,
      usedToday: item.usedToday
    });
    setIsModalOpen(true);
  };

  const handleSaveStock = async (data: StockItemFormData) => {
    setSubmitting(true);
    try {
      if (selectedItem) {
        await updateStockItem(selectedItem.id, data);
        toast.success(`Medicine ${data.medicineName} updated successfully!`);
      } else {
        await addStockItem(data);
        toast.success(`Medicine ${data.medicineName} added to inventory!`);
      }
      setIsModalOpen(false);
      reset();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save medicine stock.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStock = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name} from stock?`)) return;
    try {
      await deleteStockItem(id);
      toast.success('Medicine stock item deleted.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete medicine.');
    }
  };

  // Filter Stock List
  const filteredStock = stock.filter(item => {
    const matchesSearch = item.medicineName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCenter = selectedCenter === 'ALL' || item.centerId === selectedCenter;
    
    let matchesStatus = true;
    if (stockFilter === 'LOW') {
      matchesStatus = item.currentStock < item.minStock;
    } else if (stockFilter === 'NORMAL') {
      matchesStatus = item.currentStock >= item.minStock;
    }

    return matchesSearch && matchesCenter && matchesStatus;
  });

  return (
    <Layout title="Medicines Stock Management">
      
      {/* Search & Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MagnifyingGlass size={18} />
            </span>
            <input
              type="text"
              placeholder="Search medicines by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-semibold transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-bold uppercase tracking-wider"
            >
              <option value="ALL">All Centres</option>
              {centers.map(center => (
                <option key={center.id} value={center.id}>{center.name}</option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-bold uppercase tracking-wider"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="LOW">Low Stock Only</option>
              <option value="NORMAL">Normal Stock Only</option>
            </select>
          </div>
        </div>

        {canEditStock && (
          <Button 
            onClick={handleAddClick}
            className="flex items-center gap-1.5"
          >
            <Plus size={18} weight="bold" />
            Add Stock Item
          </Button>
        )}
      </div>

      {/* Directory Table */}
      <Card className="p-0 overflow-hidden shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine Name</TableHead>
              <TableHead>Centre / Facility</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Min Stock</TableHead>
              <TableHead>Reorder Threshold</TableHead>
              <TableHead>Daily Usage</TableHead>
              <TableHead>Projections</TableHead>
              {canEditStock && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStock.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEditStock ? 8 : 7} className="text-center py-8 text-slate-400 font-semibold">
                  No medicine stock matching search criteria found.
                </TableCell>
              </TableRow>
            ) : (
              filteredStock.map((item) => {
                const isLow = item.currentStock < item.minStock;
                const daysLeft = item.usedToday > 0 
                  ? Math.round(item.currentStock / item.usedToday) 
                  : 'Infinity';

                const centerName = centers.find(c => c.id === item.centerId)?.name || 'Unknown Facility';

                return (
                  <TableRow 
                    key={item.id} 
                    onClick={() => handleEditClick(item)}
                    className={isLow ? 'bg-rose-500/5 dark:bg-rose-950/10' : ''}
                  >
                    <TableCell className="font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        {item.medicineName}
                        {isLow && <Badge variant="critical">Low</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{centerName}</TableCell>
                    <TableCell className={isLow ? 'font-black text-rose-600 dark:text-rose-450' : 'font-semibold'}>
                      {item.currentStock} units
                    </TableCell>
                    <TableCell>{item.minStock}</TableCell>
                    <TableCell>{item.reorderThreshold}</TableCell>
                    <TableCell>{item.usedToday}</TableCell>
                    <TableCell>
                      <Badge variant={daysLeft === 'Infinity' ? 'neutral' : (Number(daysLeft) <= 2 ? 'critical' : (Number(daysLeft) <= 7 ? 'warning' : 'healthy'))}>
                        {daysLeft === 'Infinity' ? 'Stable' : `${daysLeft} days left`}
                      </Badge>
                    </TableCell>
                    {canEditStock && (
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1.5 text-teal-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            title="Edit Stock Item"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteStock(item.id, item.medicineName)}
                            className="p-1.5 text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            title="Delete Stock Item"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Stock Modifier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? `Modify ${selectedItem.medicineName}` : 'Add Medicine to Inventory'}
      >
        <form onSubmit={handleSubmit(handleSaveStock)} className="space-y-4">
          
          <Select
            label="Assigned Health Centre"
            error={errors.centerId?.message}
            disabled={!!selectedItem}
            {...register('centerId')}
          >
            <option value="">-- Select Center --</option>
            {centers.map(center => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </Select>

          <Input
            label="Medicine Name"
            placeholder="e.g. Paracetamol 500mg"
            disabled={!!selectedItem}
            error={errors.medicineName?.message}
            {...register('medicineName')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Stock"
              type="number"
              error={errors.currentStock?.message}
              {...register('currentStock', { valueAsNumber: true })}
            />
            <Input
              label="Daily Usage rate"
              type="number"
              error={errors.usedToday?.message}
              {...register('usedToday', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Stock Warning level"
              type="number"
              error={errors.minStock?.message}
              {...register('minStock', { valueAsNumber: true })}
            />
            <Input
              label="Reorder Threshold level"
              type="number"
              error={errors.reorderThreshold?.message}
              {...register('reorderThreshold', { valueAsNumber: true })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
            >
              Save Medicine Stock
            </Button>
          </div>

        </form>
      </Modal>

    </Layout>
  );
}