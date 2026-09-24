import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BookOpen, CircleCheck, Clock, Layers, Loader2, Target, Users } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageLoader from '../components/common/PageLoader';
import CourseCard, { Taka } from '../components/common/CourseCard';
import { BundleCard } from './Bundles';
import { BundleApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice, img, totalLength } from '../utils/format';

export default function BundleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { add, loading } = useCart();
  const q = useQuery({ queryKey: ['bundle', slug], queryFn: () => BundleApi.detail(slug) });
  const b = q.data?.bundle;

  if (q.isLoading) return <PageLoader />;
  if (!b) return <div className="pt-40 pb-20 text-center"><h1 className="text-2xl font-bold">Bundle not found</h1><Link to="/bundles" className="text-[#F3AC08] font-semibold">All bundles</Link></div>;

  const buy = async () => {
    if (!isAuthenticated) { toast.error('Please login to continue'); return navigate(`/authentication?callbackUrl=${encodeURIComponent(`/bundles/${slug}`)}`); }
    if (b.enrolled) return navigate('/dashboard/my-learning');
    const ok = await add({ bundle_id: b.id }, { open: false });
    if (ok) navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 pt-[4.2rem] lg:pt-24 pb-16">
      <Seo title={b.title} description={b.short_description} image={b.thumbnail} />
      <div className="container md:mx-auto bg-gradient-to-b from-[#FFF4D3] to-[#FCD53F] dark:from-gray-800 dark:to-gray-900 rounded-3xl px-4 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center md:px-8">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 py-1.5 px-4 bg-white/95 rounded-full border border-gray-200 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#ED8E22] animate-pulse" /><span className="text-xs sm:text-sm font-bold text-gray-800 !font-lexend">Course Bundle</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1E293B] dark:text-white leading-tight !font-lexend-deca">{b.title}</h1>
            <p className="text-[#334155] dark:text-gray-300 text-base lg:text-lg leading-relaxed">{b.short_description}</p>
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-[#b57d05]" /> {b.total_courses} Courses</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-[#b57d05]" /> {b.total_lessons} Lessons</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#b57d05]" /> {totalLength(b.total_length)}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#b57d05]" /> {b.total_enroll} Enrolled</span>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-3">
              <img src={img(b.thumbnail)} alt={b.title} className="w-full aspect-video object-cover rounded-xl mb-4" />
              <div className="px-2 pb-2">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white"><Taka />{formatPrice(b.effective_price)}</span>
                  {b.is_discount && <span className="text-lg text-gray-400 line-through"><Taka />{formatPrice(b.price)}</span>}
                </div>
                {b.savings > 0 && <p className="text-sm font-bold text-green-600 mb-4">You save <Taka />{formatPrice(b.savings)} compared to buying separately</p>}
                <button onClick={buy} disabled={loading} className="w-full bg-[#F3AC08] hover:bg-[#d49607] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}{b.enrolled ? 'Go to My Learning' : 'Buy This Bundle'}
                </button>
                {!b.enrolled && <button onClick={() => (isAuthenticated ? add({ bundle_id: b.id }) : navigate('/authentication'))} className="w-full mt-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-[#F3AC08] hover:text-[#F3AC08]">Add to Cart</button>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this bundle</h2>
            <div className="rich-content text-sm" dangerouslySetInnerHTML={{ __html: b.description }} />
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Courses in this bundle ({b.courses.length})</h2>
            <div className="grid sm:grid-cols-2 gap-6">{b.courses.map((c) => <CourseCard key={c.id} course={c} />)}</div>
          </section>
        </div>
        <aside className="lg:col-span-4 space-y-8">
          {b.what_you_learn?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#F3AC08]" /> What you will learn</h3>
              <ul className="space-y-2.5">{b.what_you_learn.map((x, i) => <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-200"><CircleCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{x}</li>)}</ul>
            </div>
          )}
          {b.career_outcome?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-[#F3AC08]" /> Career outcomes</h3>
              <ul className="space-y-2.5">{b.career_outcome.map((x, i) => <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-200"><CircleCheck className="w-4 h-4 text-[#F3AC08] shrink-0 mt-0.5" />{x}</li>)}</ul>
            </div>
          )}
        </aside>
      </div>

      {b.other_bundles?.length > 0 && (
        <div className="container mx-auto px-4 md:px-8 mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Other bundles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{b.other_bundles.map((x) => <BundleCard key={x.id} bundle={{ ...x, total_courses: x.total_courses || '' }} />)}</div>
        </div>
      )}
    </div>
  );
}
