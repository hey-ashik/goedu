import { Star } from 'lucide-react';
import { img, initials } from '../../utils/format';

export default function TestimonialsSection({ testimonials = [], loading }) {
  return (
    <section aria-describedby="testimonial-description" className="px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16 lg:mb-20">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#1a1f36] dark:text-white leading-tight">What Learners and Professionals Say About GoEdu?</h2>
          </div>
          <div className="flex items-start">
            <div id="testimonial-description" className="text-[#666666] dark:text-gray-400 text-base sm:text-lg leading-relaxed">
              <p>Thousands of learners across Bangladesh have upgraded their skills and careers with GoEdu’s online courses. They share how our structured lessons, local‑context examples, and recognized certificates helped them get better jobs, promotions, freelance clients, and academic opportunities.</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800/40 rounded-md p-6 sm:p-8 border border-[#e8e8e8] dark:border-gray-800 flex flex-col h-full">
                  <div className="mb-6"><div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" /></div>
                  <div className="flex-grow space-y-3 mb-8"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" /><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" /><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse" /></div>
                </div>
              ))
            : testimonials.map((t) => (
                <article key={t.id} className="bg-white dark:bg-gray-800/40 rounded-md p-6 sm:p-8 border border-[#e8e8e8] dark:border-gray-800 flex flex-col transition-colors">
                  <div className="mb-6">
                    <div className="flex gap-0.5">{Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} size={16} className="fill-[#ffc107] text-[#ffc107]" />)}</div>
                  </div>
                  <blockquote className="text-[#777777] line-clamp-6 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-8 flex-grow">{t.description}</blockquote>
                  <div className="border-t border-[#e0e0e0] dark:border-gray-800 items-center pt-6 flex gap-2">
                    {t.image ? (
                      <img src={img(t.image)} alt={`${t.name}'s profile photo`} width={48} height={48} className="border w-10 h-10 sm:w-12 sm:h-12 bg-[#ccc9c4] rounded-full flex-shrink-0 object-cover" loading="lazy" />
                    ) : (
                      <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F3AC08] text-white font-bold flex items-center justify-center flex-shrink-0">{initials(t.name)}</span>
                    )}
                    <div>
                      <cite className="font-bold text-[#1a1a1a] dark:text-white text-sm sm:text-base mb-1 not-italic block">{t.name}</cite>
                      <p className="text-[#999999] dark:text-gray-500 text-xs sm:text-sm">{t.designation || 'Member'}</p>
                    </div>
                  </div>
                </article>
              ))}
        </div>
      </div>
    </section>
  );
}
