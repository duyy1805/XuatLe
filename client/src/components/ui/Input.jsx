import { forwardRef } from 'react';
import clsx from 'clsx';

const wrapperClassName = 'flex flex-col gap-1.5';
const labelClassName = 'text-sm font-medium text-slate-900';
const inputClassName = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-500';

export const Input = forwardRef(({ label, className, wrapperClass, ...props }, ref) => {
  return (
    <div className={clsx(wrapperClassName, wrapperClass)}>
      {label && <label className={labelClassName}>{label}</label>}
      <input ref={ref} className={clsx(inputClassName, className)} {...props} />
    </div>
  );
});

Input.displayName = 'Input';

export const Select = forwardRef(({ label, className, wrapperClass, children, ...props }, ref) => {
  return (
    <div className={clsx(wrapperClassName, wrapperClass)}>
      {label && <label className={labelClassName}>{label}</label>}
      <select ref={ref} className={clsx(inputClassName, className)} {...props}>
        {children}
      </select>
    </div>
  );
});

Select.displayName = 'Select';
