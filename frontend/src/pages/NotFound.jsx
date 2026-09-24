import { Link } from 'react-router-dom';
import Seo from '../components/common/Seo';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 bg-[#FFFCF6] dark:bg-gray-900">
      <Seo title="Page not found" noIndex />
      <p className="text-[6rem] sm:text-[8rem] font-black leading-none bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to bottom, #F3AC08 20%, rgba(253,215,70,0.3))' }}>404</p>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Page not found</h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">The page you are looking for does not exist or has been moved.</p>
      <div className="flex gap-3">
        <Link to="/" className="px-6 py-3 rounded-xl bg-[#F3AC08] text-white font-bold">Go home</Link>
        <Link to="/courses" className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200">Browse courses</Link>
      </div>
    </div>
  );
}
