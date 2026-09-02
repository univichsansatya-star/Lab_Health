import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StorageService } from '@/src/services/storage';
import { Button } from '@/src/components/ui/Button';
import { BorrowingStatusBadge } from '@/src/components/ui/StatusBadge';
import { UISLogo } from '@/src/components/brand/UISLogo';
import {
  ArrowLeft,
  Printer,
  QrCode,
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Building2,
  FileCheck,
  ShieldCheck,
  Phone,
  GraduationCap,
} from 'lucide-react';
import { formatDate, formatDateTime, formatRupiah } from '@/src/lib/utils';
import { BorrowingStatus } from '@/src/types';

export const BorrowingDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState(() => StorageService.getRequestById(id || ''));
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Tiket Peminjaman Tidak Ditemukan</h2>
        <Button variant="primary" onClick={() => navigate('/student/borrowings')}>
          Kembali ke Daftar Peminjaman
        </Button>
      </div>
    );
  }

  const steps: { status: BorrowingStatus; label: string; desc: string }[] = [
    { status: 'PENDING', label: 'Permohonan Diajukan', desc: 'Menunggu review staff lab' },
    { status: 'READY_TO_PICKUP', label: 'Disetujui & Siap Diambil', desc: 'Ambil di Meja Lab Gd. B' },
    { status: 'BORROWED', label: 'Sedang Digunakan', desc: 'Dalam masa praktikum' },
    { status: 'RETURNED', label: 'Selesai Dikembalikan', desc: 'Verifikasi kondisi selesai' },
  ];

  const getStepIndex = (status: BorrowingStatus) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'APPROVED':
      case 'READY_TO_PICKUP':
        return 1;
      case 'BORROWED':
      case 'OVERDUE':
        return 2;
      case 'RETURNED':
        return 3;
      case 'REJECTED':
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(request.status);

  const handlePrint = () => {
    window.print();
  };

  const handleQuickStudentReturn = () => {
    const updated = StorageService.updateRequestStatus(
      request.id,
      'RETURNED',
      'Pengembalian dikonfirmasi di meja lab. Alat telah diperiksa petugas dalam kondisi baik.'
    );
    if (updated) {
      setRequest(updated);
      setIsReturnModalOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar Navigation & Print Action */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4 print:hidden">
        <button
          onClick={() => navigate('/student/borrowings')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-cyan-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Peminjaman</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4 text-cyan-700" />}
          >
            Cetak Slip Peminjaman (PDF)
          </Button>

          {request.status === 'BORROWED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsReturnModalOpen(true)}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Proses Pengembalian
            </Button>
          )}
        </div>
      </div>

      {/* Main Ticket Document Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <UISLogo size="md" />
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Unit Pelaksana Teknis Laboratorium Keperawatan & Kesehatan Terpadu
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Nomor Tiket Digital
            </span>
            <span className="font-mono text-base font-extrabold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-lg border border-cyan-200 inline-block mt-0.5">
              {request.ticketNumber}
            </span>
            <div className="mt-2">
              <BorrowingStatusBadge status={request.status} size="md" />
            </div>
          </div>
        </div>

        {/* Timeline Status Progress Bar (Non-print or styled) */}
        {request.status !== 'REJECTED' && (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tahapan Progres Peminjaman
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((s, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isPassed
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div
                        className={`flex-1 h-1 rounded-full ${
                          isPassed && idx < 3 ? 'bg-cyan-600' : 'bg-slate-200'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-cyan-800' : isPassed ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rejection / Overdue Notice if applicable */}
        {request.status === 'REJECTED' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
            <h4 className="text-xs font-bold">Permohonan Tidak Disetujui oleh Staff Lab</h4>
            <p className="text-xs">{request.adminNotes || 'Jadwal bentrok dengan praktikum OSCE reguler.'}</p>
          </div>
        )}

        {request.status === 'OVERDUE' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-sm">Peminjaman Melewati Batas Waktu (Overdue)</h4>
              <p>Segera kembalikan alat ke Meja Layanan Lab. Denda keterlambatan Rp 10.000 / hari per alat.</p>
              {request.fineAmount && request.fineAmount > 0 && (
                <p className="font-bold text-rose-700">Total Akumulasi Denda: {formatRupiah(request.fineAmount)}</p>
              )}
            </div>
          </div>
        )}

        {/* Academic & Borrower Details Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1.5">
              Data Peminjam (Mahasiswa)
            </h4>
            <div className="space-y-1.5 text-slate-700">
              <p className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-900">{request.userName}</span>
              </p>
              <p className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>NIM: <strong>{request.userNim}</strong> • {request.userDepartment}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>WhatsApp: {request.userPhone}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1.5">
              Waktu & Kegiatan Akademik
            </h4>
            <div className="space-y-1.5 text-slate-700">
              <p><strong>Tujuan:</strong> {request.purpose}</p>
              <p><strong>Mata Kuliah:</strong> {request.courseName}</p>
              <p><strong>Dosen Pembimbing:</strong> {request.supervisorLecturer}</p>
              <p><strong>Jadwal Pinjam:</strong> {formatDate(request.borrowDate)} s/d {formatDate(request.expectedReturnDate)}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-slate-900 text-sm">
            Rincian Alat Laboratorium yang Dipinjam
          </h4>
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {request.items.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.imageUrl}
                    alt={item.equipmentName}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                      {item.equipmentCode}
                    </span>
                    <h5 className="font-bold text-slate-900 mt-0.5 truncate">{item.equipmentName}</h5>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{item.location}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-bold text-sm text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                    {item.quantity} Unit
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Kondisi Awal: Baik</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR Pass Box for Staff Handover */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-900 to-slate-900 text-white text-center space-y-4">
          <div className="w-40 h-40 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            {/* High visual QR pass */}
            <div className="w-full h-full border-4 border-slate-950 rounded-xl p-2 grid grid-cols-5 gap-1">
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-transparent" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-transparent" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-transparent" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-transparent" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-transparent" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-transparent" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-slate-950 rounded-xs" />
              <div className="bg-slate-950 rounded-xs" />
            </div>
          </div>

          <div>
            <p className="font-mono text-sm font-bold text-cyan-300">PASS TIKET: {request.ticketNumber}</p>
            <p className="text-xs text-cyan-100/80 max-w-sm mx-auto mt-1">
              Tunjukkan tampilan ini ke Petugas Laboratorium Ners saat serah terima alat atau saat pengembalian di Meja Layanan Lab.
            </p>
          </div>
        </div>

        {/* Signatures for Print */}
        <div className="hidden print:grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-center text-xs">
          <div className="space-y-16">
            <p className="font-semibold text-slate-700">Peminjam (Mahasiswa)</p>
            <p className="font-bold underline text-slate-900">{request.userName}</p>
          </div>
          <div className="space-y-16">
            <p className="font-semibold text-slate-700">Petugas Laboratorium UIS</p>
            <p className="font-bold underline text-slate-900">
              {request.handoverStaffName || request.returnStaffName || 'Petugas Laboratorium UIS'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Return Confirmation Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Konfirmasi Pengembalian Alat</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Apakah Anda telah menyerahkan semua unit alat praktikum di atas ke petugas Meja Layanan Lab dalam kondisi bersih dan lengkap?
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsReturnModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleQuickStudentReturn}>
                Ya, Selesaikan Pengembalian
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
