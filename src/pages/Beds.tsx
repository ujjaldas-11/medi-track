import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
// import { Badge } from '@/components/ui/badge';
// import { Input, Select } from '../components/ui/Input';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
// import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Pencil, Shield } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';

const bedsSchema = z.object({
  centerId: z.string().min(1, 'Please select a health centre'),
  generalTotal: z.number().min(0, 'Must be 0 or more'),
  generalOccupied: z.number().min(0, 'Must be 0 or more'),
  icuTotal: z.number().min(0, 'Must be 0 or more'),
  icuOccupied: z.number().min(0, 'Must be 0 or more')
});

type BedsFormData = z.infer<typeof bedsSchema>;

export default function Beds() {
  const { beds, centers, updateBeds } = useData();
  const { canManageBeds } = useAuth();
  const { t } = useTranslation();

  const [selectedCenterFilter, setSelectedCenterFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BedsFormData>({
    resolver: zodResolver(bedsSchema)
  });

  const handleEditClick = (centerId: string) => {
    if (!canManageBeds) return;
    const centerBed = beds.find(b => b.centerId === centerId) || {
      generalTotal: 50,
      generalOccupied: 20,
      icuTotal: 5,
      icuOccupied: 1
    };

    reset({
      centerId,
      generalTotal: centerBed.generalTotal,
      generalOccupied: centerBed.generalOccupied,
      icuTotal: centerBed.icuTotal,
      icuOccupied: centerBed.icuOccupied
    });
    setIsModalOpen(true);
  };

  const handleSaveBeds = async (data: BedsFormData) => {
    setSubmitting(true);
    try {
      if (data.generalOccupied > data.generalTotal) {
        toast.error('Occupied general beds cannot exceed total capacity.');
        setSubmitting(false);
        return;
      }
      if (data.icuOccupied > data.icuTotal) {
        toast.error('Occupied ICU beds cannot exceed total capacity.');
        setSubmitting(false);
        return;
      }

      await updateBeds(data.centerId, {
        generalTotal: Number(data.generalTotal),
        generalOccupied: Number(data.generalOccupied),
        icuTotal: Number(data.icuTotal),
        icuOccupied: Number(data.icuOccupied)
      });
      toast.success('Beds configuration saved successfully!');
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save bed settings.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAdjust = async (centerId: string, type: 'general' | 'icu', delta: number) => {
    if (!canManageBeds) return;
    const centerBed = beds.find(b => b.centerId === centerId);
    if (!centerBed) return;

    let gOcc = centerBed.generalOccupied;
    const gTot = centerBed.generalTotal;
    let iOcc = centerBed.icuOccupied;
    const iTot = centerBed.icuTotal;

    if (type === 'general') {
      gOcc = Math.max(0, Math.min(gTot, gOcc + delta));
    } else {
      iOcc = Math.max(0, Math.min(iTot, iOcc + delta));
    }

    try {
      await updateBeds(centerId, {
        generalTotal: gTot,
        generalOccupied: gOcc,
        icuTotal: iTot,
        icuOccupied: iOcc
      });
      toast.success('Bed occupancy adjusted.');
    } catch (e) {
      console.error(e);
    }
  };

  // Filter centres
  const displayCenters = centers.filter(c => selectedCenterFilter === 'ALL' || c.id === selectedCenterFilter);

  return (
    <Layout title="Beds Occupancy Tracker">
      
      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{t('facilityFilter')}</span>
          <select
            value={selectedCenterFilter}
            onChange={(e) => setSelectedCenterFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs font-bold uppercase tracking-wider outline-none"
          >
            <option value="ALL">{t('allCentres')}</option>
            {centers.map(center => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </select>
        </div>
 
        {!canManageBeds && (
          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-400">
            <Shield size={16} />
            <span>{t('readOnlyView')}</span>
          </div>
        )}
      </div>

      {/* Beds list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayCenters.map(center => {
          const centerBed = beds.find(b => b.centerId === center.id) || {
            generalTotal: 0,
            generalOccupied: 0,
            icuTotal: 0,
            icuOccupied: 0
          };

          const genRatio = centerBed.generalTotal > 0 ? centerBed.generalOccupied / centerBed.generalTotal : 0;
          const icuRatio = centerBed.icuTotal > 0 ? centerBed.icuOccupied / centerBed.icuTotal : 0;

          return (
            <Card key={center.id} className="relative hover:shadow-sm transition">
              {/* Header */}
              <div className="flex justify-between items-start mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">{center.name}</h4>
                  <span className="text-zinc-400 text-xs capitalize">{center.address}</span>
                </div>
                {canManageBeds && (
                  <button
                    onClick={() => handleEditClick(center.id)}
                    className="p-1 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                    title="Edit Capacities"
                  >
                    <Pencil size={18} />
                  </button>
                )}
              </div>

              {/* general and icu status */}
              <div className="space-y-6">
                {/* General */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold mb-2">
                    <span className="text-zinc-700 dark:text-zinc-300">{t('generalWardBeds')}</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-100 font-bold">
                      {t('occupiedBedsRatio', { occupied: centerBed.generalOccupied, total: centerBed.generalTotal, pct: Math.round(genRatio * 100), defaultValue: `${centerBed.generalOccupied}/${centerBed.generalTotal} Beds (${Math.round(genRatio * 100)}%)` })}
                    </span>
                  </div>
 
                  <div className="w-full h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        genRatio >= 0.9 
                          ? 'bg-rose-500' 
                          : genRatio >= 0.75 
                            ? 'bg-amber-500' 
                            : 'bg-zinc-900 dark:bg-zinc-100'
                      }`}
                      style={{ width: `${Math.min(100, genRatio * 100)}%` }}
                    />
                  </div>
 
                  {canManageBeds && centerBed.generalTotal > 0 && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleQuickAdjust(center.id, 'general', -1)}
                        disabled={centerBed.generalOccupied <= 0}
                        variant="outline"
                        size="sm"
                        className="flex-1 py-1"
                      >
                        {t('occupiedMinus')}
                      </Button>
                      <Button
                        onClick={() => handleQuickAdjust(center.id, 'general', 1)}
                        disabled={centerBed.generalOccupied >= centerBed.generalTotal}
                        variant="outline"
                        size="sm"
                        className="flex-1 py-1"
                      >
                        {t('occupiedPlus')}
                      </Button>
                    </div>
                  )}
                </div>
 
                {/* ICU */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold mb-2">
                    <span className="text-zinc-700 dark:text-zinc-300">{t('icuWardBeds')}</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-100 font-bold">
                      {t('occupiedBedsRatio', { occupied: centerBed.icuOccupied, total: centerBed.icuTotal, pct: Math.round(icuRatio * 100), defaultValue: `${centerBed.icuOccupied}/${centerBed.icuTotal} Beds (${Math.round(icuRatio * 100)}%)` })}
                    </span>
                  </div>
 
                  <div className="w-full h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        icuRatio >= 0.9 
                          ? 'bg-rose-500' 
                          : icuRatio >= 0.75 
                            ? 'bg-amber-500' 
                            : 'bg-zinc-900 dark:bg-zinc-100'
                      }`}
                      style={{ width: `${Math.min(100, icuRatio * 100)}%` }}
                    />
                  </div>
 
                  {canManageBeds && centerBed.icuTotal > 0 && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleQuickAdjust(center.id, 'icu', -1)}
                        disabled={centerBed.icuOccupied <= 0}
                        variant="outline"
                        size="sm"
                        className="flex-1 py-1"
                      >
                        {t('occupiedMinus')}
                      </Button>
                      <Button
                        onClick={() => handleQuickAdjust(center.id, 'icu', 1)}
                        disabled={centerBed.icuOccupied >= centerBed.icuTotal}
                        variant="outline"
                        size="sm"
                        className="flex-1 py-1"
                      >
                        {t('occupiedPlus')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Adjust Capacities Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('adjustBedsTitle')}
      >
        <form onSubmit={handleSubmit(handleSaveBeds)} className="space-y-4">
          <input type="hidden" {...register('centerId')} />
 
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-3">
            <h5 className="font-bold text-xs uppercase text-zinc-900 dark:text-zinc-200 mb-2">{t('generalWardsConfig')}</h5>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('totalCapacity')}
                type="number"
                error={errors.generalTotal?.message}
                {...register('generalTotal', { valueAsNumber: true })}
              />
              <Input
                label={t('activeOccupied')}
                type="number"
                error={errors.generalOccupied?.message}
                {...register('generalOccupied', { valueAsNumber: true })}
              />
            </div>
          </div>
 
          <div>
            <h5 className="font-bold text-xs uppercase text-zinc-900 dark:text-zinc-200 mb-2">{t('icuWardsConfig')}</h5>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('totalCapacity')}
                type="number"
                error={errors.icuTotal?.message}
                {...register('icuTotal', { valueAsNumber: true })}
              />
              <Input
                label={t('activeOccupied')}
                type="number"
                error={errors.icuOccupied?.message}
                {...register('icuOccupied', { valueAsNumber: true })}
              />
            </div>
          </div>
 
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              loading={submitting}
            >
              {t('saveCapacities')}
            </Button>
          </div>
        </form>
      </Modal>

    </Layout>
  );
}