'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: 'red' | 'green' | 'brand';
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  confirmColor = 'brand',
  onConfirm,
  isLoading = false,
}: ConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-500',
    green: 'bg-green-600 hover:bg-green-500',
    brand: 'bg-brand-600 hover:bg-brand-500',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${colorClasses[confirmColor]} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
