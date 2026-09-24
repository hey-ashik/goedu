import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2 } from 'lucide-react';
import Seo from '../components/common/Seo';
import { Taka } from '../components/common/CourseCard';
import { EmptyState } from '../components/common/ui';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, img } from '../utils/format';

export default function Cart() {
  const { cart, remove, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-28 pb-16">
      <Seo title="Shopping Cart" noIndex />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Shopping Cart <span className="text-base font-medium text-gray-500">({cart.count} {cart.count === 1 ? 'item' : 'items'})</span></h1>
        {cart.items.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="Your cart is empty" text="Add some courses to get started" action={<Link to="/courses" className="inline-block px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-semibold">Continue Shopping</Link>} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex gap-4">
                  <Link to={item.type === 'bundle' ? `/bundles/${item.slug}` : `/courses/${item.slug}`}><img src={img(item.thumbnail)} alt={item.title} className="w-28 h-20 rounded-xl object-cover" /></Link>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.type === 'bundle' ? 'Course bundle' : item.instructor}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-gray-900 dark:text-white"><Taka />{formatPrice(item.after_discount_price)}</p>
                    {item.after_discount_price < item.price && <p className="text-xs text-gray-400 line-through"><Taka />{formatPrice(item.price)}</p>}
                    <button onClick={() => remove(item.id)} className="mt-2 text-xs text-red-500 hover:underline flex items-center gap-1 ml-auto"><Trash2 className="w-3 h-3" /> Remove</button>
                  </div>
                </div>
              ))}
              <button onClick={clear} className="text-sm text-gray-500 hover:text-red-500">Clear cart</button>
            </div>
            <aside className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 h-fit lg:sticky lg:top-28">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Subtotal</span><span><Taka />{formatPrice(cart.subtotal)}</span></div>
                {cart.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount{cart.subscription_benefit ? ` (Learner Plus ${cart.subscription_benefit}%)` : ''}</span><span>-<Taka />{formatPrice(cart.discount)}</span></div>}
                <div className="flex justify-between font-extrabold text-lg text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-700 pt-3 mt-3"><span>Total</span><span><Taka />{formatPrice(cart.total)}</span></div>
              </div>
              <button onClick={() => navigate(isAuthenticated ? '/checkout' : '/authentication?callbackUrl=%2Fcheckout')} className="mt-6 w-full py-3.5 bg-[#F3AC08] hover:bg-[#d49607] text-white rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none">Proceed to Checkout</button>
              <Link to="/courses" className="block text-center text-sm text-gray-500 hover:text-[#F3AC08] mt-3">Continue shopping</Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
