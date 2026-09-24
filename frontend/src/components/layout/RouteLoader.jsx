import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageLoader from '../common/PageLoader';

/**
 * Branded GoEdu loading screen (logo + progress bar). It is shown only:
 *   1. on the very first load of the site,
 *   2. when the visitor enters the Courses section (/courses),
 *   3. when the visitor enters the Mentorship section (/mentorship),
 *   4. when the GoEdu logo in the header is clicked (custom 'goedu:loader' event).
 * Every other navigation renders instantly without the animation.
 */
const SHOW_MS = 650; // fully visible
const FADE_MS = 250; // fade-out (matches .page-loader-leave in index.css)
const SECTIONS = ['/courses', '/mentorship'];

const isSection = (pathname) => SECTIONS.includes(pathname.replace(/\/+$/, '') || '/');

export default function RouteLoader() {
  const { pathname } = useLocation();
  const firstRender = useRef(true);
  const [phase, setPhase] = useState('visible'); // 'visible' | 'leaving' | 'hidden'

  const timers = useRef([]);
  const playing = useRef(false);
  const play = () => {
    timers.current.forEach(clearTimeout);
    playing.current = true;
    setPhase('visible');
    timers.current = [
      setTimeout(() => setPhase('leaving'), SHOW_MS),
      setTimeout(() => { playing.current = false; setPhase('hidden'); }, SHOW_MS + FADE_MS),
    ];
  };

  useEffect(() => {
    const show = firstRender.current || isSection(pathname);
    firstRender.current = false;
    if (show) play();
    else if (!playing.current) setPhase('hidden'); // keep a logo-triggered animation running across the route change
  }, [pathname]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // header logo click -> play the animation even when already on the home page
  useEffect(() => {
    window.addEventListener('goedu:loader', play);
    return () => window.removeEventListener('goedu:loader', play);
  }, []);

  if (phase === 'hidden') return null;
  return (
    <div className={phase === 'leaving' ? 'page-loader-leave' : undefined} aria-hidden={phase === 'leaving'}>
      <PageLoader />
    </div>
  );
}
