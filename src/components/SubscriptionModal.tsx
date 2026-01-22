'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';

interface SubscriptionFormData {
  tier: 'FREE' | 'PREMIUM' | 'LIFETIME';
  durationDays?: number;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentTier: string;
}

export default function SubscriptionModal({ isOpen, onClose, userId, currentTier }: SubscriptionModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch } = useForm<SubscriptionFormData>({
    defaultValues: {
      tier: 'PREMIUM',
      durationDays: 30,
    },
  });

  const tier = watch('tier');

  const mutation = useMutation({
    mutationFn: (data: SubscriptionFormData) => {
      if (data.tier === 'LIFETIME') {
        return api.post(`/admin/subscriptions/${userId}/grant-lifetime`);
      } else if (data.tier === 'PREMIUM') {
        return api.post(`/admin/subscriptions/${userId}/grant-premium`, {
          durationDays: data.durationDays,
        });
      } else {
        return api.post(`/admin/subscriptions/${userId}/revoke-premium`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const onSubmit = (data: SubscriptionFormData) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Subscription" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Current tier: <span className="font-medium">{currentTier}</span>
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-2">New Tier</label>
          <select
            {...register('tier')}
            className="block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="FREE">Free</option>
            <option value="PREMIUM">Premium</option>
            <option value="LIFETIME">Lifetime</option>
          </select>
        </div>

        {tier === 'PREMIUM' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (days)
            </label>
            <input
              type="number"
              {...register('durationDays')}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="30"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty for indefinite premium access
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
          >
            {mutation.isPending ? 'Updating...' : 'Update Subscription'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
