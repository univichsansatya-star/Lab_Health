import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/src/context/AuthContext';
import { UISLogo } from '@/src/components/brand/UISLogo';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import {
  Lock,
  Mail,
  UserCheck,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Stethoscope,
} from 'lucide-react';
import { INITIAL_USERS } from '@/src/services/mockData';

const loginSchema = z.object({
  emailOrNim: z.string().min(3, 'NIM atau Email kampus wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, isLoading, switchRoleUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrNim: 'siti.nurhaliza@mhs.ichsansatya.ac.id',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    try {
      const user = await login(data.emailOrNim);
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/staff/dashboard');
      }
    } catch (e: any) {
      setAuthError(e.message || 'Gagal masuk. Periksa kembali NIM/Email dan password Anda.');
    }
  };

  const handleQuickDemoLogin = async (userPreset: (typeof INITIAL_USERS)[0]) => {
    await switchRoleUser(userPreset.id);
    setValue('emailOrNim', userPreset.email);
    setValue('password', 'password123');
    if (userPreset.role === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/staff/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header & Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <UISLogo size="lg" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            Masuk ke Portal Laboratorium
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Gunakan akun SIAKAD atau kredensial NIP/NIM Universitas Ichsan Satya
          </p>
        </div>

        {/* Quick Demo Selector Box */}
        <div className="bg-cyan-50/80 border border-cyan-200/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-900">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>Pilih Cepat Akun Demo (1-Click Login):</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(INITIAL_USERS[0])}
              className="px-2 py-1.5 rounded-xl bg-white hover:bg-cyan-100/60 border border-cyan-200 text-[11px] font-bold text-slate-800 transition-all text-center flex flex-col items-center"
            >
              <span>Mahasiswa</span>
              <span className="text-[9px] text-cyan-700 font-normal">S1 Ners</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(INITIAL_USERS[3])}
              className="px-2 py-1.5 rounded-xl bg-white hover:bg-cyan-100/60 border border-cyan-200 text-[11px] font-bold text-slate-800 transition-all text-center flex flex-col items-center"
            >
              <span>Staff Lab</span>
              <span className="text-[9px] text-cyan-700 font-normal">Ns. Hendra</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(INITIAL_USERS[4])}
              className="px-2 py-1.5 rounded-xl bg-white hover:bg-cyan-100/60 border border-cyan-200 text-[11px] font-bold text-slate-800 transition-all text-center flex flex-col items-center"
            >
              <span>Admin / Koord</span>
              <span className="text-[9px] text-cyan-700 font-normal">Ibu Ratna</span>
            </button>
          </div>
        </div>

        {/* Main Login Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="NIM / NIP / Email Kampus"
              placeholder="Contoh: 2102041019 atau email@ichsansatya.ac.id"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.emailOrNim?.message}
              {...register('emailOrNim')}
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  className="rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
                  {...register('rememberMe')}
                />
                <span>Ingat saya di perangkat ini</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-cyan-600 hover:text-cyan-700 hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Masuk ke Portal
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Belum memiliki akun mahasiswa?{' '}
            <Link to="/register" className="font-bold text-cyan-600 hover:text-cyan-700 hover:underline">
              Registrasi Akun Baru
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Sistem Informasi Terenkripsi Terintegrasi Universitas Ichsan Satya</span>
        </div>
      </div>
    </div>
  );
};
