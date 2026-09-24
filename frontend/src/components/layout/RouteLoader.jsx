import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageLoader from '../common/PageLoader';

/**
 * Branded GoEdu loading screen (logo + progress bar). It is shown only:
 *   1. on the very first load of the site,
 *   2. when the visitor enters the Courses section (/courses),
 *   3. when the visitor enters the Mentorship section (/mentorship),
 *   4. when the GoEdu logo in the header is clicked (custom 'goedu:loader' event).
 * Every other navigation renders instantly without the animation.
 *
 * The timers are derived from the `phase` state (not kept in refs) so React's
 * StrictMode double-mount in development re-arms them instead of losing them,
 * which previously left the overlay on screen forever on localhost.
 */
const SHOW_MS = 650; // fully visible
const FADE_MS = 250; // fade-out (matches .page-loader-leave in index.css)
const SECTIONS = ['/courses', '/mentorship'];

const isSection = (pathname) => SECTIONS.includes(pathname.replace(/\/+$/, '') || '/');

export default function RouteLoader() {
  const { pathname } = useLocation();
  const firstRender = useRef(true);
  const [phase, setPhase] = useState('visible'); // 'visible' | 'leaving' | 'hidden'
  const [run, setRun] = useState(0); // bumped to restart the animation while it is already visible

  const play = () => { setPhase('visible'); setRun((r) => r + 1); };

  // phase machine: visible -(SHOW_MS)-> leaving -(FADE_MS)-> hidden
  useEffect(() => {
    if (phase === 'visible') {
      const t = setTimeout(() => setPhase('leaving'), SHOW_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'leaving') {
      const t = setTimeout(() => setPhase('hidden'), FADE_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase, run]);

  // useLayoutEffect: the overlay is committed before the browser paints the new
  // route, so the animation is visible first and the page appears underneath it.
  useLayoutEffect(() => {
    const show = firstRender.current || isSection(pathname);
    firstRender.current = false;
    if (show) play();
    // any other navigation: leave a running animation alone, otherwise stay hidden
  }, [pathname]);

  // header logo click -> play the animation even when already on the home page
  useEffect(() => {
    window.addEventListener('goedu:loader', play);
    return () => window.removeEventListener('goedu:loader', play);
  }, []);

  // safety net: whatever happens, never keep the site covered for more than a few seconds
  useEffect(() => {
    if (phase === 'hidden') return undefined;
    const t = setTimeout(() => setPhase('hidden'), 4000);
    return () => clearTimeout(t);
  }, [phase, run]);

  if (phase === 'hidden') return null;
  return (
    <div className={phase === 'leaving' ? 'page-loader-leave' : undefined} aria-hidden={phase === 'leaving'}>
      <PageLoader />
    </div>
  );
}
