import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const sizes = {
  sm: 'max-w-[500px]',
  md: 'max-w-[500px]',
  lg: 'max-w-[800px]',
  xl: 'max-w-[1140px]',
};

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className={clsx('flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-slate-900', sizes[size])}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-white/10">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
            <button className="text-slate-500 transition hover:text-slate-900 dark:hover:text-white" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          
          <div className="overflow-y-auto p-6 text-slate-900 dark:text-slate-300">
            {children}
          </div>

          {footer && (
            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-white/10 dark:bg-slate-950">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
