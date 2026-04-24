import clsx from 'clsx';
import styles from './Skeleton.module.css';

export function Skeleton({ className, ...props }) {
  return (
    <div className={clsx(styles.skeleton, className)} {...props} />
  );
}

export function TableSkeleton({ columns = 5, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j}>
              <Skeleton className="h-4 w-full" style={{ height: '1rem', minWidth: '4rem' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
