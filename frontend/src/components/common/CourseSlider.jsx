import { useId } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CourseCard, { CourseCardSkeleton } from './CourseCard';
import { cn } from '../../utils/format';

/**
 * Horizontal course slider (Swiper) with the goedu.ac prev/next buttons and
 * pill pagination. `nav` renders the buttons row, `pagination` the bullets.
 */
export default function CourseSlider({ courses = [], loading = false, paginationClass = 'popular-courses-pagination', navClassName, emptyText = 'No courses available for the selected category and filter.', slidesPerView = 3 }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const prev = `prev-${uid}`;
  const next = `next-${uid}`;

  return (
    <>
      <nav aria-label="Course slider navigation" className={cn('flex items-center justify-end mb-8', navClassName)}>
        <div className="flex gap-2">
          <button type="button" aria-label="Previous courses" className={`${prev} w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors`}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" aria-label="Next courses" className={`${next} w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors`}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </nav>
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      ) : courses.length === 0 ? (
        <p className="text-center py-12 text-gray-500">{emptyText}</p>
      ) : (
        <Swiper
          modules={[Navigation, Pagination]}
          slidesPerView={1}
          spaceBetween={20}
          navigation={{ prevEl: `.${prev}`, nextEl: `.${next}` }}
          pagination={{ el: `.${paginationClass}-${uid}`, clickable: true }}
          breakpoints={{ 640: { slidesPerView: 2, spaceBetween: 20 }, 1024: { slidesPerView, spaceBetween: 24 } }}
          className="mb-8 !pb-1"
        >
          {courses.map((c) => (
            <SwiperSlide key={c.id} className="!h-auto">
              <CourseCard course={c} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      <nav aria-label="Course slider pagination" className={`${paginationClass} ${paginationClass}-${uid} flex justify-center gap-2`} />
    </>
  );
}
