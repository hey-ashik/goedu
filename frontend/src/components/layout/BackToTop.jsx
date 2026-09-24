import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '../../utils/format';

/** Orange "scroll to top" button shown after scrolling, as on goedu.ac. */
export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-24 right-6 sm:bottom-24 sm:right-7 z-[94] w-10 h-10 rounded-full bg-[#F3AC08] text-white shadow-lg shadow-orange-300/50 dark:shadow-none flex items-center justify-center transition-all hover:bg-[#d49607]',
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}
