import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Clock, Grid3x3, Layers, List, Search } from 'lucide-react';
import Seo from '../components/common/Seo';
import { EmptyState } from '../components/common/ui';
import { Taka } from '../components/common/CourseCard';
import { BundleApi } from '../services/api';
import { useDebounce } from '../hooks/useApi';
import { cn, formatPrice, img, totalLength } from '../utils/format';

export function BundleCard({ bundle: b, list = false }) {
  return (
    <article className={cn('bg-white dark:bg-gray-800 rounded-[1.5rem] overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group flex', list ? 'flex-col md:flex-row' : 'flex-col')}>
      <Link to={`/bundles/${b.slug}`} className={cn('relative overflow-hidden bg-gradient-to-br from-[#40068D] to-[#7f26f2] shrink-0', list ? 'md:w-72 h-48 md:h-auto' : 'h-48')}>
        <img src={img(b.thumbnail)} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        {b.is_featured && <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-[#F3AC08] text-white px-2.5 py-1 rounded-full">Featured</span>}
        {b.savings > 0 && <span className="absolute top-3 right-3 text-[11px] font-bold bg-[#CBFDDA] text-[#33691E] px-2.5 py-1 rounded-full">Save <Taka />{formatPrice(b.savings)}</span>}
      </Link>
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          <Link to={`/bundles/${b.slug}`} className="text-lg font-bold text-gray-900 dark:text-white hover:text-[#F3AC08] transition-colors line-clamp-2 leading-snug">{b.title}</Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{b.short_description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-[#F3AC08]" /> {b.total_courses} courses</span>
            {b.total_length > 0 && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#F3AC08]" /> {totalLength(b.total_length)}</span>}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-gray-900 dark:text-white"><Taka />{formatPrice(b.effective_price)}</span>
            {b.is_discount && <span className="text-sm text-gray-400 line-through"><Taka />{formatPrice(b.price)}</span>}
          </div>
          <Link to={`/bundles/${b.slug}`} className="px-4 py-2 rounded-xl bg-[#FFF4D3] text-[#b57d05] font-bold text-sm hover:bg-[#F3AC08] hover:text-white transition-colors">View Bundle</Link>
        </div>
      </div>
    </article>
  );
}

export default function Bundles() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const debounced = useDebounce(search);
  const q = useQuery({ queryKey: ['bundles', debounced], queryFn: () => BundleApi.list({ search: debounced, page_size: 30 }) });

  return (
    <div className="min-h-screen bg-[#FFFCF6] dark:bg-gray-900 transition-colors duration-300 pt-28 md:pt-36 pb-16">
      <Seo title="Course Bundles" description="Save more with curated GoEdu course bundles - multiple professional courses at one discounted price." />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Explore All The Bundle</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">Continue your learning journey</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto self-start md:self-center">
            <div className="relative flex-1 md:w-80 md:flex-none">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search className="w-5 h-5 text-gray-500" /></span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="w-full pl-10 pr-4 py-3 bg-[#FFF4D3] dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none border-0 focus:ring-2 focus:ring-[#F3AC08] placeholder-gray-500 font-bold transition-all text-sm" />
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <button onClick={() => setView('grid')} className={cn('p-2 rounded-lg transition-all', view === 'grid' ? 'bg-[#FFF4D3] text-[#F3AC08]' : 'text-gray-400 hover:text-gray-600')} title="Grid View"><Grid3x3 className="w-5 h-5" /></button>
              <button onClick={() => setView('list')} className={cn('p-2 rounded-lg transition-all', view === 'list' ? 'bg-[#FFF4D3] text-[#F3AC08]' : 'text-gray-400 hover:text-gray-600')} title="List View"><List className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
        {q.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-[1.5rem] overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm h-[400px] animate-pulse flex flex-col">
                <div className="h-48 bg-gradient-to-br from-[#40068D]/40 to-[#7f26f2]/40" />
                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-3"><div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md" /><div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-md" /></div>
                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto"><div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" /><div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-md" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : q.data?.results?.length ? (
          <div className={cn('grid gap-8', view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {q.data.results.map((b) => <BundleCard key={b.id} bundle={b} list={view === 'list'} />)}
          </div>
        ) : (
          <EmptyState icon={BookOpen} title="No bundles found" text="Try a different search term." />
        )}
      </div>
    </div>
  );
}
