import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import Seo from '../components/common/Seo';
import { SiteApi } from '../services/api';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Contact() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { const r = await SiteApi.contact(form); toast.success(r.message); setForm({ name: '', email: '', subject: '', message: '' }); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  const info = [
    { Icon: Mail, label: 'Email', value: settings.contact_email, href: `mailto:${settings.contact_email}` },
    { Icon: Phone, label: 'Phone', value: settings.contact_phone, href: `tel:${settings.contact_phone}` },
    { Icon: MapPin, label: 'Location', value: settings.contact_address },
  ];
  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-28 pb-16">
      <Seo title="Contact Us" description="Get in touch with the GoEdu team - we'd love to hear from you." />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3">Contact Us</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">We&apos;d love to hear from you</p>
        </div>
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {info.map((i) => (
              <div key={i.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-gray-700 text-[#F3AC08] flex items-center justify-center shrink-0"><i.Icon className="w-5 h-5" /></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{i.label}</p>{i.href ? <a href={i.href} className="font-semibold text-gray-900 dark:text-white hover:text-[#F3AC08]">{i.value}</a> : <p className="font-semibold text-gray-900 dark:text-white">{i.value}</p>}</div>
              </div>
            ))}
            <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 h-56">
              <iframe title="GoEdu location" src="https://www.google.com/maps?q=102/1+Shukrabad,+Mirpur+Road,+Dhanmondi,+Dhaka&output=embed" className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
          <form onSubmit={submit} className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Name *</label><input required value={form.name} onChange={set('name')} className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:outline-none focus:border-[#F3AC08]" /></div>
              <div><label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Email *</label><input required type="email" value={form.email} onChange={set('email')} className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:outline-none focus:border-[#F3AC08]" /></div>
            </div>
            <div><label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Subject *</label><input required value={form.subject} onChange={set('subject')} className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:outline-none focus:border-[#F3AC08]" /></div>
            <div><label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Message *</label><textarea required rows={6} maxLength={2000} value={form.message} onChange={set('message')} className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:outline-none focus:border-[#F3AC08]" /><p className="text-xs text-gray-400 text-right">{form.message.length} /2000</p></div>
            <button type="submit" disabled={busy} className="px-8 py-3.5 rounded-xl bg-[#F3AC08] hover:bg-[#d49607] text-white font-extrabold flex items-center gap-2 disabled:opacity-70">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}
