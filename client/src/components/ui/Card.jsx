import clsx from 'clsx';
import styles from './Card.module.css';

export function Card({ className, children, ...props }) {
  return (
    <div className={clsx(styles.card, className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={clsx(styles.header, className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={clsx(styles.title, className)} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={clsx(styles.body, className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={clsx(styles.footer, className)} {...props}>
      {children}
    </div>
  );
}
