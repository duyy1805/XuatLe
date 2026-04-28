import clsx from 'clsx';

export function Card({ className, children, ...props }) {
  return (
    <div className={clsx('relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={clsx('flex items-center justify-between px-6 pt-6 pb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={clsx('text-lg font-semibold text-slate-900 dark:text-white', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={clsx('px-6 pb-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={clsx('flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 dark:border-white/5 dark:bg-slate-900/50', className)} {...props}>
      {children}
    </div>
  );
}
