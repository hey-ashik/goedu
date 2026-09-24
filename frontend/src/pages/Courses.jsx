import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronDown, Funnel, Grid3x3, List, Search, X } from 'lucide-react';
import Seo from '../components/common/Seo';
import CourseCard, { CourseCardSkeleton } from '../components/common/CourseCard';
import { EmptyState, Pagination } from '../components/common/ui';
import { CourseApi, SiteApi } from '../services/api';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useDebounce, useLockBody } from '../hooks/useApi';
import { cn } from '../utils/format';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TIERS = [
  { value: '', label: 'All' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'paid', label: 'Paid' },
  { value: 'free', label: 'Free' },
];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_low', label: 'Price: low to high' },
  { value: 'price_high', label: 'Price: high to low' },
];

function Radio({ checked, label, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="radio" className="peer sr-only" checked={checked} onChange={onChange} />
      <span className="h-5 w-5 rounded-full border-2 border-gray-400 flex items-center justify-center peer-checked:border-amber-400 after:content-[''] after:block after:h-2.5 after:w-2.5 after:rounded-full after:bg-transparent peer-checked:after:bg-amber-400" />
      <span className="text-gray-700 dark:text-gray-200">{label}</span>
    </label>
  );
}
function Checkbox({ checked, label, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span className={cn('h-5 w-5 rounded border-2 flex items-center justify-center transition-colors', checked ? 'border-amber-400 bg-amber-400 text-white' : 'border-gray-400')}>
        {checked && <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      <span className="text-gray-700 dark:text-gray-200 select-none">{label}</span>
    </label>
  );
}

function Sidebar({ categories, filters, setFilter, languages, totalAll }) {
  const [openCat, setOpenCat] = useState(null);
  return (
    <aside className="xl:w-80">
      <div className="bg-white/80 dark:bg-gray-800/60 rounded-2xl p-6 mb-6 border border-[#F3AC08]/10 hover:border-[#F3AC08]/20 transition-all duration-300 hover:bg-white dark:hover:bg-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#001858] dark:text-white flex items-center gap-2">Browse Categories</h3>
        </div>
        <div className="space-y-1 max-h-[520px] overflow-y-auto scrollbar-hide">
          <button
            onClick={() => setFilter({ category: '' })}
            className={cn('w-full flex items-center gap-4 p-3 rounded-xl text-left transition-all duration-300', !filters.category ? 'bg-[#F3AC08] text-white transform scale-[1.02]' : 'hover:bg-[#F3AC08]/10 text-gray-700 dark:text-gray-200')}
          >
            <div className="flex-1"><span className="font-medium text-base">All Categories</span></div>
            <span className={cn('text-sm font-bold', !filters.category ? 'text-white/80' : 'text-gray-400')}>{totalAll}</span>
          </button>
          {categories.map((c) => {
            const active = String(filters.category) === String(c.id) || c.sub_categories.some((s) => String(s.id) === String(filters.category));
            const expanded = openCat === c.id || active;
            return (
              <div key={c.id}>
                <div className={cn('w-full flex items-center gap-2 p-3 rounded-xl text-left transition-all duration-300', String(filters.category) === String(c.id) ? 'bg-[#F3AC08] text-white' : 'hover:bg-[#F3AC08]/10 text-gray-700 dark:text-gray-200')}>
                  <button onClick={() => setFilter({ category: String(c.id) })} className="flex-1 text-left"><span className="font-medium text-base">{c.title}</span></button>
                  <span className={cn('text-sm font-bold', String(filters.category) === String(c.id) ? 'text-white/80' : 'text-gray-400')}>{c.available_course}</span>
                  {c.sub_categories.length > 0 && (
                    <button onClick={() => setOpenCat(expanded && openCat === c.id ? null : c.id)} aria-label="Toggle sub categories"><ChevronDown className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')} /></button>
                  )}
                </div>
                {expanded && c.sub_categories.length > 0 && (
                  <div className="ml-4 pl-3 border-l border-amber-200 dark:border-gray-700 space-y-0.5 my-1">
                    {c.sub_categories.map((s) => (
                      <button key={s.id} onClick={() => setFilter({ category: String(s.id) })} className={cn('w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm', String(filters.category) === String(s.id) ? 'bg-[#F3AC08]/15 text-[#b57d05] font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700')}>
                        <span>{s.title}</span><span className="text-xs text-gray-400">{s.available_course}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-white/80 dark:bg-gray-800/60 rounded-2xl p-6 shadow-sm border border-[#F3AC08]/10 hover:border-[#F3AC08]/20 transition-all duration-300 hover:bg-white dark:hover:bg-gray-800">
        <h3 className="text-xl font-bold text-[#001858] dark:text-white mb-6 flex items-center gap-2">Filters</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">Tier</h4>
            <div className="space-y-2">{TIERS.map((t) => <Radio key={t.value} label={t.label} checked={(filters.tier || '') === t.value} onChange={() => setFilter({ tier: t.value })} />)}</div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">Language</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {languages.map((l) => {
                const selected = (filters.language || '').split(',').filter(Boolean);
                const on = selected.includes(String(l.id));
                return <Checkbox key={l.id} label={l.name} checked={on} onChange={() => setFilter({ language: (on ? selected.filter((x) => x !== String(l.id)) : [...selected, String(l.id)]).join(',') })} />;
              })}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">Level</h4>
            <div className="space-y-2">
              {LEVELS.map((lv) => {
                const selected = (filters.level || '').split(',').filter(Boolean);
                const on = selected.includes(lv);
                return <Checkbox key={lv} label={lv} checked={on} onChange={() => setFilter({ level: (on ? selected.filter((x) => x !== lv) : [...selected, lv]).join(',') })} />;
              })}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">Institute</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto"><Checkbox label="Daffodil International University" checked={filters.institute === 'diu'} onChange={() => setFilter({ institute: filters.institute === 'diu' ? '' : 'diu' })} /></div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function Courses() {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState('grid');
  useLockBody(showFilters);
  const { languages } = useSiteSettings();

  const filters = useMemo(() => Object.fromEntries(params.entries()), [params]);
  const [search, setSearch] = useState(filters.query || filters.search || '');
  const debounced = useDebounce(search, 400);

  const setFilter = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };
  useEffect(() => { if ((filters.query || '') !== debounced) setFilter({ query: debounced }); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [debounced]);
  useEffect(() => { setSearch(filters.query || ''); }, [filters.query]);

  const cats = useQuery({ queryKey: ['categories-all'], queryFn: () => SiteApi.categories() });
  const page = parseInt(filters.page, 10) || 1;
  const list = useQuery({
    queryKey: ['courses', filters],
    queryFn: () => CourseApi.list({ ...filters, query: filters.query, page, page_size: 12, sort: filters.sort || 'newest' }),
    keepPreviousData: true,
  });

  const categories = cats.data?.results || [];
  const totalAll = categories.reduce((n, c) => n + c.available_course, 0);
  const activeCount = ['category', 'tier', 'level', 'language', 'institute', 'query'].filter((k) => filters[k]).length;
  const clearAll = () => { setSearch(''); setParams({}, { replace: true }); };
  const currentCat = categories.flatMap((c) => [c, ...c.sub_categories]).find((c) => String(c.id) === String(filters.category));

  return (
    <div className="min-h-screen transition-colors duration-500 bg-[#FFFCF6] dark:bg-gray-900 pt-24 lg:pt-28">
      <Seo title="All Online Courses" description="Browse 280+ GEAC accredited professional online courses in Bangladesh. Filter by category, level, language and price." />
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="xl:hidden">
            <button onClick={() => setShowFilters(true)} className="w-full mb-2 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-[#F3AC08]/20 rounded-xl hover:bg-[#F3AC08]/10 transition-all duration-300 text-gray-800 dark:text-gray-100 font-medium">
              <Funnel className="w-4 h-4" /> Show Filters {activeCount > 0 && <span className="ml-1 text-xs bg-[#F3AC08] text-white rounded-full px-2 py-0.5">{activeCount}</span>}
            </button>
          </div>

          {/* desktop sidebar */}
          <div className="hidden xl:block xl:sticky xl:top-28 xl:self-start xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto scrollbar-hide">
            <Sidebar categories={categories} filters={filters} setFilter={setFilter} languages={languages} totalAll={totalAll} />
          </div>

          {/* mobile filter drawer */}
          <div onClick={() => setShowFilters(false)} className={cn('fixed inset-0 bg-black/50 z-[99] xl:hidden transition-opacity', showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none')} />
          <div className={cn('fixed top-0 left-0 h-full w-[85%] max-w-sm bg-[#FFFCF6] dark:bg-gray-900 z-[100] xl:hidden overflow-y-auto p-4 transition-transform duration-300', showFilters ? 'translate-x-0' : '-translate-x-full')}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"><X /></button>
            </div>
            <Sidebar categories={categories} filters={filters} setFilter={setFilter} languages={languages} totalAll={totalAll} />
            <button onClick={() => setShowFilters(false)} className="mt-4 w-full bg-[#F3AC08] text-white py-3 rounded-xl font-semibold">Show {list.data?.count ?? ''} courses</button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-8 border border-gray-100 dark:border-gray-700 shadow-sm sticky top-20 lg:top-24 z-20">
              <div className="flex flex-col md:flex-row md:gap-4 items-center gap-3">
                <div className="flex-1 relative w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search courses, instructors, or topics..."
                    className="w-full pl-12 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#F3AC08]/20 focus:border-[#F3AC08] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300 placeholder-gray-400"
                  />
                  {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Clear"><X className="w-4 h-4" /></button>}
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select value={filters.sort || 'newest'} onChange={(e) => setFilter({ sort: e.target.value })} className="flex-1 md:flex-none px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#F3AC08]">
                    {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setView('grid')} className={cn('p-2.5 rounded-lg transition-all duration-300', view === 'grid' ? 'bg-white dark:bg-gray-700 text-[#F3AC08] shadow-sm' : 'text-gray-400 hover:text-gray-600')} aria-label="Grid view"><Grid3x3 className="w-5 h-5" /></button>
                    <button onClick={() => setView('list')} className={cn('p-2.5 rounded-lg transition-all duration-300', view === 'list' ? 'bg-white dark:bg-gray-700 text-[#F3AC08] shadow-sm' : 'text-gray-400 hover:text-gray-600')} aria-label="List view"><List className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 px-1 flex-wrap gap-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <h2 className="text-2xl font-bold text-[#001858] dark:text-white tracking-tight">{currentCat ? currentCat.title : 'All Courses'}</h2>
                {list.data && <span className="text-sm text-gray-500">{list.data.count} courses{filters.query ? ` for "${filters.query}"` : ''}</span>}
              </div>
              {activeCount > 0 && <button onClick={clearAll} className="text-sm font-semibold text-[#F3AC08] hover:underline">Clear all filters</button>}
            </div>

            {list.isLoading ? (
              <div className={cn('grid gap-6', view === 'grid' ? 'sm:grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1')}>{Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}</div>
            ) : list.data?.results?.length ? (
              <>
                <div className={cn('grid gap-6', view === 'grid' ? 'sm:grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2')}>
                  {list.data.results.map((c) => <CourseCard key={c.id} course={c} />)}
                </div>
                <Pagination page={page} totalPages={list.data.total_pages} onChange={(p) => { setFilter({ page: String(p) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-10" />
              </>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No courses found"
                text="Try adjusting your search or filter criteria"
                action={<button onClick={clearAll} className="bg-[#F3AC08] hover:bg-[#F3AC08]/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300">Clear all filters</button>}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
