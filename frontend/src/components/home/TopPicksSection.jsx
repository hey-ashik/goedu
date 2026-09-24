import { Link } from 'react-router-dom';
import CourseSlider from '../common/CourseSlider';

export default function TopPicksSection({ courses = [], loading, title = 'Curated Top Picks to Shape Your Next Learning Milestone.', description, showCircle = true, className = '' }) {
  return (
    <section aria-describedby="top-picks-description" className={`relative py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300 overflow-hidden ${className}`}>
      {showCircle && (
        <div className="hidden lg:block">
          <img className="absolute top-52 right-[-100px] w-32 md:w-64 -translate-x-1/3 -translate-y-1/4 z-0 opacity-90" src="/images/home/circle.svg" alt="" aria-hidden="true" width={274} height={739} />
        </div>
      )}
      <div>
        <div className="container mx-auto">
          <header className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#1a1f36] dark:text-white leading-tight">{title}</h2>
            </div>
            <div className="flex items-center max-w-lg">
              <div id="top-picks-description" className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                <p>{description || 'Not sure which course will really help your career right now? We highlight hand‑picked, high‑impact courses based on your interests, market demand in Bangladesh, and learner feedback.'}</p>
              </div>
            </div>
          </header>
          <CourseSlider courses={courses} loading={loading} paginationClass="top-picks-pagination" navClassName="z-50 isolate" />
          <div className="text-center mt-8">
            <Link to="/courses" aria-label="View all available courses" className="px-8 py-3 rounded-full border-2 border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white font-semibold transition-colors inline-block">View ALL</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
