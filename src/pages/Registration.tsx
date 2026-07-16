import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { UserPlus, Warning, Microphone, MicrophoneSlash } from '@phosphor-icons/react';
import { useVoiceInput } from '../hooks/useVoiceInput';

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
  const { t } = useTranslation();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: 'Male',
      type: 'OPD'
    }
  });

  const visitReason = watch('visitReason') || '';

  // Voice dictation for the visit reason field, language follows the app's i18n language
  const { isListening, isSupported, toggle: toggleListening } = useVoiceInput({
    continuous: false,
    onResult: (transcript) => {
      setValue('visitReason', (visitReason ? visitReason + ' ' : '') + transcript, {
        shouldValidate: true,
      });
    },
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
        <Card className="max-w-md mx-auto text-center border-rose-500/10 bg-rose-500/5 py-12">
          <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
            <Warning size={24} weight="bold" />
          </div>
          <h4 className="font-extrabold text-sm uppercase tracking-wider text-rose-650 dark:text-rose-450">{t('accessRestricted')}</h4>
          <p className="text-xs text-zinc-500 mt-2">
            {t('registrationRestrictedDesc')}
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="Patient Registration">
      <div className="max-w-xl mx-auto">
        <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-150 rounded-xl">
              <UserPlus size={22} weight="bold" />
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">{t('newPatientCheckin')}</h4>
              <p className="text-xs text-zinc-400">{t('logVisitsSub')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('patientNameField')}
                placeholder="e.g. John Doe"
                error={errors.name?.message}
                {...register('name')}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t('ageField')}
                  type="number"
                  placeholder="34"
                  error={errors.age?.message}
                  {...register('age', { valueAsNumber: true })}
                />
                <Select
                  label={t('genderField')}
                  error={errors.gender?.message}
                  {...register('gender')}
                >
                  <option value="Male">{t('male')}</option>
                  <option value="Female">{t('female')}</option>
                  <option value="Other">{t('otherGender')}</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label={t('assignedCenter')}
                error={errors.centerId?.message}
                {...register('centerId')}
              >
                <option value="">{t('selectCenter')}</option>
                {centers.map(center => (
                  <option key={center.id} value={center.id}>
                    {center.name} ({center.type})
                  </option>
                ))}
              </Select>

              <Select
                label={t('admissionTypeField')}
                error={errors.type?.message}
                {...register('type')}
              >
                <option value="OPD">OPD (Outpatient)</option>
                <option value="Emergency">Emergency Unit</option>
              </Select>
            </div>

            <div className="relative">
              <Textarea
                label={t('visitReasonField')}
                placeholder={t('visitReasonPlaceholder')}
                error={errors.visitReason?.message}
                {...register('visitReason')}
              />
              {isSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Stop dictation' : 'Dictate visit reason'}
                  className={`absolute right-2 top-8 p-1.5 rounded-full transition-colors ${
                    isListening
                      ? 'bg-rose-500/10 text-rose-500 animate-pulse'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {isListening ? <MicrophoneSlash size={16} weight="bold" /> : <Microphone size={16} weight="bold" />}
                </button>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <Button
                type="submit"
                loading={submitting}
                className="w-full sm:w-auto"
              >
                {t('checkinPatientButton')}
              </Button>
            </div>

          </form>
        </Card>
      </div>
    </Layout>
  );
}