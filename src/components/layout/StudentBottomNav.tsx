import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, ClipboardList, Bell, User } from 'lucide-react';
import { useNotifications } from '@/src/context/NotificationContext';
import { useCart } from '@/src/context/CartContext';

export const StudentBottomNav: React.FC = () => {
  const { unreadCount } = useNotifications();
  const { totalItemsCount } = useCart();

  const navItems = [
    { to: '/student/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/catalog', label: 'Alat Lab', icon: Stethoscope, badge: totalItemsCount > 0 ? totalItemsCount : undefined },
    { to: '/student/borrowings', label: 'Peminjaman', icon: ClipboardList },
    { to: '/student/notifications', label: 'Notifikasi', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { to: '/student/profile', label: 'Profil', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-lg px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-16 py-1 rounded-xl text-[10px] font-semibold transition-all ${
                  isActive
                    ? 'text-cyan-600 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
