import React from 'react';
import { useCart } from '@/src/context/CartContext';
import { Button } from '@/src/components/ui/Button';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { items, isDrawerOpen, setIsDrawerOpen, removeItem, updateQuantity, clearCart, totalItemsCount } =
    useCart();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    navigate('/student/request-wizard');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transform animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-base">Keranjang Peminjaman</h3>
                <p className="text-xs text-slate-500">{totalItemsCount} alat terpilih untuk praktikum</p>
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h4 className="font-heading font-bold text-slate-800 text-base">Keranjang Masih Kosong</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Pilih alat laboratorium keperawatan & kesehatan dari katalog untuk memulai permohonan pinjam.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/catalog');
                  }}
                  className="mt-2"
                >
                  Buka Katalog Alat
                </Button>
              </div>
            ) : (
              items.map(({ equipment, quantity }) => (
                <div
                  key={equipment.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-cyan-200 transition-all flex gap-3 group relative shadow-2xs"
                >
                  <img
                    src={equipment.imageUrl}
                    alt={equipment.name}
                    className="w-20 h-20 rounded-lg object-cover bg-slate-100 flex-shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                          {equipment.code}
                        </span>
                        <button
                          onClick={() => removeItem(equipment.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Hapus dari keranjang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-2 mt-1 leading-snug">
                        {equipment.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{equipment.location}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(equipment.id, quantity - 1)}
                          className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-800">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(equipment.id, quantity + 1)}
                          disabled={quantity >= equipment.availableQuantity}
                          className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">
                        Tersedia: <strong className="text-cyan-700">{equipment.availableQuantity} unit</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Total Item Peralatan</span>
                <span className="font-bold text-slate-900">{totalItemsCount} Unit</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>Pengambilan alat wajib diverifikasi bersama Petugas Lab di lokasi.</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={clearCart}>
                  Kosongkan
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCheckout}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Ajukan Pinjam
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
