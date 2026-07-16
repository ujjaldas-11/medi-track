import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Pencil, Link as LinkIcon, Shield } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

type CoordinatesFormData = z.infer<typeof coordinatesSchema>;

export default function MapView() {
  const { centers, updateCenter } = useData();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedCenter, setSelectedCenter] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CoordinatesFormData>({
    resolver: zodResolver(coordinatesSchema)
  });

  // Custom marker pin generator using HTML & CSS
  const createCustomIcon = (score: number) => {
    let colorClass = 'bg-emerald-500 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.7)]';
    if (score < 60) colorClass = 'bg-rose-500 border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.7)]';
    else if (score < 80) colorClass = 'bg-amber-500 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.7)]';

    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white ${colorClass} text-white font-black text-[10px] transform hover:scale-125 transition-transform duration-200">
          ${score}%
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  const handleEditClick = (center: any) => {
    if (!isAdmin) return;
    setSelectedCenter(center);
    reset({
      lat: center.lat,
      lng: center.lng
    });
    setIsEditModalOpen(true);
  };

  const handleSaveCoordinates = async (data: CoordinatesFormData) => {
    setSubmitting(true);
    try {
      await updateCenter(selectedCenter.id, {
        lat: Number(data.lat),
        lng: Number(data.lng)
      });
      toast.success(`Coordinates for ${selectedCenter.name} updated successfully!`);
      setIsEditModalOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to update coordinates.');
    } finally {
      setSubmitting(false);
    }
  };

  // Default Delhi Coordinates
  const defaultPosition: [number, number] = [28.6139, 77.2090];

  return (
    <Layout title="Health Facilities Map Grid">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left sidebar: Facility List on Map */}
        <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <Card className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-zinc-400">{t('centresIndex', 'Centres Index')}</span>
            {!isAdmin && (
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Shield size={14} />
                {t('readOnlyView')}
              </span>
            )}
          </Card>

          {centers.map(center => {
            const score = center.healthScore || 100;
            let scoreColor: 'healthy' | 'warning' | 'critical' = 'healthy';
            if (score < 60) scoreColor = 'critical';
            else if (score < 80) scoreColor = 'warning';

            return (
              <Card 
                key={center.id} 
                onClick={() => handleEditClick(center)}
                className={`p-4 cursor-pointer hover:border-zinc-900/30 dark:hover:border-zinc-50/30 transition shadow-sm border ${
                  selectedCenter?.id === center.id ? 'border-zinc-900/50 bg-zinc-900/5 dark:border-zinc-50/50 dark:bg-zinc-50/5' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h5 className="font-extrabold text-xs uppercase text-zinc-900 dark:text-zinc-200">{center.name}</h5>
                  <Badge variant={scoreColor}>{score}%</Badge>
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 font-mono">
                  {t('coordinatesLabel', 'Coordinates')}: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                </p>
                {isAdmin && (
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(center);
                      }}
                      className="text-[10px] px-2 py-1 flex items-center gap-1"
                    >
                      <Pencil size={12} />
                      {t('setCoord', 'Set Coord')}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Map Grid container */}
        <div className="lg:col-span-3 h-[70vh] rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 relative z-0">
          
          <MapContainer 
            center={centers[0] ? [centers[0].lat, centers[0].lng] : defaultPosition} 
            zoom={11} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {centers.map(center => {
              const score = center.healthScore || 100;
              return (
                <Marker 
                  key={center.id} 
                  position={[center.lat, center.lng]}
                  icon={createCustomIcon(score)}
                >
                  <Popup>
                    <div className="p-1 space-y-2 text-zinc-800 dark:text-zinc-200">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">{center.name}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{center.address}</p>
                      
                      <div className="flex gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <button
                          onClick={() => navigate(`/centres/${center.id}`)}
                          className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer"
                        >
                          <LinkIcon size={12} />
                          {t('details', 'Details')}
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleEditClick(center)}
                            className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-zinc-500 dark:text-zinc-400 hover:underline cursor-pointer"
                          >
                            <Pencil size={12} />
                            {t('coordinatesLabel', 'Coordinates')}
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

        </div>

      </div>

      {/* Edit Coordinate Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedCenter ? t('editCoordinatesFor', { name: selectedCenter.name, defaultValue: `Edit Coordinates - ${selectedCenter.name}` }) : t('editCoordinates', 'Edit Coordinates')}
      >
        <form onSubmit={handleSubmit(handleSaveCoordinates)} className="space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            {t('relocateFacilityDesc', 'Enter decimal degree coordinates to relocate this health facility on the Leaflet map.')}
          </p>
 
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('latitudeField', 'Latitude')}
              type="number"
              step="any"
              error={errors.lat?.message}
              {...register('lat', { valueAsNumber: true })}
            />
            <Input
              label={t('longitudeField', 'Longitude')}
              type="number"
              step="any"
              error={errors.lng?.message}
              {...register('lng', { valueAsNumber: true })}
            />
          </div>
 
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={submitting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              loading={submitting}
            >
              {t('updateCoordinates', 'Update Coordinates')}
            </Button>
          </div>
        </form>
      </Modal>

    </Layout>
  );
}
