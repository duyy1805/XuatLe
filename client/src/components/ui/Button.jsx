import { forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Button.module.css';

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
        styles.btn,
        styles[variant],
        styles[size],
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
