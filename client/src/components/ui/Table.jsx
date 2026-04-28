import clsx from 'clsx';

export function TableContainer({ children, className }) {
  return <div className={clsx('w-full overflow-x-auto rounded-xl border border-slate-100 bg-white dark:border-white/10 dark:bg-slate-900', className)}>{children}</div>;
}

export function Table({ children, className }) {
  return <table className={clsx('w-full border-separate border-spacing-0 text-left text-sm [&_tbody_tr:hover_td]:bg-blue-50 dark:[&_tbody_tr:hover_td]:bg-white/5 [&_tbody_tr]:transition [&_td]:border-b [&_td]:border-slate-100 dark:[&_td]:border-white/5 [&_td]:px-5 [&_td]:py-4 [&_td]:text-slate-900 dark:[&_td]:text-slate-300 [&_tbody_tr:last-child_td]:border-b-0 [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-slate-200 dark:[&_th]:border-white/10 [&_th]:bg-slate-50/85 dark:[&_th]:bg-slate-900/85 [&_th]:px-5 [&_th]:py-4 [&_th]:font-semibold [&_th]:text-slate-500 dark:[&_th]:text-slate-400 [&_th]:backdrop-blur', className)}>{children}</table>;
}
