import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { AuthApi, SubscriptionApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate, initials } from '../../utils/format';

const Input = ({ label, ...props }) => (
  <label className="block"><span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span><input className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:outline-none focus:border-[#F3AC08]" {...props} /></label>
);

export default function Profile() {
  const { user, setUser, refresh } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', photo: user.photo || '' });
  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' });
  const [busy, setBusy] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy('profile');
    try { const r = await AuthApi.updateProfile(form); setUser(r.user); toast.success('Profile updated'); } catch (err) { toast.error(err.message); } finally { setBusy(''); }
  };
  const savePw = async (e) => {
    e.preventDefault();
    if (pw.new_password !== pw.confirm) return toast.error('Passwords do not match');
    setBusy('pw');
    try { await AuthApi.changePassword(pw); toast.success('Password updated'); setPw({ current_password: '', new_password: '', confirm: '' }); } catch (err) { toast.error(err.message); } finally { setBusy(''); }
  };
  const cancelSub = async () => {
    if (!window.confirm('Cancel your Learner Plus subscription? Access continues until the end of the billing period.')) return;
    setBusy('sub');
    try { const r = await SubscriptionApi.cancel(); toast.success(r.message); await refresh(); qc.invalidateQueries({ queryKey: ['packages'] }); } catch (err) { toast.error(err.message); } finally { setBusy(''); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">Profile</h1>
      <form onSubmit={saveProfile} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center gap-4">
          {form.photo ? <img src={form.photo} alt={user.name} className="w-16 h-16 rounded-full object-cover bg-gray-100" /> : <span className="w-16 h-16 rounded-full bg-amber-400 text-white text-xl font-bold flex items-center justify-center">{initials(user.name)}</span>}
          <div><p className="font-bold text-gray-900 dark:text-white">{user.name}</p><p className="text-xs text-gray-500">Member since {formatDate(user.created_at)}</p></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" value={user.email} disabled />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Photo URL" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="https://..." />
        </div>
        <button type="submit" disabled={busy === 'profile'} className="px-6 py-3 rounded-xl bg-[#F3AC08] text-white font-bold flex items-center gap-2 disabled:opacity-70">{busy === 'profile' && <Loader2 className="w-4 h-4 animate-spin" />}Save changes</button>
      </form>
      <form onSubmit={savePw} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <h2 className="font-bold text-gray-900 dark:text-white">Change password</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Current password" type="password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} required />
          <Input label="New password" type="password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} required minLength={6} />
          <Input label="Confirm new password" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
        </div>
        <button type="submit" disabled={busy === 'pw'} className="px-6 py-3 rounded-xl bg-[#111827] dark:bg-white dark:text-[#111827] text-white font-bold flex items-center gap-2 disabled:opacity-70">{busy === 'pw' && <Loader2 className="w-4 h-4 animate-spin" />}Update password</button>
      </form>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-2">Subscription</h2>
        {user.subscription ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">Learner Plus <strong>{user.subscription.package_title}</strong> · active until {formatDate(user.subscription.expires_at)}</p>
            <button onClick={cancelSub} disabled={busy === 'sub'} className="text-sm font-semibold text-red-600 hover:underline">Cancel subscription</button>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">No active subscription. <a href="/subscription" className="text-[#F3AC08] font-semibold">Get Learner Plus</a></p>
        )}
      </div>
    </div>
  );
}
