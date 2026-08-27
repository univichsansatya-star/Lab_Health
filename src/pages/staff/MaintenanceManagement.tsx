import React, { useState } from 'react';
import { StorageService } from '@/src/services/storage';
import { MaintenanceLog, Equipment } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Input, Select, Textarea } from '@/src/components/ui/Input';
import { Modal } from '@/src/components/ui/Modal';
import { EmptyState } from '@/src/components/ui/EmptyState';
import {
  Wrench,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Calendar,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { formatDate, formatRupiah } from '@/src/lib/utils';

export const MaintenanceManagement: React.FC = () => {
  const [logs, setLogs] = useState<MaintenanceLog[]>(() => StorageService.getMaintenanceLogs());
  const [equipmentList] = useState<Equipment[]>(() => StorageService.getEquipment());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    equipmentId: equipmentList[0]?.id || '',
    type: 'CALIBRATION' as const,
    description: '',
    cost: 150000,
    performedBy: 'Teknisi Medis Eksternal PT. Medika',
    status: 'IN_PROGRESS' as const,
  });

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedEq = equipmentList.find((e) => e.id === formData.equipmentId);
    if (!selectedEq) return;

    const newLog = StorageService.createMaintenanceLog({
      equipmentId: selectedEq.id,
      equipmentName: selectedEq.name,
      equipmentCode: selectedEq.code,
      type: formData.type,
      description: formData.description,
      cost: Number(formData.cost),
      performedBy: formData.performedBy,
      startDate: new Date().toISOString().slice(0, 10),
      status: formData.status,
    });

    setLogs(StorageService.getMaintenanceLogs());
    setIsAddModalOpen(false);
  };

  const handleCompleteLog = (logId: string) => {
    const updated = StorageService.updateMaintenanceLog(logId, {
      status: 'COMPLETED',
      completionDate: new Date().toISOString().slice(0, 10),
    });
    if (updated) {
      setLogs(StorageService.getMaintenanceLogs());
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = l.equipmentName.toLowerCase().includes(q);
      const matchCode = l.equipmentCode.toLowerCase().includes(q);
      const matchDesc = l.description.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            Pemeliharaan & Kalibrasi Alat Lab
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Jadwal servis berkala, riwayat perbaikan simulator, dan pencatatan biaya perawatan
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + Catat Servis / Kalibrasi
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <p className="text-xs text-slate-500 font-medium">Sedang Dalam Perbaikan / Kalibrasi</p>
          <p className="text-2xl font-extrabold text-amber-600 font-heading">
            {logs.filter((l) => l.status === 'IN_PROGRESS').length} Unit
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <p className="text-xs text-slate-500 font-medium">Servis Selesai Tahun Ini</p>
          <p className="text-2xl font-extrabold text-emerald-600 font-heading">
            {logs.filter((l) => l.status === 'COMPLETED').length} Servis
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
          <p className="text-xs text-slate-500 font-medium">Total Anggaran Pemeliharaan</p>
          <p className="text-xl font-extrabold text-slate-900 font-heading">
            {formatRupiah(logs.reduce((sum, l) => sum + (l.cost || 0), 0))}
          </p>
        </div>
      </div>

      {/* Log List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <Input
            placeholder="Cari nama alat, kode, atau deskripsi perbaikan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={<Wrench className="w-6 h-6" />}
            title="Tidak Ada Riwayat Pemeliharaan"
            description="Semua peralatan laboratorium dalam kondisi terkalibrasi dan siap pakai."
          />
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                      {log.equipmentCode}
                    </span>
                    <span className="font-bold text-slate-900">{log.equipmentName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {log.type === 'CALIBRATION' ? 'Kalibrasi Berkala' : log.type === 'REPAIR' ? 'Perbaikan Kerusakan' : 'Inspeksi Rutin'}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed max-w-2xl">{log.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Teknisi: <strong>{log.performedBy}</strong></span>
                    <span>Mulai: {formatDate(log.startDate)}</span>
                    {log.cost && <span>Biaya: <strong>{formatRupiah(log.cost)}</strong></span>}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {log.status === 'IN_PROGRESS' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCompleteLog(log.id)}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Tandai Selesai Servis
                    </Button>
                  ) : (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Selesai Kalibrasi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Service Record Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Catat Pemeliharaan / Kalibrasi Alat Lab"
        size="md"
      >
        <form onSubmit={handleAddLog} className="space-y-4">
          <Select
            label="Pilih Peralatan Medis"
            value={formData.equipmentId}
            onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
            required
          >
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.code} - {eq.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Jenis Kegiatan"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="CALIBRATION">Kalibrasi Berkala</option>
              <option value="REPAIR">Perbaikan Kerusakan</option>
              <option value="INSPECTION">Inspeksi Kelayakan</option>
            </Select>

            <Input
              label="Estimasi Biaya (Rp)"
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Teknisi / Lembaga Kalibrasi"
            value={formData.performedBy}
            onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
            required
          />

          <Textarea
            label="Deskripsi Kendala / Catatan Servis"
            placeholder="Contoh: Penggantian sensor aliran oksigen atau kalibrasi tekanan darah..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="md" type="submit">
              Simpan Jadwal Pemeliharaan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
