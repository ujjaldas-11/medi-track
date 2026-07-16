import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Heartbeat } from '@phosphor-icons/react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setAuthError('');
    try {
      await login(data.email, data.password);
      toast.success('Successfully logged in!', { position: 'bottom-right' });
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errMsg = 'Invalid email or password.';
      } else if (err.code === 'auth/invalid-credential') {
        errMsg = 'Invalid login credentials.';
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
          District Health Centre Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-10 py-8 shadow-md bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                placeholder="doctor@meditrack.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="text-right mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-zinc-900 hover:text-zinc-850 hover:underline dark:text-zinc-350 dark:hover:text-zinc-200"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

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
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-zinc-400">Don't have an account? </span>
            <Link 
              to="/register" 
              className="font-bold text-zinc-900 hover:text-zinc-850 hover:underline dark:text-zinc-350 dark:hover:text-zinc-200"
            >
              Register here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}