/**
 * Quiet in-page loading state used while a page's data is fetched.
 * Deliberately subtle (no logo animation): the branded GoEdu loading screen is
 * reserved for the first visit and for entering the Courses / Mentorship sections.
 */
export default function ContentLoader({ className = '' }) {
  return (
    <div role="status" aria-live="polite" aria-label="Loading" className={`min-h-[50vh] w-full flex items-center justify-center pt-24 ${className}`}>
      <span className="h-8 w-8 rounded-full border-[3px] border-amber-100 dark:border-gray-800 border-t-[#F3AC08] animate-spin" />
    </div>
  );
}
