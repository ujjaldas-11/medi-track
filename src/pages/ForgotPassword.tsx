import React, { useState } from 'react';
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-teal-500 flex items-center justify-center text-[#0B2A4A] shadow-lg shadow-teal-500/20">
          <Heartbeat size={32} weight="bold" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-[#0B2A4A] dark:text-slate-100 tracking-wider uppercase">
          MediTrack
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Reset Your Password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-10 py-8 shadow-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                Check your inbox! We've sent a password reset link to your email address.
              </div>
              <Link
                to="/login"
                className="inline-block font-bold text-teal-600 dark:text-teal-400 hover:underline text-sm"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
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
                <span className="text-slate-400">Remembered your password? </span>
                <Link
                  to="/login"
                  className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
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