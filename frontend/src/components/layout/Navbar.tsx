import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { useCart } from '@/src/context/CartContext';
import { useNotifications } from '@/src/context/NotificationContext';
import { UISLogo } from '@/src/components/brand/UISLogo';
import { Button } from '@/src/components/ui/Button';
import {
  ShoppingBag,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Wrench,
  BarChart3,
  Users,
  Sparkles,
  Search,
  Clock,
  Menu,
  X,
  RotateCcw,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { totalItemsCount, setIsDrawerOpen } = useCart();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isStaff = role === 'nurse_staff' || role === 'admin';

  const roleLabel = {
    student: 'Mahasiswa',
    nurse_staff: 'Staff Lab Ners',
    admin: 'Koordinator Lab / Admin',
  }[role];

  const roleBadgeColor = {
    student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    nurse_staff: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
  }[role];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 focus:outline-none group">
            <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">UIS Health Lab</h1>
              <p className="text-[10px] font-semibold text-cyan-600 uppercase tracking-widest mt-0.5">Universitas Ichsan Satya</p>
            </div>
          </Link>

          {/* Center Navigation Links for Student / Public */}
          {!isStaff && (
            <nav className="hidden md:flex items-center gap-1.5">
              <Link
                to="/catalog"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname.startsWith('/catalog')
                    ? 'bg-cyan-50 text-cyan-700'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Katalog Alat
              </Link>
              <Link
                to="/student/dashboard"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/student/dashboard'
                    ? 'bg-cyan-50 text-cyan-700'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/student/borrowings"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname.startsWith('/student/borrowings')
                    ? 'bg-cyan-50 text-cyan-700'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Peminjaman Saya
              </Link>
            </nav>
          )}

          {/* Quick Staff Navigation */}
          {isStaff && (
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/staff/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname === '/staff/dashboard'
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/staff/inventory"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname.startsWith('/staff/inventory')
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Inventaris
              </Link>
              <Link
                to="/staff/requests"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname.startsWith('/staff/requests')
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Permintaan
              </Link>
              <Link
                to="/staff/returns"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname.startsWith('/staff/returns')
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pengembalian
              </Link>
              <Link
                to="/staff/maintenance"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname.startsWith('/staff/maintenance')
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pemeliharaan
              </Link>
              <Link
                to="/staff/reports"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname.startsWith('/staff/reports')
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Laporan
              </Link>
            </nav>
          )}

          {/* Right Action Icons & Profile Switcher */}
          <div className="flex items-center gap-3">
            {/* Lab Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Lab Status: Open</span>
            </div>

            {/* Current authenticated persona */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${roleBadgeColor}`}>
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden sm:inline">{roleLabel}</span>
            </div>

            {/* Equipment Request Cart Button (For Students / All) */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-cyan-700 transition-colors relative"
              title="Keranjang Peminjaman"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-cyan-700 transition-colors relative"
                title="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full" />
                )}
              </button>

              {isNotifOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setIsNotifOpen(false)}
                >
                  <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-cyan-600" />
                      <span className="font-heading font-bold text-xs text-slate-800">
                        Notifikasi Lab ({notifications.length})
                      </span>
                    </div>
                    <Link
                      to={role === 'student' ? '/student/notifications' : '/staff/notifications'}
                      className="text-[11px] text-cyan-600 font-semibold hover:underline"
                      onClick={() => setIsNotifOpen(false)}
                    >
                      Lihat Semua
                    </Link>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">Tidak ada notifikasi baru</div>
                    ) : (
                      notifications.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            setIsNotifOpen(false);
                            if (n.link) navigate(n.link);
                          }}
                          className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 ${
                            !n.isRead ? 'bg-cyan-50/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-cyan-600 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1.5 block">
                            {new Date(n.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sleek User Profile Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 pl-3 border-l border-slate-200 text-left hover:opacity-90 transition-opacity focus:outline-none"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-900 leading-tight truncate max-w-[140px]">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {role === 'student' ? 'Nursing Student' : role === 'admin' ? 'Lab Coordinator' : 'Lab Staff'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200 flex-shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm">
                      {user?.name.slice(0, 2).toUpperCase() || 'US'}
                    </div>
                  )}
                </div>
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      NIM/NIP: {user?.nim_nip}
                    </span>
                  </div>

                  <div className="space-y-0.5 mt-1">
                    <Link
                      to={role === 'student' ? '/student/profile' : '/staff/settings'}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profil & Pengaturan</span>
                    </Link>
                    <Link
                      to={role === 'student' ? '/student/borrowings' : '/staff/requests'}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <ClipboardList className="w-4 h-4 text-slate-400" />
                      <span>{role === 'student' ? 'Riwayat Peminjaman' : 'Daftar Request Lab'}</span>
                    </Link>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Keluar / Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
            <Link
              to="/catalog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
            >
              Katalog Alat
            </Link>
            {role === 'student' ? (
              <>
                <Link
                  to="/student/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
                >
                  Dashboard Mahasiswa
                </Link>
                <Link
                  to="/student/borrowings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
                >
                  Peminjaman Saya
                </Link>
                <Link
                  to="/student/notifications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
                >
                  Notifikasi ({unreadCount})
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/staff/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
                >
                  Dashboard Staff
                </Link>
                <Link
                  to="/staff/inventory"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
                >
                  Inventaris Alat
                </Link>
                <Link
                  to="/staff/requests"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
                >
                  Permintaan Peminjaman
                </Link>
                <Link
                  to="/staff/returns"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
                >
                  Meja Pengembalian
                </Link>
                <Link
                  to="/staff/maintenance"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
                >
                  Pemeliharaan & Kalibrasi
                </Link>
                <Link
                  to="/staff/reports"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
                >
                  Laporan & Statistik
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
