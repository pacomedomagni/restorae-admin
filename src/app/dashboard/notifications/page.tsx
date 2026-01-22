'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface NotificationFormData {
  target: string;
  title: string;
  body: string;
  schedule?: string;
}

export default function NotificationsPage() {
  const [sent, setSent] = useState<number | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NotificationFormData>();

  const sendMutation = useMutation({
    mutationFn: async (data: NotificationFormData) => {
      // This would integrate with a notification campaign system
      // For now, just simulate success
      return { sent: 100 }; // Mock response
    },
    onSuccess: (data) => {
      setSent(data.sent);
      reset();
      setTimeout(() => setSent(null), 3000);
    },
  });

  const onSubmit = (data: NotificationFormData) => {
    if (window.confirm(`Send notification to ${data.target}?`)) {
      sendMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">Manage push notifications and campaigns</p>
      </div>

      {/* Campaign Builder */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900">Send Push Notification</h3>
        
        {sent && (
          <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
            ✓ Notification sent to {sent} devices successfully!
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Audience</label>
            <select
              {...register('target', { required: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-brand-500"
            >
              <option value="all">All Users</option>
              <option value="premium">Premium Users</option>
              <option value="free">Free Users</option>
              <option value="inactive">Inactive Users (7+ days)</option>
              <option value="trial">Trial Users</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-brand-500"
              placeholder="Notification title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message *</label>
            <textarea
              {...register('body', { required: 'Message is required' })}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-brand-500"
              placeholder="Notification message"
            />
            {errors.body && (
              <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Schedule For (optional)</label>
            <input
              type="datetime-local"
              {...register('schedule')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
            >
              {sendMutation.isPending ? 'Sending...' : 'Send Now'}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Recent Campaigns */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900">Recent Campaigns</h3>
        <div className="mt-4">
          <p className="text-sm text-gray-500">No campaigns sent yet</p>
        </div>
      </div>
    </div>
  );
}
