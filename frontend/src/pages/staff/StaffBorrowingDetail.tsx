import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StorageService } from '@/src/services/storage';
import { Button } from '@/src/components/ui/Button';
import { Input, Textarea, Select } from '@/src/components/ui/Input';
import { BorrowingStatusBadge, ConditionBadge } from '@/src/components/ui/StatusBadge';
import { UISLogo } from '@/src/components/brand/UISLogo';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  XCircle,
  PackageCheck,
  RotateCcw,
  AlertTriangle,
  User,
  Calendar,
  Phone,
  GraduationCap,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { formatDate, formatDateTime, formatRupiah } from '@/src/lib/utils';
import { EquipmentCondition } from '@/src/types';

export const StaffBorrowingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState(() => StorageService.getRequestById(id || ''));
  const [adminNotes, setAdminNotes] = useState(request?.adminNotes || '');
  const [fineAmount, setFineAmount] = useState<number>(request?.fineAmount || 0);

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Tiket Peminjaman Tidak Ditemukan</h2>
        <Button variant="primary" onClick={() => navigate('/staff/requests')}>
          Kembali ke Daftar Permohonan
        </Button>
      </div>
    );
  }

  const handleUpdateStatus = (newStatus: any, defaultNote?: string) => {
    const noteToSave = adminNotes || defaultNote;
    const updated = StorageService.updateRequestStatus(request.id, newStatus, noteToSave, fineAmount);
    if (updated) {
      setRequest(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 print:hidden">
        <button
          onClick={() => navigate('/staff/requests')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-cyan-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Permohonan</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4 text-cyan-700" />}
          >
            Cetak Berita Acara (PDF)
          </Button>
        </div>
      </div>

      {/* Main Ticket Paper */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header Ticket */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <UISLogo size="md" />
            <p className="text-xs text-slate-500 font-medium mt-1">
              Lembar Verifikasi & Sirkulasi Alat Laboratorium Kesehatan UIS
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="font-mono text-lg font-extrabold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-xl border border-cyan-200 inline-block">
              {request.ticketNumber}
            </span>
            <div className="mt-2">
              <BorrowingStatusBadge status={request.status} size="md" />
            </div>
          </div>
        </div>

        {/* Borrower & Academic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1">
              Data Mahasiswa Pemohon
            </h4>
            <p><strong>Nama:</strong> {request.userName}</p>
            <p><strong>NIM:</strong> {request.userNim}</p>
            <p><strong>Program Studi:</strong> {request.userDepartment}</p>
            <p><strong>Nomor WhatsApp:</strong> {request.userPhone}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1">
              Jadwal & Penanggung Jawab
            </h4>
            <p><strong>Tujuan:</strong> {request.purpose}</p>
            <p><strong>Mata Kuliah:</strong> {request.courseName}</p>
            <p><strong>Dosen Pembimbing:</strong> {request.supervisorLecturer}</p>
            <p><strong>Waktu Pinjam:</strong> {formatDate(request.borrowDate)} s/d {formatDate(request.expectedReturnDate)}</p>
          </div>
        </div>

        {/* Equipment List */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-slate-900 text-sm">
            Daftar Peralatan Medis dalam Tiket
          </h4>
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
            {request.items.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.imageUrl}
                    alt={item.equipmentName}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded">
                      {item.equipmentCode}
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5 truncate">{item.equipmentName}</p>
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Verification Controls Box (Hidden when printing) */}
        <div className="p-5 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 space-y-4 print:hidden">
          <h4 className="font-heading font-bold text-sm text-cyan-900">
            Aksi Verifikasi Staff Laboratorium
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="Catatan Verifikasi / Alasan"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Tambahkan catatan khusus kondisi alat atau instruksi..."
            />

            <div className="space-y-2">
              <Input
                label="Penetapan Denda / Kerusakan (Rp)"
                type="number"
                value={fineAmount}
                onChange={(e) => setFineAmount(Number(e.target.value))}
                placeholder="0"
              />
              <p className="text-[11px] text-slate-500">
                Isi nilai denda jika alat terlambat dikembalikan atau mengalami kerusakan.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            {request.status === 'PENDING' && (
              <>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleUpdateStatus('READY_TO_PICKUP', 'Disetujui staff lab.')}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Setujui & Siapkan di Meja Lab
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => handleUpdateStatus('REJECTED', 'Ditolak oleh staff lab.')}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  Tolak Permohonan
                </Button>
              </>
            )}

            {request.status === 'READY_TO_PICKUP' && (
              <Button
                variant="secondary"
                size="md"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleUpdateStatus('BORROWED', 'Serah terima alat selesai.')}
                leftIcon={<PackageCheck className="w-4 h-4" />}
              >
                Konfirmasi Serah Terima ke Mahasiswa (Status: Dipinjam)
              </Button>
            )}

            {(request.status === 'BORROWED' || request.status === 'OVERDUE') && (
              <Button
                variant="primary"
                size="md"
                onClick={() => handleUpdateStatus('RETURNED', 'Pengembalian selesai dan diperiksa.')}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Selesaikan Pengembalian (Inspeksi Baik)
              </Button>
            )}
          </div>
        </div>

        {/* Signatures for Print */}
        <div className="hidden print:grid grid-cols-2 gap-8 pt-12 border-t border-slate-300 text-center text-xs">
          <div className="space-y-16">
            <p className="font-semibold text-slate-700">Mahasiswa Pemohon</p>
            <p className="font-bold underline text-slate-900">{request.userName}</p>
          </div>
          <div className="space-y-16">
            <p className="font-semibold text-slate-700">Staff Laboratorium UIS</p>
            <p className="font-bold underline text-slate-900">
              {request.handoverStaffName || request.returnStaffName || 'Petugas Laboratorium UIS'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
