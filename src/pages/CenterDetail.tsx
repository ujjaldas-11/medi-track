import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
// import { Select } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
import { Modal } from '../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { 
  Info, 
  Pill, 
  Users, 
  Bed, 
  TestTube, 
  ChartBar, 
  Plus, 
  Trash, 
  Pencil, 
  MapPin, 
  PaperPlane
} from '@phosphor-icons/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Zod schemas
const stockSchema = z.object({
  medicineName: z.string().min(2, 'Name is required'),
  currentStock: z.coerce.number().min(0, 'Must be 0 or more'),
  minStock: z.coerce.number().min(1, 'Must be 1 or more'),
  reorderThreshold: z.coerce.number().min(1, 'Must be 1 or more'),
  usedToday: z.coerce.number().min(0, 'Must be 0 or more')
});

const doctorSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  specialty: z.string().min(2, 'Specialty is required'),
  isPresent: z.coerce.boolean(),
  isLate: z.coerce.boolean(),
  consecutiveAbsences: z.coerce.number().min(0)
});

const coordinatesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180)
});

type StockFormInput = z.input<typeof stockSchema>;
type StockFormData = z.output<typeof stockSchema>;
type DoctorFormInput = z.input<typeof doctorSchema>;
type DoctorFormData = z.output<typeof doctorSchema>;
type CoordinatesFormInput = z.input<typeof coordinatesSchema>;
type CoordinatesFormData = z.output<typeof coordinatesSchema>;

export default function CenterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    centers, stock, doctors, beds, tests, footfall, patients,
    updateCenter, addStockItem, updateStockItem, deleteStockItem,
    addDoctor, updateDoctor, deleteDoctor, updateBeds, updateTests, logFootfall 
  } = useData();
  const { 
    canEditStock, canManageBeds, canManageDoctors, canRegisterPatients, isAdmin 
  } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'doctors' | 'beds' | 'tests' | 'trends'>('overview');

  // Modal States
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const [isBedsModalOpen, setIsBedsModalOpen] = useState(false);
  const [isLogFootfallOpen, setIsLogFootfallOpen] = useState(false);

  // Find center
  const center = centers.find(c => c.id === id);

  if (!center) {
    return (
      <Layout title={t('facilityNotFound', 'Facility Not Found')}>
        <Card className="text-center py-12">
          <p className="text-slate-500 font-bold mb-4">{t('facilityNotExist', 'The health centre you are looking for does not exist.')}</p>
          <Button onClick={() => navigate('/centres')}>{t('backToDirectory', 'Back to Directory')}</Button>
        </Card>
      </Layout>
    );
  }

  // Filtered center data
  const centerStock = stock.filter(s => s.centerId === center.id);
  const centerDoctors = doctors.filter(d => d.centerId === center.id);
  const centerBeds = beds.find(b => b.centerId === center.id) || { generalTotal: 0, generalOccupied: 0, icuTotal: 0, icuOccupied: 0 };
  const centerTests = tests.find(t => t.centerId === center.id) || { bloodTest: false, ecg: false, xray: false, ultrasound: false, oxygen: false, ambulance: false };
  const centerFootfall = footfall.filter(f => f.centerId === center.id).sort((a,b) => a.date.localeCompare(b.date));
  const centerPatients = patients.filter(p => p.centerId === center.id);

  // Forms setup
  const locForm = useForm<CoordinatesFormInput, any, CoordinatesFormData>({
    resolver: zodResolver(coordinatesSchema),
    defaultValues: { lat: center.lat, lng: center.lng }
  });

  const stockForm = useForm<StockFormInput, any, StockFormData>({
    resolver: zodResolver(stockSchema),
    defaultValues: { medicineName: '', currentStock: 0, minStock: 20, reorderThreshold: 50, usedToday: 0 }
  });

  const doctorForm = useForm<DoctorFormInput, any, DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: { name: '', specialty: 'General Physician', isPresent: true, isLate: false, consecutiveAbsences: 0 }
  });

  const bedsForm = useForm<any>({
    defaultValues: { 
      generalTotal: centerBeds.generalTotal, 
      generalOccupied: centerBeds.generalOccupied,
      icuTotal: centerBeds.icuTotal,
      icuOccupied: centerBeds.icuOccupied
    }
  });

  const footfallForm = useForm<any>({
    defaultValues: { opdCount: 20, emergencyCount: 5 }
  });

  // Action handlers
  const handleUpdateCoordinates = async (data: any) => {
    try {
      await updateCenter(center.id, data);
      toast.success('Coordinates updated successfully!');
      setIsLocModalOpen(false);
    } catch (e) {
      toast.error('Failed to update coordinates.');
    }
  };

  const handleSaveStock = async (data: any) => {
    try {
      if (selectedStock) {
        await updateStockItem(selectedStock.id, data);
        toast.success('Stock updated.');
      } else {
        await addStockItem({ centerId: center.id, ...data });
        toast.success('Medicine stock item added.');
      }
      setIsStockModalOpen(false);
      stockForm.reset();
    } catch (e) {
      toast.error('Error saving stock.');
    }
  };

  const handleEditStockClick = (item: any) => {
    if (!canEditStock) return;
    setSelectedStock(item);
    stockForm.reset({
      medicineName: item.medicineName,
      currentStock: item.currentStock,
      minStock: item.minStock,
      reorderThreshold: item.reorderThreshold,
      usedToday: item.usedToday
    });
    setIsStockModalOpen(true);
  };

  const handleDeleteStock = async (stockId: string) => {
    if (!window.confirm('Delete this stock item?')) return;
    try {
      await deleteStockItem(stockId);
      toast.success('Stock item deleted.');
    } catch (e) {
      toast.error('Failed to delete item.');
    }
  };

  const handleSaveDoctor = async (data: any) => {
    try {
      if (selectedDoc) {
        await updateDoctor(selectedDoc.id, data);
        toast.success('Doctor details updated.');
      } else {
        await addDoctor({ centerId: center.id, ...data });
        toast.success('Doctor added to directory.');
      }
      setIsDocModalOpen(false);
      doctorForm.reset();
    } catch (e) {
      toast.error('Error saving doctor.');
    }
  };

  const handleEditDocClick = (doc: any) => {
    if (!canManageDoctors) return;
    setSelectedDoc(doc);
    doctorForm.reset({
      name: doc.name,
      specialty: doc.specialty,
      isPresent: doc.isPresent,
      isLate: doc.isLate || false,
      consecutiveAbsences: doc.consecutiveAbsences || 0
    });
    setIsDocModalOpen(true);
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!window.confirm('Delete this doctor record?')) return;
    try {
      await deleteDoctor(docId);
      toast.success('Doctor record deleted.');
    } catch (e) {
      toast.error('Failed to delete doctor.');
    }
  };

  const handleToggleDocAttendance = async (docItem: any, status: 'Present' | 'Absent' | 'Late') => {
    if (!canManageDoctors) return;
    try {
      const consecutiveAbsences = status === 'Absent' 
        ? (docItem.consecutiveAbsences || 0) + 1 
        : 0;

      await updateDoctor(docItem.id, {
        isPresent: status === 'Present',
        isLate: status === 'Late',
        consecutiveAbsences
      });
      toast.success(`${docItem.name} marked as ${status}`);
    } catch (e) {
      toast.error('Failed to update attendance.');
    }
  };

  const handleSendWarning = (docName: string) => {
    toast.success(`Warning email notification sent to ${docName}.`, { position: 'bottom-right' });
  };

  const handleUpdateBeds = async (data: any) => {
    try {
      await updateBeds(center.id, {
        generalTotal: Number(data.generalTotal),
        generalOccupied: Number(data.generalOccupied),
        icuTotal: Number(data.icuTotal),
        icuOccupied: Number(data.icuOccupied)
      });
      toast.success('Beds status updated successfully.');
      setIsBedsModalOpen(false);
    } catch (e) {
      toast.error('Failed to update beds.');
    }
  };

  const handleQuickBedAdjust = async (type: 'general' | 'icu', delta: number) => {
    if (!canManageBeds) return;
    try {
      const gTot = centerBeds.generalTotal;
      let gOcc = centerBeds.generalOccupied;
      const iTot = centerBeds.icuTotal;
      let iOcc = centerBeds.icuOccupied;

      if (type === 'general') {
        gOcc = Math.max(0, Math.min(gTot, gOcc + delta));
      } else {
        iOcc = Math.max(0, Math.min(iTot, iOcc + delta));
      }

      await updateBeds(center.id, {
        generalTotal: gTot,
        generalOccupied: gOcc,
        icuTotal: iTot,
        icuOccupied: iOcc
      });
      toast.success(`Beds adjusted.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTest = async (testName: string, currentVal: boolean) => {
    if (!canManageBeds) return; // restrict diagnostics toggles to MO/CMO
    try {
      const updateData = {
        bloodTest: centerTests.bloodTest,
        ecg: centerTests.ecg,
        xray: centerTests.xray,
        ultrasound: centerTests.ultrasound,
        oxygen: centerTests.oxygen,
        ambulance: centerTests.ambulance,
        [testName]: !currentVal
      };
      await updateTests(center.id, updateData);
      toast.success(`Equipment status updated.`);
    } catch (e) {
      toast.error('Failed to toggle equipment.');
    }
  };

  const handleLogFootfall = async (data: any) => {
    try {
      await logFootfall(center.id, Number(data.opdCount), Number(data.emergencyCount));
      toast.success('Footfall counts logged successfully!');
      setIsLogFootfallOpen(false);
    } catch (e) {
      toast.error('Failed to log footfall.');
    }
  };

  // Score Badge
  const score = center.healthScore || 100;
  let scoreColor: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (score < 60) scoreColor = 'critical';
  else if (score < 80) scoreColor = 'warning';

  return (
    <Layout title={`${center.name} detail`}>
      
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm text-zinc-900 dark:text-zinc-50">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 font-extrabold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">{center.type}</span>
            <span className="text-zinc-400 text-xs">ID: {center.id}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black mt-2 tracking-wide uppercase text-zinc-900 dark:text-zinc-50">{center.name}</h3>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
            <MapPin size={14} />
            {center.address} (Lat: {center.lat.toFixed(4)}, Lng: {center.lng.toFixed(4)})
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Health Score</p>
            <div className="mt-1 flex justify-end">
              <Badge variant={scoreColor} className="text-sm px-3.5 py-1">
                {score}% Score
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Slim local sub-sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-3 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <nav className="flex flex-col gap-1.5">
              {[
                { id: 'overview', label: t('overview', 'Overview'), icon: <Info size={18} /> },
                { id: 'stock', label: t('medicinesStock', 'Medicine Stock'), icon: <Pill size={18} /> },
                { id: 'doctors', label: t('doctorsAttendance', 'Doctors Attendance'), icon: <Users size={18} /> },
                { id: 'beds', label: t('bedsOccupancy', 'Beds Occupancy'), icon: <Bed size={18} /> },
                { id: 'tests', label: t('diagnosticsStatus', 'Diagnostics Status'), icon: <TestTube size={18} /> },
                { id: 'trends', label: t('trendsLogging', 'Trends & Logging'), icon: <ChartBar size={18} /> },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      isActive 
                        ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 shadow-sm' 
                        : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850/50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card variant="accent">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">{t('medicinesCol', 'Medicines')}</p>
                  <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-105 mt-1">{t('itemsCount', '{{count}} items', { count: centerStock.length })}</h4>
                  <p className="text-xs text-rose-500 mt-1 font-semibold">
                    {t('itemsCountLow', '{{count}} items low', { count: centerStock.filter(s => s.currentStock < s.minStock).length })}
                  </p>
                </Card>
                <Card variant="accent">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">{t('staffing', 'Staffing')}</p>
                  <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-105 mt-1">{t('doctorsCount', '{{count}} doctors', { count: centerDoctors.length })}</h4>
                  <p className="text-xs text-emerald-600 mt-1 font-semibold">
                    {t('presentTodayCount', '{{count}} present today', { count: centerDoctors.filter(d => d.isPresent).length })}
                  </p>
                </Card>
                <Card variant="accent">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">{t('bedsOccupied', 'Beds Occupied')}</p>
                  <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-105 mt-1">
                    {(centerBeds.generalOccupied || 0) + (centerBeds.icuOccupied || 0)}/
                    {(centerBeds.generalTotal || 0) + (centerBeds.icuTotal || 0)}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">{t('wardsSubText', 'General + ICU Wards')}</p>
                </Card>
              </div>
 
              <Card>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">{t('facilityLocationDetails', 'Facility Location details')}</h4>
                  {isAdmin && (
                    <Button size="sm" variant="outline" onClick={() => setIsLocModalOpen(true)}>
                      <Pencil size={14} className="mr-1.5" />
                      {t('manageLocation', 'Manage Location')}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs mt-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                  <div>
                    <span className="text-zinc-400 font-bold block">{t('latitudeField', 'Latitude')}</span>
                    <span className="font-mono text-sm font-semibold">{center.lat}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-bold block">{t('longitudeField', 'Longitude')}</span>
                    <span className="font-mono text-sm font-semibold">{center.lng}</span>
                  </div>
                </div>
              </Card>

            </div>
          )}

          {/* TAB 2: MEDICINE STOCK */}
          {activeTab === 'stock' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">Medicine stock levels</h4>
                  <p className="text-xs text-zinc-400">Inventory of medicines, warnings, and usage rates</p>
                </div>
                {canEditStock && (
                  <Button 
                    onClick={() => {
                      setSelectedStock(null);
                      stockForm.reset({ medicineName: '', currentStock: 0, minStock: 20, reorderThreshold: 50, usedToday: 0 });
                      setIsStockModalOpen(true);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Plus size={16} weight="bold" />
                    Add Medicine Stock
                  </Button>
                )}
              </div>

              <Card className="p-0 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min Stock</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Used Today</TableHead>
                      <TableHead>Days Left</TableHead>
                      {canEditStock && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centerStock.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={canEditStock ? 7 : 6} className="text-center py-6 text-slate-400">
                          No stock inventory recorded for this centre.
                        </TableCell>
                      </TableRow>
                    ) : (
                      centerStock.map((item) => {
                        const isLow = item.currentStock < item.minStock;
                        const daysLeft = item.usedToday > 0 
                          ? Math.round(item.currentStock / item.usedToday) 
                          : 'Infinity';

                        return (
                          <TableRow 
                            key={item.id} 
                            onClick={() => handleEditStockClick(item)}
                            className={isLow ? 'bg-rose-500/5 dark:bg-rose-950/10' : ''}
                          >
                            <TableCell className="font-semibold text-zinc-800 dark:text-zinc-200">
                              <div className="flex items-center gap-2">
                                {item.medicineName}
                                {isLow && <Badge variant="critical">Low</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className={isLow ? 'font-bold text-rose-600 dark:text-rose-400' : ''}>
                              {item.currentStock} units
                            </TableCell>
                            <TableCell>{item.minStock}</TableCell>
                            <TableCell>{item.reorderThreshold}</TableCell>
                            <TableCell>{item.usedToday}</TableCell>
                            <TableCell>
                              <Badge variant={daysLeft === 'Infinity' ? 'neutral' : (Number(daysLeft) <= 3 ? 'critical' : (Number(daysLeft) <= 7 ? 'warning' : 'healthy'))}>
                                {daysLeft === 'Infinity' ? 'N/A' : `${daysLeft} days`}
                              </Badge>
                            </TableCell>
                            {canEditStock && (
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleEditStockClick(item)}
                                    className="p-1 rounded text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStock(item.id)}
                                    className="p-1 rounded text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
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

            </div>
          )}

          {/* TAB 3: DOCTORS ATTENDANCE */}
          {activeTab === 'doctors' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">Doctors Directory & Attendance</h4>
                  <p className="text-xs text-zinc-400">Attendance tracking, absences, and clinical specialties</p>
                </div>
                {canManageDoctors && (
                  <Button
                    onClick={() => {
                      setSelectedDoc(null);
                      doctorForm.reset({ name: '', specialty: 'General Physician', isPresent: true, isLate: false, consecutiveAbsences: 0 });
                      setIsDocModalOpen(true);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Plus size={16} weight="bold" />
                    Register Doctor
                  </Button>
                )}
              </div>

              <Card className="p-0 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor Name</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Consecutive Absences</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centerDoctors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-zinc-400">
                          No doctors registered at this facility.
                        </TableCell>
                      </TableRow>
                    ) : (
                      centerDoctors.map((doc) => {
                        const hasWarning = (doc.consecutiveAbsences || 0) >= 3;

                        return (
                          <TableRow key={doc.id} onClick={() => handleEditDocClick(doc)}>
                            <TableCell className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {doc.name}
                            </TableCell>
                            <TableCell>{doc.specialty}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant={doc.isPresent ? 'healthy' : (doc.isLate ? 'warning' : 'critical')}>
                                  {doc.isPresent ? 'Present' : (doc.isLate ? 'Late' : 'Absent')}
                                </Badge>
                                {hasWarning && <Badge variant="critical">Flagged</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className={hasWarning ? 'font-bold text-rose-500' : ''}>
                              {doc.consecutiveAbsences || 0} days
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                {!doc.isPresent && (
                                  <Button 
                                    onClick={() => handleSendWarning(doc.name)}
                                    size="sm" 
                                    variant="outline"
                                    className="text-xs px-2.5 py-1 flex items-center gap-1 border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                  >
                                    <PaperPlane size={12} />
                                    Send Warning
                                  </Button>
                                )}

                                {canManageDoctors ? (
                                  <>
                                    <select
                                      onChange={(e) => handleToggleDocAttendance(doc, e.target.value as any)}
                                      value={doc.isPresent ? 'Present' : (doc.isLate ? 'Late' : 'Absent')}
                                      className="px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-lg outline-none"
                                    >
                                      <option value="Present">Present</option>
                                      <option value="Absent">Absent</option>
                                      <option value="Late">Late</option>
                                    </select>
                                    <button
                                      onClick={() => handleDeleteDoc(doc.id)}
                                      className="p-1 text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded cursor-pointer"
                                    >
                                      <Trash size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">ReadOnly</span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </Card>

            </div>
          )}

          {/* TAB 4: BEDS OCCUPANCY */}
          {activeTab === 'beds' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">Bed Occupancy Controls</h4>
                  <p className="text-xs text-zinc-400">Manage capacities and active occupancy rates of wards</p>
                </div>
                {canManageBeds && (
                  <Button 
                    onClick={() => {
                      bedsForm.reset({
                        generalTotal: centerBeds.generalTotal,
                        generalOccupied: centerBeds.generalOccupied,
                        icuTotal: centerBeds.icuTotal,
                        icuOccupied: centerBeds.icuOccupied
                      });
                      setIsBedsModalOpen(true);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Pencil size={16} />
                    Adjust Bed Capacity
                  </Button>
                )}
              </div>

              {/* Progress Bars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* General Beds */}
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h5 className="font-extrabold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-200">General Wards</h5>
                      <span className="text-zinc-400 text-xs">Standard admissions</span>
                    </div>
                    <span className="font-mono text-sm font-bold">
                      {centerBeds.generalOccupied}/{centerBeds.generalTotal} occupied
                    </span>
                  </div>

                  <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        (centerBeds.generalOccupied / (centerBeds.generalTotal || 1)) >= 0.9 
                          ? 'bg-rose-500' 
                          : (centerBeds.generalOccupied / (centerBeds.generalTotal || 1)) >= 0.75 
                            ? 'bg-amber-500' 
                            : 'bg-zinc-900 dark:bg-zinc-50'
                      }`}
                      style={{ width: `${Math.min(100, ((centerBeds.generalOccupied / (centerBeds.generalTotal || 1)) * 100))}%` }}
                    />
                  </div>

                  {canManageBeds && (
                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={() => handleQuickBedAdjust('general', -1)} 
                        disabled={centerBeds.generalOccupied <= 0}
                        variant="outline"
                        className="flex-1 text-sm py-1.5"
                      >
                        - Occupied
                      </Button>
                      <Button 
                        onClick={() => handleQuickBedAdjust('general', 1)} 
                        disabled={centerBeds.generalOccupied >= centerBeds.generalTotal}
                        variant="outline"
                        className="flex-1 text-sm py-1.5"
                      >
                        + Occupied
                      </Button>
                    </div>
                  )}
                </Card>

                {/* ICU Wards */}
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h5 className="font-extrabold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-200">Intensive Care Units (ICU)</h5>
                      <span className="text-zinc-400 text-xs">Critical patients</span>
                    </div>
                    <span className="font-mono text-sm font-bold">
                      {centerBeds.icuOccupied}/{centerBeds.icuTotal} occupied
                    </span>
                  </div>

                  <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        (centerBeds.icuOccupied / (centerBeds.icuTotal || 1)) >= 0.9 
                          ? 'bg-rose-500' 
                          : (centerBeds.icuOccupied / (centerBeds.icuTotal || 1)) >= 0.75 
                            ? 'bg-amber-500' 
                            : 'bg-zinc-900 dark:bg-zinc-50'
                      }`}
                      style={{ width: `${Math.min(100, ((centerBeds.icuOccupied / (centerBeds.icuTotal || 1)) * 100))}%` }}
                    />
                  </div>

                  {canManageBeds && (
                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={() => handleQuickBedAdjust('icu', -1)} 
                        disabled={centerBeds.icuOccupied <= 0}
                        variant="outline"
                        className="flex-1 text-sm py-1.5"
                      >
                        - Occupied
                      </Button>
                      <Button 
                        onClick={() => handleQuickBedAdjust('icu', 1)} 
                        disabled={centerBeds.icuOccupied >= centerBeds.icuTotal}
                        variant="outline"
                        className="flex-1 text-sm py-1.5"
                      >
                        + Occupied
                      </Button>
                    </div>
                  )}
                </Card>

              </div>

            </div>
          )}

          {/* TAB 5: DIAGNOSTICS STATUS */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">Diagnostic Units & Equipment</h4>
                <p className="text-xs text-zinc-400">Toggle availability of testing labs, scanners, and support fleets</p>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[
                  { name: 'bloodTest', label: 'Blood Testing Lab' },
                  { name: 'ecg', label: 'ECG Machine' },
                  { name: 'xray', label: 'X-Ray Scanner' },
                  { name: 'ultrasound', label: 'Ultrasound Scanner' },
                  { name: 'oxygen', label: 'Oxygen Plants / Cylinders' },
                  { name: 'ambulance', label: 'Ambulance Unit' },
                ].map((item) => {
                  const isAvailable = (centerTests as any)[item.name];

                  return (
                    <Card 
                      key={item.name} 
                      className={`flex flex-col justify-between h-36 border transition duration-200 ${
                        isAvailable 
                          ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10' 
                          : 'border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <div>
                        <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-200">{item.label}</h5>
                        <p className="text-[10px] text-zinc-400 uppercase font-black mt-1">Code: {item.name}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <span className={`text-xs font-black uppercase tracking-wider ${isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                          {isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                        
                        <input
                          type="checkbox"
                          checked={isAvailable}
                          disabled={!canManageBeds} // restricts diagnostic updates to MO/CMO
                          onChange={() => handleToggleTest(item.name, isAvailable)}
                          className="w-9 h-5 bg-zinc-250 dark:bg-zinc-700 rounded-full appearance-none checked:bg-zinc-900 dark:checked:bg-white relative cursor-pointer outline-none transition duration-200 before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition before:shadow-sm"
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 6: TRENDS & LOGGING */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900 dark:text-zinc-200">Patient Trends & Logging</h4>
                  <p className="text-xs text-zinc-400">Log new daily visits and track historical OPD/Emergency counts</p>
                </div>
                {canRegisterPatients && (
                  <Button 
                    onClick={() => setIsLogFootfallOpen(true)}
                    className="flex items-center gap-1.5"
                  >
                    <Plus size={16} weight="bold" />
                    Log Daily Footfall
                  </Button>
                )}
              </div>

              {/* Chart */}
              <Card>
                <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-6">Patient Visit Trend (OPD vs Emergency)</h5>
                <div className="h-72">
                  {centerFootfall.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-400 text-sm font-semibold">
                      No visit trends recorded yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={centerFootfall.map(f => ({
                        date: new Date(f.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
                        OPD: f.opdCount,
                        Emergency: f.emergencyCount
                      }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0 0)" className="dark:stroke-zinc-800" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid oklch(0.92 0 0)', 
                            borderRadius: '0.75rem' 
                          }} 
                        />
                        <Area type="monotone" dataKey="OPD" stroke="#18181b" strokeWidth={2} fillOpacity={0.04} fill="#18181b" />
                        <Area type="monotone" dataKey="Emergency" stroke="#71717a" strokeWidth={2} fillOpacity={0.02} fill="#71717a" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              {/* Patient Registration Logs */}
              <div>
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-4">Patient Registrations Log</h5>
                <Card className="p-0 overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Visit Type</TableHead>
                        <TableHead>Registered At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {centerPatients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-zinc-400">
                            No patients registered today for this center.
                          </TableCell>
                        </TableRow>
                      ) : (
                        centerPatients.map((pat) => (
                          <TableRow key={pat.id}>
                            <TableCell className="font-bold text-zinc-800 dark:text-zinc-200">{pat.name}</TableCell>
                            <TableCell>{pat.age} yrs</TableCell>
                            <TableCell>{pat.gender}</TableCell>
                            <TableCell>
                              <Badge variant={pat.type === 'Emergency' ? 'critical' : 'info'}>
                                {pat.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-zinc-400">
                              {pat.registeredAt ? new Date(pat.registeredAt.seconds * 1000).toLocaleString() : ''}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Coordinate Modal */}
      <Modal isOpen={isLocModalOpen} onClose={() => setIsLocModalOpen(false)} title="Edit Location Coordinates">
        <form onSubmit={locForm.handleSubmit(handleUpdateCoordinates)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Latitude" type="number" step="any" {...locForm.register('lat')} error={locForm.formState.errors.lat?.message} />
            <Input label="Longitude" type="number" step="any" {...locForm.register('lng')} error={locForm.formState.errors.lng?.message} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsLocModalOpen(false)}>Cancel</Button>
            <Button type="submit">Update Coordinates</Button>
          </div>
        </form>
      </Modal>

      {/* Stock Modal */}
      <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title={selectedStock ? 'Edit Medicine Stock' : 'Add Medicine Stock'}>
        <form onSubmit={stockForm.handleSubmit(handleSaveStock)} className="space-y-4">
          <Input label="Medicine Name" placeholder="e.g. Paracetamol 500mg" disabled={!!selectedStock} {...stockForm.register('medicineName')} error={stockForm.formState.errors.medicineName?.message} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Current Stock" type="number" {...stockForm.register('currentStock')} error={stockForm.formState.errors.currentStock?.message} />
            <Input label="Min Stock Threshold" type="number" {...stockForm.register('minStock')} error={stockForm.formState.errors.minStock?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Reorder Threshold" type="number" {...stockForm.register('reorderThreshold')} error={stockForm.formState.errors.reorderThreshold?.message} />
            <Input label="Daily Usage Rate" type="number" {...stockForm.register('usedToday')} error={stockForm.formState.errors.usedToday?.message} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsStockModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Medicine</Button>
          </div>
        </form>
      </Modal>

      {/* Doctor Modal */}
      <Modal isOpen={isDocModalOpen} onClose={() => setIsDocModalOpen(false)} title={selectedDoc ? 'Edit Doctor Record' : 'Register Doctor'}>
        <form onSubmit={doctorForm.handleSubmit(handleSaveDoctor)} className="space-y-4">
          <Input label="Doctor Name" placeholder="e.g. Dr. Rajesh Sharma" {...doctorForm.register('name')} error={doctorForm.formState.errors.name?.message} />
          <Input label="Specialty / Role" placeholder="e.g. Cardiologist" {...doctorForm.register('specialty')} error={doctorForm.formState.errors.specialty?.message} />
          <div className="grid grid-cols-3 gap-2">
            <Select label="Presence" {...doctorForm.register('isPresent')}>
              <option value="true">Present</option>
              <option value="false">Absent</option>
            </Select>
            <Select label="Late Status" {...doctorForm.register('isLate')}>
              <option value="false">On Time</option>
              <option value="true">Late Arrival</option>
            </Select>
            <Input label="Absent Days" type="number" {...doctorForm.register('consecutiveAbsences')} error={doctorForm.formState.errors.consecutiveAbsences?.message} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsDocModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Doctor</Button>
          </div>
        </form>
      </Modal>

      {/* Beds Modal */}
      <Modal isOpen={isBedsModalOpen} onClose={() => setIsBedsModalOpen(false)} title="Adjust Ward Capacities">
        <form onSubmit={bedsForm.handleSubmit(handleUpdateBeds)} className="space-y-4">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-3">
            <h5 className="font-bold text-xs uppercase text-zinc-900 dark:text-zinc-200 mb-2">General Ward Beds</h5>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Total General Beds" type="number" {...bedsForm.register('generalTotal')} />
              <Input label="Occupied General Beds" type="number" {...bedsForm.register('generalOccupied')} />
            </div>
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase text-zinc-900 dark:text-zinc-200 mb-2">ICU Wards Beds</h5>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Total ICU Beds" type="number" {...bedsForm.register('icuTotal')} />
              <Input label="Occupied ICU Beds" type="number" {...bedsForm.register('icuOccupied')} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsBedsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Log Footfall Modal */}
      <Modal isOpen={isLogFootfallOpen} onClose={() => setIsLogFootfallOpen(false)} title="Log Daily Footfall counts">
        <form onSubmit={footfallForm.handleSubmit(handleLogFootfall)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="OPD Patient Count" type="number" {...footfallForm.register('opdCount')} />
            <Input label="Emergency Patient Count" type="number" {...footfallForm.register('emergencyCount')} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsLogFootfallOpen(false)}>Cancel</Button>
            <Button type="submit">Log Counts</Button>
          </div>
        </form>
      </Modal>

    </Layout>
  );
}
