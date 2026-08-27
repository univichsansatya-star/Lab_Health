import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/src/context/CartContext';
import { StorageService } from '@/src/services/storage';
import { Equipment, EquipmentCategory } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Input, Select } from '@/src/components/ui/Input';
import { ConditionBadge } from '@/src/components/ui/StatusBadge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Plus,
  ShoppingBag,
  MapPin,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  Sparkles,
  ShieldCheck,
  Tag,
  Stethoscope,
} from 'lucide-react';

const CATEGORIES: EquipmentCategory[] = [
  'Nursing Skills',
  'Maternity & Child Health',
  'Emergency & Critical Care',
  'Anatomy & Physiology',
  'Diagnostic & Vital Signs',
  'Surgical & Sterile Instruments',
  'Pharmacology & Labware',
];

export const EquipmentCatalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem, setIsDrawerOpen } = useCart();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'low_stock'>('all');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name_asc' | 'available_desc' | 'popular'>('name_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const allEquipment = StorageService.getEquipment();

  const filteredEquipment = useMemo(() => {
    return allEquipment
      .filter((item) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCode = item.code.toLowerCase().includes(q);
          const matchBrand = item.brand.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchBrand && !matchDesc) return false;
        }

        // Category
        if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
          return false;
        }

        // Availability
        if (availabilityFilter === 'available' && item.availableQuantity <= 0) {
          return false;
        }
        if (availabilityFilter === 'low_stock' && (item.availableQuantity > 2 || item.availableQuantity <= 0)) {
          return false;
        }

        // Condition
        if (conditionFilter !== 'ALL' && item.condition !== conditionFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'available_desc') return b.availableQuantity - a.availableQuantity;
        if (sortBy === 'popular') return b.borrowedQuantity - a.borrowedQuantity;
        return 0;
      });
  }, [allEquipment, searchQuery, selectedCategory, availabilityFilter, conditionFilter, sortBy]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'ALL') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200 mb-1.5">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Inventaris Laboratorium Keperawatan UIS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Katalog Alat & Simulator Medis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pilih peralatan untuk praktikum mandiri, skill lab, atau ujian OSCE klinis
          </p>
        </div>

        {/* View Mode & Count */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">
            Menampilkan <strong className="text-slate-900">{filteredEquipment.length}</strong> alat
          </span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-cyan-800' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Tampilan Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-xs text-cyan-800' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Tampilan List"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => handleCategorySelect('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Kategori ({allEquipment.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = allEquipment.filter((e) => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search */}
        <div className="lg:col-span-5">
          <Input
            placeholder="Cari nama alat, kode, merk (contoh: Laerdal, EKG, SpO2)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Availability */}
        <div className="lg:col-span-3">
          <Select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as any)}
          >
            <option value="all">Semua Ketersediaan</option>
            <option value="available">Hanya yang Siap Dipinjam (Stok &gt; 0)</option>
            <option value="low_stock">Stok Menipis (1-2 Unit)</option>
          </Select>
        </div>

        {/* Condition */}
        <div className="lg:col-span-2">
          <Select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}>
            <option value="ALL">Semua Kondisi</option>
            <option value="EXCELLENT">Sangat Baik (100%)</option>
            <option value="GOOD">Baik & Siap Pakai</option>
            <option value="FAIR">Cukup</option>
          </Select>
        </div>

        {/* Sort */}
        <div className="lg:col-span-2">
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="name_asc">Nama (A - Z)</option>
            <option value="available_desc">Stok Terbanyak</option>
            <option value="popular">Paling Sering Dipinjam</option>
          </Select>
        </div>
      </div>

      {/* Catalog Items Display */}
      {filteredEquipment.length === 0 ? (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title="Tidak Ada Alat yang Sesuai"
          description="Coba ubah kata kunci pencarian atau reset filter kategori untuk menemukan alat lain."
          actionLabel="Reset Semua Filter"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('ALL');
            setAvailabilityFilter('all');
            setConditionFilter('ALL');
          }}
        />
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredEquipment.map((eq) => (
            <div
              key={eq.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:border-cyan-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => navigate(`/catalog/${eq.id}`)}>
                  <img
                    src={eq.imageUrl}
                    alt={eq.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-bold text-slate-800 shadow-2xs">
                      {eq.category}
                    </span>
                    {eq.requiresSpecialApproval && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-bold shadow-2xs">
                        Perlu Mandat Dosen
                      </span>
                    )}
                  </div>

                  <span
                    className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                      eq.availableQuantity > 0
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {eq.availableQuantity > 0 ? `${eq.availableQuantity} Unit Tersedia` : 'Sedang Habis'}
                  </span>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded">
                      {eq.code}
                    </span>
                    <span className="text-slate-400 font-medium">{eq.brand}</span>
                  </div>

                  <h3
                    onClick={() => navigate(`/catalog/${eq.id}`)}
                    className="font-heading font-bold text-sm text-slate-900 line-clamp-2 leading-snug cursor-pointer group-hover:text-cyan-700 transition-colors"
                  >
                    {eq.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {eq.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{eq.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => navigate(`/catalog/${eq.id}`)}
                  >
                    Lihat Detail
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={eq.availableQuantity <= 0}
                    onClick={() => {
                      addItem(eq, 1);
                      setIsDrawerOpen(true);
                    }}
                    className="text-xs"
                  >
                    + Pinjam
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Layout */
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          {filteredEquipment.map((eq) => (
            <div
              key={eq.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-start gap-4 min-w-0">
                <img
                  src={eq.imageUrl}
                  alt={eq.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-slate-100 flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/catalog/${eq.id}`)}
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                      {eq.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {eq.category}
                    </span>
                    <ConditionBadge condition={eq.condition} />
                  </div>
                  <h3
                    onClick={() => navigate(`/catalog/${eq.id}`)}
                    className="font-heading font-bold text-base text-slate-900 cursor-pointer group-hover:text-cyan-700 transition-colors line-clamp-1"
                  >
                    {eq.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl">{eq.description}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{eq.location}</span>
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      eq.availableQuantity > 0
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {eq.availableQuantity > 0 ? `${eq.availableQuantity} Unit Tersedia` : 'Stok Kosong'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Total: {eq.totalQuantity} unit di lab</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/catalog/${eq.id}`)}>
                    Detail
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={eq.availableQuantity <= 0}
                    onClick={() => {
                      addItem(eq, 1);
                      setIsDrawerOpen(true);
                    }}
                  >
                    + Pinjam
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
