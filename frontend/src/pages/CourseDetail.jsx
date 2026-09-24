import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Award, BookOpen, ChartNoAxesColumnIncreasing, ChevronDown, CircleCheckBig, Clock, Download, FileText, Globe, Heart, Info, Lock, LockOpen, MonitorPlay, Play, Star, Loader2,
} from 'lucide-react';
import Seo from '../components/common/Seo';
import ContentLoader from '../components/common/ContentLoader';
import TopPicksSection from '../components/home/TopPicksSection';
import { Stars } from '../components/common/ui';
import { Taka } from '../components/common/CourseCard';
import { CourseApi, OrderApi, ReviewApi, WishlistApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { cn, formatDate, formatPrice, img, lessonTime, totalLength } from '../utils/format';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'course-content', label: 'Course Content' },
  { id: 'what-you-will-learn', label: 'What You Will Learn' },
  { id: 'instructor', label: 'Instructor' },
  { id: 'review', label: 'Review' },
];

function Section({ course }) {
  const [open, setOpen] = useState(() => new Set([course.sections[0]?.id]));
  const [showAll, setShowAll] = useState(course.sections.length <= 5);
  const sections = showAll ? course.sections : course.sections.slice(0, 5);
  const toggle = (id) => setOpen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <section id="course-content" className="scroll-mt-32">
      <div className="flex lg:flex-row flex-col items-center justify-between mb-6 gap-2">
        <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">Course Content</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
          {course.section_count} sections • {course.lecture_count} lectures • {course.total_quiz} quizzes • {course.total_assignment} assignments • {totalLength(course.course_length)} total length
        </div>
      </div>
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
        {sections.map((s) => (
          <div key={s.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
            <button onClick={() => toggle(s.id)} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <ChevronDown className={cn('w-5 h-5 text-gray-500 transition-transform', open.has(s.id) && 'rotate-180')} />
                <span className="font-bold text-[#1a1a1a] dark:text-white text-left">{s.title}</span>
              </div>
              <span className="text-xs text-gray-400 shrink-0 ml-2">{s.lessons.length} lectures</span>
            </button>
            <div className={cn('overflow-hidden transition-all', open.has(s.id) ? 'max-h-[3000px]' : 'max-h-0')}>
              <div className="px-4 py-2 space-y-1">
                {s.lessons.map((l) => (
                  <div key={l.id} className={cn('flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 group transition-colors', l.is_free_preview ? 'cursor-pointer' : 'cursor-default')}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center flex-shrink-0">
                        {l.type === 'quiz' ? <FileText className="w-3 h-3 text-gray-500" /> : l.type === 'assignment' ? <CircleCheckBig className="w-3 h-3 text-gray-500" /> : <Play className="w-3 h-3 text-gray-500 fill-current" />}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#F3AC08] truncate">{l.title}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn('text-xs', l.is_free_preview ? 'text-green-600' : 'text-amber-600')}>{l.is_free_preview ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span>
                      <span className="text-xs text-gray-400">{lessonTime(l.duration_seconds)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {!showAll && (
        <div className="mt-4">
          <button onClick={() => setShowAll(true)} className="w-full bg-[#333] hover:bg-black text-white text-sm font-semibold py-3 rounded-xl transition-colors">Load all {course.sections.length} sections</button>
        </div>
      )}
    </section>
  );
}

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const { add: addToCart, loading: cartBusy } = useCart();
  const [active, setActive] = useState('overview');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const q = useQuery({ queryKey: ['course', slug], queryFn: () => CourseApi.detail(slug) });
  const related = useQuery({ queryKey: ['course-related', slug], queryFn: () => CourseApi.related(slug), enabled: !!q.data });
  const course = q.data?.course;

  useEffect(() => {
    if (course?.user_review) { setRating(course.user_review.rating); setComment(course.user_review.comment || ''); }
  }, [course?.user_review]);

  useEffect(() => {
    const onScroll = () => {
      const offsets = TABS.map((t) => ({ id: t.id, top: document.getElementById(t.id)?.getBoundingClientRect().top ?? Infinity }));
      const current = offsets.filter((o) => o.top <= 140).pop();
      if (current) setActive(current.id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (id) => { setActive(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const requireLogin = () => { toast.error('Please login to continue'); navigate(`/authentication?callbackUrl=${encodeURIComponent(`/courses/${slug}`)}`); };

  const buy = async () => {
    if (!isAuthenticated) return requireLogin();
    if (course.enroll_status === 'enrolled') return navigate(`/dashboard/learn/${slug}`);
    if (course.price === 0 || (course.is_subscription && user?.subscription)) {
      setBusy(true);
      try {
        const res = await OrderApi.enrollFree(course.id);
        toast.success(res.message);
        qc.invalidateQueries({ queryKey: ['course', slug] });
        navigate(`/dashboard/learn/${slug}`);
      } catch (err) { toast.error(err.message); } finally { setBusy(false); }
      return;
    }
    const ok = await addToCart({ course_id: course.id }, { open: false });
    if (ok) navigate('/checkout');
  };

  const toggleWish = async () => {
    if (!isAuthenticated) return requireLogin();
    try {
      const res = await WishlistApi.toggle(course.id);
      toast.success(res.message);
      qc.setQueryData(['course', slug], (old) => old && { ...old, course: { ...old.course, wish_list_status: res.wished } });
    } catch (err) { toast.error(err.message); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return requireLogin();
    if (!rating) return toast.error('Please select a star rating');
    setBusy(true);
    try {
      const res = await ReviewApi.submit({ course_id: course.id, rating, comment });
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ['course', slug] });
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const price = useMemo(() => {
    if (!course) return null;
    if (course.price === 0) return { main: 'Free' };
    const benefit = user?.subscription_benefit || 0;
    if (course.is_discount && course.discount_price > 0) return { main: course.discount_price, old: course.price };
    if (benefit && !course.is_discount) return { main: Math.round(course.price * (1 - benefit / 100)), old: course.price, note: `Learner Plus ${benefit}% off` };
    return { main: course.price };
  }, [course, user]);

  if (q.isLoading) return <ContentLoader />;
  if (q.error || !course) {
    return (
      <div className="pt-40 pb-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Course not found</h1>
        <Link to="/courses" className="text-[#F3AC08] font-semibold">Browse all courses</Link>
      </div>
    );
  }

  const enrolled = course.enroll_status === 'enrolled';
  const subFree = course.is_subscription && user?.subscription;
  const cta = enrolled ? 'Go to Course' : course.price === 0 ? 'Enroll for Free' : subFree ? 'Start Learning (Learner Plus)' : 'Buy Now';

  return (
    <div className="min-h-screen bg-[#fffcf6] dark:bg-gray-900 pt-[6.2rem]">
      <Seo title={course.title} description={course.meta_description || `${course.title} - online course on GoEdu`} image={course.thumbnail} />
      {/* yellow hero */}
      <div className="container md:mx-auto bg-gradient-to-b from-[#FFF4D3] to-[#FCD53F] dark:from-gray-800 dark:to-gray-900 rounded-3xl px-4 lg:px-8 pt-10">
        <div className="lg:pb-10 mx-auto md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 lg:pb-0">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                <Link to="/courses" className="hover:text-[#F3AC08]">Courses</Link><span>/</span>
                <Link to={`/courses?category=${course.category_id}`} className="hover:text-[#F3AC08]">{course.category_name}</Link>
              </div>
              <h1 className="w-full text-2xl md:text-4xl font-bold text-[#1a1a1a] dark:text-white leading-tight">{course.title}</h1>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm inline-block w-full min-w-[300px]">
                {course.tags?.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-4"><Info className="w-4 h-4 text-gray-400" /><span className="font-bold text-sm text-[#1a1a1a] dark:text-white">Skills That Are Tagged</span></div>
                    <div className="flex flex-wrap gap-2">{course.tags.map((t) => <span key={t} className="bg-[#FFF5DE] dark:bg-gray-700 text-[#49454F] dark:text-gray-200 px-4 py-1.5 text-xs font-semibold rounded-md border border-[#F3AC08]/10">{t}</span>)}</div>
                  </>
                )}
                <div className="bg-transparent pt-4">
                  <p className="font-semibold text-[#1a1a1a] dark:text-white mb-4">This course includes:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-4 sm:gap-x-8 max-w-2xl">
                    <div className="flex items-center gap-3"><MonitorPlay className="w-5 h-5 text-[#F3AC08]" /><span className="text-sm text-gray-700 dark:text-gray-300">{course.total_hours}+ hours on-demand video</span></div>
                    <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-[#F3AC08]" /><span className="text-sm text-gray-700 dark:text-gray-300">{course.total_quiz} Quiz</span></div>
                    <div className="flex items-center gap-3"><CircleCheckBig className="w-5 h-5 text-[#F3AC08]" /><span className="text-sm text-gray-700 dark:text-gray-300">{course.total_assignment} Assignments</span></div>
                    <div className="flex items-center gap-3"><Download className="w-5 h-5 text-[#F3AC08]" /><span className="text-sm text-gray-700 dark:text-gray-300">{course.total_lesson} Lessons</span></div>
                    <div className="flex items-center gap-3"><MonitorPlay className="w-5 h-5 text-[#F3AC08]" /><span className="text-sm text-gray-700 dark:text-gray-300">Access on mobile</span></div>
                    <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-[#F3AC08]" /><span className="text-sm text-gray-700 dark:text-gray-300">{course.language_name || 'English'}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-4" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 -mt-5 lg:-mt-18 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 lg:mt-12">
            <div className="sticky top-[4.4rem] lg:top-[5.3rem] py-1 lg:py-2 z-30 border-b border-gray-200 dark:border-gray-700 mb-6 lg:mb-8 -mx-4 px-4 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
              <div className="flex items-center gap-4 sm:gap-8 min-w-max lg:justify-start mx-auto lg:mx-0 max-w-7xl">
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => goTo(t.id)} className={cn('py-4 px-4 lg:py-2.5 text-sm font-bold transition-all whitespace-nowrap', active === t.id ? 'text-[#F3AC08]' : 'text-[#373737] dark:text-gray-300 hover:text-[#F3AC08]')}>{t.label}</button>
                ))}
              </div>
            </div>

            <div className="space-y-12 pb-20">
              <section id="overview" className="scroll-mt-32 bg-white dark:bg-gray-800 rounded-2xl lg:p-8 p-4">
                <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-4">Overview</h2>
                <div className="rich-content max-w-none text-gray-600 dark:text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: course.description || '<p>No description available.</p>' }} />
              </section>

              {course.sections.length > 0 && <Section course={course} />}

              <section id="what-you-will-learn" className="scroll-mt-32">
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 bg-white dark:bg-gray-800">
                  <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-6">What You Will Learn</h2>
                  <div className="rich-content wyl-list max-w-none text-sm" dangerouslySetInnerHTML={{ __html: course.what_you_learn || '<p>Practical, job-ready skills taught step by step.</p>' }} />
                </div>
              </section>

              <section id="instructor" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-6">Instructor</h2>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <Link className="flex-shrink-0" to={`/instructor/${course.instructor.slug}`}>
                      <img alt={course.instructor.name} width={80} height={80} className="rounded-full object-cover w-16 h-16 sm:w-20 sm:h-20 bg-gray-100" src={img(course.instructor.photo)} />
                    </Link>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] dark:text-white hover:text-[#F3AC08]"><Link to={`/instructor/${course.instructor.slug}`}>{course.instructor.name}</Link></h3>
                      <p className="text-sm text-gray-500 mb-2">{course.instructor.title}{course.instructor.institute ? ` · ${course.instructor.institute}` : ''}</p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                        <div className="flex items-center gap-1"><Award className="w-4 h-4 flex-shrink-0" /><span>{course.instructor.total_student_enrolled} Students</span></div>
                        <div className="flex items-center gap-1"><BookOpen className="w-4 h-4 flex-shrink-0" /><span>{course.instructor.total_course} Courses</span></div>
                      </div>
                      {course.instructor.about && <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{course.instructor.about}</div>}
                    </div>
                  </div>
                </div>
              </section>

              <section id="review" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-6">Student Feedback</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex flex-col items-center justify-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                      <span className="text-4xl font-bold text-[#F3AC08]">{course.review_summary.avg}</span>
                      <Stars value={Number(course.review_summary.avg)} className="my-2" />
                      <span className="text-sm text-gray-500 font-semibold">Course Rating</span>
                    </div>
                    <p className="text-sm text-gray-500">{course.review_summary.total} review{course.review_summary.total === 1 ? '' : 's'}</p>
                  </div>
                  <form onSubmit={submitReview} className="mb-8">
                    <div className="mb-4">
                      <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">{course.user_review ? 'Update your review' : 'Write a Review'}</label>
                      <Stars value={rating} onChange={setRating} size={24} className="mb-4" activeClass="text-[#F3AC08] fill-[#F3AC08]" />
                      <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-3 border dark:border-gray-700 dark:bg-gray-900 rounded-lg focus:outline-none focus:border-[#F3AC08]" rows={4} placeholder="Your review..." />
                    </div>
                    <button type="submit" disabled={busy} className="bg-[#F3AC08] text-white px-6 py-2 rounded-lg font-bold disabled:opacity-60">{busy ? 'Saving...' : 'Submit Review'}</button>
                  </form>
                  <div className="space-y-6">
                    {course.reviews.map((r) => (
                      <div key={r.id} className="flex gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                        <img src={img(r.user_photo)} alt={r.user_name} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold text-gray-900 dark:text-white">{r.user_name}</span><Stars value={r.rating} size={12} /><span className="text-xs text-gray-400">{formatDate(r.created_at)}</span></div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* sticky purchase card */}
          <div className="lg:col-span-4 relative order-first lg:order-last">
            <div className="lg:sticky mt-6 lg:mt-12 lg:top-24 z-20 lg:-mt-[340px]">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 p-2">
                <div className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group mb-4">
                  <img alt={course.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={img(course.thumbnail)} />
                  {course.promo_video && (
                    <a href={course.promo_video} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20"><span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center"><Play className="w-6 h-6 text-[#F3AC08] fill-current ml-1" /></span></a>
                  )}
                </div>
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="text-3xl font-extrabold text-[#1a1a1a] dark:text-white">{price.main === 'Free' ? 'Free' : <><Taka />{formatPrice(price.main)}</>}</span>
                    {price.old && <span className="text-base text-gray-400 line-through"><Taka />{formatPrice(price.old)}</span>}
                    {course.is_subscription && !subFree && <Link to="/subscription" className="text-xs font-bold text-[#F3AC08]">Free with Learner Plus</Link>}
                  </div>
                  {price.note && <p className="text-xs text-green-600 font-semibold mb-3">{price.note}</p>}
                  <div className="flex gap-3 mb-2">
                    <button onClick={buy} disabled={busy || cartBusy} className="flex-1 bg-[#F3AC08] hover:bg-[#d49607] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-200 dark:shadow-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {(busy || cartBusy) && <Loader2 className="w-4 h-4 animate-spin" />}{cta}
                    </button>
                    <button onClick={toggleWish} className="p-3.5 border border-[#F3AC08] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group" aria-label="Add to wishlist">
                      <Heart className={cn('w-6 h-6 text-[#F3AC08] group-hover:text-red-500', course.wish_list_status && 'fill-red-500 text-red-500')} />
                    </button>
                  </div>
                  {!enrolled && course.price > 0 && !subFree && (
                    <button onClick={() => (isAuthenticated ? addToCart({ course_id: course.id }) : requireLogin())} className="w-full mb-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-[#F3AC08] hover:text-[#F3AC08]">Add to Cart</button>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-1"><MonitorPlay className="w-4 h-4 text-[#F3AC08]" /><span>{course.total_enroll} Enrolled</span></div>
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-[#F3AC08]" /><span>{course.total_hours} Hours</span></div>
                    <div className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-[#F3AC08]" /><span>{course.total_lesson} Lessons</span></div>
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  {[
                    { Icon: FileText, title: 'Shareable Certificate', text: 'Earn a Certificate upon completion' },
                    { Icon: Globe, title: '100% online courses', text: 'Start instantly and learn at your own schedule.' },
                    { Icon: ChartNoAxesColumnIncreasing, title: `${course.level_name} Level`, text: 'No prior experience required.' },
                  ].map((f, i) => (
                    <div key={f.title}>
                      {i > 0 && <div className="w-full h-px bg-gray-100 dark:bg-gray-700 mb-4" />}
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-orange-50 dark:bg-gray-700 rounded-lg"><f.Icon className="w-6 h-6 text-[#F3AC08]" /></div>
                        <div>
                          <h4 className="font-bold text-[#F3AC08] text-sm mb-1">{f.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{f.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TopPicksSection
        courses={related.data?.results || []}
        loading={related.isLoading}
        title="Top Picks for You"
        description="Highlight curated, trending, or personalized courses that push users closer to enrollment - based on what they've just learned about GoEdu’s credibility."
        showCircle={false}
      />
    </div>
  );
}
