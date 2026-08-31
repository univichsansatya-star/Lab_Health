import React from 'react';
import { useNotifications } from '@/src/context/NotificationContext';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
  Sparkles,
  Check,
} from 'lucide-react';
import { formatDateTime } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

export const StudentNotifications: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'WARNING':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'DANGER':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      default:
        return <Info className="w-5 h-5 text-cyan-600" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-emerald-50 border-emerald-200';
      case 'WARNING':
        return 'bg-amber-50 border-amber-200';
      case 'DANGER':
        return 'bg-rose-50 border-rose-200';
      default:
        return 'bg-cyan-50 border-cyan-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Notifikasi & Pengumuman Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pemberitahuan status approval permohonan, pengingat jadwal kembali, dan update lab
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              leftIcon={<Check className="w-4 h-4 text-cyan-600" />}
            >
              Tandai Semua Dibaca
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-slate-400 hover:text-rose-600"
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Hapus Semua
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title="Tidak Ada Notifikasi"
          description="Semua pemberitahuan penting terkait peminjaman alat akan muncul di sini."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.link) navigate(n.link);
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !n.isRead
                  ? `${getBg(n.type)} shadow-xs`
                  : 'bg-white border-slate-200/80 opacity-80 hover:opacity-100 hover:border-slate-300'
              }`}
            >
              <div className="p-2 rounded-xl bg-white shadow-2xs flex-shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-heading font-bold text-sm text-slate-900 truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                {!n.isRead && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full">
                    Baru
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
