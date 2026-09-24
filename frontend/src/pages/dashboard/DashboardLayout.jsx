import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarCheck, CirclePlay, GraduationCap, Heart, LayoutDashboard, LogOut, MessageCircle, Package, ReceiptText, User } from 'lucide-react';
import Seo from '../../components/common/Seo';
import { useAuth } from '../../context/AuthContext';
import { cn, initials } from '../../utils/format';

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/my-learning', label: 'My Learning', icon: GraduationCap },
  { to: '/dashboard/orders', label: 'Purchases', icon: ReceiptText },
  { to: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/dashboard/bookings', label: 'Mentor Sessions', icon: CalendarCheck },
  { to: '/dashboard/subscription-resources', label: 'Resources', icon: Package },
  { to: '/dashboard/video-library', label: 'Micro Courses', icon: CirclePlay },
  { to: '/ai-mentor', label: 'AI Mentor', icon: MessageCircle },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-24 pb-16">
      <Seo title="Dashboard" noIndex />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 lg:gap-8">
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 mb-4 flex items-center gap-3">
            {user.photo ? <img src={user.photo} alt={user.name} className="w-12 h-12 rounded-full object-cover" /> : <span className="w-12 h-12 rounded-full bg-amber-400 text-white font-bold text-lg flex items-center justify-center">{initials(user.name)}</span>}
            <div className="min-w-0"><p className="font-bold text-gray-900 dark:text-white truncate">{user.name}</p><p className="text-xs text-gray-500 truncate">{user.email}</p>{user.subscription && <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Learner Plus</span>}</div>
          </div>
          <nav className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-2 flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cn('flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors', isActive ? 'bg-[#F3AC08] text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-700')}>
                <n.icon className="w-4 h-4 shrink-0" /> {n.label}
              </NavLink>
            ))}
            <button onClick={async () => { await logout(); toast.success('Logged out'); navigate('/'); }} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 whitespace-nowrap"><LogOut className="w-4 h-4" /> Log out</button>
          </nav>
        </aside>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </div>
  );
}
