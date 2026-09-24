import { useSiteSettings } from '../../hooks/useSiteSettings';

const Star = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const cardClass = 'bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center';

export default function TrustedSection() {
  const { settings } = useSiteSettings();
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FFFCF6] dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold !font-lexend-deca text-[#213130] dark:text-white mb-4 leading-tight">Trusted by Thousands of Learners Worldwide</h2>
        <p className="max-w-5xl mx-auto text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-12 leading-relaxed">
          Join a growing community of learners who trust our courses to build real, career-ready skills. Backed by top ratings and verified reviews, we focus on outcomes—not just content.
        </p>
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto">
          <a href={settings.review_google} target="_blank" rel="noopener noreferrer" className={cardClass}>
            <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-3">
              <svg className="w-14 h-5 sm:w-20 sm:h-8" viewBox="0 0 24 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                {[['0', '#4285F4', 'G'], ['5.2', '#EA4335', 'o'], ['9.5', '#FBBC05', 'o'], ['13.8', '#4285F4', 'g'], ['18.2', '#34A853', 'l'], ['20.2', '#EA4335', 'e']].map(([x, fill, ch]) => (
                  <text key={x} x={x} y="7" fontFamily="Product Sans, Roboto, Arial, sans-serif" fontWeight="bold" fontSize="7" fill={fill}>{ch}</text>
                ))}
              </svg>
            </div>
            <div className="flex gap-0.5 mb-1.5 sm:mb-2">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-3 h-3 sm:w-5 sm:h-5 text-[#FBBC05]" />)}</div>
            <span className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-xs font-medium text-center line-clamp-1">Read our reviews</span>
          </a>
          <a href={settings.review_trustpilot} target="_blank" rel="noopener noreferrer" className={cardClass}>
            <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-3">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-[#00B67A]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.1L12 17.6l-6.3 3.7 1.7-7.1L2 9.5l7.1-.6z" /></svg>
              <span className="font-bold text-gray-900 dark:text-white tracking-tight text-[10px] sm:text-sm">Trustpilot</span>
            </div>
            <div className="flex gap-0.5 mb-1.5 sm:mb-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="w-3 h-3 sm:w-5 sm:h-5 bg-[#00B67A] flex items-center justify-center"><Star className="w-2 h-2 sm:w-3.5 sm:h-3.5 text-white" /></span>
              ))}
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-xs font-medium text-center line-clamp-1">Read our reviews</span>
          </a>
          <a href={settings.review_facebook} target="_blank" rel="noopener noreferrer" className={cardClass}>
            <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-3">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.69 4.54-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" /></svg>
              <span className="font-bold text-[10px] sm:text-sm tracking-tight whitespace-nowrap text-gray-900 dark:text-white">Review</span>
            </div>
            <div className="text-xl sm:text-3xl font-extrabold text-[#0066F5] dark:text-[#3B82F6] mb-1.5 sm:mb-2">100%</div>
            <span className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-xs font-medium text-center line-clamp-1">Recommended</span>
          </a>
        </div>
      </div>
    </section>
  );
}
