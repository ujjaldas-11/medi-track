import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { UserPlus, Warning } from '@phosphor-icons/react';

const patientSchema = z.object({
  name: z.string().min(3, 'Patient name must be at least 3 characters'),
  age: z.number().min(0, 'Age must be 0 or older').max(125, 'Please enter a valid age'),
  gender: z.enum(['Male', 'Female', 'Other']),
  centerId: z.string().min(1, 'Please select a health centre'),
  visitReason: z.string().min(3, 'Please enter a visit reason'),
  type: z.enum(['OPD', 'Emergency'])
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function Registration() {
  const { centers, registerPatient } = useData();
  const { canRegisterPatients, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: 'Male',
      type: 'OPD'
    }
  });

  const onSubmit = async (data: PatientFormData) => {
    setSubmitting(true);
    try {
      await registerPatient({
        ...data,
        registeredBy: user?.email || 'System'
      });
      toast.success(`Patient ${data.name} checked in successfully!`, { position: 'bottom-right' });
      reset();
    } catch (e) {
      console.error(e);
      toast.error('Failed to register patient.');
    } finally {
      setSubmitting(false);
    }
  };

  // If user doesn't have permission, display Access Denied
  if (!canRegisterPatients) {
    return (
      <Layout title="Patient Registration">
        <Card className="max-w-md mx-auto text-center border-rose-500/20 bg-rose-500/5 py-12">
          <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
            <Warning size={24} weight="bold" />
          </div>
          <h4 className="font-extrabold text-sm uppercase tracking-wider text-rose-650 dark:text-rose-400">Access Restricted</h4>
          <p className="text-xs text-slate-500 mt-2">
            Only Front Desk staff and CMO administrators have permissions to register new patients.
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="Patient Registration">
      <div className="max-w-xl mx-auto">
        <Card className="shadow-lg border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 bg-teal-500/10 text-teal-500 rounded-xl">
              <UserPlus size={24} weight="duotone" />
            </div>
            <div>
              <h4 className="font-bold text-[#0B2A4A] dark:text-slate-100 uppercase tracking-wide">New Patient Check-in</h4>
              <p className="text-xs text-slate-400">Log visits and dispatch automatically to appropriate units</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Patient Name"
                placeholder="e.g. John Doe"
                error={errors.name?.message}
                {...register('name')}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Age"
                  type="number"
                  placeholder="34"
                  error={errors.age?.message}
                  {...register('age', { valueAsNumber: true })}
                />
                <Select
                  label="Gender"
                  error={errors.gender?.message}
                  {...register('gender')}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Assigned Health Centre"
                error={errors.centerId?.message}
                {...register('centerId')}
              >
                <option value="">-- Select Center --</option>
                {centers.map(center => (
                  <option key={center.id} value={center.id}>
                    {center.name} ({center.type})
                  </option>
                ))}
              </Select>

              <Select
                label="Admission Type"
                error={errors.type?.message}
                {...register('type')}
              >
                <option value="OPD">OPD (Outpatient)</option>
                <option value="Emergency">Emergency Unit</option>
              </Select>
            </div>

            <Textarea
              label="Visit Reason / Symptoms"
              placeholder="Describe primary symptoms or reason for visit..."
              error={errors.visitReason?.message}
              {...register('visitReason')}
            />

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                type="submit"
                loading={submitting}
                className="w-full sm:w-auto"
              >
                Check-in Patient
              </Button>
            </div>

          </form>
        </Card>
      </div>
    </Layout>
  );
}