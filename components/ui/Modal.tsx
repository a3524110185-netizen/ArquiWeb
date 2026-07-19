'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function Modal({ open, isOpen, onClose, title, size = 'md', children, footer }: ModalProps) {
  const isVisible = open ?? isOpen ?? false;
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isVisible) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isVisible, onClose]);

  useEffect(() => {
    if (isVisible) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={cn('w-full bg-card rounded-2xl shadow-2xl fade-in overflow-hidden', sizes[size])}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-default">
            <h2 className="text-base font-semibold text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-app transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-default bg-app">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Confirm Dialog helper
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  open, onClose, onConfirm, title = '¿Confirmar acción?',
  message = 'Esta acción no se puede deshacer.', confirmLabel = 'Confirmar', variant = 'danger'
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant={variant} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm text-secondary">{message}</p>
    </Modal>
  );
}
