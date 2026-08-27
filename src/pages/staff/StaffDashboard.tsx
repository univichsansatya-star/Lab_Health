import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { StorageService } from '@/src/services/storage';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { BorrowingStatusBadge, ConditionBadge } from '@/src/components/ui/StatusBadge';
import {
  Boxes,
  ClipboardCheck,
  RotateCcw,
  AlertTriangle,
  Wrench,
  Search,
  QrCode,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  Package,
  FileSpreadsheet,
  AlertOctagon,
} from 'lucide-react';
import { formatDate, formatDateTime, formatRupiah } from '@/src/lib/utils';
import { BorrowingRequest } from '@/src/types';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<BorrowingRequest[]>(() => StorageService.getRequests());
  const [quickSearch, setQuickSearch] = useState('');
  const equipment = StorageService.getEquipment();

  // KPIs
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const readyPickupRequests = requests.filter((r) => r.status === 'READY_TO_PICKUP');
  const activeBorrowings = requests.filter((r) => r.status === 'BORROWED');
  const overdueRequests = requests.filter((r) => r.status === 'OVERDUE');
  const maintenanceCount = equipment.reduce((sum, e) => sum + e.maintenanceQuantity, 0);
  const lowStockEquipment = equipment.filter((e) => e.availableQuantity <= 2 && e.availableQuantity > 0);

  const handleQuickApprove = (id: string) => {
    const updated = StorageService.updateRequestStatus(
      id,
      'READY_TO_PICKUP',
      'Disetujui oleh Staff Lab. Alat siap diambil di Meja Layanan Lab.'
    );
    if (updated) {
      setRequests(StorageService.getRequests());
    }
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    const found = requests.find(
      (r) =>
        r.ticketNumber.toLowerCase().includes(quickSearch.toLowerCase()) ||
        r.userNim.includes(quickSearch) ||
        r.userName.toLowerCase().includes(quickSearch.toLowerCase())
    );
    if (found) {
      navigate(`/staff/requests/${found.id}`);
    } else {
      navigate(`/staff/requests?search=${encodeURIComponent(quickSearch)}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Kendali Laboratorium Terpadu UIS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            Selamat Bertugas, {user?.name.split(',')[0]}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola sirkulasi alat klinis, verifikasi permohonan mahasiswa, dan inspeksi pengembalian
          </p>
        </div>

        {/* Quick Ticket / QR Code Search Box */}
        <form onSubmit={handleQuickSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <Input
            placeholder="Scan / Ketik No. Tiket / NIM Mahasiswa..."
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            leftIcon={<QrCode className="w-4 h-4 text-cyan-600" />}
          />
          <Button type="submit" variant="primary" size="md">
            Cari
          </Button>
        </form>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Pending Requests */}
        <div
          onClick={() => navigate('/staff/requests?status=PENDING')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Permohonan Baru</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 font-heading">
            {pendingRequests.length}
          </p>
          <p className="text-[10px] text-slate-400">Butuh persetujuan staff</p>
        </div>

        {/* Ready to Pickup */}
        <div
          onClick={() => navigate('/staff/requests?status=READY_TO_PICKUP')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Siap Diambil</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-600 font-heading">
            {readyPickupRequests.length}
          </p>
          <p className="text-[10px] text-slate-400">Menunggu serah terima</p>
        </div>

        {/* Active Borrowed */}
        <div
          onClick={() => navigate('/staff/requests?status=BORROWED')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-cyan-300 hover:shadow-xs transition-all cursor-pointer space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Sedang Digunakan</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-cyan-700 font-heading">
            {activeBorrowings.length}
          </p>
          <p className="text-[10px] text-slate-400">Di ruang praktikum/stase</p>
        </div>

        {/* Overdue */}
        <div
          onClick={() => navigate('/staff/requests?status=OVERDUE')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Terlambat (Overdue)</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 font-heading">
            {overdueRequests.length}
          </p>
          <p className="text-[10px] text-rose-500 font-medium">Perlu penagihan/denda</p>
        </div>

        {/* In Maintenance */}
        <div
          onClick={() => navigate('/staff/maintenance')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Dalam Servis/Kalibrasi</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-700 font-heading">
            {maintenanceCount}
          </p>
          <p className="text-[10px] text-slate-400">Unit alat non-aktif</p>
        </div>
      </div>

      {/* Main Grid: Pending Approvals Queue (Left) & Alerts / Quick Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Approval List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 bg-cyan-600 rounded-full" />
              <h3 className="font-heading font-bold text-base text-slate-900">
                Antrean Verifikasi Permohonan Mahasiswa ({pendingRequests.length})
              </h3>
            </div>
            <Link
              to="/staff/requests"
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800 inline-flex items-center gap-1"
            >
              <span>Semua Permohonan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Semua Permohonan Telah Diproses</p>
              <p className="text-[11px] text-slate-400">Tidak ada antrean tiket yang menunggu persetujuan staff saat ini.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingRequests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                        {req.ticketNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{req.userName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">({req.userNim})</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate">{req.purpose}</p>
                    <p className="text-[11px] text-slate-400">
                      {req.items.length} jenis alat • Dosen: {req.supervisorLecturer} • Waktu Pinjam: {formatDate(req.borrowDate)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/staff/requests/${req.id}`)}
                    >
                      Detail
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleQuickApprove(req.id)}
                    >
                      Setujui
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Return Desk & Low Stock Alerts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Desk Card */}
          <div className="bg-gradient-to-br from-cyan-900 to-slate-900 rounded-2xl p-5 text-white shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-cyan-400" />
              <h3 className="font-heading font-bold text-sm">Meja Layanan Pengembalian</h3>
            </div>
            <p className="text-xs text-cyan-100/80 leading-relaxed">
              Verifikasi cepat kondisi alat saat mahasiswa mengembalikan di loket laboratorium.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-400"
              onClick={() => navigate('/staff/returns')}
            >
              Buka Meja Pengembalian Lab →
            </Button>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Peringatan Stok Menipis</span>
              </h4>
              <Link to="/staff/inventory" className="text-[11px] font-bold text-cyan-700 hover:underline">
                Kelola Stok
              </Link>
            </div>

            <div className="space-y-2">
              {lowStockEquipment.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500">{item.code}</p>
                  </div>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex-shrink-0">
                    Sisa {item.availableQuantity} Unit
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
