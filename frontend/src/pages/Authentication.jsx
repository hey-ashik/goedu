import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import Seo from '../components/common/Seo';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/format';

function Field({ icon: Icon, error, ...props }) {
  return (
    <div>
      <div className={cn('flex items-center gap-2 rounded-xl border bg-white dark:bg-gray-900 px-4 focus-within:ring-2 focus-within:ring-[#F3AC08]/30 focus-within:border-[#F3AC08]', error ? 'border-red-400' : 'border-gray-200 dark:border-gray-700')}>
        <Icon className="w-4 h-4 text-gray-400 shrink-0" />
        <input className="flex-1 py-3 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400" {...props} />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function Authentication() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const callback = params.get('callbackUrl') || '/dashboard';
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (mode === 'register' && form.password !== form.confirm) return setErrors({ confirm: 'Passwords do not match' });
    setBusy(true);
    try {
      if (mode === 'login') await login({ email: form.email, password: form.password });
      else await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created. Welcome to GoEdu!');
      navigate(callback.startsWith('/') ? callback : '/dashboard', { replace: true });
    } catch (err) {
      if (err.details) setErrors(err.details);
      toast.error(err.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-24 pb-16 flex items-center">
      <Seo title={mode === 'login' ? 'Login' : 'Create account'} noIndex />
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="hidden lg:flex flex-col justify-between bg-gradient-to-b from-[#FFF4D3] to-[#FCD53F] p-10 relative overflow-hidden">
            <img src="/logo.svg" alt="GoEdu" className="h-10 w-auto self-start" />
            <div>
              <h2 className="text-3xl font-black text-[#1E293B] leading-tight mb-4 !font-lexend-deca">Build Skills with Trusted Online Courses</h2>
              <p className="text-[#334155] text-sm leading-relaxed">Join 100,000+ learners on Bangladesh&apos;s GEAC accredited online course platform. Access 280+ professional courses with shareable certificates, AI Mentor guidance and 1:1 mentorship.</p>
              <ul className="mt-6 space-y-2 text-sm text-[#1E293B] font-semibold">
                {['GEAC accredited certificates', 'Learn anytime, on any device', 'AI Mentor course recommendations'].map((t) => <li key={t} className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-[#111827] text-white text-[10px] flex items-center justify-center">✓</span>{t}</li>)}
              </ul>
            </div>
            <img src="/images/home/thumb.png" alt="" className="absolute -bottom-6 -right-10 w-64 opacity-90 pointer-events-none" aria-hidden="true" />
          </div>
          <div className="p-6 sm:p-10">
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-full p-1 mb-8">
              {['login', 'register'].map((m) => (
                <button key={m} onClick={() => { setMode(m); setErrors({}); }} className={cn('flex-1 py-2.5 rounded-full text-sm font-bold transition-all', mode === m ? 'bg-white dark:bg-gray-700 text-[#ED8E22] shadow-sm' : 'text-gray-500')}>{m === 'login' ? 'Log in' : 'Sign up'}</button>
              ))}
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{mode === 'login' ? 'Welcome back' : 'Create your free account'}</h1>
            <p className="text-sm text-gray-500 mb-6">{mode === 'login' ? 'Log in to continue your learning journey.' : 'Your name is used on certificates, so make sure it is correct.'}</p>
            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && <Field icon={User} type="text" placeholder="Full name" value={form.name} onChange={set('name')} required error={errors.name} />}
              <Field icon={Mail} type="email" placeholder="Email address" value={form.email} onChange={set('email')} required error={errors.email} autoComplete="email" />
              {mode === 'register' && <Field icon={Phone} type="tel" placeholder="Phone number (optional)" value={form.phone} onChange={set('phone')} error={errors.phone} />}
              <div className="relative">
                <Field icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={set('password')} required minLength={6} error={errors.password} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" aria-label="Toggle password">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              {mode === 'register' && <Field icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Confirm password" value={form.confirm} onChange={set('confirm')} required error={errors.confirm} />}
              <button type="submit" disabled={busy} className="w-full py-3.5 rounded-xl bg-[#F3AC08] hover:bg-[#d49607] text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 dark:shadow-none disabled:opacity-70 transition-all active:scale-[0.98]">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}{mode === 'login' ? 'Log in' : 'Create account'}
              </button>
            </form>
            {mode === 'login' && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-gray-900 border border-amber-100 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
                Demo account: <button type="button" onClick={() => setForm((f) => ({ ...f, email: 'demo@goedu.ac', password: 'Demo@1234' }))} className="font-bold text-[#b57d05] hover:underline">demo@goedu.ac / Demo@1234</button>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-6 text-center">By continuing you agree to our <Link to="/terms-and-conditions" className="underline">Terms</Link> and <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
