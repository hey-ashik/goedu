import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CartApi } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const EMPTY = { items: [], count: 0, subtotal: 0, discount: 0, total: 0, subscription_benefit: 0 };

export function CartProvider({ children }) {
  const { status } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await CartApi.get();
      setCart(res.cart || EMPTY);
    } catch { /* keep previous */ }
  }, []);

  // reload when auth status changes (guest cart merges into the account on login)
  useEffect(() => { if (status !== 'loading') refresh(); }, [status, refresh]);

  const add = useCallback(async (payload, { open = true } = {}) => {
    setLoading(true);
    try {
      const res = await CartApi.add(payload);
      setCart(res.cart);
      toast.success(res.message || 'Added to cart');
      if (open) setOpen(true);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      const res = await CartApi.remove(id);
      setCart(res.cart);
    } catch (err) { toast.error(err.message); }
  }, []);

  const clear = useCallback(async () => {
    try { const res = await CartApi.clear(); setCart(res.cart); } catch { /* ignore */ }
  }, []);

  const value = useMemo(
    () => ({
      cart,
      count: cart.count || 0,
      isOpen,
      loading,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      toggleCart: () => setOpen((v) => !v),
      add,
      remove,
      clear,
      refresh,
      inCart: (courseId) => cart.items.some((i) => i.course_id === courseId),
    }),
    [cart, isOpen, loading, add, remove, clear, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};
