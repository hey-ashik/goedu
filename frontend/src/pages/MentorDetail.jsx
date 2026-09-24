import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Calendar, CircleCheck, Clock, Loader2, ShieldCheck, Star, Video } from 'lucide-react';
import Seo from '../components/common/Seo';
import ContentLoader from '../components/common/ContentLoader';
import CourseCard, { Taka } from '../components/common/CourseCard';
import { MentorshipApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { cn, formatDateTime, formatPrice, img } from '../utils/format';

export default function MentorDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const q = useQuery({ queryKey: ['mentor', slug], queryFn: () => MentorshipApi.detail(slug) });
  const [slot, setSlot] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [booked, setBooked] = useState(null);
  const m = q.data?.mentor;

  if (q.isLoading) return <ContentLoader />;
  if (!m) return <div className="pt-40 pb-20 text-center"><h1 className="text-2xl font-bold">Mentor not found</h1><Link to="/mentorship" className="text-[#F3AC08] font-semibold">Browse mentors</Link></div>;

  const book = async () => {
    if (!isAuthenticated) { toast.error('Please login to book a session'); return navigate(`/authentication?callbackUrl=${encodeURIComponent(`/mentorship/${slug}`)}`); }
    if (!slot) return toast.error('Please pick a time slot');
    setBusy(true);
    try {
      const res = await MentorshipApi.book({ mentor_id: m.id, slot_at: slot, note });
      setBooked(res.booking);
      toast.success('Session booked! 🎉');
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-28 pb-16">
      <Seo title={`${m.name} - Mentor`} description={m.about} image={m.photo} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 flex flex-col sm:flex-row gap-6">
            <img src={img(m.photo)} alt={m.name} className="w-28 h-28 rounded-2xl object-cover bg-gray-100 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">{m.name} <ShieldCheck className="w-6 h-6 text-[#F3AC08]" /></h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{m.designation}{m.institute_name ? ` · ${m.institute_name}` : ''}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1 font-bold text-gray-800 dark:text-gray-100"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {m.mentor_rating.toFixed(1)} <span className="text-gray-400 font-normal">({m.mentor_reviews} reviews)</span></span>
                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300"><Video className="w-4 h-4 text-[#F3AC08]" /> {m.session_minutes}-Min Video Session</span>
                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300"><Calendar className="w-4 h-4 text-[#F3AC08]" /> Flexible booking</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">{m.specialties.map((s) => <span key={s} className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 dark:bg-gray-700 text-[#b57d05] dark:text-amber-300">{s}</span>)}</div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About {m.name.split(' ')[0]}</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{m.about}</p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
              {['Personalised 1:1 guidance', 'Career and learning path advice', 'Portfolio / project feedback', 'Actionable next steps after each session'].map((t) => <li key={t} className="flex gap-2 text-gray-700 dark:text-gray-200"><CircleCheck className="w-4 h-4 text-[#F3AC08] shrink-0 mt-0.5" />{t}</li>)}
            </ul>
          </div>
          {m.courses.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Courses by {m.name}</h2>
              <div className="grid sm:grid-cols-2 gap-6">{m.courses.map((c) => <CourseCard key={c.id} course={c} />)}</div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-28 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Book 1:1 Session</h2>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Instant Lock</span>
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mb-6">{m.session_price ? <><Taka />{formatPrice(m.session_price)}</> : 'Free'} <span className="text-sm font-normal text-gray-400">/ session</span></div>
            {booked ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4"><CircleCheck className="w-8 h-8" /></div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Session Booked! 🎉</h3>
                <p className="text-sm text-gray-500 mt-1">{formatDateTime(booked.slot_at)} with {booked.mentor}</p>
                <Link to="/dashboard/bookings" className="inline-block mt-5 px-6 py-2.5 rounded-xl bg-[#111827] text-white text-sm font-bold">View my bookings</Link>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Available Slots</p>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {m.slots.map((s) => {
                    const d = new Date(s);
                    const day = d.toDateString() === new Date().toDateString() ? 'Today' : d.toDateString() === new Date(Date.now() + 86400000).toDateString() ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
                    return (
                      <button key={s} onClick={() => setSlot(s)} className={cn('p-2.5 rounded-xl border-2 text-center transition-all', slot === s ? 'border-[#F3AC08] bg-[#F3AC08] text-white' : 'border-gray-200 dark:border-gray-600 hover:border-[#F3AC08] text-gray-700 dark:text-gray-200')}>
                        <p className={cn('text-[10px]', slot === s ? 'opacity-80' : 'text-gray-400')}>{day}</p>
                        <p className="text-sm font-extrabold">{d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                      </button>
                    );
                  })}
                </div>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What would you like to discuss? (optional)" className="w-full text-sm p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-900 mb-4 focus:outline-none focus:border-[#F3AC08]" />
                <button onClick={book} disabled={busy} className="w-full py-3.5 rounded-xl bg-[#F3AC08] hover:bg-[#d89a07] text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#F3AC08]/25 disabled:opacity-70">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />} Confirm Slot Booking
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-3">Payment for sessions is collected after the mentor confirms.</p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
