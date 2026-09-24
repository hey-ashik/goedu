import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, Clock, Copy, Eye, Facebook, Loader2, MessageCircle, Twitter } from 'lucide-react';
import Seo from '../components/common/Seo';
import ContentLoader from '../components/common/ContentLoader';
import { ArticleApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, img } from '../utils/format';

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const q = useQuery({ queryKey: ['article', slug], queryFn: () => ArticleApi.detail(slug) });
  const a = q.data?.article;

  if (q.isLoading) return <ContentLoader />;
  if (!a) return <div className="pt-40 pb-20 text-center"><h1 className="text-2xl font-bold">Article not found</h1><Link to="/blog" className="text-[#F3AC08] font-semibold">Back to blog</Link></div>;

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const share = (kind) => {
    if (kind === 'copy') { navigator.clipboard?.writeText(url); toast.success('Link copied'); return; }
    const u = kind === 'facebook' ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` : `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(a.title)}`;
    window.open(u, '_blank', 'noopener,width=600,height=500');
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate(`/authentication?callbackUrl=${encodeURIComponent(`/blog/${slug}`)}`);
    setBusy(true);
    try {
      await ArticleApi.comment(slug, comment);
      setComment('');
      toast.success('Comment posted');
      qc.invalidateQueries({ queryKey: ['article', slug] });
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-24 pb-16">
      <Seo title={a.title} description={a.short_description} image={a.banner || a.thumbnail} type="article" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/blog')} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#F3AC08] mb-6"><ArrowLeft className="w-4 h-4" /> Back to Stories</button>
        <div className="grid lg:grid-cols-3 gap-10">
          <article className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden mb-8">
              <img src={img(a.banner || a.thumbnail)} alt={a.title} className="w-full aspect-[16/9] object-cover" />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#F3AC08] text-white text-xs font-bold">{a.category_name}</span>
            </div>
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <img src={img(a.author_photo)} alt={a.author_name} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
              <div><p className="font-bold text-gray-900 dark:text-white">{a.author_name}</p><p className="text-xs text-gray-500">Author</p></div>
              <div className="flex items-center gap-4 text-xs text-gray-500 sm:ml-auto">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(a.published_date)}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {a.read_time} min read</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {a.no_of_view} views</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">{a.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{a.short_description}</p>
            {a.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-8">{a.tags.map((t) => <span key={t} className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"># {t}</span>)}</div>}
            <div className="rich-content prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: a.body }} />

            <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Author</h3>
              <div className="flex gap-4">
                <img src={img(a.author_photo)} alt={a.author_name} className="w-16 h-16 rounded-full object-cover bg-gray-100 shrink-0" />
                <div><p className="font-bold text-gray-900 dark:text-white">{a.author_name}</p><p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{a.author_bio}</p></div>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-[#F3AC08]" /> Comments ({a.comments.length})</h3>
              <form onSubmit={submit} className="mb-6">
                {isAuthenticated ? (
                  <>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} required placeholder="Share your thoughts..." className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:border-[#F3AC08]" />
                    <button type="submit" disabled={busy} className="mt-2 px-5 py-2.5 rounded-xl bg-[#F3AC08] text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Post comment</button>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Please <Link to={`/authentication?callbackUrl=${encodeURIComponent(`/blog/${slug}`)}`} className="text-[#F3AC08] font-semibold">sign in</Link> to leave a comment</p>
                )}
              </form>
              <div className="space-y-5">
                {a.comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <img src={img(c.user_photo)} alt={c.user_name} className="w-10 h-10 rounded-full object-cover bg-gray-100 shrink-0" />
                    <div><h4 className="text-sm font-bold text-gray-900 dark:text-white">{c.user_name} <span className="text-xs font-normal text-gray-400 ml-2">{formatDate(c.created_at)}</span></h4><p className="text-sm text-gray-600 dark:text-gray-300">{c.body}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="space-y-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Share this story</h4>
              <div className="flex flex-col gap-2">
                <button onClick={() => share('facebook')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:border-[#F3AC08]"><Facebook className="w-4 h-4 text-[#1877F2]" /> Facebook</button>
                <button onClick={() => share('twitter')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:border-[#F3AC08]"><Twitter className="w-4 h-4 text-sky-500" /> Twitter</button>
                <button onClick={() => share('copy')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:border-[#F3AC08]"><Copy className="w-4 h-4" /> Copy Link</button>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Trending Stories</h4>
              <div className="space-y-4">
                {(q.data?.trending || []).map((t) => (
                  <Link key={t.id} to={`/blog/${t.slug}`} className="flex gap-3 group"><img src={img(t.thumbnail)} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" /><div><h5 className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-[#F3AC08]">{t.title}</h5><p className="text-xs text-gray-500">{t.read_time} min read</p></div></Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
