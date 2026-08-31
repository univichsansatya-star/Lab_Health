import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/src/context/CartContext';
import { useAuth } from '@/src/context/AuthContext';
import { StorageService } from '@/src/services/storage';
import { Button } from '@/src/components/ui/Button';
import { Input, Select, Textarea } from '@/src/components/ui/Input';
import { EmptyState } from '@/src/components/ui/EmptyState';
import {
  CheckCircle2,
  Calendar,
  User,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  MapPin,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  QrCode,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatDate } from '@/src/lib/utils';
import { BorrowingRequest } from '@/src/types';

const requestSchema = z.object({
  purpose: z.string().min(5, 'Tujuan peminjaman wajib diisi jelas'),
  courseName: z.string().min(3, 'Nama mata kuliah/stase wajib diisi'),
  supervisorLecturer: z.string().min(3, 'Nama dosen pembimbing / penanggung jawab wajib diisi'),
  borrowDate: z.string().min(1, 'Pilih tanggal mulai pinjam'),
  expectedReturnDate: z.string().min(1, 'Pilih tanggal estimasi pengembalian'),
  notes: z.string().optional(),
  agreeTerms: z.boolean().refine((val) => val === true, 'Wajib menyetujui SOP dan tanggung jawab alat'),
});

type RequestFormValues = z.infer<typeof requestSchema>;

export const BorrowingRequestWizard: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, totalItemsCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [createdTicket, setCreatedTicket] = useState<BorrowingRequest | null>(null);

  // Defaults: today and 2 days ahead
  const todayStr = new Date().toISOString().slice(0, 10);
  const next2Days = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      purpose: 'Praktikum Mandiri Persiapan OSCE Stase Kritis',
      courseName: 'Keperawatan Gawat Darurat & Kritis II',
      supervisorLecturer: 'Ns. Faisal Akbar, S.Kep., M.Kep.',
      borrowDate: todayStr,
      expectedReturnDate: next2Days,
      agreeTerms: true,
    },
  });

  const formValues = watch();

  if (items.length === 0 && currentStep !== 4) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Keranjang Peminjaman Kosong"
          description="Pilih peralatan keperawatan dari katalog terlebih dahulu untuk melanjutkan pengajuan pinjaman."
          actionLabel="Buka Katalog Alat"
          onAction={() => navigate('/catalog')}
        />
      </div>
    );
  }

  const onSubmit = async (data: RequestFormValues) => {
    if (!user) return;

    try {
      const newRequest = StorageService.createRequest({
        userId: user.id,
        userName: user.name,
        userNim: user.nim_nip,
        userDepartment: user.department,
        userPhone: user.phone,
        userRole: user.role,
        purpose: data.purpose,
        courseName: data.courseName,
        supervisorLecturer: data.supervisorLecturer,
        borrowDate: data.borrowDate,
        expectedReturnDate: data.expectedReturnDate,
        status: 'PENDING',
        items: items.map((i) => ({
          equipmentId: i.equipment.id,
          equipmentCode: i.equipment.code,
          equipmentName: i.equipment.name,
          quantity: i.quantity,
          imageUrl: i.equipment.imageUrl,
          location: i.equipment.location,
          conditionAtBorrow: i.equipment.condition,
        })),
        adminNotes: data.notes,
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      clearCart();
      setCreatedTicket(newRequest);
      setCurrentStep(4);
    } catch (e) {
      console.error('Failed to submit request', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Step Indicator (Only if not completed) */}
      {currentStep !== 4 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
              Pengajuan Peminjaman Alat Lab
            </h1>
            <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
              Langkah {currentStep} dari 3
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div
              className={`h-2 rounded-full transition-all ${
                currentStep >= 1 ? 'bg-cyan-600' : 'bg-slate-200'
              }`}
            />
            <div
              className={`h-2 rounded-full transition-all ${
                currentStep >= 2 ? 'bg-cyan-600' : 'bg-slate-200'
              }`}
            />
            <div
              className={`h-2 rounded-full transition-all ${
                currentStep >= 3 ? 'bg-cyan-600' : 'bg-slate-200'
              }`}
            />
          </div>
        </div>
      )}

      {/* STEP 1: REVIEW SELECTED ITEMS */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              1. Tinjau & Konfirmasi Daftar Alat ({totalItemsCount} Unit)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pastikan jumlah alat yang akan Anda pinjam sesuai dengan modul praktikum
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map(({ equipment, quantity }) => (
              <div
                key={equipment.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={equipment.imageUrl}
                    alt={equipment.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded">
                      {equipment.code}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                      {equipment.name}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{equipment.location}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(equipment.id, quantity - 1)}
                      className="p-1 hover:bg-white rounded-lg text-slate-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(equipment.id, quantity + 1)}
                      disabled={quantity >= equipment.availableQuantity}
                      className="p-1 hover:bg-white rounded-lg text-slate-600 disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(equipment.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link to="/catalog">
              <Button variant="ghost" size="sm">
                + Tambah Alat Lain dari Katalog
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(2)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Lanjut ke Jadwal & Modul
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: SCHEDULE & ACADEMIC PURPOSE FORM */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              2. Jadwal Praktikum & Data Akademik
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Informasi ini digunakan staff lab untuk menjadwalkan kesiapan alat di meja serah terima
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tanggal Mulai Pinjam"
                type="date"
                leftIcon={<Calendar className="w-4 h-4" />}
                error={errors.borrowDate?.message}
                {...register('borrowDate')}
              />
              <Input
                label="Estimasi Tanggal Pengembalian"
                type="date"
                leftIcon={<Calendar className="w-4 h-4" />}
                error={errors.expectedReturnDate?.message}
                {...register('expectedReturnDate')}
              />
            </div>

            <Input
              label="Tujuan Peminjaman / Kegiatan"
              placeholder="Contoh: Praktikum Mandiri Resusitasi CPR OSCE Ners"
              error={errors.purpose?.message}
              {...register('purpose')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mata Kuliah / Stase Klinis"
                placeholder="Contoh: Keperawatan Medikal Bedah II"
                error={errors.courseName?.message}
                {...register('courseName')}
              />
              <Input
                label="Dosen Pembimbing / Penanggung Jawab"
                placeholder="Contoh: Ns. Faisal Akbar, M.Kep."
                error={errors.supervisorLecturer?.message}
                {...register('supervisorLecturer')}
              />
            </div>

            <Textarea
              label="Catatan Tambahan untuk Petugas Lab (Opsional)"
              placeholder="Contoh: Memerlukan konektor kabel daya cadangan atau baterai cadangan..."
              {...register('notes')}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Kembali
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(3)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Lanjut ke Verifikasi & Ringkasan
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: FINAL REVIEW & SOP AGREEMENT */}
      {currentStep === 3 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                3. Ringkasan Permohonan & Pakta Integritas Lab
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Periksa kembali kelengkapan permohonan sebelum dikirimkan ke petugas lab
              </p>
            </div>

            {/* Student & Schedule Info Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
              <div className="space-y-1.5">
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Peminjam</p>
                <p className="font-bold text-slate-900">{user?.name}</p>
                <p className="text-slate-600">NIM: {user?.nim_nip} • {user?.department}</p>
                <p className="text-slate-600">WhatsApp: {user?.phone}</p>
              </div>

              <div className="space-y-1.5">
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Waktu & Kegiatan</p>
                <p className="font-bold text-slate-900">{formValues.purpose}</p>
                <p className="text-slate-600">
                  Jadwal: {formatDate(formValues.borrowDate)} s/d {formatDate(formValues.expectedReturnDate)}
                </p>
                <p className="text-slate-600">Dosen: {formValues.supervisorLecturer}</p>
              </div>
            </div>

            {/* Selected Items summary table */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daftar Alat ({totalItemsCount} Unit)
              </p>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {items.map(({ equipment, quantity }) => (
                  <div key={equipment.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={equipment.imageUrl}
                        alt={equipment.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                      />
                      <div>
                        <span className="text-[10px] font-mono font-bold text-cyan-700">{equipment.code}</span>
                        <p className="font-bold text-slate-800">{equipment.name}</p>
                      </div>
                    </div>
                    <span className="font-bold text-cyan-800 bg-cyan-50 px-2 py-1 rounded">
                      {quantity} Unit
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SOP & Agreement Checkbox */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-900">Ketentuan & SOP Laboratorium UIS</h4>
                  <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-1">
                    <li>Alat wajib diperiksa bersama petugas saat serah terima di meja lab.</li>
                    <li>Wajib membersihkan dan mengembalikan alat tepat waktu sesuai jadwal.</li>
                    <li>Keterlambatan pengembalian dikenakan denda administrasi sesuai SK Rektor.</li>
                    <li>Segala bentuk kerusakan akibat kelalaian menjadi tanggung jawab peminjam.</li>
                  </ul>
                </div>
              </div>

              <label className="flex items-start gap-2 pt-2 border-t border-amber-200/80 cursor-pointer text-xs text-amber-900">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 border-amber-300"
                  {...register('agreeTerms')}
                />
                <span className="font-semibold">
                  Saya telah membaca, memahami, dan menyetujui seluruh tata tertib penggunaan laboratorium UIS di atas.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-rose-600 font-medium">{errors.agreeTerms.message}</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Ubah Jadwal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Kirim Permohonan Peminjaman
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 4: SUCCESS RECEIPT & QR CODE PASS */}
      {currentStep === 4 && createdTicket && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-lg text-center space-y-6 max-w-xl mx-auto animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Permohonan Berhasil Dikirim
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading pt-2">
              Tiket #{createdTicket.ticketNumber}
            </h2>
            <p className="text-xs text-slate-500">
              Staff Laboratorium Ners akan memverifikasi permohonan Anda segera.
            </p>
          </div>

          {/* QR Code Pass Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 max-w-sm mx-auto space-y-3">
            <div className="w-36 h-36 bg-white p-3 rounded-xl border border-slate-200 mx-auto flex items-center justify-center shadow-2xs">
              {/* Stylized QR representation */}
              <div className="w-full h-full border-4 border-slate-900 rounded-lg p-2 grid grid-cols-4 gap-1">
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-transparent" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-transparent" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-transparent" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-transparent" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-slate-900 rounded-xs" />
                <div className="bg-slate-900 rounded-xs" />
              </div>
            </div>
            <p className="font-mono text-xs font-bold text-cyan-800">{createdTicket.ticketNumber}</p>
            <p className="text-[11px] text-slate-500 leading-snug">
              Tunjukkan QR Code ini di Meja Layanan Lab Gedung B Lt. 2 saat status tiket menjadi <strong>Siap Diambil</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/student/borrowings/${createdTicket.id}`)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Lihat Detail & Lacak Status
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/student/borrowings')}
            >
              Semua Peminjaman Saya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
