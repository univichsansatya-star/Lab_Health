import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UISLogo } from '@/src/components/brand/UISLogo';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

const forgotSchema = z.object({
  emailOrNim: z.string().min(3, 'Masukkan NIM atau Email kampus terdaftar'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSent(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <UISLogo size="lg" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            Reset Password Akun
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Masukkan NIM atau email kampus Anda untuk menerima tautan pemulihan kata sandi
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          {isSent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading">Tautan Terkirim!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Kami telah mengirimkan instruksi dan kode verifikasi reset password ke email kampus Anda.
              </p>
              <Link to="/login" className="inline-block mt-2">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Kembali ke Halaman Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="NIM atau Email Kampus"
                placeholder="Contoh: 2102041019 atau email@ichsansatya.ac.id"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.emailOrNim?.message}
                {...register('emailOrNim')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isSubmitting}
                leftIcon={<KeyRound className="w-4 h-4" />}
              >
                Kirim Tautan Reset
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 font-bold text-cyan-600 hover:text-cyan-700 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
