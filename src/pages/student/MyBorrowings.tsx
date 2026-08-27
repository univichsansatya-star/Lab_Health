import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { StorageService } from '@/src/services/storage';
import { BorrowingRequest, BorrowingStatus } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Input, Select } from '@/src/components/ui/Input';
import { BorrowingStatusBadge } from '@/src/components/ui/StatusBadge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import {
  Search,
  Calendar,
  Clock,
  QrCode,
  ArrowRight,
  Filter,
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';
import { formatDate } from '@/src/lib/utils';

export const MyBorrowings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const allUserRequests = StorageService.getRequests().filter((r) => r.userId === user?.id);

  const filteredRequests = useMemo(() => {
    return allUserRequests.filter((req) => {
      // Tab filter
      if (activeTab !== 'ALL' && req.status !== activeTab) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTicket = req.ticketNumber.toLowerCase().includes(q);
        const matchPurpose = req.purpose.toLowerCase().includes(q);
        const matchCourse = req.courseName.toLowerCase().includes(q);
        const matchItem = req.items.some((i) => i.equipmentName.toLowerCase().includes(q));
        if (!matchTicket && !matchPurpose && !matchCourse && !matchItem) return false;
      }
      return true;
    });
  }, [allUserRequests, activeTab, searchQuery]);

  const tabs = [
    { key: 'ALL', label: 'Semua Tiket', count: allUserRequests.length },
    { key: 'PENDING', label: 'Menunggu Review', count: allUserRequests.filter((r) => r.status === 'PENDING').length },
    { key: 'READY_TO_PICKUP', label: 'Siap Diambil', count: allUserRequests.filter((r) => r.status === 'READY_TO_PICKUP').length },
    { key: 'BORROWED', label: 'Sedang Dipinjam', count: allUserRequests.filter((r) => r.status === 'BORROWED').length },
    { key: 'RETURNED', label: 'Selesai', count: allUserRequests.filter((r) => r.status === 'RETURNED').length },
    { key: 'OVERDUE', label: 'Terlambat', count: allUserRequests.filter((r) => r.status === 'OVERDUE').length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Daftar & Riwayat Peminjaman Alat
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Lacak status permohonan, ambil tiket QR lab, dan pantau masa pengembalian alat praktikum
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/catalog')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Buat Peminjaman Baru
        </Button>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
        <Input
          placeholder="Cari nomor tiket, nama alat, atau mata kuliah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="Tidak Ada Peminjaman Ditemukan"
          description="Anda belum memiliki peminjaman pada filter ini atau kata kunci tidak sesuai."
          actionLabel="Pinjam Alat Sekarang"
          onAction={() => navigate('/catalog')}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const totalQty = req.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <div
                key={req.id}
                onClick={() => navigate(`/student/borrowings/${req.id}`)}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-cyan-300 hover:shadow-md transition-all duration-200 cursor-pointer space-y-4 group"
              >
                {/* Top Row: Ticket Number, Purpose & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                      {req.ticketNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Dosen: <strong className="text-slate-800">{req.supervisorLecturer}</strong>
                    </span>
                  </div>
                  <BorrowingStatusBadge status={req.status} size="sm" />
                </div>

                {/* Middle Row: Purpose, Course, and Items Thumbnails */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-6 space-y-1">
                    <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-cyan-700 transition-colors">
                      {req.purpose}
                    </h3>
                    <p className="text-xs text-slate-500">{req.courseName}</p>
                  </div>

                  {/* Items preview */}
                  <div className="lg:col-span-6 flex items-center gap-2 overflow-x-auto">
                    {req.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs flex-shrink-0"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.equipmentName}
                          className="w-9 h-9 rounded-lg object-cover bg-white"
                        />
                        <div className="max-w-[140px]">
                          <p className="text-xs font-bold text-slate-800 truncate">{item.equipmentName}</p>
                          <p className="text-[10px] text-slate-500">{item.quantity} Unit</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Row: Dates & Action prompt */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dipinjam: <strong>{formatDate(req.borrowDate)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Jatuh Tempo: <strong className={req.status === 'OVERDUE' ? 'text-rose-600' : 'text-slate-800'}>{formatDate(req.expectedReturnDate)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-cyan-700 font-bold group-hover:translate-x-1 transition-transform">
                    <QrCode className="w-4 h-4 text-cyan-600" />
                    <span>Lihat Tiket & QR Code Serah Terima →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
