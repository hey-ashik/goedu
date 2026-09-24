import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Building2, Calendar, ChevronDown, ChevronLeft, CircleCheck, Clock, LayoutGrid, List, MessageSquare, Mic, PhoneOff, Search, Share2, ShieldCheck, SlidersHorizontal, Star, Video, Zap } from 'lucide-react';
import Seo from '../components/common/Seo';
import { EmptyState } from '../components/common/ui';
import { Taka } from '../components/common/CourseCard';
import { MentorshipApi } from '../services/api';
import { useDebounce } from '../hooks/useApi';
import { cn, formatPrice, img } from '../utils/format';

const DEMO = [
  { name: 'Alex Rivera', role: 'Tech Lead @ Google', rating: '4.9', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80' },
  { name: 'Sarah Chen', role: 'Sr. UX Designer @ Meta', rating: '5.0', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80', active: true },
  { name: 'Tanvir Ahmed', role: 'Principal AI Scientist', rating: '4.9', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80' },
  { name: 'Maria Santos', role: 'Engineering Director', rating: '4.8', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80' },
];

/** Animated "GoEdu TabOS" tablet mock-up from the reference hero. */
function TabletDemo() {
  return (
    <div className="relative flex justify-center items-center py-4 [perspective:1000px] w-full">
      <div aria-hidden="true" className="absolute -inset-6 bg-gradient-to-tr from-[#ED8E22]/30 via-[#F3AC08]/20 to-amber-100/50 rounded-full blur-3xl opacity-75" />
      <div className="absolute bottom-1 w-[80%] sm:w-[480px] h-10 bg-black/40 rounded-full blur-xl pointer-events-none" />
      <div className="relative z-10 w-full max-w-[520px] aspect-[520/380] rounded-[32px] border-[10px] sm:border-[12px] border-gray-900 bg-gray-950 shadow-[24px_32px_55px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col select-none sm:animate-3d-tablet">
        <div className="w-full bg-gray-950 py-1.5 px-4 flex items-center justify-between z-40 border-b border-gray-900">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500/80" /><div className="w-2 h-2 rounded-full bg-amber-500/80" /><div className="w-2 h-2 rounded-full bg-emerald-500/80" /></div>
          <div className="w-3 h-3 rounded-full bg-black border border-gray-800 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-blue-900/60" /></div>
          <span className="text-[10px] font-bold text-gray-500">GoEdu TabOS</span>
        </div>
        <div className="relative flex-1 bg-gray-50 overflow-hidden">
          {/* screen 1: list */}
          <div className="absolute inset-0 flex flex-col bg-gray-50 animate-screen-list">
            <div className="px-4 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-[#F3AC08] text-white flex items-center justify-center font-extrabold text-xs">G</div><h3 className="text-xs font-extrabold text-gray-900 flex items-center gap-1">GoEdu Mentorship Hub<Zap className="w-3 h-3 text-[#F3AC08] fill-[#F3AC08]" /></h3></div>
              <div className="flex items-center gap-2"><div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 text-[10px] text-gray-400"><Search className="w-3 h-3" /><span>Search mentors, skills...</span></div><span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[#F3AC08] text-[9px] font-bold">● 800+ Live</span></div>
            </div>
            <div className="flex-1 p-3 overflow-hidden">
              <div className="grid grid-cols-2 gap-2.5">
                {DEMO.map((m) => (
                  <div key={m.name} className={cn('p-2.5 rounded-xl bg-white flex items-center justify-between', m.active ? 'border-2 border-[#F3AC08] shadow-md' : 'border border-gray-100 shadow-xs')}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={m.img} alt={m.name} className={cn('w-9 h-9 rounded-xl object-cover shadow-xs border', m.active ? 'border-2 border-[#F3AC08]' : 'border-gray-200')} />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-900 flex items-center gap-0.5 truncate">{m.name} <ShieldCheck className="w-3 h-3 text-[#F3AC08]" /></p>
                        <p className="text-[9px] text-gray-500 truncate">{m.role}</p>
                        <div className="flex items-center gap-1 mt-0.5"><Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /><span className="text-[9px] font-bold text-gray-700">{m.rating}</span></div>
                      </div>
                    </div>
                    <button type="button" className={cn('px-2 py-0.5 rounded-lg text-[9px] font-bold shrink-0', m.active ? 'bg-[#F3AC08] text-white shadow-xs' : 'bg-amber-50 text-[#F3AC08]')}>Book</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* screen 2: booking */}
          <div className="absolute inset-0 flex flex-col bg-white animate-screen-booking">
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5"><ChevronLeft className="w-4 h-4 text-gray-600" /><span className="text-xs font-bold text-gray-900">Book 1:1 Session with Sarah Chen</span></div>
              <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Instant Lock</span>
            </div>
            <div className="flex-1 p-3 grid grid-cols-12 gap-3 relative">
              <div className="col-span-5 bg-amber-50/60 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2"><img src={DEMO[1].img} alt="Sarah Chen" className="w-11 h-11 rounded-2xl object-cover shadow-sm border-2 border-[#F3AC08]" /><div><p className="text-xs font-extrabold text-gray-900">Sarah Chen</p><p className="text-[9px] text-gray-500">Sr. UX Designer @ Meta</p></div></div>
                  <div className="space-y-1 mt-2 text-[9px] text-gray-600">
                    <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span>5.0 Rating (94 Reviews)</span></div>
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#F3AC08]" /><span>45-Min Video Session</span></div>
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#F3AC08]" /><span>Google Calendar Sync</span></div>
                  </div>
                </div>
                <div className="text-[10px] font-extrabold text-amber-600">$45 <span className="text-[8px] font-normal text-gray-400">/ session</span></div>
              </div>
              <div className="col-span-7 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Available Slots</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {[['Today', '10:00 AM'], ['Today', '02:30 PM'], ['Tomorrow', '04:30 PM', true], ['Tomorrow', '06:00 PM']].map(([d, t, hi]) => (
                      <div key={d + t} className={cn('p-1.5 rounded-lg text-center', hi ? 'border-2 animate-slot-highlight' : 'border border-gray-200')}>
                        <p className={cn('text-[8px]', hi ? 'opacity-80' : 'text-gray-400')}>{d}</p><p className={cn('text-[10px]', hi ? 'font-extrabold' : 'font-bold text-gray-700')}>{t}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="button" className="w-full py-2.5 rounded-xl text-white text-xs font-extrabold shadow-md bg-[#F3AC08] flex items-center justify-center gap-1.5">Confirm Slot Booking <ArrowRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
          {/* screen 3: call */}
          <div className="absolute inset-0 flex flex-col bg-gray-950 text-white animate-screen-call overflow-hidden">
            <div className="px-3 py-2 bg-gray-900/90 border-b border-gray-800/80 flex items-center justify-between z-30">
              <div className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span><p className="text-[10px] font-extrabold">Live 1:1 Consultation</p><span className="text-[8px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded-md font-mono">24:18</span></div>
              <span className="text-[8px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/50 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />1080p HD Live</span>
            </div>
            <div className="flex-1 p-2.5 grid grid-cols-12 gap-2.5 relative overflow-hidden">
              <div className="col-span-8 relative rounded-2xl overflow-hidden border border-gray-800/80 flex flex-col justify-between p-3 bg-gray-900">
                <img src={DEMO[1].img} alt="Sarah Chen Live Video Call" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between"><span className="px-2.5 py-1 rounded-lg bg-black/60 text-[9px] font-bold flex items-center gap-1.5 border border-white/10"><ShieldCheck className="w-3 h-3 text-[#F3AC08]" />Sarah Chen (Meta UX Lead)</span></div>
                <div className="relative z-10 bg-black/75 p-2 rounded-xl border border-white/15 text-[9px] text-gray-100"><p className="font-medium leading-tight"><span className="font-extrabold text-amber-300">💬 Sarah Chen:</span> &quot;Your UX portfolio structure looks great! Let&apos;s optimize the hero section &amp; user journey.&quot;</p></div>
              </div>
              <div className="col-span-4 flex flex-col gap-2 relative z-10">
                <div className="h-20 sm:h-28 rounded-xl border border-white/20 relative overflow-hidden bg-gray-900"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" alt="Student Video Stream" className="w-full h-full object-cover" /><span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[8px] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />You (Student)</span></div>
                <div className="flex-1 bg-gray-900/90 rounded-xl p-2.5 border border-gray-800">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-1 mb-1.5"><div className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-[#F3AC08]" /><span className="text-[9px] font-bold text-gray-200">Live Action Notes</span></div><span className="text-[7px] text-amber-400 font-bold uppercase">Synced</span></div>
                  <ul className="space-y-1.5 text-[8px]"><li className="text-emerald-400 font-medium">✓ Portfolio Hero section review</li><li className="text-emerald-400 font-medium">✓ Live 1:1 Video Sync active</li><li className="text-amber-300 font-medium">● Next: System Design Roadmap</li></ul>
                </div>
              </div>
            </div>
            <div className="px-4 py-2 bg-gray-900/95 border-t border-gray-800 flex items-center justify-between z-30">
              <div className="flex items-center gap-2">{[Mic, Video, Share2].map((I, i) => <button key={i} type="button" className="p-1.5 rounded-lg bg-gray-800 border border-gray-700"><I className="w-3.5 h-3.5" /></button>)}</div>
              <button type="button" className="px-3 py-1 rounded-lg bg-red-600 text-[9px] font-bold flex items-center gap-1"><PhoneOff className="w-3 h-3" />End Session</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mentor card - same structure and styling as the goedu.ac mentorship directory (grid + list layouts). */
export function MentorCard({ m, list = false }) {
  const about = (m.about || '').replace(/<[^>]*>/g, '').trim();
  const role = m.specialist || m.designation || null;
  const institute = (m.institute_name || '').trim() || null;
  const price = m.session_price !== null && m.session_price !== undefined ? Number(m.session_price) : null;
  const Photo = (
    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-700">
      <img src={img(m.photo)} alt={m.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />
    </div>
  );
  const Identity = (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5">
        <h3 className="text-lg font-bold text-[#001858] dark:text-white truncate group-hover:text-[#F3AC08] transition-colors">{m.name}</h3>
        <ShieldCheck className="w-5 h-5 text-[#F3AC08] shrink-0" />
      </div>
      {role && <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-0.5 truncate">{role}</p>}
      {institute && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1.5 truncate"><Building2 className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{institute}</span></p>}
    </div>
  );
  const Category = m.mentor_category ? (
    <div className={cn('flex flex-wrap gap-2', list ? 'mt-3' : 'mt-4')}>
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold"><Star className="w-3.5 h-3.5 text-[#F3AC08]" />{m.mentor_category}</span>
    </div>
  ) : null;
  const Availability = (
    <div className={cn('flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium', list ? 'mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60' : 'mt-4')}>
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span>Available for 1:1 Mentorship</span>
    </div>
  );
  const Price = (
    <div className={list ? '' : 'mb-4'}>
      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Starting from</p>
      <p className="text-2xl font-black text-[#001858] dark:text-white mt-0.5">
        {price > 0 ? <><Taka />{formatPrice(price)}<span className="text-xs font-normal text-gray-400 ml-0.5">/session</span></> : <span className="text-emerald-600 dark:text-emerald-400 text-xl font-bold">Free Consultation</span>}
      </p>
    </div>
  );
  const Actions = (
    <div className={cn('grid gap-3', list ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-1 mt-4' : 'grid-cols-2')}>
      <Link to={`/instructor/${m.slug}`} className="py-3 px-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-bold text-center whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">View Profile</Link>
      <Link to={`/mentorship/${m.slug}`} className="py-3 px-3 rounded-2xl bg-[#F3AC08] hover:bg-[#d89a07] text-white text-sm font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shadow-md shadow-[#F3AC08]/20 transition-all active:scale-[0.98]"><Calendar className="w-4 h-4 shrink-0" />Book Session</Link>
    </div>
  );

  if (list) {
    return (
      <article className="group bg-white dark:bg-gray-800 rounded-[28px] border border-gray-100 dark:border-gray-700 p-5 sm:p-6 hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 flex flex-col md:flex-row gap-6 justify-between">
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-5">
          {Photo}
          <div className="flex-1 min-w-0">
            {Identity}
            {Category}
            {about && <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 mt-3">{about}</p>}
            {Availability}
          </div>
        </div>
        <div className="md:w-56 shrink-0 flex flex-col justify-between pt-4 md:pt-0 md:pl-6 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700">
          {price !== null && Price}
          {Actions}
        </div>
      </article>
    );
  }
  return (
    <article className="group bg-white dark:bg-gray-800 rounded-[28px] border border-gray-100 dark:border-gray-700 p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start gap-4">{Photo}{Identity}</div>
        {Category}
        {about && <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 mt-4">{about}</p>}
        {Availability}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        {price !== null && Price}
        {Actions}
      </div>
    </article>
  );
}

export default function Mentorship() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('recommended');
  const [view, setView] = useState('grid');
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debounced = useDebounce(search);
  const mentors = useQuery({ queryKey: ['mentors', debounced, category, sort], queryFn: () => MentorshipApi.mentors({ search: debounced, category, sort }) });
  const cats = useQuery({ queryKey: ['mentor-categories'], queryFn: MentorshipApi.categories });
  const results = mentors.data?.results || [];
  const featured = useMemo(() => results.filter((m) => m.is_featured), [results]);
  const applied = [category].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 transition-colors duration-300">
      <Seo title="Find Top Industry Mentors & Book 1:1 Sessions | GoEdu Mentorship" description="Book personalized 1-on-1 sessions with verified industry experts across software engineering, AI, business, study abroad and career growth." />
      {/* hero starts at the very top so its colour runs under the transparent header, exactly like the home page */}
      <div className="relative overflow-hidden bg-[#FFF6DD] dark:bg-gray-900 pt-[90px]">
        <div className="absolute bottom-0 left-0 w-full pointer-events-none select-none" style={{ height: '60%', background: 'radial-gradient(ellipse 70% 80% at 50% 100%, rgba(255, 178, 0, 0.35) 0%, rgba(243, 172, 8, 0.15) 45%, rgba(253, 215, 70, 0) 100%)' }} aria-hidden="true" />
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 sm:pt-16 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 py-2 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm mb-6 w-fit">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ED8E22] opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[#ED8E22]" /></span>
                <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">Verified Industry Experts</p>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] xl:text-[3.5rem] font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15]">Find Your Perfect <span className="text-[#F3AC08]">Mentor</span></h1>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mt-5 max-w-2xl leading-relaxed">Book personalized 1-on-1 sessions with verified industry experts across software engineering, AI, cybersecurity, study abroad, and career growth.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href="#mentors-directory" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#F3AC08] text-white text-sm font-bold hover:bg-[#d89a07] active:scale-[0.98] transition-all shadow-lg shadow-[#F3AC08]/25">Browse Mentors<ArrowRight className="w-4 h-4" /></a>
                <Link to="/become-an-instructor?as=mentor" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 text-sm font-bold hover:border-[#F3AC08] hover:text-[#F3AC08] active:scale-[0.98] transition-all shadow-xs">Become a Mentor</Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-gray-600 dark:text-gray-300 font-medium">
                {['Verified Experts', '1:1 Live Consultations', 'Flexible Booking'].map((t) => <div key={t} className="flex items-center gap-2"><CircleCheck className="w-4 h-4 text-[#F3AC08]" /><span>{t}</span></div>)}
              </div>
            </div>
            <div className="lg:col-span-6 relative flex justify-center items-center mt-6 lg:mt-0 overflow-hidden px-2"><TabletDemo /></div>
          </div>
        </div>
      </div>

      <div id="mentors-directory" className="sticky top-16 lg:top-20 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-xs scroll-mt-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search mentors by name, specialty, or category..." className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#F3AC08] focus:border-transparent transition-all" />
          </div>
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <button type="button" onClick={() => setFiltersOpen((v) => !v)} className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-[#F3AC08] hover:text-[#F3AC08] transition-colors bg-white dark:bg-gray-800"><SlidersHorizontal className="w-4 h-4" />Filters</button>
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500"><SlidersHorizontal className="w-4 h-4 text-[#F3AC08]" /><span className="font-semibold text-gray-800 dark:text-gray-100">{applied}</span>filter{applied === 1 ? '' : 's'} applied</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16">
        {featured.length > 0 && (
          <div>
            <h2 className="text-xl font-extrabold text-[#001858] dark:text-white mb-4">Featured mentors</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pt-3 pb-5 px-3 -mx-3">
              {featured.map((m) => (
                <Link key={m.id} to={`/mentorship/${m.slug}`} className="w-72 shrink-0 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4 hover:shadow-xl hover:border-[#F3AC08]/40 transition-all">
                  <div className="flex items-center gap-3"><img src={img(m.photo)} alt={m.name} className="w-14 h-14 rounded-xl object-cover" /><div className="min-w-0"><p className="font-bold text-sm text-gray-900 dark:text-white truncate">{m.name}</p><p className="text-xs text-gray-500 truncate">{m.designation}</p></div></div>
                  <div className="h-8 rounded-lg bg-amber-50 dark:bg-gray-700 text-[#b57d05] dark:text-amber-300 text-xs font-semibold flex items-center px-3 truncate">{m.mentor_category}</div>
                  <div className="h-9 rounded-xl bg-[#F3AC08] text-white text-sm font-bold flex items-center justify-center">Book 1:1 Session</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 scroll-mt-24">
          <aside className={cn('lg:block', filtersOpen ? 'block' : 'hidden')}>
            <div className="lg:sticky lg:top-40 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <h3 className="text-sm font-extrabold text-[#001858] dark:text-white mb-1">Filter Mentors</h3>
              <p className="text-xs text-gray-400 mb-4">Filter mentors by category</p>
              <div className="space-y-2">
                <button onClick={() => setCategory('')} className={cn('w-full text-left text-sm px-3 py-2 rounded-lg', !category ? 'bg-[#F3AC08] text-white font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200')}>All categories</button>
                {(cats.data?.results || []).map((c) => (
                  <button key={c.name} onClick={() => setCategory(c.name)} className={cn('w-full flex justify-between text-sm px-3 py-2 rounded-lg', category === c.name ? 'bg-[#F3AC08] text-white font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200')}><span>{c.name}</span><span className="text-xs opacity-70">{c.total}</span></button>
                ))}
              </div>
            </div>
          </aside>
          <div className="min-w-0 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">Showing <span className="font-bold text-[#001858] dark:text-white">{results.length}</span> mentor{results.length === 1 ? '' : 's'}</p>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button type="button" onClick={() => setSortOpen((v) => !v)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-[#F3AC08] transition-colors">Sort: {{ recommended: 'Recommended', rating: 'Top rated', price_low: 'Price: low', price_high: 'Price: high' }[sort]}<ChevronDown className={cn('w-4 h-4 transition-transform', sortOpen && 'rotate-180')} /></button>
                  {sortOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl p-1 z-20">
                      {[['recommended', 'Recommended'], ['rating', 'Top rated'], ['price_low', 'Price: low to high'], ['price_high', 'Price: high to low']].map(([v, l]) => <button key={v} onClick={() => { setSort(v); setSortOpen(false); }} className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">{l}</button>)}
                    </div>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <button type="button" aria-label="Grid view" onClick={() => setView('grid')} className={cn('w-9 h-9 rounded-lg flex items-center justify-center transition-colors', view === 'grid' ? 'bg-[#F3AC08] text-white' : 'text-gray-400 hover:text-[#F3AC08]')}><LayoutGrid className="w-4 h-4" /></button>
                  <button type="button" aria-label="List view" onClick={() => setView('list')} className={cn('w-9 h-9 rounded-lg flex items-center justify-center transition-colors', view === 'list' ? 'bg-[#F3AC08] text-white' : 'text-gray-400 hover:text-[#F3AC08]')}><List className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
            {mentors.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">{[0, 1, 2].map((i) => <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 h-72 animate-pulse" />)}</div>
            ) : results.length ? (
              <div className={cn('grid gap-5', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>{results.map((m) => <MentorCard key={m.id} m={m} list={view === 'list'} />)}</div>
            ) : (
              <EmptyState title="No mentors found" text="Try another keyword or clear the category filter." />
            )}
          </div>
        </div>

        <section className="rounded-[2.5rem] bg-[#111827] text-white p-8 sm:p-12 lg:p-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Share Your Knowledge. Inspire Others.</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">Join a community of industry experts helping the next generation of professionals grow. Set your own schedule, your own rates, and make a real impact — one session at a time.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/become-an-instructor?as=mentor" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#F3AC08] text-white font-bold hover:bg-[#d89a07]">Apply as Mentor <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/become-an-instructor" className="inline-flex items-center px-7 py-3.5 rounded-2xl border border-white/20 font-bold hover:bg-white/10">Learn More</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
