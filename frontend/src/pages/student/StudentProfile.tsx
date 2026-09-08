import React, { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { StorageService } from '@/src/services/storage';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  AlertOctagon,
  BookOpen,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentProfile: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '0812-3456-7890');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const userRequests = StorageService.getRequests().filter((r) => r.userId === user?.id);
  const totalBorrowed = userRequests.length;
  const returnedOnTime = userRequests.filter((r) => r.status === 'RETURNED').length;
  const overdueCount = userRequests.filter((r) => r.status === 'OVERDUE').length;

  const handleSave = async () => {
    await updateProfile({ phone });
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                Mahasiswa Aktif UIS
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Bebas Tanggungan Lab
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              {user?.name}
            </h1>

            <p className="text-xs text-slate-600 font-medium">
               NIM: <strong className="text-slate-900">{user?.nim_nip}</strong> • {user?.department} • Semester {user?.semester}
            </p>

            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Batal Edit' : 'Edit Kontak'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:bg-rose-50"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Keluar
            </Button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
            Data kontak berhasil diperbarui!
          </div>
        )}

        {isEditing && (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 max-w-md">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Ubah Nomor WhatsApp Aktif
            </h4>
            <div className="flex gap-2">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                leftIcon={<Phone className="w-4 h-4" />}
              />
              <Button variant="primary" size="md" onClick={handleSave}>
                Simpan
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lab Performance & Ethics Track Record */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-heading">
          Rekam Jejak & Kepatuhan Praktikum Lab
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Total Peminjaman</span>
              <BookOpen className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 font-heading">{totalBorrowed}</p>
            <p className="text-[11px] text-slate-500">Sesi praktikum & OSCE</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Tepat Waktu</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-600 font-heading">
              {totalBorrowed > 0 ? Math.round((returnedOnTime / totalBorrowed) * 100) : 100}%
            </p>
            <p className="text-[11px] text-slate-500">{returnedOnTime} tiket selesai tertib</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Catatan Denda / Insiden</span>
              <AlertOctagon className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 font-heading">{overdueCount}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Status: Sangat Disiplin</p>
          </div>
        </div>
      </div>

    </div>
  );
};
