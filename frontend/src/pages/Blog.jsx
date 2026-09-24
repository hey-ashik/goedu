import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, Search, X } from 'lucide-react';
import Seo from '../components/common/Seo';
import { ArticleCard, ArticleSkeleton } from '../components/home/BlogSection';
import { EmptyState, Pagination } from '../components/common/ui';
import { ArticleApi } from '../services/api';
import { useDebounce } from '../hooks/useApi';
import { cn } from '../utils/format';

export default function Blog() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const debounced = useDebounce(search);
  const category = params.get('category') || '';
  const page = parseInt(params.get('page'), 10) || 1;
  const cats = useQuery({ queryKey: ['article-categories'], queryFn: ArticleApi.categories });
  const featured = useQuery({ queryKey: ['articles-featured'], queryFn: () => ArticleApi.list({ page_size: 1, sort: 'popular' }) });
  const list = useQuery({ queryKey: ['articles', category, debounced, page], queryFn: () => ArticleApi.list({ category, search: debounced, page, page_size: 9 }), keepPreviousData: true });
  const trending = useQuery({ queryKey: ['articles-trending'], queryFn: ArticleApi.trending });

  const setCat = (slug) => { const n = new URLSearchParams(params); slug ? n.set('category', slug) : n.delete('category'); n.delete('page'); setParams(n); };
  const hero = featured.data?.results?.[0];

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-gray-900 pt-20">
      <Seo title="Blog - Education, Career and Skills" description="Practical tips on online learning, exam preparation, professional skills, freelancing and industry trends in Bangladesh." />
      <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="text-left space-y-6 md:space-y-8 animate-fadeIn">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight text-gray-900 dark:text-white">Where<br />possibilities<br />begin</h1>
                <p className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-2xl text-gray-600 dark:text-gray-300">We&apos;re a leading marketplace platform for learning and teaching online. Explore some of our most popular content and learn something new.</p>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0 flex justify-center lg:justify-end animate-fadeIn">
              <img src="/images/blog.jpeg" alt="Person working on laptop" className="w-full max-w-md rounded-lg lg:max-w-md xl:max-w-lg h-[320px] md:h-[450px] object-contain" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black py-3 md:py-4">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="relative h-12 flex items-center container mx-auto">
            <button onClick={() => setSearchOpen((v) => !v)} className="flex-shrink-0 p-3 md:p-4 text-white hover:text-gray-300 transition-all duration-300 hover:scale-105 active:scale-95" aria-label="Search articles"><Search className="h-4 w-4 md:h-5 md:w-5" /></button>
            {searchOpen ? (
              <div className="flex-1 flex items-center gap-2">
                <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..." className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm" />
                <button onClick={() => { setSearch(''); setSearchOpen(false); }} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-3 md:gap-4">
                  <button onClick={() => setCat('')} className={cn('shrink-0 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-colors', !category ? 'bg-white text-black' : 'text-gray-300 hover:text-white bg-white/10')}>All stories</button>
                  {(cats.data?.results || []).map((c) => (
                    <button key={c.id} onClick={() => setCat(c.slug)} className={cn('shrink-0 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-colors', category === c.slug ? 'bg-white text-black' : 'text-gray-300 hover:text-white bg-white/10')}>{c.name} <span className="opacity-60">({c.total})</span></button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {hero && !category && !debounced && (
        <section className="py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Featured story</h2>
              <div className="grid lg:grid-cols-3 gap-8"><ArticleCard article={hero} featured /><div className="hidden lg:flex flex-col gap-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Trending Stories</h3>
                {(trending.data?.results || []).slice(0, 4).map((t) => (
                  <a key={t.id} href={`/blog/${t.slug}`} className="flex gap-3 group"><img src={t.thumbnail || '/placeholder.svg'} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" /><div><h5 className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-[#F3AC08]">{t.title}</h5><p className="text-xs text-gray-500">{t.read_time} min read</p></div></a>
                ))}
              </div></div>
            </div>
          </div>
        </section>
      )}

      <div className="py-12 md:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8 md:gap-12">
            <main className="lg:col-span-3">
              <div className="mb-8 flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{debounced ? `Results for "${debounced}"` : category ? cats.data?.results?.find((c) => c.slug === category)?.name || 'Stories' : 'Latest stories'}</h2>
                  {list.data && <p className="text-sm text-gray-500">{list.data.count} article{list.data.count === 1 ? '' : 's'}</p>}
                </div>
              </div>
              {list.isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">{[0, 1, 2].map((i) => <ArticleSkeleton key={i} />)}</div>
              ) : list.data?.results?.length ? (
                <>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">{list.data.results.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
                  <Pagination page={page} totalPages={list.data.total_pages} onChange={(p) => { const n = new URLSearchParams(params); n.set('page', String(p)); setParams(n); }} className="mt-10" />
                </>
              ) : (
                <EmptyState icon={Newspaper} title="No articles found" text="Try another search or category." />
              )}
            </main>
            <aside className="space-y-8">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Trending Stories</h4>
                <div className="space-y-4">
                  {(trending.data?.results || []).map((t) => (
                    <a key={t.id} href={`/blog/${t.slug}`} className="block group"><h5 className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-[#F3AC08]">{t.title}</h5><p className="text-xs text-gray-500">{t.read_time} min read · {t.no_of_view} views</p></a>
                  ))}
                </div>
              </div>
              <div className="bg-[#111827] rounded-2xl p-6 text-white">
                <h4 className="font-bold mb-2">Learn something new today</h4>
                <p className="text-sm text-gray-300 mb-4">Explore 280+ accredited online courses on GoEdu.</p>
                <a href="/courses" className="inline-block px-5 py-2.5 rounded-xl bg-[#F3AC08] text-white text-sm font-bold">Browse courses</a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
