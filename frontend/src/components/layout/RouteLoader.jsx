import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageLoader from '../common/PageLoader';

/**
 * Shows the GoEdu loading screen (logo + progress bar) whenever the visitor
 * navigates to another page: Courses, Bundles, Mentorship, Subscription, a course
 * or bundle page, dashboard pages, etc. It stays for a short, fixed moment and
 * then fades out so the transition feels smooth on every screen size.
 * Query-string / hash changes (filters, pagination) do not trigger it.
 */
const SHOW_MS = 1400; // how long the loader stays fully visible
const FADE_MS = 350; // fade-out duration (matches .page-loader-leave in index.css)

export default function RouteLoader() {
  const { pathname } = useLocation();
  const [phase, setPhase] = useState('visible'); // 'visible' | 'leaving' | 'hidden'

  useEffect(() => {
    setPhase('visible');
    const hide = setTimeout(() => setPhase('leaving'), SHOW_MS);
    const remove = setTimeout(() => setPhase('hidden'), SHOW_MS + FADE_MS);
    return () => {
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [pathname]);

  if (phase === 'hidden') return null;
  return (
    <div className={phase === 'leaving' ? 'page-loader-leave' : undefined} aria-hidden={phase === 'leaving'}>
      <PageLoader />
    </div>
  );
}
