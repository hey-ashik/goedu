import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BookOpen, ChevronDown, ChevronUp, Headset, Library, Loader2, MessageCircle, Percent, PiggyBank, Star, Wallet } from 'lucide-react';
import Seo from '../components/common/Seo';
import { Taka } from '../components/common/CourseCard';
import { SubscriptionApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { cn, formatPrice, initials } from '../utils/format';

const FEATURES = [
  { Icon: Library, title: 'Growing course library access', desc: 'Access the subscription library for free while your Learner Plus subscription is active. As the library grows, your learning options grow too.' },
  { Icon: MessageCircle, title: 'Exclusive AI Mentor access', desc: 'Use AI Mentor to get curated course suggestions, learning direction, and personalized support based on your goals and current skill level.' },
  { Icon: Headset, title: 'Priority support', desc: 'Get faster support when you need help, so confusion or technical issues do not stop your learning progress.' },
  { Icon: Percent, title: '20% discount on other courses', desc: 'Want something outside the subscription library? Learner Plus members get 20% discount on other GoEdu courses.' },
  { Icon: Wallet, title: 'Very insignificant daily cost', desc: 'The yearly plan breaks down to only about ৳19.45 per day, making continuous learning feel easy and affordable.' },
  { Icon: PiggyBank, title: 'Avoid repeated course purchases', desc: 'Single courses can range from ৳500 to ৳3,000. Learner Plus helps you avoid buying 50+ premium courses one by one.' },
];
const COMPARE = [
  ['Access to subscription course library', 'Purchase separately', 'Included while active'],
  ['One-course buying pressure', 'High cost over time', 'Avoid reported purchases'],
  ['Typical individual course price', '৳500-৳3,000 each', 'One subscription'],
  ['AI Mentor access', 'Not included', 'Exclusive access'],
  ['Priority support', 'Standard care', 'Included'],
  ['Other courses outside library', 'Full price', '20% discount'],
  ['Effective yearly daily cost', 'Varies widely', '৳19.45 / day'],
  ['Learning flexibility', 'Limited by each purchase', 'Explore more freely'],
];
const FAQ = [
  { q: 'What do I get with Learner Plus?', a: 'You get access to the subscription course library while your subscription is active, exclusive AI Mentor access, priority support, and 20% discount on other GoEdu courses outside the subscription library.' },
  { q: 'Are all GoEdu courses included?', a: 'Learner Plus gives access to the courses available inside the subscription library. Courses outside the library are not included, but subscribers receive a 20% discount on them.' },
  { q: 'Why is yearly better value?', a: 'The yearly plan costs ৳7,099, which is about ৳19.45 per day. Compared to buying many individual courses ranging from ৳200 to ৳3,000, it gives better long-term value.' },
  { q: 'Can I cancel anytime?', a: 'Yes. You can cancel from your account. Your access continues until the end of your current billing period.' },
  { q: 'What is AI Mentor?', a: 'AI Mentor is an exclusive feature that helps guide your learning by suggesting direction and support based on your goals, interests, and current level.' },
  { q: 'Do I get priority support?', a: 'Yes. Learner Plus subscribers receive priority support for faster assistance.' },
];
const Check = ({ className = 'w-4 h-4 text-green-500 shrink-0' }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>;

function PlanCard({ pkg, selected, isYearly, active, onSelect, busy }) {
  if (!pkg) return null;
  return (
    <div className={cn('relative rounded-[2rem] p-6 md:p-8 flex flex-col bg-white dark:bg-gray-900 transition-all duration-300', selected ? (isYearly ? 'border-2 border-amber-500 shadow-2xl z-20 scale-[1.03] -translate-y-1.5' : 'border-2 border-[#111827] dark:border-gray-100 shadow-2xl z-20 scale-[1.03] -translate-y-1.5') : 'border-2 border-gray-200/90 dark:border-gray-800 shadow-md opacity-75 hover:opacity-100 z-10 scale-[0.98]')}>
      {isYearly && selected && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FEF3C7] text-[#92400E] text-[10px] md:text-xs font-black px-5 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm border border-amber-200">Best Value — Most Popular</div>}
      {isYearly && !selected && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-200 dark:bg-gray-800 text-gray-500 text-[10px] md:text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm border border-gray-300 dark:border-gray-700">Yearly Option</div>}
      <div className="mb-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{pkg.title} Plan</h3>
        <h4 className="text-2xl md:text-3xl font-black text-[#111827] dark:text-white mb-2">Learner Plus</h4>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-4">{isYearly ? 'Best for learners who want maximum value and continuous access.' : 'Flexible monthly access to the subscription library and AI Mentor.'}</p>
        {pkg.is_discount && (
          <div className="flex items-baseline gap-1 mb-1"><span className="text-gray-400 text-sm line-through font-bold">৳{formatPrice(pkg.price)}</span><span className="text-gray-400 text-sm font-bold">/ {pkg.package_choice}</span></div>
        )}
        <div className="flex items-baseline gap-2 mb-4"><span className="text-4xl md:text-5xl font-black text-[#111827] dark:text-white tracking-tighter">৳{formatPrice(pkg.effective_price)}</span><span className="text-gray-500 font-bold text-base">/ {pkg.package_choice}</span></div>
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Billed {isYearly ? 'once yearly' : 'monthly'}</span>
          {pkg.is_discount && <span className="bg-[#dcfce7] text-[#0b6b2a] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-tighter">Save ৳{formatPrice(pkg.save_amount)}</span>}
          {!isYearly && <span className="bg-[#dcfce7] text-[#0b6b2a] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-tighter">Cancel anytime</span>}
        </div>
        <button
          onClick={() => !active && selected && onSelect(pkg)}
          disabled={active || !selected || busy}
          className={cn('w-full py-3.5 px-6 rounded-xl font-extrabold text-base transition-all flex items-center justify-center gap-2', active ? 'bg-amber-500 text-white shadow-md cursor-default' : selected ? (isYearly ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25 active:scale-95' : 'bg-[#111827] dark:bg-white text-white dark:text-[#111827] hover:bg-black shadow-lg active:scale-95') : 'bg-gray-100 dark:bg-gray-800/80 text-gray-400 border border-gray-200 dark:border-gray-800 cursor-not-allowed opacity-60 font-semibold')}
        >
          {busy && selected ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {active ? <><Check className="w-4 h-4 text-white" /> Currently Active</> : isYearly ? 'Get Yearly Access — Best Deal →' : 'Start Monthly Plan'}
        </button>
        <div className="mt-3 text-center"><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">🔒 {isYearly ? 'Secure payment · Cancel anytime · Instant access' : 'No hidden charges · Instant access'}</p></div>
      </div>
      <div className="pt-5 border-t border-gray-100 dark:border-gray-800">
        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-[0.15em] mb-3">What you get:</h5>
        <ul className="space-y-2.5">
          {pkg.perks.map((p, i) => (
            <li key={i} className="flex gap-2.5 items-start group">
              <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3 h-3 text-green-600" /></div>
              <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Subscription() {
  const { isAuthenticated, user, refresh } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [plan, setPlan] = useState('yearly');
  const [busy, setBusy] = useState(false);
  const [faq, setFaq] = useState(0);
  const q = useQuery({ queryKey: ['packages', user?.id], queryFn: SubscriptionApi.packages });
  const testimonials = useQuery({ queryKey: ['testimonials', 'subscription'], queryFn: () => import('../services/api').then((m) => m.SiteApi.testimonials('subscription')) });
  const pkgs = q.data?.results || [];
  const monthly = pkgs.find((p) => p.package_choice === 'month');
  const yearly = pkgs.find((p) => p.package_choice === 'year');
  const current = q.data?.user_info;
  useEffect(() => { if (current) setPlan(current.package_choice === 'month' ? 'monthly' : 'yearly'); }, [current]);

  const subscribe = async (pkg) => {
    if (!isAuthenticated) { toast.error('Please login to subscribe'); return navigate('/authentication?callbackUrl=%2Fsubscription'); }
    setBusy(true);
    try {
      const res = await SubscriptionApi.subscribe(pkg.id);
      toast.success(res.message);
      await refresh();
      qc.invalidateQueries({ queryKey: ['packages'] });
      navigate('/dashboard');
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const isActive = (pkg) => current && current.package_id === pkg?.id;

  return (
    <div className="min-h-screen selection:bg-yellow-200 selection:text-yellow-900 transition-colors duration-300 bg-[#FFFAF0] dark:bg-gray-900 pt-16 lg:pt-20">
      <Seo title="Learner Plus Subscription" description="Stop buying courses one by one. Get access to a growing library of GoEdu courses, AI Mentor, priority support and 20% off other courses." />
      <section className="w-full relative overflow-hidden pt-8 bg-[#FFFAF0] dark:bg-gray-900">
        <div className="relative max-w-7xl mx-auto px-4 pt-12 md:pt-20 flex flex-col items-center text-center z-10">
          <div className="inline-flex items-center bg-[#111827] text-white text-[9px] md:text-xs font-bold px-4 md:px-5 py-1.5 md:py-2 rounded-full mb-6 md:mb-8 tracking-widest uppercase shadow-lg shadow-black/10 animate-fadeIn"><span className="w-1.5 h-1.5 bg-[#F3AC08] rounded-full mr-2" />ONE SUBSCRIPTION. GROWING COURSE LIBRARY.</div>
          <h1 className="text-3xl md:text-5xl lg:text-[68px] font-black text-[#111827] dark:text-white leading-[1.15] md:leading-[1.1] mb-6 md:mb-8 max-w-7xl tracking-tight animate-fadeIn">Stop Buying Courses One by One.<br /><span className="text-[#F3AC08]">Start Learning Smarter.</span></h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed mb-8 md:mb-10 font-medium px-4">Get access to a growing library of GoEdu courses while your subscription is active, enjoy exclusive AI Mentor access, receive priority support, and save more on courses outside the subscription library.</p>
          <div className="bg-white dark:bg-gray-800 backdrop-blur-sm border border-[#F3AC08]/40 rounded-full px-5 md:px-10 py-2.5 md:py-3 mb-10 md:mb-12 shadow-sm flex items-center justify-center gap-2 max-w-[95%] md:max-w-none">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-[#F3AC08] fill-[#F3AC08]" />
              <span className="text-[#111827] dark:text-white text-xs md:text-sm lg:text-base font-bold">Yearly plan costs only <span className="text-[#F3AC08]"><Taka /> {q.data?.per_day || '19.45'} per day</span> — a very insignificant daily investment</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-4 md:py-8 flex flex-col items-center">
        <div className="mb-16 relative z-20">
          <div className="w-full flex justify-center">
            <div className="relative bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700 flex items-center shadow-sm h-14 w-[300px]">
              <div className="absolute top-1 bottom-1 bg-[#111827] rounded-full shadow-lg z-0 transition-all duration-200" style={{ left: plan === 'monthly' ? 4 : 150, width: 146 }} />
              <button onClick={() => setPlan('monthly')} className={cn('relative z-10 flex-1 h-full font-bold text-sm md:text-base transition-colors duration-300', plan === 'monthly' ? 'text-white' : 'text-gray-500 hover:text-gray-700')}>Monthly</button>
              <button onClick={() => setPlan('yearly')} className={cn('relative z-10 flex-1 h-full font-bold text-sm md:text-base flex flex-col items-center justify-center transition-colors duration-300', plan === 'yearly' ? 'text-white' : 'text-gray-500 hover:text-gray-700')}><div className="flex items-center gap-1.5"><span>Yearly</span></div></button>
            </div>
          </div>
        </div>
        {q.isLoading ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">{[0, 1].map((i) => <div key={i} className="rounded-[2rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 h-[520px] animate-pulse" />)}</div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 pt-4">
            <PlanCard pkg={monthly} selected={plan === 'monthly'} isYearly={false} active={isActive(monthly)} onSelect={subscribe} busy={busy} />
            <PlanCard pkg={yearly} selected={plan === 'yearly'} isYearly active={isActive(yearly)} onSelect={subscribe} busy={busy} />
          </div>
        )}
        <p className="text-gray-500 text-sm font-medium text-center">Both plans include the same benefits. Yearly simply gives you the lowest effective cost.</p>
        {q.data?.library_count > 0 && <Link to="/courses?tier=subscription" className="mt-4 text-sm font-bold text-[#F3AC08] hover:underline flex items-center gap-1"><BookOpen className="w-4 h-4" /> Browse the {q.data.library_count} courses in the subscription library</Link>}
      </div>

      <section className="py-24 bg-white dark:bg-gray-900/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4"><div className="h-px w-8 bg-[#f5a624]" /><span className="text-[#f5a624] text-xs font-black uppercase tracking-widest">What you actually get</span><div className="h-px w-8 bg-[#f5a624]" /></div>
            <h2 className="text-3xl md:text-5xl font-black text-[#111827] dark:text-white mb-6 leading-tight max-w-4xl mx-auto">A smarter alternative to buying every course separately</h2>
            <p className="text-gray-500 text-lg font-medium max-w-3xl mx-auto">Individual courses may cost from ৳500 to ৳3,000 each. Learner Plus helps you avoid repeated purchases and keeps your learning flexible.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[#FAFAFA] dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-[#f5a624] mb-6"><f.Icon className="w-6 h-6" /></div>
                <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-4">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-gray-900/60">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4"><div className="h-px w-8 bg-[#f5a624]" /><span className="text-[#f5a624] text-xs font-black uppercase tracking-widest">How it stacks up</span><div className="h-px w-8 bg-[#f5a624]" /></div>
            <h2 className="text-3xl md:text-5xl font-black text-[#111827] dark:text-white mb-6 leading-tight">Learner Plus vs. buying 50+ courses one by one</h2>
            <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto">When single courses range from ৳500 to ৳3,000, buying many courses separately can become expensive very quickly.</p>
          </div>
          <div className="hidden md:block overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-gray-50/50 dark:bg-gray-900/40"><th className="py-6 px-8" /><th className="py-6 px-8 text-sm font-black text-[#111827] dark:text-white uppercase tracking-wider text-center">Buying One by One</th><th className="py-6 px-8 text-sm font-black text-[#f5a624] uppercase tracking-wider text-center bg-[#FFF9F0] dark:bg-amber-900/20">Learner Plus</th></tr></thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {COMPARE.map(([k, a, b]) => (
                  <tr key={k} className="group hover:bg-gray-50/30 transition-colors"><td className="py-5 px-8 text-sm font-bold text-[#111827] dark:text-white">{k}</td><td className="py-5 px-8 text-sm font-medium text-gray-500 text-center">{a}</td><td className="py-5 px-8 text-sm font-bold text-center bg-[#FFF9F0]/50 dark:bg-amber-900/10 text-green-600"><div className="flex items-center justify-center gap-2"><Check />{b}</div></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-1 gap-6 md:hidden">
            {COMPARE.map(([k, a, b]) => (
              <div key={k} className="bg-[#FAFAFA] dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-[#111827] dark:text-white font-black text-sm uppercase tracking-wider mb-6 pb-4 border-b border-gray-200/50">{k}</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1"><span className="text-[10px] font-black text-gray-400 uppercase">One by One</span><p className="text-[#555] dark:text-gray-300 font-medium text-sm">{a}</p></div>
                  <div className="flex flex-col gap-1"><span className="text-[10px] font-black text-[#f5a624] uppercase">Learner Plus</span><p className="font-bold text-sm flex items-center gap-2 text-green-600"><Check />{b}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-gray-900/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div className="max-w-xl"><h2 className="text-4xl md:text-5xl font-black text-[#111827] dark:text-white mb-6 leading-tight">What Learners and Professionals Say About GoEdu?</h2></div>
            <div className="max-w-md"><p className="text-gray-500 text-lg font-medium">Thousands of learners across Bangladesh have upgraded their skills and careers with GoEdu online courses. They share how our structured lessons, local-context examples, and practical learning support helped them improve their confidence, career direction, and professional growth.</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(testimonials.data?.results || []).map((t) => (
              <div key={t.id} className="bg-[#111827] p-8 rounded-[2rem] text-white relative flex flex-col justify-between">
                <div className="mb-8">
                  <div className="flex gap-1 mb-6">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-5 h-5 text-[#f5a624] fill-[#f5a624]" />)}</div>
                  <p className="text-white/80 text-lg font-medium leading-relaxed italic">&quot;{t.description}&quot;</p>
                </div>
                <div className="flex items-center gap-4"><div className="w-12 h-12 bg-[#f5a624] rounded-full flex items-center justify-center text-[#111827] font-black text-lg">{initials(t.name)}</div><div><h4 className="font-black text-white">{t.name}</h4><p className="text-white/40 text-sm font-bold">{t.designation}</p></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-[#F3AC08] to-[#ED8E22] p-10 md:p-16 text-center text-[#111827]">
          <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">Ready to stop overthinking every course purchase?</h2>
          <p className="text-[#111827]/80 text-lg font-medium max-w-2xl mx-auto mb-8">Start with Learner Plus and keep accessing the subscription library, AI Mentor, priority support, and add-on course discounts while your subscription is active.</p>
          <button onClick={() => (yearly ? subscribe(yearly) : null)} disabled={busy || isActive(yearly)} className="px-8 py-4 rounded-2xl bg-[#111827] text-white font-extrabold hover:bg-black transition-all active:scale-95 disabled:opacity-70">{isActive(yearly) ? 'Yearly plan active' : 'Get Learner Plus — Yearly Deal →'}</button>
          <p className="text-sm font-bold mt-4 text-[#111827]/70">No contracts. Cancel anytime. Instant access after payment.</p>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-gray-900/60">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4"><div className="h-px w-8 bg-[#f5a624]" /><span className="text-[#f5a624] text-xs font-black uppercase tracking-widest">Got Questions?</span><div className="h-px w-8 bg-[#f5a624]" /></div>
            <h2 className="text-3xl md:text-5xl font-black text-[#111827] dark:text-white">We&apos;ve got answers</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((f, i) => {
              const open = faq === i;
              return (
                <div key={f.q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <button onClick={() => setFaq(open ? null : i)} className="w-full px-6 md:px-8 py-5 md:py-6 text-left flex items-center justify-between group">
                    <h4 className={cn('text-base md:text-lg font-bold transition-colors', open ? 'text-[#f5a624]' : 'text-[#111827] dark:text-white group-hover:text-[#f5a624]')}>{f.q}</h4>
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', open ? 'bg-[#f5a624] text-white' : 'bg-yellow-50 dark:bg-yellow-900/20 text-[#f5a624]')}>{open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
                  </button>
                  {open && <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0"><div className="h-px w-full bg-gray-50 dark:bg-gray-700 mb-6" /><p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium text-sm md:text-base">{f.a}</p></div>}
                </div>
              );
            })}
          </div>
          <div className="text-center mt-12"><p className="text-gray-500 text-sm font-medium">Still not sure? <Link to="/contact" className="text-[#f5a624] font-bold hover:underline">Chat with our team →</Link></p></div>
        </div>
      </section>
    </div>
  );
}
