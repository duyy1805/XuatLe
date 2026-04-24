import { forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05),0_2px_4px_-2px_rgba(15,23,42,0.05),0_0_15px_rgba(37,99,235,0.15)]',
  secondary: 'bg-blue-50 text-blue-600 hover:bg-indigo-100',
  outline: 'border border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-500 hover:bg-slate-50',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md',
  success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md',
};

const sizes = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  ...props 
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: props.disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: props.disabled || isLoading ? 1 : 0.98 }}
      disabled={isLoading || props.disabled}
      className={clsx(
        'relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={16} />}
      {!isLoading && children}
    </motion.button>
  );
});

Button.displayName = 'Button';
