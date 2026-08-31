import React, { useState } from 'react';
import { StorageService } from '@/src/services/storage';
import { BorrowingRequest, EquipmentCondition } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Input, Select, Textarea } from '@/src/components/ui/Input';
import { BorrowingStatusBadge, ConditionBadge } from '@/src/components/ui/StatusBadge';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Calendar,
  User,
  ShieldCheck,
  Sparkles,
  Printer,
} from 'lucide-react';
import { formatDate, formatRupiah } from '@/src/lib/utils';
import confetti from 'canvas-confetti';

export const ReturnManagement: React.FC = () => {
  const [searchTicket, setSearchTicket] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<BorrowingRequest | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = useState(false);

  // Return inspection state
  const [conditionNotes, setConditionNotes] = useState('');
  const [fineAmount, setFineAmount] = useState(0);

  const allRequests = StorageService.getRequests();
  const activeAndOverdue = allRequests.filter(
    (r) => r.status === 'BORROWED' || r.status === 'OVERDUE' || r.status === 'READY_TO_PICKUP'
  );
  const recentReturned = allRequests.filter((r) => r.status === 'RETURNED').slice(0, 5);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setReturnSuccess(false);

    if (!searchTicket.trim()) return;

    const q = searchTicket.trim().toLowerCase();
    const found = allRequests.find(
      (r) =>
        r.ticketNumber.toLowerCase() === q ||
        r.userNim === q ||
        r.userName.toLowerCase().includes(q)
    );

    if (!found) {
      setSearchError('Tiket tidak ditemukan. Periksa kembali nomor tiket atau NIM.');
      setSelectedTicket(null);
      return;
    }

    setSelectedTicket(found);

    // Calculate auto late fines if overdue
    const expected = new Date(found.expectedReturnDate).getTime();
    const now = Date.now();
    if (now > expected) {
      const diffDays = Math.ceil((now - expected) / (1000 * 60 * 60 * 24));
      const autoFine = diffDays * 10000 * found.items.length;
      setFineAmount(autoFine);
    } else {
      setFineAmount(0);
    }
  };

  const handleProcessReturn = () => {
    if (!selectedTicket) return;

    const note = conditionNotes
      ? `Pengembalian diverifikasi: ${conditionNotes}`
      : 'Pengembalian di Meja Layanan Lab. Seluruh alat diperiksa dalam kondisi baik & lengkap.';

    const updated = StorageService.updateRequestStatus(
      selectedTicket.id,
      'RETURNED',
      note,
      fineAmount
    );

    if (updated) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      setSelectedTicket(updated);
      setReturnSuccess(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
          Meja Layanan Pengembalian Alat Lab
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan QR tiket atau masukkan NIM mahasiswa untuk memverifikasi kondisi fisik dan menyelesaikan pengembalian
        </p>
      </div>

      {/* Quick Lookup Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Masukkan Nomor Tiket (REQ-xxxx) atau NIM Mahasiswa..."
              value={searchTicket}
              onChange={(e) => setSearchTicket(e.target.value)}
              leftIcon={<QrCode className="w-4 h-4 text-cyan-600" />}
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Cari Tiket Lab
          </Button>
        </form>

        {searchError && (
          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>{searchError}</span>
          </p>
        )}

        {/* Quick select from active borrowings */}
        <div className="pt-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Pilih Cepat dari Peminjaman Aktif:
          </p>
          <div className="flex flex-wrap gap-2">
            {activeAndOverdue.slice(0, 4).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSearchTicket(r.ticketNumber);
                  setSelectedTicket(r);
                  setReturnSuccess(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-cyan-50 hover:border-cyan-300 border border-slate-200 text-xs text-slate-700 transition-all flex items-center gap-2"
              >
                <span className="font-mono font-bold text-cyan-800">{r.ticketNumber}</span>
                <span className="font-medium truncate max-w-[120px]">{r.userName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Ticket Return Inspection Desk */}
      {selectedTicket && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-lg border border-cyan-200">
                  {selectedTicket.ticketNumber}
                </span>
                <BorrowingStatusBadge status={selectedTicket.status} size="sm" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 mt-2">
                {selectedTicket.purpose}
              </h3>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500">
              <p className="font-bold text-slate-900">{selectedTicket.userName}</p>
              <p>NIM: {selectedTicket.userNim} • {selectedTicket.userDepartment}</p>
              <p>Jatuh Tempo: <strong>{formatDate(selectedTicket.expectedReturnDate)}</strong></p>
            </div>
          </div>

          {/* Overdue Alert if applicable */}
          {selectedTicket.status === 'OVERDUE' && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-sm">Peringatan Keterlambatan Pengembalian</h4>
                <p>Tiket ini telah melewati batas jatuh tempo. Denda terhitung otomatis Rp 10.000 / hari per alat.</p>
              </div>
            </div>
          )}

          {/* Items to verify */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">
              Checklist Fisik & Kelengkapan Alat
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              {selectedTicket.items.map((item, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.equipmentName}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                    />
                    <div>
                      <span className="font-mono text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded">
                        {item.equipmentCode}
                      </span>
                      <p className="font-bold text-slate-900 mt-0.5">{item.equipmentName}</p>
                      <p className="text-[11px] text-slate-500">Jumlah: {item.quantity} Unit • Lokasi: {item.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600">Kondisi Pengembalian:</span>
                    <select className="text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-bold text-slate-800 focus:ring-cyan-500">
                      <option value="EXCELLENT">Sangat Baik (100%)</option>
                      <option value="GOOD">Baik & Lengkap</option>
                      <option value="FAIR">Cukup / Perlu Pembersihan</option>
                      <option value="DAMAGED">Ada Kerusakan</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Return Verification Actions Form */}
          {selectedTicket.status !== 'RETURNED' ? (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Textarea
                  label="Catatan Kondisi Pengembalian"
                  placeholder="Contoh: Alat diterima lengkap dan bersih, baterai terisi penuh..."
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                />

                <div className="space-y-2">
                  <Input
                    label="Total Denda / Penggantian (Rp)"
                    type="number"
                    value={fineAmount}
                    onChange={(e) => setFineAmount(Number(e.target.value))}
                    placeholder="0"
                  />
                  <p className="text-[11px] text-slate-500">
                    Bila denda keterlambatan atau biaya kerusakan berlaku, masukkan nominal di atas.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setSelectedTicket(null)}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleProcessReturn}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Konfirmasi Pengembalian Selesai
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-xs">Tiket ini telah selesai dikembalikan dan stok alat dipulihkan.</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
                Cetak Bukti Pengembalian
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Recent Returns Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-900">
          Riwayat Pengembalian Terakhir
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {recentReturned.map((req) => (
            <div key={req.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <span className="font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                  {req.ticketNumber}
                </span>
                <span className="font-bold text-slate-900 ml-2">{req.userName}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">{req.purpose}</p>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Selesai
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
