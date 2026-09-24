import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarCheck, CirclePlay, GraduationCap, Heart, LayoutDashboard, LogOut, Menu, MessageCircle, Package, ReceiptText, User, X } from 'lucide-react';
import Seo from '../../components/common/Seo';
import { useAuth } from '../../context/AuthContext';
import { useLockBody } from '../../hooks/useApi';
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

function Avatar({ user, size = 'md', className }) {
  const cls = cn('rounded-full object-cover shrink-0', size === 'sm' ? 'w-9 h-9 text-sm' : 'w-12 h-12 text-lg', className);
  return user.photo ? (
    <img src={user.photo} alt={user.name} className={cls} />
  ) : (
    <span className={cn(cls, 'bg-amber-400 text-white font-bold flex items-center justify-center')}>{initials(user.name)}</span>
  );
}

function UserCard({ user, onClose }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-3">
      <Avatar user={user} />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
        {user.subscription && <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Learner Plus</span>}
      </div>
      {onClose && (
        <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close menu"><X className="w-5 h-5" /></button>
      )}
    </div>
  );
}

function DashboardNav({ onNavigate, onLogout, className }) {
  return (
    <nav className={cn('bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-2 flex flex-col gap-1', className)}>
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={onNavigate}
          className={({ isActive }) => cn('flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors', isActive ? 'bg-[#F3AC08] text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-700')}
        >
          <n.icon className="w-4 h-4 shrink-0" /> {n.label}
        </NavLink>
      ))}
      <button onClick={onLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 whitespace-nowrap"><LogOut className="w-4 h-4" /> Log out</button>
    </nav>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  useLockBody(menuOpen);

  // close the drawer on navigation and when the viewport grows into the sidebar layout
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const h = (e) => { if (e.matches) setMenuOpen(false); };
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const current = NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to))) || NAV[0];
  const doLogout = async () => { setMenuOpen(false); await logout(); toast.success('Logged out'); navigate('/'); };

  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-[92px] sm:pt-24 pb-12 sm:pb-16">
      <Seo title="Dashboard" noIndex />
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4 sm:gap-6 lg:gap-8">
        {/* ---------- phones + tablets: compact bar (hamburger left, avatar right) ---------- */}
        <div className="lg:hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-2 py-2 flex items-center gap-2">
          <button
            onClick={() => setMenuOpen(true)}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Open dashboard menu"
            aria-expanded={menuOpen}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <current.icon className="w-4 h-4 text-[#F3AC08] shrink-0" />
            <p className="font-bold text-gray-900 dark:text-white truncate">{current.label}</p>
          </div>
          <Link to="/dashboard/profile" className="p-1 rounded-full hover:ring-2 hover:ring-amber-300 transition-shadow" aria-label="Your profile">
            <Avatar user={user} size="sm" />
          </Link>
        </div>

        {/* ---------- drawer (below lg) ---------- */}
        <div
          onClick={() => setMenuOpen(false)}
          className={cn('fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300', menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}
        />
        <aside
          className={cn(
            'fixed top-0 left-0 z-[100] h-full w-[85%] max-w-sm bg-[#FFFCF6] dark:bg-gray-900 shadow-2xl lg:hidden flex flex-col gap-4 p-4 overflow-y-auto transition-transform duration-300 ease-out',
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          aria-hidden={!menuOpen}
        >
          <UserCard user={user} onClose={() => setMenuOpen(false)} />
          <DashboardNav onNavigate={() => setMenuOpen(false)} onLogout={doLogout} />
        </aside>

        {/* ---------- desktop sidebar ---------- */}
        <aside className="hidden lg:block min-w-0 lg:sticky lg:top-28 lg:self-start space-y-4">
          <UserCard user={user} />
          <DashboardNav onLogout={doLogout} />
        </aside>

        <div className="min-w-0"><Outlet /></div>
      </div>
    </div>
  );
}
