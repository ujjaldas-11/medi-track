import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Plus, MagnifyingGlass, Trash } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';

const centerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(['PHC', 'CHC']),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180)
});

type CenterFormInput = z.input<typeof centerSchema>;
type CenterFormData = z.output<typeof centerSchema>;

export default function CentersDirectory() {
  const { centers, addCenter, deleteCenter, stock, doctors, beds } = useData();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PHC' | 'CHC' | 'UNDERPERFORMING'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CenterFormInput, any, CenterFormData>({
    resolver: zodResolver(centerSchema),
    defaultValues: {
      lat: 28.6,
      lng: 77.2
    }
  });

  const handleAddCenter = async (data: CenterFormData) => {
    setIsSubmitting(true);
    try {
      await addCenter(data);
      toast.success('Health Centre added successfully!');
      setIsAddModalOpen(false);
      reset();
    } catch (e) {
      console.error(e);
      toast.error('Failed to add health centre.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCenter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t('deleteCenterConfirm', 'Are you sure you want to delete this health centre? All associated records will remain but the center itself will be deleted.'))) return;
    try {
      await deleteCenter(id);
      toast.success('Health Centre deleted.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete center.');
    }
  };

  // Filters and search logic
  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          center.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (typeFilter === 'ALL') return true;
    if (typeFilter === 'PHC') return center.type === 'PHC';
    if (typeFilter === 'CHC') return center.type === 'CHC';
    if (typeFilter === 'UNDERPERFORMING') return (center.healthScore || 100) < 70;
    
    return true;
  });

  return (
    <Layout title="Health Centres Directory">
      
      {/* Search & Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <MagnifyingGlass size={18} />
            </span>
            <input
              type="text"
              placeholder={t('searchCentresPlaceholder', 'Search centres by name or location...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm font-semibold transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider hidden sm:inline flex-shrink-0">{t('filterLabel', 'Filter:')}</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs font-bold uppercase tracking-wider outline-none"
            >
              <option value="ALL">{t('allFacilities', 'All Facilities')}</option>
              <option value="CHC">{t('chcsOnly', 'CHCs Only')}</option>
              <option value="PHC">{t('phcsOnly', 'PHCs Only')}</option>
              <option value="UNDERPERFORMING">{t('underperformingOnly', 'Underperforming (<70)')}</option>
            </select>
          </div>
        </div>

        {isAdmin && (
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus size={18} weight="bold" />
            {t('addNewFacility', 'Add New Facility')}
          </Button>
        )}
      </div>

      {/* Directory Table */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('centreName')}</TableHead>
              <TableHead>{t('type')}</TableHead>
              <TableHead>{t('addressField', 'Address')}</TableHead>
              <TableHead>{t('medsStatusCol', 'Meds Status')}</TableHead>
              <TableHead>{t('bedsOccupancyCol', 'Beds Occupancy')}</TableHead>
              <TableHead>{t('doctors')}</TableHead>
              <TableHead>{t('overallHealthScore')}</TableHead>
              {isAdmin && <TableHead className="text-right">{t('actionsCol')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCenters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8 text-zinc-400 font-semibold">
                  {t('noCentresFound', 'No health centres matching filters found.')}
                </TableCell>
              </TableRow>
            ) : (
              filteredCenters.map((center) => {
                const centerStock = stock.filter(s => s.centerId === center.id);
                const stockRatio = centerStock.length > 0 ? t('itemsCount', '{{count}} items', { count: centerStock.length }) : t('noData', 'No data');
 
                const centerBed = beds.find(b => b.centerId === center.id);
                const totalB = (centerBed?.generalTotal || 0) + (centerBed?.icuTotal || 0);
                const occupiedB = (centerBed?.generalOccupied || 0) + (centerBed?.icuOccupied || 0);
                const bedRatio = totalB > 0 ? t('bedsRatioText', '{{occupied}}/{{total}} beds ({{pct}}%)', { occupied: occupiedB, total: totalB, pct: Math.round(occupiedB/totalB*100) }) : t('noBeds', 'No beds');
 
                const centerDoc = doctors.filter(d => d.centerId === center.id);
                const docRatio = t('presentRatioText', '{{present}}/{{total}} present', { present: centerDoc.filter(d => d.isPresent).length, total: centerDoc.length });
 
                const score = center.healthScore || 100;
                let scoreColor: 'healthy' | 'warning' | 'critical' = 'healthy';
                if (score < 60) scoreColor = 'critical';
                else if (score < 80) scoreColor = 'warning';

                return (
                  <TableRow key={center.id} onClick={() => navigate(`/centres/${center.id}`)}>
                    <TableCell className="font-bold text-zinc-900 dark:text-zinc-200">{center.name}</TableCell>
                    <TableCell><Badge variant="neutral">{center.type}</Badge></TableCell>
                    <TableCell className="max-w-xs truncate">{center.address}</TableCell>
                    <TableCell>{stockRatio}</TableCell>
                    <TableCell>{bedRatio}</TableCell>
                    <TableCell>{docRatio}</TableCell>
                    <TableCell><Badge variant={scoreColor}>{score}%</Badge></TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <button
                          onClick={(e) => handleDeleteCenter(center.id, e)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-95 cursor-pointer"
                          title="Delete Health Centre"
                        >
                          <Trash size={18} />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Center Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('addNewHealthCentre', 'Add New Health Centre')}
      >
        <form onSubmit={handleSubmit(handleAddCenter)} className="space-y-4">
          <Input
            label={t('centreName')}
            placeholder="e.g. Rohini Community Health Centre"
            error={errors.name?.message}
            {...register('name')}
          />
 
          <Select
            label={t('centreTypeField', 'Centre Type')}
            error={errors.type?.message}
            {...register('type')}
          >
            <option value="PHC">Primary Health Centre (PHC)</option>
            <option value="CHC">Community Health Centre (CHC)</option>
          </Select>
 
          <Input
            label={t('addressLocationField', 'Address Location')}
            placeholder="e.g. Sector 3, Near Metro Station, Delhi"
            error={errors.address?.message}
            {...register('address')}
          />
 
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('latitudeField', 'Latitude')}
              type="number"
              step="any"
              error={errors.lat?.message}
              {...register('lat')}
            />
            <Input
              label={t('longitudeField', 'Longitude')}
              type="number"
              step="any"
              error={errors.lng?.message}
              {...register('lng')}
            />
          </div>
 
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
            >
              {t('addFacilityButton', 'Add Facility')}
            </Button>
          </div>
        </form>
      </Modal>

    </Layout>
  );
}
