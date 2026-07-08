import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Heartbeat } from '@phosphor-icons/react';

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['cmo', 'mo', 'pharmacist', 'frontdesk', 'staff'], {
    error: () => 'Please select a valid role'
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'staff'
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setAuthError('');
    try {
      await registerAuth(data.email, data.password, data.role);
      toast.success('Account registered successfully! Please Login to continue.', { position: 'bottom-right' });
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Failed to register account.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already registered.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Invalid email address format.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password is too weak.';
      }
      setAuthError(errMsg);
      toast.error(errMsg, { position: 'bottom-right' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-950 shadow-sm">
          <Heartbeat size={28} weight="bold" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight uppercase">
          MediTrack
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Create a New Healthcare Account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-10 py-8 shadow-md bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            <Input
              label="Email Address"
              type="email"
              placeholder="user@meditrack.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Select
              label="Account Role / Designation"
              error={errors.role?.message}
              {...register('role')}
            >
              <option value="cmo">Chief Medical Officer (CMO)</option>
              <option value="mo">Medical Officer (MO)</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="frontdesk">Front Desk Staff</option>
              <option value="staff">Clinical Support Staff</option>
            </Select>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold text-center">
                {authError}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full text-center"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-zinc-400">Already have an account? </span>
            <Link 
              to="/login" 
              className="font-bold text-zinc-900 hover:text-zinc-850 hover:underline dark:text-zinc-350 dark:hover:text-zinc-200"
            >
              Sign in here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
