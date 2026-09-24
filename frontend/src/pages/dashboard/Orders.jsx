import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ReceiptText } from 'lucide-react';
import { OrderApi } from '../../services/api';
import { EmptyState } from '../../components/common/ui';
import { Taka } from '../../components/common/CourseCard';
import { cn, formatDateTime, formatPrice, img } from '../../utils/format';

const STATUS = { paid: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-600' };

export default function Orders() {
  const q = useQuery({ queryKey: ['orders'], queryFn: OrderApi.list });
  const orders = q.data?.results || [];
  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Purchases</h1>
      {q.isLoading ? <div className="h-40 rounded-2xl bg-white dark:bg-gray-800 animate-pulse" /> : orders.length ? (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div><p className="font-mono font-bold text-gray-900 dark:text-white">{o.order_number}</p><p className="text-xs text-gray-500">{formatDateTime(o.created_at)} · {o.payment_method}</p></div>
                <div className="flex items-center gap-3"><span className={cn('text-xs font-bold px-2.5 py-1 rounded-full uppercase', STATUS[o.payment_status])}>{o.payment_status}</span><span className="font-extrabold text-gray-900 dark:text-white"><Taka />{formatPrice(o.total)}</span></div>
              </div>
              <div className="space-y-2">
                {o.items.map((it, i) => (
                  <Link key={i} to={it.item_type === 'bundle' ? `/bundles/${it.slug}` : it.item_type === 'course' ? `/dashboard/learn/${it.slug}` : '/subscription'} className="flex items-center gap-3 p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-gray-700">
                    {it.thumbnail ? <img src={img(it.thumbnail)} alt="" className="w-16 h-11 rounded-lg object-cover" /> : <span className="w-16 h-11 rounded-lg bg-amber-100 text-[#b57d05] text-[10px] font-bold flex items-center justify-center uppercase">{it.item_type}</span>}
                    <span className="flex-1 text-sm text-gray-800 dark:text-gray-100 line-clamp-1">{it.title}</span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200"><Taka />{formatPrice(it.price)}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={ReceiptText} title="No purchases yet" text="Your orders and receipts will appear here." action={<Link to="/courses" className="inline-block px-6 py-3 rounded-xl bg-[#F3AC08] text-white font-bold">Browse courses</Link>} />
      )}
    </div>
  );
}
