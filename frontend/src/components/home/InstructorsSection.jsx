import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, img } from '../../utils/format';

export default function InstructorsSection({ instructors = [] }) {
  const [hover, setHover] = useState(null);
  if (!instructors.length) return null;
  return (
    <section aria-describedby="instructors-description" className="py-16 px-4 sm:px-6 lg:px-8 bg-[url('/images/home/ins-bg.svg')] bg-cover bg-center bg-[#1b2233]">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Meet Your Instructors</h2>
          <div id="instructors-description" className="text-gray-400 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Our courses are created by experienced professionals, researchers, and educators from Bangladesh&apos;s top universities and industries.
          </div>
        </header>
        <nav aria-label="Instructor slider navigation" className="flex justify-end gap-2 mb-10">
          <button type="button" aria-label="Previous instructors" className="instructors-prev w-11 h-11 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <button type="button" aria-label="Next instructors" className="instructors-next w-11 h-11 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-100 transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </nav>
        <Swiper
          modules={[Navigation, Pagination]}
          slidesPerView={1}
          spaceBetween={20}
          loop={instructors.length > 4}
          navigation={{ nextEl: '.instructors-next', prevEl: '.instructors-prev' }}
          pagination={{ el: '.instructors-pagination', clickable: true }}
          breakpoints={{ 640: { slidesPerView: 2, spaceBetween: 20 }, 1024: { slidesPerView: 3, spaceBetween: 24 }, 1280: { slidesPerView: 4, spaceBetween: 24 } }}
          className="instructors-swiper mb-8"
        >
          {instructors.map((ins, i) => (
            <SwiperSlide key={ins.id}>
              <article>
                <div className={cn('rounded-2xl overflow-hidden transition-all border-[3px]', hover === i ? 'border-[#D4AF37]' : 'border-gray-800')}>
                  <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-900" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                    {hover === i && ins.promo_video ? (
                      <video src={ins.promo_video} autoPlay muted loop playsInline aria-label={`${ins.name} introduction video`} className="w-full h-full object-cover object-top" />
                    ) : (
                      <>
                        <img src={img(ins.photo)} alt={`${ins.name} profile photo`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#222939] via-black/40 to-transparent" />
                        <div className="absolute text-center bottom-0 left-6 right-6 pb-3">
                          {ins.featured_topic && <p className="text-white font-medium">Learn</p>}
                          <h3 className="text-white font-karantina uppercase font-bold line-clamp-2 text-3xl tracking-wide leading-tight">{ins.featured_topic}</h3>
                        </div>
                      </>
                    )}
                  </div>
                  <Link to={`/instructor/${ins.slug}`} className="block bg-[#222939] dark:bg-white p-5 h-28 flex flex-col justify-center transition-colors">
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-1.5 line-clamp-1">
                      With <span className="font-bold text-white dark:text-[#222939]">{ins.name}</span>
                    </p>
                    <p className="text-xs text-white dark:text-[#222939] leading-relaxed line-clamp-2">
                      {ins.designation}<br />{ins.institute_name}
                    </p>
                  </Link>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
        <nav aria-label="Instructor slider pagination" className="flex justify-center items-center mb-10">
          <div className="instructors-pagination flex justify-center gap-2" />
        </nav>
        <div className="text-center">
          <Link to="/courses" aria-label="Explore GoEdu courses" className="px-12 py-5 bg-[#E7B108] hover:bg-[#E08E00] text-black rounded-full font-semibold transition-colors text-base inline-block">Explore Goedu</Link>
        </div>
      </div>
    </section>
  );
}
