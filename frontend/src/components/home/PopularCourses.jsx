import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CourseApi, SiteApi } from '../../services/api';
import CourseSlider from '../common/CourseSlider';
import { SectionTag } from '../common/ui';
import { cn } from '../../utils/format';

export default function PopularCourses() {
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SiteApi.categories({ courses: 'true' })
      .then((r) => {
        const cats = (r.results || []).slice(0, 7);
        setCategories(cats);
        if (cats.length) setActive(cats[0].id);
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    setLoading(true);
    CourseApi.popular({ category: active })
      .then((r) => alive && setCourses(r.results || []))
      .catch(() => alive && setCourses([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [active]);

  return (
    <section aria-describedby="popular-courses-description" className="py-16 px-4 sm:px-6 lg:px-8 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <SectionTag>Discover Popular Courses on GoEdu</SectionTag>
          <h2 className="text-3xl sm:text-4xl font-semibold !font-lexend-deca text-[#213130] dark:text-white my-6">Explore in‑demand skills for students and professionals in Bangladesh.</h2>
          <div id="popular-courses-description" className="text-base sm:text-lg leading-relaxed max-w-[924px] text-[#213130] dark:text-gray-300 mx-auto">
            <p>From emerging technologies like AI, Blockchain, Digital Marketing, Freelancing, Video Editing and Graphic Design to IELTS, Communication, Employability and Career Development, GoEdu helps Bangladeshi learners build practical skills step by step fully online, anywhere and anytime.</p>
          </div>
        </header>
        <nav aria-label="Popular course categories" className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-9">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={active === c.id}
              onClick={() => setActive(c.id)}
              className={cn(
                'px-4 py-3 border border-[#B7B7B7] dark:border-gray-700 rounded-full font-medium transition-colors text-sm sm:text-base',
                active === c.id ? 'bg-[#2C2C2C] text-white dark:bg-white dark:text-black' : 'bg-[#F2F2F2] text-[#1E1E1E] hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {c.title}
            </button>
          ))}
        </nav>
        <CourseSlider courses={courses} loading={loading} paginationClass="popular-courses-pagination" />
        <div className="text-center mt-8">
          <Link to="/courses" aria-label="View all courses" className="px-8 py-3 rounded-full border-2 border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white font-semibold transition-colors inline-block">View ALL</Link>
        </div>
      </div>
    </section>
  );
}
