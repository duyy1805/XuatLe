import clsx from 'clsx';
import styles from './Badge.module.css';

export function Badge({ className, variant = 'neutral', children, ...props }) {
  return (
    <span className={clsx(styles.badge, styles[variant], className)} {...props}>
      {children}
    </span>
  );
}
