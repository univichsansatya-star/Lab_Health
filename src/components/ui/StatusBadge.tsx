import React from 'react';
import { cn } from '@/src/lib/utils';
import { BorrowingStatus, EquipmentCondition } from '@/src/types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  RotateCcw,
  AlertTriangle,
  Ban,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    primary: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    secondary: 'bg-slate-800 text-white border-slate-700',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    outline: 'bg-transparent text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border tracking-wide whitespace-nowrap transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Specialized Status Badges for Borrowing flow
export const BorrowingStatusBadge: React.FC<{
  status: BorrowingStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}> = ({ status, size = 'md', showIcon = true, className }) => {
  const configs: Record<
    BorrowingStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    PENDING: {
      label: 'Menunggu Persetujuan',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    },
    APPROVED: {
      label: 'Disetujui',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />,
    },
    READY_TO_PICKUP: {
      label: 'Siap Diambil di Lab',
      bg: 'bg-cyan-50',
      text: 'text-cyan-800',
      border: 'border-cyan-300 ring-1 ring-cyan-200',
      icon: <PackageCheck className="w-3.5 h-3.5 text-cyan-600" />,
    },
    BORROWED: {
      label: 'Sedang Dipinjam',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      icon: <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />,
    },
    RETURN_REQUESTED: {
      label: 'Pengajuan Pengembalian',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      icon: <RotateCcw className="w-3.5 h-3.5 text-purple-600" />,
    },
    RETURNED: {
      label: 'Selesai Dikembalikan',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
    },
    OVERDUE: {
      label: 'Terlambat Pengembalian',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-300 ring-1 ring-rose-200 animate-pulse',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
    },
    REJECTED: {
      label: 'Ditolak',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      icon: <XCircle className="w-3.5 h-3.5 text-slate-500" />,
    },
    CANCELLED: {
      label: 'Dibatalkan',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: <Ban className="w-3.5 h-3.5 text-slate-400" />,
    },
  };

  const config = configs[status] || configs.PENDING;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide whitespace-nowrap',
        config.bg,
        config.text,
        config.border,
        sizeClass,
        className
      )}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};

// Condition badge
export const ConditionBadge: React.FC<{
  condition: EquipmentCondition;
  className?: string;
}> = ({ condition, className }) => {
  const configs: Record<EquipmentCondition, { label: string; color: string; icon: React.ReactNode }> = {
    EXCELLENT: {
      label: 'Sangat Baik (100%)',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <ShieldCheck className="w-3 h-3 text-emerald-600" />,
    },
    GOOD: {
      label: 'Baik & Siap Pakai',
      color: 'bg-teal-50 text-teal-800 border-teal-200',
      icon: <CheckCircle2 className="w-3 h-3 text-teal-600" />,
    },
    FAIR: {
      label: 'Cukup / Berfungsi',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: <Clock className="w-3 h-3 text-amber-600" />,
    },
    MAINTENANCE_REQUIRED: {
      label: 'Perlu Kalibrasi/Servis',
      color: 'bg-orange-50 text-orange-800 border-orange-200',
      icon: <Wrench className="w-3 h-3 text-orange-600" />,
    },
    DAMAGED: {
      label: 'Rusak / Non-Aktif',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: <XCircle className="w-3 h-3 text-rose-600" />,
    },
  };

  const c = configs[condition] || configs.GOOD;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md border whitespace-nowrap',
        c.color,
        className
      )}
    >
      {c.icon}
      <span>{c.label}</span>
    </span>
  );
};
