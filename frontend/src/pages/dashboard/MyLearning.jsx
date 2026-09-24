import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Play } from 'lucide-react';
import { LearningApi } from '../../services/api';
import { EmptyState } from '../../components/common/ui';
import { formatDate, img } from '../../utils/format';

export default function MyLearning() {
  const q = useQuery({ queryKey: ['my-learning'], queryFn: LearningApi.mine });
  const list = q.data?.results || [];
  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">My Learning</h1>
      {q.isLoading ? (
        <div className="grid sm:grid-cols-2 gap-5">{[0, 1].map((i) => <div key={i} className="h-40 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 animate-pulse" />)}</div>
      ) : list.length ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {list.map((c) => (
            <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
              <Link to={`/dashboard/learn/${c.slug}`} className="relative h-40 overflow-hidden group"><img src={img(c.thumbnail)} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"><span className="w-12 h-12 rounded-full bg-white flex items-center justify-center"><Play className="w-5 h-5 text-[#F3AC08] fill-current ml-0.5" /></span></span></Link>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-1">{c.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{c.instructor?.name} · Enrolled {formatDate(c.enrolled_at)}</p>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-[#F3AC08]" style={{ width: `${c.progress}%` }} /></div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500"><span>{Math.round(c.progress)}% complete</span>{c.completed_at && <span className="text-green-600 font-semibold">Completed</span>}</div>
                <Link to={`/dashboard/learn/${c.slug}`} className="mt-4 w-full py-2.5 rounded-xl bg-[#F3AC08] text-white text-sm font-bold text-center">{c.progress > 0 ? 'Continue' : 'Start learning'}</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="No courses yet" text="Enroll in a course to start learning." action={<Link to="/courses" className="inline-block px-6 py-3 rounded-xl bg-[#F3AC08] text-white font-bold">Browse courses</Link>} />
      )}
    </div>
  );
}
