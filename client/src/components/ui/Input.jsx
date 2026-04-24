import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

export const Input = forwardRef(({ label, className, wrapperClass, ...props }, ref) => {
  return (
    <div className={clsx(styles.wrapper, wrapperClass)}>
      {label && <label className={styles.label}>{label}</label>}
      <input ref={ref} className={clsx(styles.input, className)} {...props} />
    </div>
  );
});

Input.displayName = 'Input';

export const Select = forwardRef(({ label, className, wrapperClass, children, ...props }, ref) => {
  return (
    <div className={clsx(styles.wrapper, wrapperClass)}>
      {label && <label className={styles.label}>{label}</label>}
      <select ref={ref} className={clsx(styles.input, className)} {...props}>
        {children}
      </select>
    </div>
  );
});

Select.displayName = 'Select';
