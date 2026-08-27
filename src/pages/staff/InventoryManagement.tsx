import React, { useState, useMemo } from 'react';
import { StorageService } from '@/src/services/storage';
import { Equipment, EquipmentCategory, EquipmentCondition } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Input, Select, Textarea } from '@/src/components/ui/Input';
import { Modal } from '@/src/components/ui/Modal';
import { ConditionBadge } from '@/src/components/ui/StatusBadge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import {
  Boxes,
  Search,
  Plus,
  Edit2,
  Trash2,
  QrCode,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  MapPin,
  Eye,
} from 'lucide-react';
import { LAB_ROOMS } from '@/src/services/mockData';

const CATEGORIES: EquipmentCategory[] = [
  'Nursing Skills',
  'Maternity & Child Health',
  'Emergency & Critical Care',
  'Anatomy & Physiology',
  'Diagnostic & Vital Signs',
  'Surgical & Sterile Instruments',
  'Pharmacology & Labware',
];

export const InventoryManagement: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => StorageService.getEquipment());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Nursing Skills' as EquipmentCategory,
    brand: '',
    model: '',
    totalQuantity: 5,
    availableQuantity: 5,
    borrowedQuantity: 0,
    maintenanceQuantity: 0,
    condition: 'EXCELLENT' as EquipmentCondition,
    location: 'Lab KDK Gd. B Lt. 2 - Lemari A1',
    description: '',
    specifications: 'Standar OSCE, Bersertifikat Kemenkes',
    usageGuidelines: 'Wajib dibersihkan setelah digunakan dengan desinfektan alkohol 70%',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    requiresSpecialApproval: false,
  });

  const filtered = useMemo(() => {
    return equipmentList.filter((item) => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (conditionFilter !== 'ALL' && item.condition !== conditionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchBrand = item.brand.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchBrand && !matchLoc) return false;
      }
      return true;
    });
  }, [equipmentList, categoryFilter, conditionFilter, searchQuery]);

  const handleOpenAdd = () => {
    const newCode = `UIS-LAB-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      code: newCode,
      name: '',
      category: 'Nursing Skills',
      brand: 'Standard Lab',
      model: 'Model 2026',
      totalQuantity: 5,
      availableQuantity: 5,
      borrowedQuantity: 0,
      maintenanceQuantity: 0,
      condition: 'EXCELLENT',
      location: 'Lab KDK Gd. B Lt. 2 - Rak A1',
      description: '',
      specifications: 'Standar OSCE Nasional, Buku Panduan Praktikum',
      usageGuidelines: 'Gunakan sarung tangan steril saat simulasi.',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
      requiresSpecialApproval: false,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const created = StorageService.createEquipment({
      code: formData.code,
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      model: formData.model,
      totalQuantity: Number(formData.totalQuantity),
      availableQuantity: Number(formData.totalQuantity),
      borrowedQuantity: 0,
      maintenanceQuantity: 0,
      condition: formData.condition,
      location: formData.location,
      description: formData.description,
      specifications: formData.specifications.split('\n').filter(Boolean),
      usageGuidelines: formData.usageGuidelines.split('\n').filter(Boolean),
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
      requiresSpecialApproval: formData.requiresSpecialApproval,
      isConsumable: false,
      qrCode: `QR-${formData.code}`,
      createdAt: new Date().toISOString(),
      lastInspectionDate: new Date().toISOString().slice(0, 10),
    });

    setEquipmentList(StorageService.getEquipment());
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setFormData({
      code: eq.code,
      name: eq.name,
      category: eq.category,
      brand: eq.brand,
      model: eq.model,
      totalQuantity: eq.totalQuantity,
      availableQuantity: eq.availableQuantity,
      borrowedQuantity: eq.borrowedQuantity,
      maintenanceQuantity: eq.maintenanceQuantity,
      condition: eq.condition,
      location: eq.location,
      description: eq.description,
      specifications: eq.specifications.join('\n'),
      usageGuidelines: eq.usageGuidelines.join('\n'),
      imageUrl: eq.imageUrl,
      requiresSpecialApproval: eq.requiresSpecialApproval,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;
    const updated = StorageService.updateEquipment(selectedEquipment.id, {
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      model: formData.model,
      totalQuantity: Number(formData.totalQuantity),
      availableQuantity: Number(formData.availableQuantity),
      condition: formData.condition,
      location: formData.location,
      description: formData.description,
      specifications: formData.specifications.split('\n').filter(Boolean),
      usageGuidelines: formData.usageGuidelines.split('\n').filter(Boolean),
      imageUrl: formData.imageUrl,
      requiresSpecialApproval: formData.requiresSpecialApproval,
    });

    if (updated) {
      setEquipmentList(StorageService.getEquipment());
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data alat ini dari inventaris lab?')) {
      StorageService.deleteEquipment(id);
      setEquipmentList(StorageService.getEquipment());
    }
  };

  const handleOpenQr = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setIsQrModalOpen(true);
  };

  const exportCSV = () => {
    const headers = 'ID,Kode,Nama Alat,Kategori,Merk,Total,Tersedia,Dipinjam,Kondisi,Lokasi\n';
    const rows = equipmentList
      .map(
        (e) =>
          `"${e.id}","${e.code}","${e.name}","${e.category}","${e.brand}",${e.totalQuantity},${e.availableQuantity},${e.borrowedQuantity},"${e.condition}","${e.location}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inventaris_Lab_UIS_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            Manajemen Inventaris Alat Laboratorium
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {equipmentList.length} jenis simulator medis dan instrumen klinis terdaftar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            leftIcon={<Download className="w-4 h-4 text-cyan-700" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            + Tambah Alat Baru
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6">
          <Input
            placeholder="Cari kode alat, nama, merk, atau lemari simpan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="sm:col-span-3">
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="ALL">Semua Kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-3">
          <Select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}>
            <option value="ALL">Semua Kondisi</option>
            <option value="EXCELLENT">Sangat Baik (100%)</option>
            <option value="GOOD">Baik & Siap Pakai</option>
            <option value="FAIR">Cukup</option>
            <option value="MAINTENANCE_REQUIRED">Perlu Servis</option>
          </Select>
        </div>
      </div>

      {/* Equipment Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Boxes className="w-6 h-6" />}
          title="Tidak Ada Alat yang Sesuai"
          description="Coba ubah kata kunci pencarian atau reset filter kategori."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Peralatan</th>
                  <th className="py-3 px-4">Kategori & Merk</th>
                  <th className="py-3 px-4 text-center">Stok (Tersedia/Total)</th>
                  <th className="py-3 px-4">Kondisi</th>
                  <th className="py-3 px-4">Lokasi Rak</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Item Name & Image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-11 h-11 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded">
                            {item.code}
                          </span>
                          <p className="font-bold text-slate-900 truncate mt-0.5 max-w-[200px]">
                            {item.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Brand */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{item.category}</p>
                      <p className="text-[11px] text-slate-400">{item.brand}</p>
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          item.availableQuantity > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.availableQuantity} / {item.totalQuantity} Unit
                      </span>
                    </td>

                    {/* Condition */}
                    <td className="py-3 px-4">
                      <ConditionBadge condition={item.condition} size="sm" />
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                      {item.location}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenQr(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                          title="Cetak Barcode QR Label"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                          title="Edit Data Alat"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Alat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Equipment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Peralatan Laboratorium Baru"
        size="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Kode Alat / Barcode"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
            <Input
              label="Nama Alat Medis / Simulator"
              placeholder="Contoh: Infusion Pump Otomatis..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Kategori Lab"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>

            <Input
              label="Merk / Pabrikan"
              placeholder="Contoh: Terumo / Laerdal"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
            />

            <Input
              label="Model / Seri"
              placeholder="Contoh: TE-LM700"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Total Unit di Lab"
              type="number"
              min="1"
              value={formData.totalQuantity}
              onChange={(e) => setFormData({ ...formData, totalQuantity: Number(e.target.value) })}
              required
            />

            <Select
              label="Kondisi Fisik"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
            >
              <option value="EXCELLENT">Sangat Baik (100%)</option>
              <option value="GOOD">Baik & Siap Pakai</option>
              <option value="FAIR">Cukup</option>
            </Select>

            <Input
              label="Lokasi Penyimpanan Rak"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <Input
            label="URL Foto Alat"
            placeholder="https://..."
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />

          <Textarea
            label="Deskripsi Singkat"
            placeholder="Fungsi utama alat untuk praktikum..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="md" type="submit">
              Simpan ke Inventaris
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Equipment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Data Peralatan Laboratorium"
        size="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Kode Alat" value={formData.code} disabled />
            <Input
              label="Nama Alat Medis"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Kategori"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>

            <Input
              label="Total Unit"
              type="number"
              value={formData.totalQuantity}
              onChange={(e) => setFormData({ ...formData, totalQuantity: Number(e.target.value) })}
            />

            <Input
              label="Unit Tersedia"
              type="number"
              value={formData.availableQuantity}
              onChange={(e) => setFormData({ ...formData, availableQuantity: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Kondisi"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
            >
              <option value="EXCELLENT">Sangat Baik (100%)</option>
              <option value="GOOD">Baik & Siap Pakai</option>
              <option value="FAIR">Cukup</option>
              <option value="MAINTENANCE_REQUIRED">Perlu Servis</option>
            </Select>

            <Input
              label="Lokasi Rak"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <Textarea
            label="Deskripsi"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="md" type="submit">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Printable Label Modal */}
      {selectedEquipment && (
        <Modal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          title="Label Barcode QR Alat Laboratorium"
          size="sm"
        >
          <div className="text-center space-y-4 py-2">
            <div className="p-4 bg-white border-2 border-dashed border-slate-300 rounded-2xl inline-block shadow-xs">
              <div className="w-40 h-40 border-4 border-slate-900 rounded-xl p-2 grid grid-cols-5 gap-1 mx-auto">
                <div className="bg-slate-950 rounded-xs" />
                <div className="bg-slate-950 rounded-xs" />
                <div className="bg-transparent" />
                <div className="bg-slate-950 rounded-xs" />
                <div className="bg-slate-950 rounded-xs" />
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
              </div>
              <p className="font-mono text-xs font-bold text-slate-900 mt-2">{selectedEquipment.code}</p>
              <p className="text-[11px] font-bold text-cyan-800 truncate max-w-[200px]">
                {selectedEquipment.name}
              </p>
              <p className="text-[10px] text-slate-500">UPT Lab Keperawatan UIS</p>
            </div>

            <p className="text-xs text-slate-500">
              Cetak dan tempelkan label QR ini pada bodi atau kotak penyimpanan peralatan lab untuk scan cepat.
            </p>

            <div className="flex gap-2 justify-center">
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Cetak Stiker Label
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
