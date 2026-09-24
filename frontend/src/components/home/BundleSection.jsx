import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { img } from '../../utils/format';

export default function BundleSection({ featured, bundles = [] }) {
  if (!featured) return null;
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 duration-300 container mx-auto">
      <div
        className="relative border rounded-[2.5rem] overflow-hidden p-6 sm:p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[460px] bg-no-repeat bg-cover bg-center bg-gradient-to-br from-[#FFF4D3] to-[#FCD53F]"
        style={featured.banner ? { backgroundImage: `url(${featured.banner})` } : undefined}
      >
        <div className="flex-1 relative z-10 text-center lg:text-left max-w-3xl flex flex-col items-center lg:items-start">
          <div className="inline-flex items-center gap-1.5 py-1.5 px-4 bg-white/95 rounded-full border border-gray-200 shadow-sm mb-6 active:scale-95 transition-all">
            <span className="h-2 w-2 rounded-full bg-[#ED8E22] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-gray-800 !font-lexend">Bundle</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#1E293B] mb-6 leading-[1.2] lg:leading-[1.15] tracking-tight !font-lexend-deca drop-shadow-sm text-center lg:text-left">{featured.title}</h2>
          <p className="text-[#334155] text-sm sm:text-base lg:text-lg mb-8 leading-relaxed max-w-2xl text-center lg:text-left mx-auto lg:mx-0">{featured.short_description}</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 sm:gap-6 w-full sm:w-auto">
            <Link to={`/bundles/${featured.slug}`} className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#1E293B] text-white hover:bg-gray-800 active:scale-95 transition-all font-semibold shadow-lg text-sm sm:text-base text-center">
              See What&apos;s in This Bundle
            </Link>
          </div>
        </div>
        <div className="flex-grow-0 flex-shrink-0 flex justify-center items-center relative z-10 w-full lg:w-auto">
          {featured.thumbnail && (
            <img src={img(featured.thumbnail)} alt="Digital institution bundle package" width={960} height={502} className="w-full h-auto sm:max-w-[320px] lg:max-w-[480px] transition-transform duration-500 hover:scale-[1.02] rounded-3xl object-contain shadow-xl" />
          )}
        </div>
      </div>

      {bundles.length > 0 && (
        <div className="mt-8">
          <Swiper
            modules={[Navigation]}
            slidesPerView={1}
            spaceBetween={20}
            navigation={{ nextEl: '.bundle-courses-next', prevEl: '.bundle-courses-prev' }}
            breakpoints={{ 640: { slidesPerView: 2.2, spaceBetween: 20 }, 1024: { slidesPerView: 2.7, spaceBetween: 24 } }}
            className="bundle-courses-swiper mb-4"
          >
            {bundles.map((b) => (
              <SwiperSlide key={b.id} className="!h-auto">
                <article className="h-full">
                  <div className="group flex flex-row items-center gap-3 bg-white dark:bg-gray-800/40 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow h-full">
                    <div className="w-[110px] h-[110px] sm:w-32 sm:h-28 rounded-xl overflow-hidden relative flex-shrink-0">
                      <img src={img(b.thumbnail)} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <Link to={`/bundles/${b.slug}`} className="text-sm font-bold text-[#001858] dark:text-white hover:text-[#F3AC08] transition-colors line-clamp-2 leading-snug">{b.title}</Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{b.short_description}</p>
                      <Link to={`/bundles/${b.slug}`} className="text-xs font-semibold text-[#F3AC08] mt-2">View bundle →</Link>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="flex justify-end gap-2">
            <button type="button" aria-label="Previous bundles" className="bundle-courses-prev w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-300 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button type="button" aria-label="Next bundles" className="bundle-courses-next w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black hover:bg-gray-800 transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </section>
  );
}
