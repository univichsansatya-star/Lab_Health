import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import {
  LayoutDashboard,
  Boxes,
  ClipboardCheck,
  RotateCcw,
  Wrench,
  BarChart3,
  Users,
  Settings,
  Sparkles,
  Layers,
  AlertOctagon,
  LifeBuoy,
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { CartDrawer } from '../cart/CartDrawer';

export const StaffLayout: React.FC = () => {
  const { user, role } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard Lab', href: '/staff/dashboard', icon: LayoutDashboard },
    { name: 'Inventaris Peralatan', href: '/staff/inventory', icon: Boxes },
    { name: 'Permintaan Pinjam', href: '/staff/requests', icon: ClipboardCheck },
    { name: 'Meja Pengembalian', href: '/staff/returns', icon: RotateCcw },
    { name: 'Pemeliharaan / Servis', href: '/staff/maintenance', icon: Wrench },
    { name: 'Laporan & Analitik', href: '/staff/reports', icon: BarChart3 },
    { name: 'Manajemen Pengguna', href: '/staff/users', icon: Users },
    { name: 'Pengaturan Sistem', href: '/staff/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <CartDrawer />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Left Sidebar for Staff Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-6">
            {/* Staff Card Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-900 to-slate-900 text-white shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-10 h-10 rounded-xl object-cover border border-cyan-400/30"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate leading-tight">{user?.name}</p>
                  <p className="text-[11px] text-cyan-200 truncate mt-0.5">
                    {role === 'admin' ? 'Koordinator Lab' : 'Staff Lab Ners'}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-cyan-800/60 flex items-center justify-between text-[10px] text-cyan-200">
                <span>NIP: {user?.nim_nip}</span>
                <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono">STAFF-VERIFIED</span>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Modul Pengelolaan
              </p>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/staff/dashboard' && location.pathname.startsWith(item.href));

                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-cyan-50 text-cyan-800 font-bold shadow-2xs border border-cyan-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-cyan-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Quick SOP / Info Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                <LifeBuoy className="w-3.5 h-3.5 text-cyan-600" />
                <span>Bantuan & SOP Lab UIS</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Verifikasi kondisi alat & tanda tangan mahasiswa saat serah terima di meja lab.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
