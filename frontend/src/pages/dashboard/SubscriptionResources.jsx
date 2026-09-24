import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Lock, Package, Sparkles } from 'lucide-react';
import { SubscriptionApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CourseCard from '../../components/common/CourseCard';

const RESOURCES = [
  { title: 'Career Roadmap Templates', type: 'PDF pack', desc: 'Step-by-step roadmaps for AI, Digital Marketing, Freelancing and Software careers.' },
  { title: 'CV & Cover Letter Kit', type: 'DOCX templates', desc: 'ATS friendly CV templates and cover letters used by GoEdu career mentors.' },
  { title: 'Interview Question Bank', type: 'PDF', desc: '200+ interview questions with model answers for fresh graduates in Bangladesh.' },
  { title: 'Freelancer Starter Checklist', type: 'PDF', desc: 'Profile setup, pricing and first-client checklist for Upwork and Fiverr.' },
];

export default function SubscriptionResources() {
  const { user } = useAuth();
  const active = !!user.subscription;
  const lib = useQuery({ queryKey: ['sub-library'], queryFn: SubscriptionApi.library, enabled: active });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Subscription Resources</h1>
        <p className="text-sm text-gray-500 mt-1">Member-exclusive downloadable resources (+2 new every month).</p>
      </div>
      {!active && (
        <div className="bg-gradient-to-br from-[#FFF4D3] to-[#FCD53F] dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <Lock className="w-8 h-8 text-[#b57d05] shrink-0" />
          <div className="flex-1"><p className="font-bold text-gray-900 dark:text-white">Learner Plus required</p><p className="text-sm text-gray-700 dark:text-gray-300">Activate a subscription to unlock all resources and the subscription course library.</p></div>
          <Link to="/subscription" className="px-5 py-2.5 rounded-xl bg-[#111827] text-white text-sm font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#F3AC08]" /> Get Learner Plus</Link>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {RESOURCES.map((r) => (
          <div key={r.title} className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex gap-4 ${active ? '' : 'opacity-70'}`}>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-gray-700 text-[#F3AC08] flex items-center justify-center shrink-0"><FileText className="w-5 h-5" /></div>
            <div className="flex-1"><p className="font-bold text-gray-900 dark:text-white">{r.title}</p><p className="text-xs text-gray-500 mb-2">{r.type}</p><p className="text-sm text-gray-600 dark:text-gray-300">{r.desc}</p><button disabled={!active} className="mt-3 text-sm font-bold text-[#F3AC08] disabled:text-gray-400 flex items-center gap-1">{active ? <><Package className="w-4 h-4" /> Download</> : <><Lock className="w-4 h-4" /> Locked</>}</button></div>
          </div>
        ))}
      </div>
      {active && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Subscription course library</h2>
          {lib.isLoading ? <div className="h-40 rounded-2xl bg-white dark:bg-gray-800 animate-pulse" /> : <div className="grid sm:grid-cols-2 gap-5">{(lib.data?.results || []).map((c) => <CourseCard key={c.id} course={c} />)}</div>}
        </div>
      )}
    </div>
  );
}
