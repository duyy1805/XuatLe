import clsx from 'clsx';

const variants = {
  primary: 'border-blue-600/20 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  success: 'border-emerald-600/20 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'border-amber-600/20 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'border-red-600/20 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  info: 'border-sky-600/20 bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  neutral: 'border-slate-600/20 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export function Badge({ className, variant = 'neutral', children, ...props }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase leading-tight', variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
