import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/src/context/AuthContext';
import { UISLogo } from '@/src/components/brand/UISLogo';
import { Button } from '@/src/components/ui/Button';
import { Input, Select } from '@/src/components/ui/Input';
import { User, Mail, Lock, Phone, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const registerSchema = z
  .object({
    name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
    nim_nip: z.string().min(8, 'NIM/NIP minimal 8 digit'),
    email: z.string().email('Format email kampus tidak valid'),
    phone: z.string().min(10, 'Nomor WhatsApp aktif minimal 10 digit'),
    department: z.string().min(1, 'Pilih program studi'),
    semester: z.string().min(1, 'Pilih semester'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password wajib diisi'),
    agreeSop: z.boolean().refine((val) => val === true, 'Wajib menyetujui tata tertib Lab UIS'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password konfirmasi tidak cocok',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      department: 'S1 Keperawatan',
      semester: '4',
      agreeSop: true,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(
        {
          name: data.name,
          nim_nip: data.nim_nip,
          email: data.email,
          role: 'student',
          department: data.department,
          studyProgram: data.department,
          semester: Number(data.semester),
          phone: data.phone,
          avatar: undefined,
        },
        data.password,
      );
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <UISLogo size="lg" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            Pendaftaran Akun Mahasiswa
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Daftarkan diri Anda untuk mengakses sistem peminjaman alat laboratorium terpadu UIS
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Registrasi Berhasil!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Akun Anda telah aktif dan terhubung dengan data akademik UIS. Mengalihkan ke dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nama Lengkap Sesuai KTM"
                placeholder="Contoh: Siti Nurhaliza Putri"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.name?.message}
                {...register('name')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nomor Induk Mahasiswa (NIM)"
                  placeholder="Contoh: 2102041019"
                  leftIcon={<GraduationCap className="w-4 h-4" />}
                  error={errors.nim_nip?.message}
                  {...register('nim_nip')}
                />
                <Input
                  label="Nomor WhatsApp"
                  placeholder="0812-xxxx-xxxx"
                  leftIcon={<Phone className="w-4 h-4" />}
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>

              <Input
                label="Email Mahasiswa / Pribadi"
                type="email"
                placeholder="nama@mhs.ichsansatya.ac.id"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Program Studi"
                  error={errors.department?.message}
                  {...register('department')}
                >
                  <option value="S1 Keperawatan">S1 Keperawatan</option>
                  <option value="Profesi Ners">Profesi Ners</option>
                  <option value="D3 Kebidanan">D3 Kebidanan</option>
                  <option value="Farmasi Klinis">Farmasi Klinis</option>
                  <option value="Administrasi Rumah Sakit">Administrasi Rumah Sakit</option>
                </Select>

                <Select
                  label="Semester Saat Ini"
                  error={errors.semester?.message}
                  {...register('semester')}
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8 / Profesi</option>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  label="Ulangi Password"
                  type="password"
                  placeholder="Ulangi password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
                    {...register('agreeSop')}
                  />
                  <span>
                    Saya menyetujui seluruh <strong>Tata Tertib & SOP Laboratorium</strong> Universitas Ichsan
                    Satya dan bertanggung jawab penuh atas pemeliharaan alat yang dipinjam.
                  </span>
                </label>
                {errors.agreeSop && (
                  <p className="text-xs text-rose-600 mt-1">{errors.agreeSop.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-3"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Daftar & Masuk Dashboard
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Sudah memiliki akun terdaftar?{' '}
            <Link to="/login" className="font-bold text-cyan-600 hover:text-cyan-700 hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
