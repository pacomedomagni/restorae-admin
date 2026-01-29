'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PaperAirplaneIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';

interface NotificationFormData {
  title: string;
  body: string;
  schedule?: string;
  data?: string;
}

interface Campaign {
  id: string;
  title: string;
  body: string;
  segmentId?: string;
  status: string;
  sentAt?: string;
  scheduledFor?: string;
  createdAt: string;
  segment?: { name: string };
  _count?: { logs: number };
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [sent, setSent] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NotificationFormData>();

  // Fetch recent campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['notification-campaigns'],
    queryFn: () => api.get<{ campaigns: Campaign[]; total: number }>('/admin/notifications/campaigns'),
  });

  const campaigns = campaignsData?.campaigns;

  // Send notification mutation - creates campaign and sends immediately
  const sendMutation = useMutation({
    mutationFn: async (data: NotificationFormData) => {
      // First create the campaign
      const campaign = await api.post<Campaign>('/admin/notifications/campaigns', {
        title: data.title,
        body: data.body,
        scheduledFor: data.schedule ? new Date(data.schedule).toISOString() : undefined,
        data: data.data ? JSON.parse(data.data) : undefined,
      });
      
      // If not scheduled, send immediately
      if (!data.schedule) {
        return api.post(`/admin/notifications/campaigns/${campaign.id}/send`);
      }
      
      return campaign;
    },
    onSuccess: (result: any) => {
      setSent(result.sent || result.scheduled || 0);
      setError(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ['notification-campaigns'] });
      setTimeout(() => setSent(null), 5000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to send notification');
      setTimeout(() => setError(null), 5000);
    },
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/notifications/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-campaigns'] });
    },
  });

  const onSubmit = (data: NotificationFormData) => {
    if (window.confirm('Send this notification to all users?')) {
      sendMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">Send push notifications to users</p>
      </div>

      {/* Campaign Builder */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <PaperAirplaneIcon className="h-5 w-5 mr-2 text-brand-600" />
          Send Push Notification
        </h3>
        
        {sent !== null && (
          <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
            ✓ Notification {sent > 0 ? `sent to ${sent} devices` : 'scheduled'} successfully!
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
            ✗ {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Audience</label>
            <p className="mt-1 text-sm text-gray-500">Sends to all users with push notifications enabled</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              {...register('title', { required: 'Title is required', maxLength: 50 })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-brand-500"
              placeholder="Notification title"
              maxLength={50}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Message *</label>
            <textarea
              {...register('body', { required: 'Message is required', maxLength: 200 })}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-brand-500"
              placeholder="Notification message"
              maxLength={200}
            />
            {errors.body && (
              <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Schedule For (optional)
            </label>
            <input
              type="datetime-local"
              {...register('schedule')}
              min={new Date().toISOString().slice(0, 16)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty to send immediately</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Custom Data (JSON, optional)</label>
            <input
              type="text"
              {...register('data', {
                validate: (value) => {
                  if (!value) return true;
                  try {
                    JSON.parse(value);
                    return true;
                  } catch {
                    return 'Invalid JSON';
                  }
                }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-brand-500 font-mono text-sm"
              placeholder='{"screen": "tools", "action": "open"}'
            />
            {errors.data && (
              <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
            )}
          </div>
          
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50 flex items-center"
            >
              <PaperAirplaneIcon className="h-4 w-4 mr-2" />
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
        
        {campaignsLoading ? (
          <div className="mt-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="mt-4 space-y-3">
            {campaigns.map((campaign: Campaign) => (
              <div key={campaign.id} className="flex items-start justify-between rounded-md border border-gray-200 p-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{campaign.title}</div>
                  <div className="text-sm text-gray-500 mt-1">{campaign.body}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{campaign.segment?.name || 'All Users'}</span>
                    <span>
                      {campaign.status === 'SENT' 
                        ? `Sent to ${campaign._count?.logs || 0} devices` 
                        : campaign.status === 'SCHEDULED'
                        ? `Scheduled for ${new Date(campaign.scheduledFor!).toLocaleString()}`
                        : campaign.status}
                    </span>
                    <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    campaign.status === 'SENT' ? 'bg-green-100 text-green-700' :
                    campaign.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-700' :
                    campaign.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {campaign.status}
                  </span>
                  {campaign.status === 'SCHEDULED' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Cancel this scheduled notification?')) {
                          deleteMutation.mutate(campaign.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No campaigns sent yet</p>
        )}
      </div>
    </div>
  );
}
