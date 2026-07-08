import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Heartbeat } from '@phosphor-icons/react';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setAuthError('');
    try {
      await resetPassword(data.email);
      setSent(true);
      toast.success('Password reset email sent!', { position: 'bottom-right' });
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Failed to send reset email.';
      if (err.code === 'auth/user-not-found') {
        errMsg = 'No account found with this email.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Invalid email address format.';
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
          Reset Your Password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-10 py-8 shadow-md bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                Check your inbox! We've sent a password reset link to your email address.
              </div>
              <Link
                to="/login"
                className="inline-block font-bold text-zinc-900 hover:text-zinc-850 hover:underline text-sm dark:text-zinc-350 dark:hover:text-zinc-200"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 -mt-2">
                  Enter the email address linked to your account and we'll send you a link to reset your password.
                </p>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="doctor@meditrack.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

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
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 text-center text-xs">
                <span className="text-zinc-400">Remembered your password? </span>
                <Link
                  to="/login"
                  className="font-bold text-zinc-900 hover:text-zinc-850 hover:underline dark:text-zinc-350 dark:hover:text-zinc-200"
                >
                  Sign in here
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}