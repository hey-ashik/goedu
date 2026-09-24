import { cn } from '../../utils/format';

/**
 * Full-viewport page loader: fixed overlay centred on every screen size, with
 * the GoEdu mark and a slim indeterminate bar. Fades in after a short delay so
 * fast navigations never flash it.
 */
export default function PageLoader({ label = 'Loading', inline = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'flex flex-col items-center justify-center bg-[#FFFCF6] dark:bg-gray-900 page-loader',
        inline ? 'min-h-[60vh] w-full' : 'fixed inset-0 z-[200] h-[100dvh] w-full'
      )}
    >
      <div className="flex flex-col items-center gap-5 -translate-y-6">
        <img src="/logo.svg" alt="GoEdu" width="140" height="45" className="h-10 sm:h-11 w-auto page-loader-logo" draggable="false" />
        <div className="relative h-[3px] w-40 sm:w-48 overflow-hidden rounded-full bg-amber-100 dark:bg-gray-800">
          <span className="absolute inset-y-0 w-1/3 rounded-full bg-[#F3AC08] page-loader-bar" />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">{label}</p>
      </div>
    </div>
  );
}
