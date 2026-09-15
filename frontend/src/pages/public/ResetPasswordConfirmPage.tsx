import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, CheckCircle2, KeyRound, Lock } from 'lucide-react';
import { api } from '@/src/services/api';
import { UISLogo } from '@/src/components/brand/UISLogo';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';

const schema = z.object({
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmation: z.string(),
}).refine((value) => value.password === value.confirmation, {
  message: 'Konfirmasi password tidak sama',
  path: ['confirmation'],
});

type FormValues = z.infer<typeof schema>;

export const ResetPasswordConfirmPage: React.FC = () => {
  const [params] = useSearchParams();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      await api.auth.confirmPasswordReset(params.get('uid') || '', params.get('token') || '', data.password);
      setDone(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Tautan reset tidak valid atau sudah kedaluwarsa.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2"><div className="flex justify-center"><UISLogo size="lg" /></div><h2 className="text-2xl font-extrabold text-slate-900 font-heading">Buat Password Baru</h2></div>
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          {done ? (
            <div className="text-center py-6 space-y-4"><CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" /><h3 className="font-bold">Password berhasil diubah</h3><Link to="/login"><Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>Kembali ke Login</Button></Link></div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && <p className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">{serverError}</p>}
              <Input label="Password Baru" type="password" leftIcon={<Lock className="w-4 h-4" />} error={errors.password?.message} {...register('password')} />
              <Input label="Konfirmasi Password" type="password" leftIcon={<Lock className="w-4 h-4" />} error={errors.confirmation?.message} {...register('confirmation')} />
              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting} leftIcon={<KeyRound className="w-4 h-4" />}>Simpan Password Baru</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};