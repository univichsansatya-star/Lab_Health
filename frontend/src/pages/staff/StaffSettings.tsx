import React, { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { Input, Select, Textarea } from '@/src/components/ui/Input';
import {
  Settings,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Building2,
  FileCheck,
} from 'lucide-react';

export const StaffSettings: React.FC = () => {
  const [maxBorrowDays, setMaxBorrowDays] = useState(3);
  const [dailyFine, setDailyFine] = useState(10000);
  const [openHour, setOpenHour] = useState('07:30');
  const [closeHour, setCloseHour] = useState('17:00');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
          Pengaturan & Kebijakan Laboratorium
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Konfigurasi jam layanan loket, tarif denda keterlambatan, dan parameter sirkulasi alat
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Pengaturan kebijakan laboratorium berhasil disimpan!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        {/* Operational hours */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-600" />
            <span>Jam Operasional Layanan Meja Lab</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Jam Buka Loket Pagi"
              type="time"
              value={openHour}
              onChange={(e) => setOpenHour(e.target.value)}
            />
            <Input
              label="Jam Tutup Loket Sore"
              type="time"
              value={closeHour}
              onChange={(e) => setCloseHour(e.target.value)}
            />
          </div>
        </div>

        {/* Borrowing Policies */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Kebijakan Durasi & Denda Keterlambatan</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Maksimal Durasi Pinjam Standar (Hari)"
              type="number"
              min="1"
              max="14"
              value={maxBorrowDays}
              onChange={(e) => setMaxBorrowDays(Number(e.target.value))}
            />
            <Input
              label="Tarif Denda Keterlambatan (Rp / Hari / Alat)"
              type="number"
              step="1000"
              value={dailyFine}
              onChange={(e) => setDailyFine(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-600" />
            <span>Informasi Kontak Loket UPT Lab</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email Resmi" placeholder="Masukkan email resmi layanan lab" />
            <Input label="Hotline WhatsApp Petugas" placeholder="Masukkan nomor layanan lab" />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <Button type="submit" variant="primary" size="md">
            Simpan Pengaturan
          </Button>
        </div>
      </form>

    </div>
  );
};
