import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { StudentBottomNav } from './StudentBottomNav';
import { CartDrawer } from '../cart/CartDrawer';
import { UISLogo } from '../brand/UISLogo';
import { Heart, Phone, Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

export const MainLayout: React.FC = () => {
  const { role } = useAuth();
  const isStudent = role === 'student';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-cyan-100 selection:text-cyan-900">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 pb-20 md:pb-12">
        <Outlet />
      </main>

      {/* Student Mobile Bottom Bar */}
      {isStudent && <StudentBottomNav />}

      {/* Modern Friendly Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            {/* Column 1: Brand info */}
            <div className="md:col-span-2 space-y-4">
              <UISLogo size="md" variant="white" />
              <p className="text-slate-400 max-w-md leading-relaxed text-xs">
                Sistem Informasi Peminjaman dan Manajemen Inventaris Peralatan Laboratorium Keperawatan, Maternitas,
                dan Gawat Darurat Terpadu Universitas Ichsan Satya. Menunjang pembelajaran klinis berstandar OSCE & LAM-PTKes.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Terakreditasi Baik Sekali & Sertifikasi Keamanan Lab</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-white uppercase tracking-wider text-[11px]">
                Navigasi Cepat
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to="/catalog" className="hover:text-cyan-400 transition-colors">
                    Katalog Alat Laboratorium
                  </Link>
                </li>
                <li>
                  <Link to="/student/dashboard" className="hover:text-cyan-400 transition-colors">
                    Dashboard Mahasiswa
                  </Link>
                </li>
                <li>
                  <Link to="/student/borrowings" className="hover:text-cyan-400 transition-colors">
                    Lacak Tiket Peminjaman
                  </Link>
                </li>
                <li>
                  <Link to="/staff/dashboard" className="hover:text-cyan-400 transition-colors">
                    Portal Staff & Admin Lab
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact & Location */}
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-white uppercase tracking-wider text-[11px]">
                Kontak & Layanan Lab
              </h4>
              <div className="space-y-2 text-slate-400 leading-relaxed">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>Gedung B & C Kampus Terpadu UIS, Jl. KH. Hasyim Ashari No. 12</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Kontak layanan dikelola oleh administrator laboratorium.</span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Universitas Ichsan Satya. Hak Cipta Dilindungi.</p>
            <div className="flex items-center gap-1 text-slate-400">
              <span>Dibangun dengan dedikasi untuk Ners & Tenaga Kesehatan Indonesia</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
