import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { useCart } from '@/src/context/CartContext';
import { useNotifications } from '@/src/context/NotificationContext';
import { Button } from '@/src/components/ui/Button';
import { BorrowingStatusBadge } from '@/src/components/ui/StatusBadge';
import { StorageService } from '@/src/services/storage';
import {
  Search,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  QrCode,
  Calendar,
  ChevronRight,
  PackageCheck,
  Building2,
  FileText,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/src/lib/utils';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addItem, setIsDrawerOpen } = useCart();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const allRequests = StorageService.getRequests().filter((r) => r.userId === user?.id);
  const allEquipment = StorageService.getEquipment();

  // Active / in-progress borrowings
  const activeBorrowings = allRequests.filter(
    (r) => r.status === 'BORROWED' || r.status === 'READY_TO_PICKUP' || r.status === 'PENDING'
  );

  const overdueBorrowings = allRequests.filter((r) => r.status === 'OVERDUE');
  const popularEquipment = allEquipment.slice(0, 3);
  const nextReturnItem = allRequests.find((r) => r.status === 'BORROWED') || allRequests[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/catalog');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Top Greeting Header with Sleek KPI summary pills */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-heading">
            Good Morning, {user?.name.split(' ')[0]}!
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-0.5">
            Ready for your Clinical Practicum today at Universitas Ichsan Satya?
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5 shadow-sm min-w-[170px]">
            <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active Loans</p>
              <p className="text-xl font-bold text-slate-900 leading-none mt-1">
                {String(allRequests.filter((r) => r.status === 'BORROWED').length).padStart(2, '0')} Items
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5 shadow-sm min-w-[170px]">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Due Soon</p>
              <p className="text-xl font-bold text-slate-900 leading-none mt-1">
                {String(activeBorrowings.length).padStart(2, '0')} Items
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Alert Banner if Overdue */}
      {overdueBorrowings.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-900 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Peringatan: Alat Praktikum Melewati Batas Pengembalian!</h4>
              <p className="text-xs text-rose-700">
                Tiket #{overdueBorrowings[0].ticketNumber} telah overdue. Segera kembalikan ke Meja Layanan Lab.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => navigate(`/student/borrowings/${overdueBorrowings[0].id}`)}
          >
            Lihat Tiket Overdue
          </Button>
        </div>
      )}

      {/* Main Grid: 8 Cols (Search + Frequently Borrowed + Active Loans) & 4 Cols (Upcoming Return Card + Recent Activity) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Sleek Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-3 bg-white p-2 sm:p-3 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex-1 flex items-center gap-3 px-3">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment (e.g., stethoscope, catheter kit, manikin)..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm placeholder:text-slate-400 text-slate-900"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/catalog')}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Filters
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 text-white text-xs font-bold rounded-lg shadow-md shadow-cyan-200 hover:bg-cyan-700 transition-all"
              >
                Search
              </button>
            </div>
          </form>

          {/* Frequently Borrowed Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 font-heading text-base">Frequently Borrowed</h3>
              <Link to="/catalog" className="text-cyan-600 text-xs font-bold hover:underline">
                View Catalog
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {popularEquipment.map((eq) => (
                <div
                  key={eq.id}
                  onClick={() => navigate(`/catalog/${eq.id}`)}
                  className="group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] bg-slate-50 rounded-2xl mb-3 border border-slate-100 flex items-center justify-center relative overflow-hidden transition-all group-hover:border-cyan-200 group-hover:shadow-md">
                      <div
                        className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] text-white font-bold rounded uppercase tracking-wider ${
                          eq.availableQuantity > 0 ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      >
                        {eq.availableQuantity > 0 ? 'Available' : 'In Use'}
                      </div>
                      <img
                        src={eq.imageUrl}
                        alt={eq.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-cyan-700 transition-colors line-clamp-1">
                      {eq.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {eq.location} • {eq.category}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-cyan-600">{eq.code}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(eq, 1);
                        setIsDrawerOpen(true);
                      }}
                      className="text-xs font-bold text-cyan-600 hover:text-cyan-800"
                    >
                      + Pinjam
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Borrowing Tickets */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 font-heading text-base">Active Borrowings & Passes</h3>
              <Link to="/student/borrowings" className="text-cyan-600 text-xs font-bold hover:underline">
                View All ({allRequests.length})
              </Link>
            </div>

            {activeBorrowings.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                <p className="text-sm font-bold text-slate-700">No active loans found</p>
                <p className="text-xs text-slate-400">Borrow equipment anytime from our online catalog.</p>
                <Button variant="soft-cyan" size="sm" onClick={() => navigate('/catalog')}>
                  Browse Equipment
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBorrowings.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    onClick={() => navigate(`/student/borrowings/${req.id}`)}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-cyan-50/40 border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-cyan-600 font-mono font-bold text-xs">
                        QR
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                            {req.ticketNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{req.purpose}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {req.items.length} Alat • Jatuh tempo: {formatDate(req.expectedReturnDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <BorrowingStatusBadge status={req.status} size="sm" />
                      <span className="text-cyan-600 text-xs font-bold">Detail →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Sleek Upcoming Return Hero Card */}
          <div className="bg-cyan-700 rounded-3xl p-6 text-white shadow-xl shadow-cyan-200/50 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-4 font-heading">Upcoming Return</h3>
              {nextReturnItem ? (
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                      Ticket #{nextReturnItem.ticketNumber}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 bg-amber-500 text-white rounded">
                      {nextReturnItem.status === 'BORROWED' ? 'Return Due' : nextReturnItem.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-white leading-tight">
                      {nextReturnItem.items[0]?.equipmentName || 'Peralatan Praktikum Klinis'}
                    </p>
                    <p className="text-xs text-cyan-100 mt-1">
                      Lokasi: Gedung Lab B & C, Lantai 2
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/student/borrowings/${nextReturnItem.id}`)}
                    className="w-full py-2.5 bg-white text-cyan-700 text-sm font-bold rounded-xl hover:bg-cyan-50 transition-colors"
                  >
                    View Digital Pass & QR
                  </button>
                </div>
              ) : (
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <p className="text-sm text-cyan-100">No active loans due today. All equipment returned safely.</p>
                </div>
              )}
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-600 rounded-full blur-3xl opacity-50 pointer-events-none" />
          </div>

          {/* Sleek Recent Activity Card with Colored Line Indicators */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex-1 flex flex-col">
            <h3 className="font-bold text-slate-900 mb-4 font-heading text-base">Recent Activity</h3>
            <div className="flex flex-col gap-5 overflow-hidden flex-1">
              <div className="flex gap-3.5 items-start">
                <div className="w-1.5 bg-emerald-500 rounded-full h-10 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Borrowing Approved</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    Permintaan alat Ners Lab telah diverifikasi dan disetujui staff lab.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">2 HOURS AGO</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-1.5 bg-amber-400 rounded-full h-10 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Maintenance Alert</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    Surgical Suite A sterilisasi rutin pukul 14:00 - 16:00 WIB.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">5 HOURS AGO</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-1.5 bg-cyan-500 rounded-full h-10 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Item Returned</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    Pengembalian instrumen selesai dan kondisi diverifikasi baik.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">YESTERDAY</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/student/notifications')}
              className="mt-6 w-full py-2.5 text-slate-500 text-xs font-bold hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100"
            >
              View Full History
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

