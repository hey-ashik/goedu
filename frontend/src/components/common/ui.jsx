import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '../../utils/format';

/** Row of 5 stars, `value` 0-5. */
export function Stars({ value = 5, size = 16, className, onChange, activeClass = 'text-[#F3AC08] fill-[#F3AC08]' }) {
  return (
    <div className={cn('flex gap-1', className)}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star`}>
            <Star size={size} className={n <= value ? activeClass : 'text-gray-300'} />
          </button>
        ) : (
          <Star key={n} size={size} className={n <= Math.round(value) ? activeClass : 'text-gray-300 dark:text-gray-600'} />
        )
      )}
    </div>
  );
}

export function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6 md:mb-8 flex-wrap">
      <Link to="/" className="transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:text-yellow-600">Home</Link>
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="text-gray-500">/</span>
          {it.to ? (
            <Link to={it.to} className="text-gray-600 dark:text-gray-400 hover:text-yellow-600">{it.label}</Link>
          ) : (
            <span className="font-medium truncate max-w-[200px] sm:max-w-none text-gray-800 dark:text-gray-100">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Yellow gradient page hero used by About / policy pages. */
export function PageHero({ title, crumbs, children, className }) {
  return (
    <section className={cn('relative mt-5 overflow-hidden bg-gradient-to-b from-[#FFF4D3] to-[#FCD53F] dark:from-gray-800 dark:to-gray-900', className)}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {crumbs && <Breadcrumb items={crumbs} />}
        <div className="max-w-4xl">
          <div className="flex items-start gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight capitalize font-poppins text-gray-900 dark:text-white">{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

export function Pagination({ page, totalPages, onChange, className }) {
  if (!totalPages || totalPages <= 1) return null;
  const pages = [];
  const push = (p) => pages.push(p);
  if (totalPages <= 7) for (let p = 1; p <= totalPages; p++) push(p);
  else {
    push(1);
    if (page > 3) push('…');
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) push(p);
    if (page < totalPages - 2) push('…');
    push(totalPages);
  }
  return (
    <div className={cn('flex items-center justify-center gap-1.5 flex-wrap', className)}>
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-40 hover:border-[#F3AC08]" aria-label="Previous page"><ChevronLeft size={18} /></button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)} className={cn('w-10 h-10 rounded-xl border text-sm font-semibold transition-colors', p === page ? 'bg-[#F3AC08] border-[#F3AC08] text-white' : 'border-gray-200 dark:border-gray-700 hover:border-[#F3AC08] text-gray-700 dark:text-gray-200')}>{p}</button>
        )
      )}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-40 hover:border-[#F3AC08]" aria-label="Next page"><ChevronRight size={18} /></button>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action, className }) {
  return (
    <div className={cn('text-center py-12', className)}>
      {Icon && <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      {text && <p className="text-gray-600 dark:text-gray-400 mb-4">{text}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('bg-gray-200 dark:bg-gray-700 rounded animate-pulse', className)} />;
}

export function SectionTag({ children, className }) {
  return (
    <div className={cn('inline-flex items-center gap-2 py-2 px-4 border rounded-full border-black dark:border-white', className)}>
      <span aria-hidden="true" className="bg-[#ED8E22] font-normal h-2 w-2 rounded-full" />
      <p className="!font-lexend dark:text-white text-black">{children}</p>
    </div>
  );
}

export function Button({ as: Comp = 'button', variant = 'primary', size = 'md', className, children, ...props }) {
  const variants = {
    primary: 'bg-[#F3AC08] hover:bg-[#d49607] text-white shadow-lg shadow-orange-200 dark:shadow-none',
    dark: 'bg-[#111827] hover:bg-black text-white dark:bg-white dark:text-[#111827] dark:hover:bg-gray-100',
    outline: 'border-2 border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white',
    ghost: 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:border-[#F3AC08] hover:text-[#F3AC08]',
  };
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-sm sm:text-base', lg: 'px-8 py-3.5 text-base' };
  return (
    <Comp className={cn('inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed', variants[variant], sizes[size], className)} {...props}>
      {children}
    </Comp>
  );
}
