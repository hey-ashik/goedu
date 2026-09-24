import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Eye } from 'lucide-react';
import { formatDate, img } from '../../utils/format';

export function ArticleCard({ article: a, featured = false }) {
  return (
    <article className={`relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col ${featured ? 'lg:col-span-2' : ''}`}>
      <Link to={`/blog/${a.slug}`} className={`relative bg-gray-200 overflow-hidden ${featured ? 'aspect-[16/9]' : 'h-52'}`}>
        <img src={img(a.thumbnail)} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        <div className="p-4 absolute top-0 left-0 z-10">
          <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-[#F3AC08] text-white shadow">{a.category_name || 'Blog'}</span>
        </div>
      </Link>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex gap-4 mb-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Clock size={13} /> {a.read_time} min read</span>
          <span className="flex items-center gap-1"><Eye size={13} /> {a.no_of_view} views</span>
          {a.published_date && <span>{formatDate(a.published_date)}</span>}
        </div>
        <Link to={`/blog/${a.slug}`} className={`font-bold text-gray-900 dark:text-white leading-snug hover:text-[#F3AC08] transition-colors ${featured ? 'text-xl md:text-2xl' : 'text-lg'} line-clamp-2 mb-3`}>{a.title}</Link>
        {featured && <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">{a.short_description}</p>}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-center gap-3">
            <img src={img(a.author_photo)} alt={a.author_name} className="w-10 h-10 rounded-full object-cover bg-gray-100" loading="lazy" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{a.author_name}</p>
              <p className="text-xs text-gray-500">Author</p>
            </div>
          </div>
          <Link to={`/blog/${a.slug}`} aria-label={`Read ${a.title}`} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-200 group-hover:bg-[#F3AC08] group-hover:text-white transition-colors">
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="h-52 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-32 animate-pulse" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
        <div className="flex items-center justify-between"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" /><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" /></div>
      </div>
    </div>
  );
}

export default function BlogSection({ articles = [], loading }) {
  return (
    <section aria-describedby="blog-description" className="py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#1a1f36] dark:text-white leading-tight">Education, Career, and Skills Blog for Bangladeshi Learners.</h2>
          </div>
          <div className="flex items-center">
            <div id="blog-description" className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              <p>Stay updated with practical tips on online learning, exam preparation, professional skills, freelancing, study‑abroad guidance, and industry trends in Bangladesh.</p>
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? [0, 1, 2].map((i) => <ArticleSkeleton key={i} />) : articles.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
        <div className="text-center mt-10">
          <Link to="/blog" className="px-8 py-3 rounded-full border-2 border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white font-semibold transition-colors inline-block">Read All Articles</Link>
        </div>
      </div>
    </section>
  );
}
