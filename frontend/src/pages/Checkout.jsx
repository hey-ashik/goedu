import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CircleCheck, CreditCard, Loader2, Lock, Smartphone, Wallet } from 'lucide-react';
import Seo from '../components/common/Seo';
import { Taka } from '../components/common/CourseCard';
import { OrderApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { cn, formatPrice, img } from '../utils/format';

const METHODS = [
  { id: 'sslcommerz', label: 'Card / Mobile banking (SSLCommerz)', Icon: CreditCard, note: 'Visa, Mastercard, Amex, bKash, Nagad, Rocket' },
  { id: 'bkash', label: 'bKash', Icon: Smartphone, note: 'Pay with your bKash wallet' },
  { id: 'nagad', label: 'Nagad', Icon: Wallet, note: 'Pay with your Nagad wallet' },
];

export default function Checkout() {
  const { cart, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState('sslcommerz');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const pay = async () => {
    setBusy(true);
    try {
      const res = await OrderApi.checkout({ payment_method: method });
      setDone(res.order);
      toast.success(res.message);
      refresh();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-32 pb-16">
        <Seo title="Order confirmed" noIndex />
        <div className="max-w-lg mx-auto px-4 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-10 shadow-xl">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6"><CircleCheck className="w-10 h-10" /></div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Payment successful!</h1>
          <p className="text-gray-500 mb-1">Order <span className="font-mono font-bold text-gray-800 dark:text-gray-100">{done.order_number}</span></p>
          <p className="text-gray-500 mb-8">You are now enrolled in {done.enrolled} course{done.enrolled === 1 ? '' : 's'}. Happy learning!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dashboard/my-learning" className="px-6 py-3 rounded-xl bg-[#F3AC08] text-white font-bold">Start Learning</Link>
            <Link to="/dashboard/orders" className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-200">View Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-32 pb-16 text-center">
        <Seo title="Checkout" noIndex />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h1>
        <Link to="/courses" className="text-[#F3AC08] font-semibold">Browse courses</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-28 pb-16">
      <Seo title="Checkout" noIndex />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Billing details</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500 text-xs mb-1">Name</p><p className="font-semibold text-gray-900 dark:text-white">{user.name}</p></div>
                <div><p className="text-gray-500 text-xs mb-1">Email</p><p className="font-semibold text-gray-900 dark:text-white">{user.email}</p></div>
                {user.phone && <div><p className="text-gray-500 text-xs mb-1">Phone</p><p className="font-semibold text-gray-900 dark:text-white">{user.phone}</p></div>}
              </div>
              <Link to="/dashboard/profile" className="text-xs text-[#F3AC08] font-semibold mt-3 inline-block">Edit profile</Link>
            </section>
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Payment method</h2>
              <div className="space-y-3">
                {METHODS.map((m) => (
                  <label key={m.id} className={cn('flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all', method === m.id ? 'border-[#F3AC08] bg-amber-50/60 dark:bg-gray-900' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300')}>
                    <input type="radio" name="method" className="sr-only" checked={method === m.id} onChange={() => setMethod(m.id)} />
                    <div className="w-11 h-11 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#F3AC08]"><m.Icon className="w-5 h-5" /></div>
                    <div className="flex-1"><p className="font-semibold text-gray-900 dark:text-white text-sm">{m.label}</p><p className="text-xs text-gray-500">{m.note}</p></div>
                    <span className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', method === m.id ? 'border-[#F3AC08]' : 'border-gray-300')}>{method === m.id && <span className="w-2.5 h-2.5 rounded-full bg-[#F3AC08]" />}</span>
                  </label>
                ))}
              </div>
              <img src="/images/SSLCommerz.png" alt="SSLCommerz Payment Methods" className="w-full mt-6 mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:rounded-lg dark:p-2" />
              <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1"><Lock className="w-3 h-3" /> Demo checkout: the order is marked paid instantly. Connect your SSLCommerz store credentials in the backend to take live payments.</p>
            </section>
          </div>
          <aside className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 lg:sticky lg:top-28">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order summary</h2>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.items.map((i) => (
                  <div key={i.id} className="flex gap-3 items-center">
                    <img src={img(i.thumbnail)} alt="" className="w-14 h-10 rounded-lg object-cover" />
                    <p className="flex-1 text-sm text-gray-800 dark:text-gray-100 line-clamp-2">{i.title}</p>
                    <span className="text-sm font-bold text-gray-900 dark:text-white"><Taka />{formatPrice(i.after_discount_price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Subtotal</span><span><Taka />{formatPrice(cart.subtotal)}</span></div>
                {cart.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-<Taka />{formatPrice(cart.discount)}</span></div>}
                <div className="flex justify-between font-extrabold text-xl text-gray-900 dark:text-white pt-2"><span>Total</span><span><Taka />{formatPrice(cart.total)}</span></div>
              </div>
              <button onClick={pay} disabled={busy} className="mt-6 w-full py-3.5 bg-[#F3AC08] hover:bg-[#d49607] text-white rounded-xl font-extrabold shadow-lg shadow-orange-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Pay <Taka />{formatPrice(cart.total)}
              </button>
              <p className="text-[11px] text-gray-400 text-center mt-3">By paying you agree to the <Link to="/refund-policy" className="underline">refund policy</Link>.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
