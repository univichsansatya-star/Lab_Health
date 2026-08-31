import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StorageService } from '@/src/services/storage';
import { BorrowingRequest, BorrowingStatus } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Input, Select, Textarea } from '@/src/components/ui/Input';
import { Modal } from '@/src/components/ui/Modal';
import { BorrowingStatusBadge } from '@/src/components/ui/StatusBadge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import {
  ClipboardCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  UserCheck,
  FileText,
  AlertTriangle,
  QrCode,
  PackageCheck,
} from 'lucide-react';
import { formatDate } from '@/src/lib/utils';

export const BorrowingRequestsManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<BorrowingRequest[]>(() => StorageService.getRequests());
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('status') || 'ALL');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<BorrowingRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (activeTab !== 'ALL' && r.status !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTicket = r.ticketNumber.toLowerCase().includes(q);
        const matchName = r.userName.toLowerCase().includes(q);
        const matchNim = r.userNim.includes(q);
        const matchPurpose = r.purpose.toLowerCase().includes(q);
        if (!matchTicket && !matchName && !matchNim && !matchPurpose) return false;
      }
      return true;
    });
  }, [requests, activeTab, searchQuery]);

  const handleApprove = (id: string) => {
    const updated = StorageService.updateRequestStatus(
      id,
      'READY_TO_PICKUP',
      'Permohonan disetujui. Alat telah disiapkan di Meja Layanan Lab Gedung B Lt. 2.'
    );
    if (updated) {
      setRequests(StorageService.getRequests());
    }
  };

  const handleOpenReject = (req: BorrowingRequest) => {
    setSelectedReq(req);
    setRejectReason('Jadwal bentrok dengan ujian OSCE semester.');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedReq) return;
    const updated = StorageService.updateRequestStatus(
      selectedReq.id,
      'REJECTED',
      rejectReason || 'Permohonan ditolak oleh staff laboratorium.'
    );
    if (updated) {
      setRequests(StorageService.getRequests());
      setIsRejectModalOpen(false);
    }
  };

  const handleHandover = (id: string) => {
    const updated = StorageService.updateRequestStatus(
      id,
      'BORROWED',
      'Serah terima alat praktikum selesai di meja lab. Mahasiswa bertanggung jawab penuh.'
    );
    if (updated) {
      setRequests(StorageService.getRequests());
    }
  };

  const tabs = [
    { key: 'ALL', label: 'Semua Tiket', count: requests.length },
    { key: 'PENDING', label: 'Menunggu Approval', count: requests.filter((r) => r.status === 'PENDING').length },
    { key: 'READY_TO_PICKUP', label: 'Siap Diambil', count: requests.filter((r) => r.status === 'READY_TO_PICKUP').length },
    { key: 'BORROWED', label: 'Sedang Dipinjam', count: requests.filter((r) => r.status === 'BORROWED').length },
    { key: 'OVERDUE', label: 'Terlambat', count: requests.filter((r) => r.status === 'OVERDUE').length },
    { key: 'RETURNED', label: 'Selesai', count: requests.filter((r) => r.status === 'RETURNED').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            Daftar Permohonan & Sirkulasi Alat
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifikasi kelayakan pinjam, jadwalkan serah terima, dan validasi pengembalian
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === 'ALL') searchParams.delete('status');
              else searchParams.set('status', tab.key);
              setSearchParams(searchParams);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
        <Input
          placeholder="Cari nomor tiket, nama mahasiswa, NIM, atau tujuan praktikum..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Requests Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="w-6 h-6" />}
          title="Tidak Ada Permohonan Ditemukan"
          description="Tidak ada tiket peminjaman yang cocok dengan filter atau pencarian saat ini."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Tiket & Mahasiswa</th>
                  <th className="py-3 px-4">Kegiatan & Dosen</th>
                  <th className="py-3 px-4">Daftar Alat</th>
                  <th className="py-3 px-4">Jadwal Pinjam</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Ticket & Student */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                        {req.ticketNumber}
                      </span>
                      <p className="font-bold text-slate-900 mt-1">{req.userName}</p>
                      <p className="text-[11px] text-slate-500">{req.userNim} • {req.userDepartment}</p>
                    </td>

                    {/* Purpose & Supervisor */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <p className="font-semibold text-slate-800 truncate">{req.purpose}</p>
                      <p className="text-[11px] text-slate-500 truncate">{req.courseName}</p>
                      <p className="text-[10px] text-cyan-700 font-medium mt-0.5">Dosen: {req.supervisorLecturer}</p>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 max-w-[180px]">
                        {req.items.map((it, idx) => (
                          <p key={idx} className="text-[11px] text-slate-700 truncate">
                            • {it.quantity}x {it.equipmentName}
                          </p>
                        ))}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <p>{formatDate(req.borrowDate)}</p>
                      <p className="text-[11px] text-slate-400">s/d {formatDate(req.expectedReturnDate)}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <BorrowingStatusBadge status={req.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {req.status === 'PENDING' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(req.id)}
                            >
                              Setujui
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:bg-rose-50"
                              onClick={() => handleOpenReject(req)}
                            >
                              Tolak
                            </Button>
                          </>
                        )}

                        {req.status === 'READY_TO_PICKUP' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleHandover(req.id)}
                            leftIcon={<PackageCheck className="w-4 h-4" />}
                          >
                            Serah Terima
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/staff/requests/${req.id}`)}
                        >
                          Detail
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {selectedReq && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title={`Tolak Permohonan Tiket #${selectedReq.ticketNumber}`}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Mahasiswa <strong>{selectedReq.userName}</strong> akan menerima notifikasi penolakan beserta alasan di bawah ini:
            </p>

            <Textarea
              label="Alasan Penolakan Permohonan"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Stok alat dialokasikan untuk ujian OSCE stase keperawatan..."
              required
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsRejectModalOpen(false)}>
                Batal
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmReject}>
                Tolak Permohonan
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
