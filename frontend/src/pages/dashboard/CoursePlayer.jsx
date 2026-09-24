import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Award, ChevronDown, ChevronLeft, ChevronRight, CircleCheck, Circle, FileText, Play } from 'lucide-react';
import PageLoader from '../../components/common/PageLoader';
import { LearningApi } from '../../services/api';
import { cn, img, lessonTime } from '../../utils/format';

export default function CoursePlayer() {
  const { slug } = useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['player', slug], queryFn: () => LearningApi.player(slug) });
  const [current, setCurrent] = useState(null);
  const [open, setOpen] = useState(new Set());
  const data = q.data;
  const lessons = data ? data.sections.flatMap((s) => s.lessons) : [];

  useEffect(() => {
    if (!data || current) return;
    const first = lessons.find((l) => !l.completed) || lessons[0];
    if (first) { setCurrent(first); setOpen(new Set([first.section_id])); }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (q.isLoading) return <PageLoader />;
  if (q.error || !data) return <div className="text-center py-20"><h1 className="text-xl font-bold mb-2">{q.error?.message || 'Course not available'}</h1><Link to="/dashboard/my-learning" className="text-[#F3AC08] font-semibold">Back to My Learning</Link></div>;

  const idx = lessons.findIndex((l) => l.id === current?.id);
  const mark = async (lesson, completed = true) => {
    try {
      const res = await LearningApi.progress(slug, { lesson_id: lesson.id, completed });
      qc.setQueryData(['player', slug], (old) => ({ ...old, completed_count: res.completed_count, enrollment: { ...old.enrollment, progress: res.progress }, sections: old.sections.map((s) => ({ ...s, lessons: s.lessons.map((l) => (l.id === lesson.id ? { ...l, completed } : l)) })) }));
      qc.invalidateQueries({ queryKey: ['my-learning'] });
      if (completed && res.progress >= 100) toast.success('🎉 Course completed! Your certificate is ready.');
    } catch (err) { toast.error(err.message); }
  };
  const go = (n) => { const l = lessons[idx + n]; if (l) { setCurrent(l); setOpen((s) => new Set([...s, l.section_id])); } };
  const pct = Math.round(Number(data.enrollment.progress));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/dashboard/my-learning" className="text-sm text-gray-500 hover:text-[#F3AC08] flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> My Learning</Link>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex-1 min-w-0 truncate">{data.course.title}</h1>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4">
        <div className="flex-1"><div className="flex justify-between text-xs text-gray-500 mb-1"><span>{data.completed_count} / {data.total_lessons} lessons completed</span><span className="font-bold text-gray-900 dark:text-white">{pct}%</span></div><div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-[#F3AC08] transition-all" style={{ width: `${pct}%` }} /></div></div>
        {pct >= 100 && <span className="flex items-center gap-1 text-sm font-bold text-green-600"><Award className="w-5 h-5" /> Certificate earned</span>}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center">
            {current?.video_url ? (
              <video key={current.id} src={current.video_url} controls className="w-full h-full" onEnded={() => mark(current)} />
            ) : (
              <>
                <img src={img(data.course.thumbnail)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <div className="relative text-center text-white px-6">
                  <span className="w-16 h-16 mx-auto rounded-full bg-[#F3AC08] flex items-center justify-center mb-4">{current?.type === 'quiz' ? <FileText className="w-7 h-7" /> : <Play className="w-7 h-7 fill-current ml-1" />}</span>
                  <p className="font-bold text-lg">{current?.title}</p>
                  <p className="text-sm text-gray-300 mt-1">{current?.type === 'quiz' ? 'Quiz' : current?.type === 'assignment' ? 'Assignment' : 'Video lesson'} · {lessonTime(current?.duration_seconds || 0)}</p>
                  <p className="text-xs text-gray-400 mt-3">Video streaming will appear here once media files are uploaded for this lesson.</p>
                </div>
              </>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0"><p className="text-xs text-gray-500">Lesson {idx + 1} of {lessons.length}</p><h2 className="font-bold text-gray-900 dark:text-white truncate">{current?.title}</h2></div>
            <div className="flex gap-2">
              <button onClick={() => go(-1)} disabled={idx <= 0} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold disabled:opacity-40 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Prev</button>
              <button onClick={() => (current?.completed ? mark(current, false) : mark(current))} className={cn('px-4 py-2 rounded-xl text-sm font-bold', current?.completed ? 'bg-green-100 text-green-700' : 'bg-[#F3AC08] text-white')}>{current?.completed ? 'Completed ✓' : 'Mark as complete'}</button>
              <button onClick={() => go(1)} disabled={idx >= lessons.length - 1} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold disabled:opacity-40 flex items-center gap-1">Next <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <aside className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden lg:max-h-[75vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white">Course content</div>
          {data.sections.map((s) => {
            const done = s.lessons.filter((l) => l.completed).length;
            const isOpen = open.has(s.id);
            return (
              <div key={s.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                <button onClick={() => setOpen((o) => { const n = new Set(o); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n; })} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 text-left">
                  <span className="text-sm font-bold text-gray-900 dark:text-white pr-2">{s.title}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-2 shrink-0">{done}/{s.lessons.length}<ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} /></span>
                </button>
                {isOpen && s.lessons.map((l) => (
                  <button key={l.id} onClick={() => setCurrent(l)} className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-amber-50 dark:hover:bg-gray-700', current?.id === l.id && 'bg-amber-50 dark:bg-gray-700')}>
                    {l.completed ? <CircleCheck className="w-4 h-4 text-green-500 shrink-0" /> : <Circle className="w-4 h-4 text-gray-300 shrink-0" />}
                    <span className={cn('flex-1 truncate', current?.id === l.id ? 'font-bold text-[#b57d05]' : 'text-gray-700 dark:text-gray-200')}>{l.title}</span>
                    <span className="text-[11px] text-gray-400 shrink-0">{lessonTime(l.duration_seconds)}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </aside>
      </div>
    </div>
  );
}
