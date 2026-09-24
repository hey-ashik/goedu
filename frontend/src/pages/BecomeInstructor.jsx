import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CircleCheck, Clock, Globe, Loader2, TrendingUp, Users } from 'lucide-react';
import Seo from '../components/common/Seo';
import { PageHero } from '../components/common/ui';
import { SiteApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PERKS = [
  { Icon: Users, title: 'Reach 100,000+ learners', text: 'Publish your course to the largest accredited learner community in Bangladesh.' },
  { Icon: TrendingUp, title: 'Earn from your expertise', text: 'Set your own price for courses and 1:1 mentorship sessions and get paid every month.' },
  { Icon: Clock, title: 'Teach on your schedule', text: 'Record once, teach forever. Self-paced courses work for you around the clock.' },
  { Icon: Globe, title: 'GEAC accredited platform', text: 'Your learners receive recognised, shareable certificates on completion.' },
];

export default function BecomeInstructor() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const asMentor = params.get('as') === 'mentor';
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', expertise: '', institute: '', message: '', apply_as: asMentor ? 'mentor' : 'instructor' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { const r = await SiteApi.applyInstructor(form); toast.success(r.message); setSent(true); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  const title = asMentor ? 'Become a Mentor' : 'Become an Instructor';
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <Seo title={title} description="Share your knowledge with 100,000+ learners on GoEdu. Apply to become an instructor or mentor." />
      <PageHero title={title} crumbs={[{ label: title }]}>
        <p className="text-gray-700 dark:text-gray-300 max-w-2xl">Join a community of industry experts helping the next generation of professionals grow. Set your own schedule, your own rates, and make a real impact — one session at a time.</p>
      </PageHero>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Why teach on GoEdu?</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {PERKS.map((p) => (
              <div key={p.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-gray-700 text-[#F3AC08] flex items-center justify-center mb-4"><p.Icon className="w-5 h-5" /></div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{p.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#111827] text-white rounded-2xl p-6">
            <h3 className="font-bold mb-3">How it works</h3>
            <ol className="space-y-2 text-sm text-gray-300 list-decimal pl-5">
              <li>Submit the application form with your expertise.</li>
              <li>Our team reviews it and gets in touch by email within a few days.</li>
              <li>Get onboarded, upload your content and go live.</li>
            </ol>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 shadow-xl h-fit">
          {sent ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4"><CircleCheck className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Application received</h3>
              <p className="text-gray-500 mt-2">Thank you! We will review your application and contact you by email.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Apply now</h2>
              <div className="flex bg-gray-100 dark:bg-gray-900 rounded-full p-1">
                {['instructor', 'mentor'].map((v) => <button type="button" key={v} onClick={() => setForm((f) => ({ ...f, apply_as: v }))} className={`flex-1 py-2 rounded-full text-sm font-bold capitalize ${form.apply_as === v ? 'bg-white dark:bg-gray-700 text-[#ED8E22] shadow-sm' : 'text-gray-500'}`}>{v}</button>)}
              </div>
              {[['name', 'Full name', 'text', true], ['email', 'Email address', 'email', true], ['phone', 'Phone number', 'tel', false], ['expertise', 'Area of expertise (e.g. Digital Marketing, Python)', 'text', true], ['institute', 'Organisation / Institute', 'text', false]].map(([k, ph, type, req]) => (
                <input key={k} type={type} required={req} value={form[k]} onChange={set(k)} placeholder={ph} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:outline-none focus:border-[#F3AC08] focus:ring-2 focus:ring-[#F3AC08]/20" />
              ))}
              <textarea rows={4} value={form.message} onChange={set('message')} placeholder="Tell us about your teaching / mentoring experience" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:outline-none focus:border-[#F3AC08] focus:ring-2 focus:ring-[#F3AC08]/20" />
              <button type="submit" disabled={busy} className="w-full py-3.5 rounded-xl bg-[#F3AC08] hover:bg-[#d49607] text-white font-extrabold flex items-center justify-center gap-2 disabled:opacity-70">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Submit application</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
