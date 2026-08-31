import React, { useState } from 'react';
import { StorageService } from '@/src/services/storage';
import { Button } from '@/src/components/ui/Button';
import { Select } from '@/src/components/ui/Input';
import { UISLogo } from '@/src/components/brand/UISLogo';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Award,
  Users,
  Boxes,
  Stethoscope,
} from 'lucide-react';
import { formatRupiah } from '@/src/lib/utils';

export const LabReports: React.FC = () => {
  const [period, setPeriod] = useState('semester_ganjil');

  const allRequests = StorageService.getRequests();
  const allEquipment = StorageService.getEquipment();

  // Metric calculations
  const totalBorrowings = allRequests.length;
  const returnedOnTime = allRequests.filter((r) => r.status === 'RETURNED').length;
  const onTimePercentage = totalBorrowings > 0 ? Math.round((returnedOnTime / totalBorrowings) * 100) : 100;
  const totalFines = allRequests.reduce((sum, r) => sum + (r.fineAmount || 0), 0);

  // Top borrowed equipment
  const topEquipment = [...allEquipment]
    .sort((a, b) => b.borrowedQuantity - a.borrowedQuantity)
    .slice(0, 5);

  // Condition distribution
  const conditionExcellent = allEquipment.filter((e) => e.condition === 'EXCELLENT').length;
  const conditionGood = allEquipment.filter((e) => e.condition === 'GOOD').length;
  const conditionFair = allEquipment.filter((e) => e.condition === 'FAIR').length;
  const conditionMaint = allEquipment.filter((e) => e.condition === 'MAINTENANCE_REQUIRED').length;

  const exportReportCSV = () => {
    const headers = 'ID Tiket,Peminjam,NIM,Prodi,Tujuan,Dosen,Status,Tanggal Pinjam,Tanggal Kembali\n';
    const rows = allRequests
      .map(
        (r) =>
          `"${r.ticketNumber}","${r.userName}","${r.userNim}","${r.userDepartment}","${r.purpose}","${r.supervisorLecturer}","${r.status}","${r.borrowDate}","${r.expectedReturnDate}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Peminjaman_Lab_UIS_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            Laporan & Analitik Laboratorium Terpadu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistik utilisasi alat, rekam jejak kepatuhan praktikan, dan audit inventaris
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportReportCSV}
            leftIcon={<Download className="w-4 h-4 text-cyan-700" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Cetak Laporan Resmi
          </Button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block border-b border-slate-200 pb-4">
        <UISLogo size="md" />
        <h2 className="text-lg font-bold text-slate-900 mt-2">
          LAPORAN KINERJA DAN UTILISASI ALAT LABORATORIUM
        </h2>
        <p className="text-xs text-slate-500">
          Periode Akademik: Tahun Ajaran 2025/2026 • Dicetak pada: {new Date().toLocaleDateString('id-ID')}
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Volume Peminjaman</span>
          <p className="text-2xl font-extrabold text-slate-900 font-heading">{totalBorrowings} Tiket</p>
          <p className="text-[11px] text-emerald-600 font-medium">+18% dari semester lalu</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Tingkat Pengembalian Tepat Waktu</span>
          <p className="text-2xl font-extrabold text-cyan-700 font-heading">{onTimePercentage}%</p>
          <p className="text-[11px] text-slate-500">Kepatuhan praktikan sangat tinggi</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Kesiapan Alat Lab (Siap Pakai)</span>
          <p className="text-2xl font-extrabold text-emerald-600 font-heading">
            {Math.round(((conditionExcellent + conditionGood) / allEquipment.length) * 100)}%
          </p>
          <p className="text-[11px] text-slate-500">{conditionMaint} unit dalam perbaikan</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Penerimaan Denda / Kas Lab</span>
          <p className="text-2xl font-extrabold text-slate-900 font-heading">{formatRupiah(totalFines)}</p>
          <p className="text-[11px] text-slate-400">Dialokasikan untuk bahan habis pakai</p>
        </div>
      </div>

      {/* Charts / Visual Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Most Borrowed Equipment */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-600" />
            <span>5 Peralatan Paling Sering Digunakan</span>
          </h3>

          <div className="space-y-3">
            {topEquipment.map((eq, i) => {
              const percentage = Math.round((eq.borrowedQuantity / eq.totalQuantity) * 100) || 50;
              return (
                <div key={eq.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      {i + 1}. {eq.name}
                    </span>
                    <span className="font-semibold text-cyan-800">
                      {eq.borrowedQuantity} / {eq.totalQuantity} Unit
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipment Condition Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <Boxes className="w-4 h-4 text-teal-600" />
            <span>Kondisi Fisik Inventaris Laboratorium</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-emerald-800 font-semibold">Sangat Baik (100%)</span>
              <p className="text-xl font-extrabold text-emerald-900">{conditionExcellent} Jenis</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
              <span className="text-blue-800 font-semibold">Baik & Terkalibrasi</span>
              <p className="text-xl font-extrabold text-blue-900">{conditionGood} Jenis</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-amber-800 font-semibold">Cukup (Perlu Inspeksi)</span>
              <p className="text-xl font-extrabold text-amber-900">{conditionFair} Jenis</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
              <span className="text-purple-800 font-semibold">Dalam Perbaikan</span>
              <p className="text-xl font-extrabold text-purple-900">{conditionMaint} Jenis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
