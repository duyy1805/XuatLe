import clsx from 'clsx';

const variants = {
  success: 'border-emerald-600/20 bg-emerald-50 text-emerald-600',
  warning: 'border-amber-600/20 bg-amber-50 text-amber-600',
  danger: 'border-red-600/20 bg-red-50 text-red-600',
  info: 'border-sky-600/20 bg-sky-50 text-sky-600',
  neutral: 'border-slate-600/20 bg-slate-100 text-slate-600',
};

export function Badge({ className, variant = 'neutral', children, ...props }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase leading-tight', variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
