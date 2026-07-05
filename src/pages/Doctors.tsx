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
import { Plus, MagnifyingGlass, Trash, Pencil, PaperPlane, ShieldWarning } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';


const doctorSchema = z.object({
  centerId: z.string().min(1, 'Please select a health centre'),
  name: z.string().min(3, 'Doctor name must be at least 3 characters'),
  specialty: z.string().min(2, 'Specialty is required'),
  isPresent: z.boolean(),
  isLate: z.boolean(),
  consecutiveAbsences: z.number().min(0, 'Must be 0 or more')
});

type DoctorFormData = z.infer<typeof doctorSchema>;

export default function Doctors() {
  const { doctors, centers, addDoctor, updateDoctor, deleteDoctor } = useData();
  const { canManageDoctors } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'FLAGGED'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      isPresent: true,
      isLate: false,
      consecutiveAbsences: 0
    }
  });

  const handleAddClick = () => {
    setSelectedDoc(null);
    reset({
      centerId: selectedCenter !== 'ALL' ? selectedCenter : '',
      name: '',
      specialty: '',
      isPresent: true,
      isLate: false,
      consecutiveAbsences: 0
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (docItem: any) => {
    if (!canManageDoctors) return;
    setSelectedDoc(docItem);
    reset({
      centerId: docItem.centerId,
      name: docItem.name,
      specialty: docItem.specialty,
      isPresent: docItem.isPresent,
      isLate: docItem.isLate || false,
      consecutiveAbsences: docItem.consecutiveAbsences || 0
    });
    setIsModalOpen(true);
  };

  const handleSaveDoctor = async (data: DoctorFormData) => {
    setSubmitting(true);
    try {
      if (selectedDoc) {
        await updateDoctor(selectedDoc.id, data);
        toast.success(`Doctor ${data.name} updated successfully!`);
      } else {
        await addDoctor(data);
        toast.success(`Doctor ${data.name} added successfully!`);
      }
      setIsModalOpen(false);
      reset();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save doctor details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name} from records?`)) return;
    try {
      await deleteDoctor(id);
      toast.success('Doctor record deleted.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete doctor.');
    }
  };

  const handleToggleAttendance = async (docItem: any, status: 'Present' | 'Absent' | 'Late') => {
    if (!canManageDoctors) return;
    try {
      const absences = status === 'Absent'
        ? (docItem.consecutiveAbsences || 0) + 1
        : 0;

      await updateDoctor(docItem.id, {
        isPresent: status === 'Present',
        isLate: status === 'Late',
        consecutiveAbsences: absences
      });
      toast.success(`${docItem.name} marked as ${status}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to update attendance.');
    }
  };

  const handleSendWarning = (name: string) => {
    toast.success(`Warning notification sent to ${name}.`, { position: 'bottom-right' });
  };

  // Filter Doctors list
  const filteredDoctors = doctors.filter(docItem => {
    const matchesSearch = docItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docItem.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCenter = selectedCenter === 'ALL' || docItem.centerId === selectedCenter;

    let matchesStatus = true;
    if (statusFilter === 'PRESENT') {
      matchesStatus = docItem.isPresent;
    } else if (statusFilter === 'ABSENT') {
      matchesStatus = !docItem.isPresent;
    } else if (statusFilter === 'FLAGGED') {
      matchesStatus = (docItem.consecutiveAbsences || 0) >= 3;
    }

    return matchesSearch && matchesCenter && matchesStatus;
  });

  return (
    <Layout title="Doctors Attendance Directory">

      {/* Search & Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MagnifyingGlass size={18} />
            </span>
            <input
              type="text"
              placeholder="Search doctors by name or specialty..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-bold uppercase tracking-wider"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present Only</option>
              <option value="ABSENT">Absent Only</option>
              <option value="FLAGGED">Flagged (3+ Absences)</option>
            </select>
          </div>
        </div>

        {canManageDoctors ? (
          <Button
            onClick={handleAddClick}
            className="flex items-center gap-1.5"
          >
            <Plus size={18} weight="bold" />
            Register Doctor
          </Button>
        ) : (
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
            <ShieldWarning size={16} />
            <span>Read-Only View</span>
          </div>
        )}
      </div>

      {/* Directory Table */}
      <Card className="p-0 overflow-hidden shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Centre / Facility</TableHead>
              <TableHead>Attendance Status</TableHead>
              <TableHead>Consecutive Absences</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-semibold">
                  No doctors matching filter criteria found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDoctors.map((docItem) => {
                const centerName = centers.find(c => c.id === docItem.centerId)?.name || 'Unknown Facility';
                const hasWarning = (docItem.consecutiveAbsences || 0) >= 3;

                return (
                  <TableRow
                    key={docItem.id}
                    onClick={() => handleEditClick(docItem)}
                    className={hasWarning ? 'bg-rose-500/5 dark:bg-rose-955/10' : ''}
                  >
                    <TableCell className="font-bold text-slate-800 dark:text-slate-200">
                      {docItem.name}
                    </TableCell>
                    <TableCell>{docItem.specialty}</TableCell>
                    <TableCell>{centerName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={docItem.isPresent ? 'healthy' : (docItem.isLate ? 'warning' : 'critical')}>
                          {docItem.isPresent ? 'Present' : (docItem.isLate ? 'Late' : 'Absent')}
                        </Badge>
                        {hasWarning && <Badge variant="critical">Flagged</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className={hasWarning ? 'font-black text-rose-600 dark:text-rose-400' : ''}>
                      {docItem.consecutiveAbsences || 0} days
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {!docItem.isPresent && (
                          <Button
                            onClick={() => handleSendWarning(docItem.name)}
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 py-1 flex items-center gap-1 border-rose-250 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            <PaperPlane size={12} />
                            Notify Warning
                          </Button>
                        )}

                        {canManageDoctors ? (
                          <>
                            <select
                              onChange={(e) => handleToggleAttendance(docItem, e.target.value as any)}
                              value={docItem.isPresent ? 'Present' : (docItem.isLate ? 'Late' : 'Absent')}
                              className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-250 font-semibold focus:ring-1 focus:ring-teal-500 outline-none"
                            >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Late">Late</option>
                            </select>
                            <button
                              onClick={() => handleDeleteDoctor(docItem.id, docItem.name)}
                              className="p-1 text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg"
                              title="Delete Doctor"
                            >
                              <Trash size={16} />
                            </button>

                          </>
                        ) : (
                          <span className="text-[10px] text-slate-450 uppercase font-black tracking-wide">Ready Only</span>
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

      {/* Doctor Manager Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDoc ? `Modify Dr. ${selectedDoc.name}` : 'Register Doctor in District'}
      >
        <form onSubmit={handleSubmit(handleSaveDoctor)} className="space-y-4">

          <Select
            label="Assigned Health Centre"
            error={errors.centerId?.message}
            disabled={!!selectedDoc}
            {...register('centerId')}
          >
            <option value="">-- Select Center --</option>
            {centers.map(center => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </Select>

          <Input
            label="Doctor Name"
            placeholder="e.g. Dr. Rajesh Sharma"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Specialization / Designation"
            placeholder="e.g. Pediatrician, General Physician"
            error={errors.specialty?.message}
            {...register('specialty')}
          />

          {selectedDoc && (
            <div className="grid grid-cols-3 gap-2">
              <Select label="Presence" {...register('isPresent', { setValueAs: val => val === 'true' })}>
                <option value="true">Present</option>
                <option value="false">Absent</option>
              </Select>
              <Select label="Late Status" {...register('isLate', { setValueAs: val => val === 'true' })}>
                <option value="false">On Time</option>
                <option value="true">Late Arrival</option>
              </Select>
              <Input
                label="Absent Days"
                type="number"
                error={errors.consecutiveAbsences?.message}
                {...register('consecutiveAbsences', { valueAsNumber: true })}
              />
            </div>
          )}

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
              Save Doctor Records
            </Button>
          </div>

        </form>
      </Modal>

    </Layout>
  );
}