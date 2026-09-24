import { ArrowRight } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const card = 'bg-gradient-to-t from-[#FDEABF] via-[#FEF6E4] to-[#FFF8E9] dark:bg-gradient-to-t dark:from-gray-800/40 dark:via-gray-800/40 dark:to-gray-800/40 rounded-[2.5rem] relative overflow-hidden group hover:shadow-xl transition-all';
const Arrow = () => (
  <div className="absolute top-8 right-8 text-[#F59E0B] z-20">
    <ArrowRight className="w-10 h-10 -rotate-45 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" strokeWidth={2} />
  </div>
);

export default function WhyTrustSection() {
  const { settings } = useSiteSettings();
  return (
    <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden dark:bg-gray-900 transition-colors duration-300">
      <img className="hidden md:block absolute top-0 left-0 w-32 rotate-45 md:w-64 -translate-x-1/3 -translate-y-1/4 z-0 opacity-90" src="/images/home/half-circle.svg" alt="" aria-hidden="true" width={256} height={256} />
      <div className="container mx-auto relative z-10">
        <header className="text-center gap-8 mb-16 relative">
          <div>
            <h2 className="font-lexend-deca max-w-5xl mx-auto text-3xl md:text-5xl font-semibold text-[#ED8E22] mb-4 leading-tight">Why Learners, Parents, and Institutions Trust GoEdu?</h2>
            <div id="trust-description" className="max-w-3xl mx-auto text-[#323232] dark:text-gray-300 text-lg md:text-[22px] leading-snug">
              Choosing the right online course can be confusing, so GoEdu offers GEAC‑accredited programs, clear course details, and widely accepted certificates—making it a secure, structured, and affordable way to keep learning. GoEdu is the home of 100k+ learners throughout the country!
            </div>
          </div>
        </header>
        <div className="grid gap-6">
          <div className="grid md:grid-cols-12 gap-6">
            <article className={`${card} md:col-span-5 h-[320px] md:h-[340px]`}>
              <Arrow />
              <div className="p-10 relative z-20">
                <p className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2">{settings.stats_courses}+</p>
                <p className="text-gray-700 dark:text-gray-300 text-xl font-medium">Professional Courses</p>
              </div>
              <img src="/images/home/img-1.png" alt="Professional courses illustration" width={500} height={500} className="absolute bottom-0 drop-shadow-2xl h-[60%] left-0 w-3/4 md:w-full object-contain z-10" loading="lazy" />
            </article>
            <article className={`${card} md:col-span-7 h-[320px] md:h-[340px]`}>
              <Arrow />
              <div className="p-10 relative z-20">
                <p className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2">{settings.stats_learners}+</p>
                <p className="text-gray-700 dark:text-gray-300 text-xl font-medium">Active Learners</p>
              </div>
              <img src="/images/home/img-2.png" alt="Active learners illustration" width={500} height={500} className="absolute bottom-0 right-0 h-[85%] md:h-[95%] object-contain z-10" loading="lazy" />
            </article>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <article className={`${card} p-10 h-[300px]`}>
              <Arrow />
              <div className="relative z-20">
                <p className="text-5xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">{settings.stats_instructors}+</p>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">Instructors</p>
              </div>
              <div className="absolute bottom-8 left-8 z-10">
                <img src="/images/home/img-3.png" alt="Instructor illustration" width={186} height={56} className="h-14" loading="lazy" />
              </div>
            </article>
            <article className={`${card} p-10 h-[300px]`}>
              <Arrow />
              <div className="flex flex-col h-full">
                <p className="text-5xl sm:text-6xl font-bold text-[#373737] dark:text-white mb-3">{settings.stats_satisfaction}%</p>
                <p className="text-[#757575] dark:text-gray-300 text-base font-medium">Satisfaction Rate</p>
                <img className="w-[50%] absolute bottom-5 right-5" src="/images/home/img-5.png" alt="" aria-hidden="true" width={200} height={200} loading="lazy" />
              </div>
            </article>
            <article className={`${card} p-10 h-[300px]`}>
              <Arrow />
              <div className="relative z-20">
                <p className="text-5xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">GEAC</p>
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 font-medium">Accredited</p>
              </div>
              <img src="/images/home/img-4.png" alt="GEAC accreditation badge" width={192} height={192} className="absolute bottom-6 right-6 h-[12rem] w-auto z-10" loading="lazy" />
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
