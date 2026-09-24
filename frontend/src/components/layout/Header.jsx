import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen, BookPlus, CircleHelp, CreditCard, House, LayoutDashboard, LogIn, LogOut, Menu, MessageCircle,
  Moon, Newspaper, Package, CirclePlay, ShoppingCart, Sun, User, UsersRound, X, Heart, GraduationCap, ReceiptText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import { useLockBody } from '../../hooks/useApi';
import { cn, initials } from '../../utils/format';
import toast from 'react-hot-toast';

// sections that play the branded loading screen before they appear
const LOADER_SECTIONS = ['/courses', '/mentorship'];

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses', label: 'Courses' },
  { to: '/bundles', label: 'Bundles' },
  { to: '/mentorship', label: 'Mentorship' },
  { to: '/subscription', label: 'Subscription' },
];

function ThemeToggle({ className }) {
  const { isDark, toggle } = useTheme();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(e) => e.key === 'Enter' && toggle()}
      className={cn('p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-700 dark:text-gray-300 transition-colors', className)}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/my-learning', label: 'My Learning', icon: GraduationCap },
    { to: '/dashboard/orders', label: 'Purchases', icon: ReceiptText },
    { to: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/dashboard/profile', label: 'Profile', icon: User },
  ];
  return (
    <div className="relative" ref={ref}>
      {/* goedu.ac style trigger: amber initials avatar + full name */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05, transition: { type: 'spring' } }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 relative overflow-hidden group"
        aria-label="Open user menu"
      >
        {user.photo ? (
          <img src={user.photo} alt={user.name} className="rounded-full object-cover h-9 w-9 border-2 border-transparent group-hover:border-amber-400 transition-all duration-300" />
        ) : (
          <span className="h-9 w-9 rounded-full bg-amber-400 flex items-center justify-center font-bold text-lg text-white shadow-lg group-hover:shadow-xl transition-all duration-300">{initials(user.name)}</span>
        )}
        <span className="hidden md:block font-semibold text-sm text-gray-700 dark:text-gray-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300 max-w-[160px] truncate">{user.name}</span>
      </motion.button>
      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 z-50 animate-fadeIn">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            {user.subscription ? (
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Learner Plus</span>
            ) : null}
          </div>
          {items.map((it) => (
            <Link key={it.to} to={it.to} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-800">
              <it.icon className="h-4 w-4 text-amber-600" /> {it.label}
            </Link>
          ))}
          <button
            onClick={async () => { setOpen(false); await logout(); toast.success('Logged out'); navigate('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user, isAuthenticated, status } = useAuth();
  const { count, toggleCart } = useCart();
  const { openChat } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useLockBody(mobileOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const loginUrl = `/authentication?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`;

  const protectedShortcut = (label, target) => {
    setMobileOpen(false);
    if (!isAuthenticated) {
      toast.error(`Please login to access ${label}`);
      navigate(`/authentication?callbackUrl=${encodeURIComponent(target)}`);
      return;
    }
    if (target === '/ai-mentor') { navigate('/ai-mentor'); return; }
    navigate(target);
  };

  return (
    <>
      {/* ---------- Top bar (mirrors goedu.ac: transparent at the top, floating white pill once scrolled) ---------- */}
      <div className="fixed top-0 left-0 right-0 z-[90]">
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-x-0 top-0 backdrop-blur-md bg-white/30 dark:bg-gray-900/30"
              style={{ height: 15 }}
            />
          )}
        </AnimatePresence>
        <div className="relative pt-2.5">
          <div className="container mx-auto px-4 sm:px-0">
            <motion.header
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1, scale: scrolled ? 0.98 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, scale: { duration: 0.3 } }}
              className={cn(
                'w-full rounded-full transition-all duration-300',
                scrolled ? 'bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700' : 'bg-transparent'
              )}
            >
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                  <div className="flex items-center gap-8">
                    <Link to="/" onClick={() => window.dispatchEvent(new Event('goedu:loader'))} className="flex items-center cursor-pointer" aria-label="GoEdu home">
                      <img src="/logo.svg" alt="GoEdu Logo" width="140" height="45" className="h-10 w-auto" />
                    </Link>
                    <nav className="hidden lg:flex items-center bg-[#E7E7E7] dark:bg-gray-800 rounded-full px-2 py-1.5">
                      {NAV.map((n) => (
                        <NavLink
                          key={n.to}
                          to={n.to}
                          end={n.end}
                          onClick={() => LOADER_SECTIONS.includes(n.to) && window.dispatchEvent(new Event('goedu:loader'))}
                          className={({ isActive }) =>
                            cn(
                              'relative px-5 py-2 font-workSans cursor-pointer rounded-full transition-all duration-200',
                              isActive
                                ? 'bg-white dark:bg-gray-700 text-[#ED8E22] font-semibold dark:text-white shadow-sm'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                            )
                          }
                        >
                          {n.label}
                        </NavLink>
                      ))}
                    </nav>
                  </div>

                  <div className="flex items-center gap-2">
                    {status === 'loading' ? (
                      <div className="hidden lg:block h-9 w-28 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    ) : isAuthenticated ? (
                      <div className="hidden lg:block"><UserMenu /></div>
                    ) : (
                      <Link
                        to={loginUrl}
                        className="hidden lg:flex items-center justify-center rounded-full text-gray-700 dark:text-gray-300 transition-colors hover:text-gray-900 dark:hover:text-white"
                        aria-label="Log In"
                      >
                        <User className="w-5 h-5" size={20} strokeWidth={2} />
                        <span className="font-workSans ml-1 text-sm">Log in</span>
                      </Link>
                    )}
                    {/* the cart icon only exists for logged in learners, as on goedu.ac */}
                    {isAuthenticated && (
                      <button
                        onClick={toggleCart}
                        className="relative flex items-center justify-center w-10 h-10 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Cart"
                      >
                        <ShoppingCart size={20} strokeWidth={2} />
                        {count > 0 && (
                          <span className="absolute -top-1 -right-1 bg-[#E7B108] text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold">
                            {count}
                          </span>
                        )}
                      </button>
                    )}
                    <div className="hidden lg:block"><ThemeToggle /></div>
                    <button
                      onClick={() => setMobileOpen((v) => !v)}
                      className="flex lg:hidden items-center justify-center w-10 h-10 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Toggle Mobile Menu"
                    >
                      {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.header>
          </div>
        </div>
      </div>

      {/* ---------- Mobile drawer ---------- */}
      <div
        onClick={() => setMobileOpen(false)}
        className={cn('fixed inset-0 bg-black/50 backdrop-blur-sm z-[99] lg:hidden transition-opacity duration-300', mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}
      />
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-4/5 max-w-sm z-[100] lg:hidden transition-transform duration-500 ease-out bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
          {user?.photo ? (
            <img src={user.photo} alt={user.name} className="h-12 w-12 rounded-full object-cover shadow-lg" />
          ) : (
            <span className="h-12 w-12 rounded-full bg-amber-400 flex items-center justify-center font-bold text-xl text-white shadow-lg">{user ? initials(user.name) : 'G'}</span>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-base truncate text-gray-800 dark:text-white">{user ? user.name : 'Guest'}</span>
            <span className="text-xs text-gray-500 truncate">{user ? user.email : 'Not logged in'}</span>
            <span className="text-xs text-amber-600 mt-1">Welcome back</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500" aria-label="Close Menu">
            <X />
          </button>
        </div>
        <div className="h-[calc(100%-88px)] overflow-y-auto pb-5">
          <nav className="flex flex-col gap-1 px-2 py-2">
            {[
              { to: '/', label: 'Home', icon: House },
              { to: '/courses', label: 'Courses', icon: BookOpen },
              { to: '/bundles', label: 'Bundles', icon: BookPlus },
              { to: '/mentorship', label: 'Mentorship', icon: UsersRound },
              { to: '/blog', label: 'Blog', icon: Newspaper },
              { to: '/subscription', label: 'Subscription', icon: CreditCard },
            ].map((n) => (
              <div key={n.to}>
                <Link to={n.to} onClick={() => LOADER_SECTIONS.includes(n.to) && window.dispatchEvent(new Event('goedu:loader'))} className="flex items-center w-full text-left font-medium rounded-xl relative overflow-hidden transition-all duration-300 gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <span className="text-amber-600"><n.icon size={18} /></span>
                  <span className="flex-1 truncate">{n.label}</span>
                </Link>
                {n.to === '/subscription' && (
                  <div className="ml-7 pl-2.5 border-l-2 border-amber-200 dark:border-gray-700 flex flex-col gap-0.5">
                    {[
                      { label: 'Resources', icon: Package, target: '/dashboard/subscription-resources' },
                      { label: 'Micro Course', icon: CirclePlay, target: '/dashboard/video-library' },
                      { label: 'AI Mentor', icon: MessageCircle, target: '/ai-mentor' },
                    ].map((s) => (
                      <button key={s.label} type="button" onClick={() => protectedShortcut(s.label, s.target)} className="flex items-center w-full text-left font-medium rounded-xl relative overflow-hidden transition-all duration-300 gap-2.5 px-3 py-2 text-[13px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <span className="text-amber-600"><s.icon size={15} /></span>
                        <span className="flex-1 truncate">{s.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link to="/about-us" className="flex items-center w-full font-medium rounded-xl gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-amber-600"><UsersRound size={18} /></span><span className="flex-1 truncate">About</span>
            </Link>
            <Link to="/contact" className="flex items-center w-full font-medium rounded-xl gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="text-amber-600"><CircleHelp size={18} /></span><span className="flex-1 truncate">Contact</span>
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="flex items-center w-full font-medium rounded-xl gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="text-amber-600"><LayoutDashboard size={18} /></span><span className="flex-1 truncate">Dashboard</span>
              </Link>
            ) : (
              <Link to={loginUrl} className="flex items-center w-full font-medium rounded-xl gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="text-amber-600"><LogIn size={18} /></span><span className="flex-1 truncate">Login</span>
              </Link>
            )}
          </nav>
          <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
          <nav className="flex flex-col gap-1 px-2 pb-4">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Preferences</span>
              <div className="flex gap-3"><ThemeToggle /></div>
            </div>
            {isAuthenticated && <MobileLogout onDone={() => setMobileOpen(false)} />}
            <button onClick={() => { setMobileOpen(false); openChat(); }} className="mx-2 mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#ED8E22] text-white py-3 text-sm font-semibold">
              <MessageCircle size={16} /> Ask AI Mentor
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}

function MobileLogout({ onDone }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <button
      onClick={async () => { await logout(); onDone(); toast.success('Logged out'); navigate('/'); }}
      className="flex items-center w-full font-medium rounded-xl gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
    >
      <LogOut size={18} /> Log out
    </button>
  );
}
