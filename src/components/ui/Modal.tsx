'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);
  
  if (!isOpen) return null;
  
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Modal */}
      <div
        className={cn(
          'relative bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-y-auto',
          sizeStyles[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export interface ModalHeaderProps {
  title?: string;
  description?: string;
  onClose?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  description,
  onClose,
}) => (
  <div className="flex items-center justify-between p-6 border-b border-gray-200">
    <div className="flex-1">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
      )}
      {description && (
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
    {onClose && (
      <button
        onClick={onClose}
        className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
    )}
  </div>
);

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalContent: React.FC<ModalContentProps> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
);

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('flex items-center justify-end space-x-3 p-6 border-t border-gray-200', className)} {...props}>
    {children}
  </div>
);

export { Modal };
