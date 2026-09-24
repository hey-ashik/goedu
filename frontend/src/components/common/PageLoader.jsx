export default function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#FFFCF6] dark:bg-gray-900">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-amber-100 dark:border-gray-800" />
        <div className="absolute inset-0 rounded-full border-4 border-[#F3AC08] border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
