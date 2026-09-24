import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Trash2, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useEscape, useLockBody } from '../../hooks/useApi';
import { cn, formatPrice, img } from '../../utils/format';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, remove } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useLockBody(isOpen);
  useEscape(closeCart, isOpen);

  const checkout = () => {
    closeCart();
    navigate(isAuthenticated ? '/checkout' : '/authentication?callbackUrl=%2Fcheckout');
  };

  return (
    <>
      <div onClick={closeCart} className={cn('fixed inset-0 bg-black/50 backdrop-blur-sm z-[99] transition-opacity duration-300', isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')} />
      <div className={cn('fixed top-0 right-0 h-full w-full sm:w-[420px] z-[100] transition-transform duration-500 ease-out bg-white dark:bg-gray-900 shadow-2xl flex flex-col', isOpen ? 'translate-x-0' : 'translate-x-full')}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <nav className="font-bold text-xl text-gray-900 dark:text-white">Shopping Cart</nav>
              <p className="text-sm text-gray-500 dark:text-gray-400">{cart.count} {cart.count === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button onClick={closeCart} aria-label="Close Cart" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl mb-4">
                <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Add some courses to get started</p>
              <button onClick={() => { navigate('/courses'); closeCart(); }} className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-500 hover:to-orange-600 transition-all transform hover:scale-105">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {cart.items.map((item, i) => (
                <div key={item.id} style={{ animationDelay: `${100 * i}ms` }} className="group bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 animate-fadeIn">
                  <div className="flex gap-4">
                    <Link to={item.type === 'bundle' ? `/bundles/${item.slug}` : `/courses/${item.slug}`} onClick={closeCart} className="relative shrink-0">
                      <img src={img(item.thumbnail)} alt={item.title} width={80} height={80} className="w-20 h-20 rounded-xl object-cover shadow-sm" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 text-sm">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{item.type === 'bundle' ? 'Course bundle' : item.instructor}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.after_discount_price < item.price ? (
                            <>
                              <span className="font-bold text-lg bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{formatPrice(item.after_discount_price)}৳</span>
                              <span className="text-xs text-gray-400 line-through">{formatPrice(item.price)}৳</span>
                            </>
                          ) : (
                            <span className="font-bold text-lg bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{item.price === 0 ? 'Free' : `${formatPrice(item.price)}৳`}</span>
                          )}
                        </div>
                        <button onClick={() => remove(item.id)} aria-label="Remove item" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-6 space-y-4 bg-white dark:bg-gray-900">
            {cart.discount > 0 && (
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Discount{cart.subscription_benefit ? ` (Learner Plus ${cart.subscription_benefit}%)` : ''}</span>
                <span className="text-green-600">-{formatPrice(cart.discount)}৳</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Total</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">৳{formatPrice(cart.total)}</span>
            </div>
            <button onClick={checkout} className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-200 dark:shadow-none">
              Proceed to Checkout
            </button>
            <Link to="/cart" onClick={closeCart} className="block text-center text-sm text-gray-500 hover:text-amber-600">View cart</Link>
          </div>
        )}
      </div>
    </>
  );
}
