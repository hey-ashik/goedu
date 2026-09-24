import { Link } from 'react-router-dom';
import { BookOpen, Clock, ThumbsUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn, formatPrice, img } from '../../utils/format';

export function Taka({ className }) {
  return <span className={cn('font-bengali', className)}>৳</span>;
}

/**
 * Course card - a faithful port of the goedu.ac card (image with gradient +
 * title overlay, instructor, stats row, price + "Details" button).
 */
export default function CourseCard({ course, className }) {
  const { user } = useAuth();
  const hasSub = !!user?.subscription;
  const benefit = user?.subscription_benefit || 0;
  const c = course;
  const showSubFree = c.is_subscription && hasSub;
  const memberPrice = benefit > 0 && !c.is_discount && c.price > 0 ? Math.round(c.price * (1 - benefit / 100)) : null;

  const Price = () => {
    if (c.price === 0) return <span className="text-lg font-bold text-green-600">Free</span>;
    if (memberPrice !== null) {
      return (
        <div className="flex space-x-1 text-[1.379rem] font-bold text-[#333333] dark:text-gray-100">
          <div><Taka className="font-semibold" />{formatPrice(memberPrice)}</div>
          <div><span className="line-through text-[#757575] dark:text-gray-500 text-sm"><Taka />{formatPrice(c.price)}</span></div>
        </div>
      );
    }
    if (c.is_discount && c.discount_price > 0) {
      return (
        <div className="flex space-x-1 text-[1.379rem] font-bold text-[#333333] dark:text-gray-100">
          <div><Taka className="font-semibold" />{formatPrice(c.discount_price)}</div>
          <div><span className="line-through text-[#757575] dark:text-gray-500 text-sm"><Taka />{formatPrice(c.price)}</span></div>
        </div>
      );
    }
    return (
      <div className="flex space-x-1 text-[1.379rem] font-bold text-[#333333] dark:text-gray-100">
        <div><Taka className="font-semibold" />{formatPrice(c.price)}</div>
      </div>
    );
  };

  return (
    <article className={cn('h-full', className)}>
      <div className="bg-white dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col group">
        <div className="relative h-60 flex-shrink-0 overflow-hidden">
          <img
            src={img(c.thumbnail)}
            alt={`${c.title} course thumbnail`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
          {c.is_discount && c.discount_price > 0 && c.price > c.discount_price && (
            <div className="absolute top-2 left-2 text-sm inline-block p-1.5 mt-2 bg-[#CBFDDA] dark:bg-emerald-900/30 rounded-full">
              <p className="text-[#33691E] dark:text-emerald-400 font-jost px-1">
                Save <Taka />{Math.round(c.price - c.discount_price)}
              </p>
            </div>
          )}
          {c.is_subscription && (
            <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-[#111827]/80 text-amber-300 px-2 py-1 rounded-full backdrop-blur">Learner Plus</span>
          )}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <Link to={`/courses/${c.slug}`}>
              <h3 className="text-[18px] sm:text-[20px] font-bold text-white line-clamp-2 drop-shadow-md leading-tight group-hover:text-[#F3AC08] transition-colors duration-300">{c.title}</h3>
            </Link>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-3">
            <img className="w-12 h-12 rounded-full object-cover bg-gray-100" src={img(c.instructor?.photo)} alt={`${c.instructor?.name || 'Instructor'} profile photo`} width={48} height={48} loading="lazy" />
            <div className="min-w-0">
              <p className="font-semibold text-[#525252] dark:text-gray-200 truncate">{c.instructor?.name}</p>
              <p className="text-sm text-[#868686] dark:text-gray-400">{c.instructor?.title || 'instructor'}</p>
            </div>
          </div>
          <div className="flex items-center pt-4 border-t border-gray-100 dark:border-gray-800 gap-4 mb-4 text-sm flex-wrap">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <ThumbsUp aria-hidden="true" className="w-4 h-4 text-[#F59E0B]" />
              <span>{c.rating_percent}% ({c.reviews_label})</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Clock aria-hidden="true" className="w-4 h-4 text-[#F59E0B]" />
              <span>{c.duration_label}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <BookOpen aria-hidden="true" className="w-4 h-4 text-[#F59E0B]" />
              <span>{c.total_lesson} Lessons</span>
            </div>
          </div>
          <div className={cn('flex items-center pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto gap-3', showSubFree ? 'justify-center' : 'justify-between')}>
            {!showSubFree && (
              <div className="flex flex-col items-start gap-1">
                <div className="flex gap-2 items-center"><Price /></div>
                {c.is_subscription && (
                  <Link to="/subscription" className="text-[#F3AC08] hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm font-semibold">Free With Subscription</Link>
                )}
              </div>
            )}
            <div className={cn('rounded-lg p-[2px]', showSubFree && 'w-full')} style={{ background: 'linear-gradient(180deg,#FFEDD8,#FFD8AC)' }}>
              <Link
                to={`/courses/${c.slug}`}
                aria-label={`View details of ${c.title}`}
                className={cn('flex justify-center items-center px-6 lg:py-2 py-1 bg-[#FFF5DE] hover:bg-[#FFE4B5] text-gray-900 rounded-lg font-semibold h-11 transition-colors', showSubFree ? 'w-full' : 'lg:w-[11.625rem] w-[10rem] sm:w-full')}
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden h-full flex flex-col animate-pulse">
      <div className="h-60 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-4 flex-1">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2 flex-1"><div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" /><div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" /></div>
        </div>
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex justify-between items-center pt-4"><div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded" /><div className="h-11 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg" /></div>
      </div>
    </div>
  );
}
