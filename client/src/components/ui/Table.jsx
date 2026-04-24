import clsx from 'clsx';
import styles from './Table.module.css';

export function TableContainer({ children, className }) {
  return <div className={clsx(styles.container, className)}>{children}</div>;
}

export function Table({ children, className }) {
  return <table className={clsx(styles.table, className)}>{children}</table>;
}
