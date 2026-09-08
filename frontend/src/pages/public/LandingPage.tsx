import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { UISLogo } from '@/src/components/brand/UISLogo';
import {
  Stethoscope,
  HeartPulse,
  Activity,
  ShieldCheck,
  Clock,
  QrCode,
  ArrowRight,
  Sparkles,
  BookOpen,
  Search,
  CheckCircle2,
  Building2,
  Users,
  Award,
  ChevronRight,
} from 'lucide-react';
import { StorageService } from '@/src/services/storage';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const equipment = StorageService.getEquipment();
  const rooms = StorageService.getRooms();
  const featuredEquipment = equipment[0];

  const categories = [
    {
      title: 'Nursing Skills & KDK',
      count: `${equipment.filter((item) => item.category === 'Nursing Skills').length} Alat`,
      desc: 'Manikin IV arm, infus pump, set kateterisasi, NGT & perawatan luka',
      icon: Stethoscope,
      bg: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Emergency & Critical Care',
      count: `${equipment.filter((item) => item.category === 'Emergency & Critical Care').length} Alat`,
      desc: 'Defibrillator AED trainer, suction pump, syringe pump, simulator CPR',
      icon: HeartPulse,
      bg: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Maternitas & Anak',
      count: `${equipment.filter((item) => item.category === 'Maternity & Child Health').length} Alat`,
      desc: 'Simulator persalinan NOELLE, dopler denyut jantung janin, timbangan bayi',
      icon: Activity,
      bg: 'bg-teal-50 text-teal-600',
    },
    {
      title: 'Diagnostic & Vital Signs',
      count: `${equipment.filter((item) => item.category === 'Diagnostic & Vital Signs').length} Alat`,
      desc: 'Stetoskop Littmann, tensimeter aneroid, EKG 12-lead, pulse oximeter',
      icon: ShieldCheck,
      bg: 'bg-cyan-50 text-cyan-600',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Pilih Alat di Katalog',
      desc: 'Cari alat praktikum sesuai modul keperawatan, cek ketersediaan stok & spesifikasi.',
    },
    {
      step: '02',
      title: 'Ajukan Permohonan',
      desc: 'Isi jadwal praktikum, mata kuliah, dan nama dosen pembimbing secara online.',
    },
    {
      step: '03',
      title: 'Verifikasi & Pengambilan',
      desc: 'Tunjukkan QR tiket di meja lab untuk serah terima bersama petugas lab Ners.',
    },
    {
      step: '04',
      title: 'Pengembalian Tepat Waktu',
      desc: 'Kembalikan alat dalam kondisi bersih & berfungsi baik untuk praktikan lainnya.',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24">
        {/* Soft background glow & shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-100/40 via-teal-50/20 to-transparent blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100/80 border border-cyan-200 text-cyan-900 text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Portal Laboratorium Terpadu Universitas Ichsan Satya</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] font-heading">
                Peminjaman Alat Laboratorium{' '}
                <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-700 bg-clip-text text-transparent">
                  Keperawatan & Kesehatan
                </span>{' '}
                Lebih Cepat & Tertib
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Sistem digitalisasi inventaris dan peminjaman alat praktik klinis untuk mahasiswa keperawatan,
                kebidanan, dan ners UIS. Akses ribuan simulator medis, manikin canggih, dan alat diagnostik berstandar nasional.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => navigate('/catalog')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Jelajahi Katalog Alat
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                >
                  Masuk Portal Mahasiswa / Staff
                </Button>
              </div>

              {/* Trust badges */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  <span>Real-time Stock Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  <span>QR Ticket Fast Pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  <span>Standar OSCE & LAM-PTKes</span>
                </div>
              </div>
            </div>

            {/* Right Card / Interactive Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-white flex items-center justify-center font-bold">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-900">Ringkasan Laboratorium</h4>
                      <p className="text-[11px] text-slate-500">Data langsung dari server Django</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    featuredEquipment
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {featuredEquipment ? 'Data tersedia' : 'Belum ada data'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Data alat:</span>
                    <span className="font-bold text-slate-800">{equipment.length} item</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Ruang laboratorium:</span>
                    <span className="font-bold text-slate-800">{rooms.length} ruang</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Sumber data:</span>
                    <span className="font-mono font-bold text-cyan-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Django API
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Data alat terbaru
                  </p>
                  {featuredEquipment ? (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white">
                      <img
                        src={featuredEquipment.imageUrl}
                        alt={featuredEquipment.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{featuredEquipment.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {featuredEquipment.availableQuantity} unit tersedia • {featuredEquipment.brand}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        Aktif
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                      Belum ada data alat pada database.
                    </div>
                  )}
                </div>

                <Button
                  variant="soft-cyan"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/student/borrowings')}
                >
                  Buka Katalog Alat
                </Button>
              </div>

              {/* Floating pill */}
              <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-3.5 shadow-lg border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Verifikasi QR Code</p>
                  <p className="text-[10px] text-slate-500">Tanpa formulir kertas manual</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Kategori Peralatan Laboratorium
          </h2>
          <p className="text-sm text-slate-600">
            Peralatan lengkap dan terawat secara berkala untuk seluruh rumpun ilmu keperawatan dan kebidanan di UIS.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(`/catalog?category=${encodeURIComponent(cat.title)}`)}
                className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-cyan-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${cat.bg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2.5 group-hover:text-cyan-700 transition-colors font-heading">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{cat.desc}</p>
                </div>

                <div className="flex items-center text-xs font-bold text-cyan-600 gap-1 mt-4 group-hover:translate-x-1 transition-transform">
                  <span>Lihat Katalog</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works 4-Step Flow */}
      <section className="bg-slate-900 text-white py-16 rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 my-12">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-cyan-400 font-bold uppercase tracking-wider text-xs">
            Alur Peminjaman Digital
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            4 Langkah Mudah Meminjam Alat Lab
          </h2>
          <p className="text-slate-400 text-sm">
            Proses terintegrasi untuk menjamin ketersediaan, keselamatan penggunaan, dan tanggung jawab praktikan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className="relative space-y-3">
              <span className="font-heading font-extrabold text-4xl text-cyan-400/40 block">
                {s.step}
              </span>
              <h4 className="font-heading font-bold text-base text-white">{s.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/catalog')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Mulai Ajukan Peminjaman Sekarang
          </Button>
        </div>
      </section>

      {/* Lab Rooms Status Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Status Ruang Laboratorium Terpadu
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Pantau ketersediaan station ruang praktikum dan simulasi klinis UIS secara langsung.
            </p>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1"
          >
            <span>Semua Alat di Lokasi Lab</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:border-cyan-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {room.code}
                  </span>
                  <Badge
                    variant={
                      room.status === 'AVAILABLE'
                        ? 'success'
                        : room.status === 'IN_USE'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {room.status === 'AVAILABLE'
                      ? 'Tersedia'
                      : room.status === 'IN_USE'
                      ? 'Sedang Digunakan'
                      : 'Pemeliharaan'}
                  </Badge>
                </div>

                <h4 className="font-heading font-bold text-slate-900 text-sm">{room.name}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {room.building}, {room.floor}
                </p>

                {room.activeClass && (
                  <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                    <strong>Kegiatan Aktif:</strong> {room.activeClass}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Kapasitas: {room.capacity} Mahasiswa</span>
                <span className="font-medium text-slate-700">PIC: {room.supervisor.split(',')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-cyan-700 via-teal-700 to-blue-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Siap Memulai Praktik Mandiri & OSCE?
            </h3>
            <p className="text-cyan-100 text-sm leading-relaxed">
              Login dengan NIM Anda untuk memilih alat, menjadwalkan stase praktikum, dan mengunduh slip serah terima alat secara instan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-cyan-900 hover:bg-cyan-50 border-white"
              onClick={() => navigate('/login')}
            >
              Masuk Akun UIS
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
              onClick={() => navigate('/register')}
            >
              Registrasi Mahasiswa Baru
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
