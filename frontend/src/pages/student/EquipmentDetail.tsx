import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/src/context/CartContext';
import { StorageService } from '@/src/services/storage';
import { Button } from '@/src/components/ui/Button';
import { ConditionBadge } from '@/src/components/ui/StatusBadge';
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Info,
  QrCode,
  Calendar,
  Layers,
  Plus,
  Minus,
} from 'lucide-react';

export const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, setIsDrawerOpen } = useCart();
  const [borrowQty, setBorrowQty] = useState(1);

  const equipment = StorageService.getEquipmentById(id || '');
  const allEquipment = StorageService.getEquipment();

  if (!equipment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Alat Laboratorium Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500">Peralatan dengan kode atau ID tersebut tidak terdaftar di sistem.</p>
        <Button variant="primary" onClick={() => navigate('/catalog')}>
          Kembali ke Katalog
        </Button>
      </div>
    );
  }

  const similarItems = allEquipment
    .filter((e) => e.category === equipment.category && e.id !== equipment.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addItem(equipment, borrowQty);
    setIsDrawerOpen(true);
  };

  const handleDirectRequest = () => {
    addItem(equipment, borrowQty);
    navigate('/student/request-wizard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Breadcrumbs / Back button */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 hover:text-cyan-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <span>/</span>
        <Link to="/catalog" className="hover:text-cyan-700">Katalog</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{equipment.name}</span>
      </div>

      {/* Main Detail Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Large Image & Badges */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-sm aspect-4/3 sm:aspect-square">
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <span className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-xs text-xs font-bold text-slate-900 shadow-xs">
                {equipment.category}
              </span>
              {equipment.requiresSpecialApproval && (
                <span className="px-3 py-1 rounded-xl bg-amber-500 text-white text-[11px] font-bold shadow-xs">
                  Memerlukan Persetujuan Dosen
                </span>
              )}
            </div>
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-xl text-xs font-mono font-bold text-slate-800 shadow-xs border border-slate-200">
              QR: {equipment.qrCode}
            </div>
          </div>

          {/* Quick Lab Location Box */}
          <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-cyan-900 uppercase tracking-wider">Lokasi Penyimpanan di Lab</h4>
              <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-snug">{equipment.location}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Petugas: Ns. Hendra Wijaya / Ibu Ratna Dewi</p>
            </div>
          </div>
        </div>

        {/* Right: Info & Request CTA Box */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200">
                {equipment.code}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Merk: <strong className="text-slate-800">{equipment.brand}</strong> ({equipment.model})
              </span>
              <ConditionBadge condition={equipment.condition} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading leading-snug">
              {equipment.name}
            </h1>

            <p className="text-slate-600 text-sm leading-relaxed pt-1">{equipment.description}</p>
          </div>

          {/* Stock Summary Metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="text-center border-r border-slate-100 pr-2">
              <p className="text-[11px] text-slate-500 font-medium">Tersedia Siap Pinjam</p>
              <p className={`text-xl font-extrabold font-heading mt-0.5 ${equipment.availableQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {equipment.availableQuantity} <span className="text-xs font-normal text-slate-500">Unit</span>
              </p>
            </div>
            <div className="text-center border-r border-slate-100 px-2">
              <p className="text-[11px] text-slate-500 font-medium">Sedang Dipinjam</p>
              <p className="text-xl font-extrabold text-indigo-600 font-heading mt-0.5">
                {equipment.borrowedQuantity} <span className="text-xs font-normal text-slate-500">Unit</span>
              </p>
            </div>
            <div className="text-center pl-2">
              <p className="text-[11px] text-slate-500 font-medium">Total Inventaris Lab</p>
              <p className="text-xl font-extrabold text-slate-800 font-heading mt-0.5">
                {equipment.totalQuantity} <span className="text-xs font-normal text-slate-500">Unit</span>
              </p>
            </div>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 block">Jumlah yang Ingin Dipinjam:</label>
                <p className="text-[11px] text-slate-500">Maksimal {equipment.availableQuantity} unit per permohonan</p>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
                <button
                  type="button"
                  onClick={() => setBorrowQty(Math.max(1, borrowQty - 1))}
                  disabled={borrowQty <= 1}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-slate-900">{borrowQty}</span>
                <button
                  type="button"
                  onClick={() => setBorrowQty(Math.min(equipment.availableQuantity, borrowQty + 1))}
                  disabled={borrowQty >= equipment.availableQuantity}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                disabled={equipment.availableQuantity <= 0}
                onClick={handleAddToCart}
                leftIcon={<ShoppingBag className="w-5 h-5 text-cyan-600" />}
              >
                Masukkan ke Keranjang
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={equipment.availableQuantity <= 0}
                onClick={handleDirectRequest}
              >
                Ajukan Pinjam Sekarang
              </Button>
            </div>

            {equipment.availableQuantity <= 0 && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Seluruh unit saat ini sedang digunakan dalam sesi praktikum lain.</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Specifications & Usage Guidelines Tabs/Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Specifications */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-heading font-bold text-base border-b border-slate-100 pb-3">
            <Layers className="w-5 h-5 text-cyan-600" />
            <span>Spesifikasi & Kelengkapan Alat</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {equipment.specifications.map((spec, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{spec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* SOP & Usage Guidelines */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-heading font-bold text-base border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>Panduan SOP & Keamanan Praktikum</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {equipment.usageGuidelines.map((guide, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                <span>{guide}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Similar Equipment */}
      {similarItems.length > 0 && (
        <div className="space-y-4 pt-6">
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Peralatan Terkait di Kategori {equipment.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similarItems.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/catalog/${item.id}`)}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-cyan-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 group"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-mono font-bold text-cyan-700">{item.code}</p>
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-cyan-700 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    {item.availableQuantity} Unit Tersedia
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
