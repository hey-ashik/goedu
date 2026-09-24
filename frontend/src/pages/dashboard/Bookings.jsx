import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import { MentorshipApi } from '../../services/api';
import { EmptyState } from '../../components/common/ui';
import { cn, formatDateTime, img } from '../../utils/format';

const STATUS = { pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', cancelled: 'bg-gray-100 text-gray-600' };

export default function Bookings() {
  const q = useQuery({ queryKey: ['bookings'], queryFn: MentorshipApi.myBookings });
  const list = q.data?.results || [];
  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Mentor Sessions</h1>
      {q.isLoading ? <div className="h-32 rounded-2xl bg-white dark:bg-gray-800 animate-pulse" /> : list.length ? (
        <div className="space-y-3">
          {list.map((b) => (
            <div key={b.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4">
              <img src={img(b.mentor_photo)} alt={b.mentor_name} className="w-14 h-14 rounded-xl object-cover bg-gray-100" />
              <div className="flex-1 min-w-0"><Link to={`/mentorship/${b.mentor_slug}`} className="font-bold text-gray-900 dark:text-white hover:text-[#F3AC08]">{b.mentor_name}</Link><p className="text-xs text-gray-500">{b.designation}</p><p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{formatDateTime(b.slot_at)}</p>{b.note && <p className="text-xs text-gray-500 mt-1 line-clamp-1">“{b.note}”</p>}</div>
              <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full uppercase shrink-0', STATUS[b.status])}>{b.status}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={CalendarCheck} title="No sessions booked" text="Book a 1:1 session with a verified mentor." action={<Link to="/mentorship" className="inline-block px-6 py-3 rounded-xl bg-[#F3AC08] text-white font-bold">Find a mentor</Link>} />
      )}
    </div>
  );
}
