import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import { CourseApi } from '../../services/api';
import { useDebounce } from '../../hooks/useApi';
import { useChat } from '../../context/ChatContext';
import { img } from '../../utils/format';

const SparkIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 2a1 1 0 011 1v1.07A7.002 7.002 0 0116.93 10H18a1 1 0 110 2h-1.07A7.002 7.002 0 0111 17.93V19a1 1 0 11-2 0v-1.07A7.002 7.002 0 013.07 12H2a1 1 0 110-2h1.07A7.002 7.002 0 019 3.07V2a1 1 0 011-1zm0 4a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
  </svg>
);

export default function Hero() {
  const navigate = useNavigate();
  const { openChat } = useChat();
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounced = useDebounce(q, 350);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const term = debounced.trim();
    if (term.length < 2) { setResults([]); setSearched(false); return; }
    let alive = true;
    setLoading(true);
    CourseApi.search(term)
      .then((r) => { if (alive) { setResults(r.results); setSearched(true); } })
      .catch(() => { if (alive) setResults([]); })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [debounced]);

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/courses?query=${encodeURIComponent(q.trim())}` : '/courses');
  };

  const showResults = focused && (loading || results.length > 0 || searched);

  return (
    <section aria-labelledby="hero-new-heading" className="hero-section relative z-30 w-full bg-[#FFF6DD] dark:bg-gray-900 flex flex-col mt-[84px] md:mt-[116px] lg:mt-24 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute bottom-0 left-0 w-full pointer-events-none select-none z-0"
          style={{ height: '65vh', minHeight: 400, background: 'radial-gradient(ellipse 65% 90% at 50% 100%, rgba(255, 178, 0, 0.75) 0%, rgba(243, 172, 8, 0.4) 45%, rgba(253, 215, 70, 0) 100%)' }}
          aria-hidden="true"
        />
        <div className="absolute z-0 pointer-events-none select-none w-full top-0 left-0 container mx-auto px-4 md:px-0 md:max-w-none" aria-hidden="true">
          <p
            className="font-black bg-clip-text text-transparent w-full text-center m-0 pt-12 md:pt-0 px-0 pb-16 md:pb-24 text-[26vw] md:text-[clamp(4rem,30.5vw,30rem)]"
            style={{ lineHeight: 1.05, letterSpacing: '0.03em', backgroundImage: 'linear-gradient(to bottom, #F3AC08 20%, rgba(253, 215, 70, 0.08) 100%)' }}
          >
            goedu
          </p>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col w-full">
        <div className="flex justify-center w-full pt-5 sm:pt-6 shrink-0">
          <div className="inline-flex items-center gap-2 py-1 px-2 sm:py-2 sm:px-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#ED8E22] shrink-0 animate-pulse" />
            <p className="text-[10px] sm:text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">Build Skills with Trusted Online Courses</p>
          </div>
        </div>

        {/* hero person image */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 md:left-[2%] lg:left-[5%] xl:left-[10%] md:translate-x-0 pointer-events-none select-none z-10 w-[175%] h-[82%] opacity-100 md:w-[48%] md:h-[72%] md:opacity-80 lg:w-[46%] lg:h-[78%] lg:opacity-100" aria-hidden="true">
          <div className="block md:hidden absolute inset-0">
            <div className="absolute inset-0 z-10" style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 55%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 55%)' }}>
              <img alt="" fetchPriority="high" className="absolute inset-0 w-full h-full object-contain object-bottom" src="/images/home/thumb.png" />
            </div>
            <div className="absolute inset-0 z-0" style={{ filter: 'blur(4px)', maskImage: 'linear-gradient(to bottom, transparent 40%, white 55%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 40%, white 100%)' }}>
              <img alt="" className="absolute inset-0 w-full h-full object-contain object-bottom" src="/images/home/thumb.png" />
            </div>
          </div>
          <div className="hidden md:block absolute inset-0">
            <img alt="" fetchPriority="high" className="absolute inset-0 w-full h-full object-contain object-bottom" src="/images/home/thumb.png" />
          </div>
        </div>

        <div className="flex-1" />

        <div className="w-full relative z-20">
          <div className="relative z-20 w-full flex flex-col items-center text-center md:top-6 lg:top-10 md:items-end 2xl:right-[10rem] md:text-left px-3 sm:px-8 md:pr-6 lg:pr-10 xl:pr-16 pb-0 md:pb-3 sm:pb-4">
            <div className="w-full sm:max-w-2xl md:w-[48%] lg:w-[45%] xl:w-[42%]">
              <h1 id="hero-new-heading" className="text-gray-900 dark:text-white font-bold leading-tight mb-2 sm:mb-3" style={{ fontSize: 'clamp(1.35rem, 3vw, 2.65rem)' }}>
                Explore the Best Professional Online Courses in Bangladesh
              </h1>
              <div className="text-gray-600 dark:text-gray-300 max-w-2xl leading-4 text-justify lg:text-left mt-2 md:pt-0 px-1 md:px-0" style={{ fontSize: 'clamp(0.8rem, 0.95vw, 0.85rem)' }}>
                <p>
                  GoEdu is the best choice to find the best online courses in Bangladesh, now officially <strong className="font-semibold text-gray-800 dark:text-gray-100">GEAC accredited</strong>. Access 250+ quality professional online courses with certificates on varieties of topics, AI mentor, course collections, learning pathways and more.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-30 w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-4 md:pt-12 pb-6 sm:pb-8 lg:pb-5 shrink-0">
            <div className="absolute bottom-0 left-0 right-0 top-4 md:top-12 z-0 bg-gradient-to-t from-[#FFF6DD]/95 to-transparent dark:from-gray-900/95 dark:to-transparent pointer-events-none" style={{ maskImage: 'linear-gradient(to top, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)' }} />
            <div className="container mx-auto relative max-w-5xl z-10" ref={wrapRef}>
              <form
                onSubmit={submit}
                className={`relative flex items-center bg-white/95 dark:bg-gray-900/95 rounded-full transition-all duration-300 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 gap-2 md:gap-3 ${focused ? 'shadow-2xl ring-2 ring-orange-500/20 scale-[1.01]' : 'shadow-md border border-gray-200 dark:border-gray-700'}`}
              >
                <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#ED8E22] shrink-0" />
                <input
                  id="hero-new-search"
                  ref={inputRef}
                  type="text"
                  autoComplete="off"
                  value={q}
                  onFocus={() => setFocused(true)}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Explore Course"
                  className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base min-w-0"
                  aria-label="Search courses"
                />
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {loading ? (
                    <div className="p-1 sm:p-2 bg-gray-50 dark:bg-gray-700 rounded-full shrink-0"><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 animate-spin" /></div>
                  ) : q ? (
                    <button type="button" onClick={() => { setQ(''); setResults([]); setSearched(false); inputRef.current?.focus(); }} aria-label="Clear search" className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 active:scale-95 transition-all shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="submit" aria-label="Search" className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-full bg-[#ED8E22] text-white hover:bg-[#d47c1a] active:scale-95 transition-all shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openChat(q.trim() ? `Recommend me courses about: ${q.trim()}` : '')}
                    aria-label="Let AI Recommend a course"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#ED8E22] text-white font-semibold hover:bg-[#d47c1a] active:scale-95 transition-all shrink-0 h-8 w-8 sm:h-auto sm:w-auto sm:px-4 sm:py-2 md:px-5 text-xs md:text-sm"
                  >
                    <SparkIcon className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                    <span className="hidden sm:inline">Let AI Recommend</span>
                  </button>
                </div>
              </form>

              {showResults && (
                <div id="course-search-results" role="region" aria-label="Course search results" className="absolute left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 max-h-[70vh] flex flex-col transition-all duration-200 bottom-full mb-4">
                  <div aria-busy={loading} aria-live="polite" className="overflow-y-auto p-2 scrollbar-hide">
                    {loading ? (
                      <div className="space-y-2">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="flex gap-4 p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-50 dark:border-gray-800">
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse shrink-0" />
                            <div className="flex-1 space-y-2 py-1">
                              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : results.length > 0 ? (
                      <div className="space-y-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-10">Top Results ({results.length})</div>
                        {results.map((c) => (
                          <article key={c.id}>
                            <Link to={`/courses/${c.slug}`} className="group flex gap-4 p-3 rounded-xl hover:bg-orange-50 dark:hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-orange-100 dark:hover:border-white/10">
                              <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0 relative">
                                <img src={img(c.thumbnail)} alt={`${c.title} online course thumbnail`} width={96} height={80} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                {c.level_name && <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-white font-medium">{c.level_name}</div>}
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate pr-4 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{c.title}</h3>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                  <span>{c.category_name}</span><span>•</span><span>{c.total_lesson} lessons</span><span>•</span><span>{c.price === 0 ? 'Free' : `৳${c.effective_price}`}</span>
                                </div>
                              </div>
                            </Link>
                          </article>
                        ))}
                        <div className="p-2 text-center">
                          <Link to={`/courses?query=${encodeURIComponent(q)}`} className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline">View all results</Link>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <div className="bg-gray-50 dark:bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                          <SearchIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No courses found for "{q}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
