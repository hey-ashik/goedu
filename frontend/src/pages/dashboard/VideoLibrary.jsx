import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CirclePlay, Lock, Sparkles } from 'lucide-react';
import { CourseApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { img } from '../../utils/format';

export default function VideoLibrary() {
  const { user } = useAuth();
  const active = !!user.subscription;
  const q = useQuery({ queryKey: ['micro-courses'], queryFn: () => CourseApi.list({ tier: 'subscription', sort: 'newest', page_size: 12 }) });
  const list = q.data?.results || [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Micro Courses</h1>
        <p className="text-sm text-gray-500 mt-1">Standalone video lessons from our instructors. Watch anything in your plan, anytime.</p>
      </div>
      {!active && (
        <div className="bg-gradient-to-br from-[#FFF4D3] to-[#FCD53F] dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <Lock className="w-8 h-8 text-[#b57d05] shrink-0" />
          <div className="flex-1"><p className="font-bold text-gray-900 dark:text-white">Learner Plus required</p><p className="text-sm text-gray-700 dark:text-gray-300">Micro courses are exclusive to Learner Plus members (+2 new every month).</p></div>
          <Link to="/subscription" className="px-5 py-2.5 rounded-xl bg-[#111827] text-white text-sm font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#F3AC08]" /> Get Learner Plus</Link>
        </div>
      )}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((c) => (
          <Link key={c.id} to={active ? `/courses/${c.slug}` : '/subscription'} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden group">
            <div className="relative h-36"><img src={img(c.thumbnail)} alt={c.title} className="w-full h-full object-cover" /><span className="absolute inset-0 flex items-center justify-center bg-black/30"><span className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center">{active ? <CirclePlay className="w-6 h-6 text-[#F3AC08]" /> : <Lock className="w-5 h-5 text-gray-600" />}</span></span></div>
            <div className="p-4"><p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#F3AC08]">{c.title}</p><p className="text-xs text-gray-500 mt-1">{c.total_lesson} lessons · {c.duration_label}</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
