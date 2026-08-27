import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Equipment } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (equipment: Equipment, quantity?: number) => void;
  removeItem: (equipmentId: string) => void;
  updateQuantity: (equipmentId: string, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CART_STORAGE_KEY = 'uis_healthlab_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addItem = (equipment: Equipment, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.equipment.id === equipment.id);
      if (existing) {
        const newQty = Math.min(equipment.availableQuantity, existing.quantity + quantity);
        return prev.map((item) =>
          item.equipment.id === equipment.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { equipment, quantity: Math.min(equipment.availableQuantity, Math.max(1, quantity)) }];
    });
  };

  const removeItem = (equipmentId: string) => {
    setItems((prev) => prev.filter((item) => item.equipment.id !== equipmentId));
  };

  const updateQuantity = (equipmentId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(equipmentId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.equipment.id === equipmentId) {
          const validQty = Math.min(item.equipment.availableQuantity, quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItemsCount,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
