import { createContext, useState, useCallback } from 'react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

// eslint-disable-next-line react-refresh/only-export-components
export const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({
    title: 'Xác nhận',
    message: '',
    confirmText: 'Đồng ý',
    cancelText: 'Hủy',
    onConfirm: () => {},
    onCancel: () => {},
    variant: 'primary' // 'primary' | 'danger'
  });

  const confirm = useCallback((newOptions) => {
    return new Promise((resolve) => {
      setOptions({
        title: newOptions.title || 'Xác nhận',
        message: newOptions.message || '',
        confirmText: newOptions.confirmText || 'Đồng ý',
        cancelText: newOptions.cancelText || 'Hủy',
        variant: newOptions.variant || 'primary',
        onConfirm: () => {
          setIsOpen(false);
          resolve(true);
        },
        onCancel: () => {
          setIsOpen(false);
          resolve(false);
        }
      });
      setIsOpen(true);
    });
  }, []);

  const handleClose = () => {
    options.onCancel();
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        title={options.title}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={options.onCancel}>
              {options.cancelText}
            </Button>
            <Button variant={options.variant} onClick={options.onConfirm}>
              {options.confirmText}
            </Button>
          </>
        }
      >
        <p className="text-muted">{options.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}
