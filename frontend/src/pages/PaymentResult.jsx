import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CircleCheck, CircleX, Loader2, RotateCcw } from 'lucide-react';
import Seo from '../components/common/Seo';
import { Taka } from '../components/common/CourseCard';
import { OrderApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { formatPrice } from '../utils/format';

export default function PaymentResult() {
  const { outcome } = useParams();
  const [params] = useSearchParams();
  const orderNumber = params.get('order');
  const { refresh: refreshCart } = useCart();
  const { refresh: refreshUser } = useAuth();
  const q = useQuery({ queryKey: ['order', orderNumber], queryFn: () => OrderApi.status(orderNumber), enabled: !!orderNumber, refetchInterval: (d) => (d?.order?.payment_status === 'pending' ? 3000 : false) });
  const order = q.data?.order;
  const paid = order?.payment_status === 'paid';
  useEffect(() => { if (paid) { refreshCart(); refreshUser(); } }, [paid]); // eslint-disable-line react-hooks/exhaustive-deps

  const success = outcome === 'success' && (paid || (!order && !q.isFetched));
  const isSub = order?.items?.some((i) => i.item_type === 'subscription');

  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-32 pb-16">
      <Seo title={success ? 'Payment successful' : 'Payment not completed'} noIndex />
      <div className="max-w-lg mx-auto px-4 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-10 shadow-xl">
        {q.isLoading && orderNumber ? (
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-[#F3AC08]" />
        ) : success ? (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6"><CircleCheck className="w-10 h-10" /></div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Payment successful!</h1>
            {order && <p className="text-gray-500 mb-1">Order <span className="font-mono font-bold text-gray-800 dark:text-gray-100">{order.order_number}</span> · <Taka />{formatPrice(order.total)}</p>}
            <p className="text-gray-500 mb-8">{isSub ? 'Learner Plus is now active on your account.' : 'You are now enrolled. Happy learning!'}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={isSub ? '/dashboard' : '/dashboard/my-learning'} className="px-6 py-3 rounded-xl bg-[#F3AC08] text-white font-bold">{isSub ? 'Go to Dashboard' : 'Start Learning'}</Link>
              <Link to="/dashboard/orders" className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-200">View Orders</Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-6"><CircleX className="w-10 h-10" /></div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{outcome === 'cancelled' ? 'Payment cancelled' : 'Payment not completed'}</h1>
            <p className="text-gray-500 mb-8">{order?.payment_status === 'pending' ? 'We are still waiting for the payment confirmation. This page refreshes automatically.' : 'No money was taken. You can try again from your cart.'}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/cart" className="px-6 py-3 rounded-xl bg-[#F3AC08] text-white font-bold flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Try again</Link>
              <Link to="/contact" className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-200">Contact support</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
