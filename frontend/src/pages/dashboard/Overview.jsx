import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CalendarCheck, CircleCheck, Heart, ReceiptText, Sparkles } from 'lucide-react';
import { AuthApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Taka } from '../../components/common/CourseCard';
import { formatDate, formatPrice, img } from '../../utils/format';

export default function Overview() {
  const { user } = useAuth();
  const q = useQuery({ queryKey: ['dashboard'], queryFn: AuthApi.dashboard });
  const s = q.data?.stats || {};
  const tiles = [
    { label: 'Enrolled courses', value: s.enrolled ?? '–', Icon: BookOpen, to: '/dashboard/my-learning' },
    { label: 'Completed', value: s.completed ?? '–', Icon: CircleCheck, to: '/dashboard/my-learning' },
    { label: 'Wishlist', value: s.wishlist ?? '–', Icon: Heart, to: '/dashboard/wishlist' },
    { label: 'Mentor sessions', value: s.bookings ?? '–', Icon: CalendarCheck, to: '/dashboard/bookings' },
  ];
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-[#FFF4D3] to-[#FCD53F] dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Welcome back, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-gray-700 dark:text-gray-300 mt-1">Keep learning - your next skill is a few lessons away.</p>
        {s.subscription ? (
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold bg-white/80 dark:bg-gray-900 px-4 py-2 rounded-full text-gray-800 dark:text-gray-100"><Sparkles className="w-4 h-4 text-[#b57d05]" /> Learner Plus ({s.subscription.title}) active until {formatDate(s.subscription.expires_at)}</p>
        ) : (
          <Link to="/subscription" className="mt-4 inline-flex items-center gap-2 text-sm font-bold bg-[#111827] text-white px-4 py-2 rounded-full"><Sparkles className="w-4 h-4 text-[#F3AC08]" /> Upgrade to Learner Plus</Link>
        )}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-gray-700 text-[#F3AC08] flex items-center justify-center mb-3"><t.Icon className="w-5 h-5" /></div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{t.value}</p>
            <p className="text-xs text-gray-500">{t.label}</p>
          </Link>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-gray-900 dark:text-white">Continue learning</h2><Link to="/dashboard/my-learning" className="text-sm font-semibold text-[#F3AC08]">View all</Link></div>
        {q.data?.recent?.length ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {q.data.recent.map((c) => (
              <Link key={c.id} to={`/dashboard/learn/${c.slug}`} className="flex gap-3 items-center p-3 rounded-xl hover:bg-amber-50 dark:hover:bg-gray-700">
                <img src={img(c.thumbnail)} alt="" className="w-20 h-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{c.title}</p><div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden"><div className="h-full bg-[#F3AC08]" style={{ width: `${Number(c.progress)}%` }} /></div><p className="text-[11px] text-gray-500 mt-1">{Math.round(Number(c.progress))}% complete</p></div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">You have not enrolled in any course yet. <Link to="/courses" className="text-[#F3AC08] font-semibold">Browse courses</Link></p>
        )}
      </div>
      {s.orders > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-gray-700 text-[#F3AC08] flex items-center justify-center"><ReceiptText className="w-5 h-5" /></div>
          <p className="text-sm text-gray-700 dark:text-gray-200">{s.orders} order{s.orders === 1 ? '' : 's'} · total spent <strong><Taka />{formatPrice(s.spent)}</strong></p>
          <Link to="/dashboard/orders" className="ml-auto text-sm font-semibold text-[#F3AC08]">Purchases</Link>
        </div>
      )}
    </div>
  );
}
