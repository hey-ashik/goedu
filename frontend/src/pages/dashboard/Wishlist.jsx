import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Heart, X } from 'lucide-react';
import { WishlistApi } from '../../services/api';
import CourseCard from '../../components/common/CourseCard';
import { EmptyState } from '../../components/common/ui';

export default function Wishlist() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['wishlist'], queryFn: WishlistApi.list });
  const list = q.data?.results || [];
  const remove = async (id) => {
    try { await WishlistApi.toggle(id); qc.setQueryData(['wishlist'], (old) => ({ ...old, results: old.results.filter((c) => c.id !== id) })); toast.success('Removed from wishlist'); } catch (err) { toast.error(err.message); }
  };
  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Wishlist</h1>
      {q.isLoading ? <div className="h-40 rounded-2xl bg-white dark:bg-gray-800 animate-pulse" /> : list.length ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {list.map((c) => (
            <div key={c.id} className="relative">
              <button onClick={() => remove(c.id)} className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow hover:bg-red-50" aria-label="Remove"><X className="w-4 h-4" /></button>
              <CourseCard course={c} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Heart} title="Your wishlist is empty" text="Save courses you like to find them here later." action={<Link to="/courses" className="inline-block px-6 py-3 rounded-xl bg-[#F3AC08] text-white font-bold">Browse courses</Link>} />
      )}
    </div>
  );
}
