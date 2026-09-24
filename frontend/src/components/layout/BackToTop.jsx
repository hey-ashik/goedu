import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '../../utils/format';

/** Flat amber "scroll to top" button, bottom-left, shown after scrolling. */
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
        'fixed bottom-6 left-6 z-[94] w-11 h-11 rounded-full bg-[#F5B622] text-white flex items-center justify-center transition-all duration-300 hover:bg-[#E0A51C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B622] focus-visible:ring-offset-2',
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
    </button>
  );
}
