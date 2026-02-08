'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface FeedbackItem {
  id: string;
  type: string;
  status: string;
  subject?: string;
  message: string;
  email?: string;
  adminReply?: string;
  repliedAt?: string;
  user?: { email: string };
  createdAt: string;
}

export default function FeedbackPage() {
  const queryClient = useQueryClient();
  const [replyTarget, setReplyTarget] = useState<FeedbackItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => api.get('/admin/analytics/feedback?limit=50'),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/admin/feedback/${id}`, { status: 'RESOLVED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });

  const inProgressMutation = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/admin/feedback/${id}`, { status: 'IN_PROGRESS' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      api.patch(`/admin/feedback/${id}`, { adminReply: reply, status: 'RESOLVED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      setReplyTarget(null);
      setReplyText('');
    },
  });

  const handleReply = () => {
    if (!replyTarget || !replyText.trim()) return;
    replyMutation.mutate({ id: replyTarget.id, reply: replyText.trim() });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BUG':
        return 'bg-red-100 text-red-800';
      case 'FEATURE':
        return 'bg-blue-100 text-blue-800';
      case 'SUPPORT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFeedback = statusFilter === 'ALL'
    ? feedback
    : feedback?.filter((item: FeedbackItem) => item.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback & Support</h1>
          <p className="mt-1 text-sm text-gray-500">User feedback and support requests</p>
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                statusFilter === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'ALL' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          </div>
        ) : filteredFeedback?.length > 0 ? (
          filteredFeedback.map((item: FeedbackItem) => (
            <div key={item.id} className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-medium text-gray-900">
                    {item.subject || `${item.type} Report`}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{item.message}</p>

                  {/* Show admin reply if exists */}
                  {item.adminReply && (
                    <div className="mt-3 rounded-md bg-brand-50 p-3">
                      <p className="text-xs font-medium text-brand-700">Admin reply:</p>
                      <p className="mt-1 text-sm text-brand-900">{item.adminReply}</p>
                      {item.repliedAt && (
                        <p className="mt-1 text-xs text-brand-500">
                          {new Date(item.repliedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      {item.user?.email || item.email || 'Anonymous'}
                    </span>
                    <span>&middot;</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => {
                      setReplyTarget(item);
                      setReplyText('');
                    }}
                    className="rounded-md bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-100"
                  >
                    Reply
                  </button>
                  {item.status === 'PENDING' && (
                    <button
                      onClick={() => inProgressMutation.mutate(item.id)}
                      disabled={inProgressMutation.isPending}
                      className="rounded-md bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-600 hover:bg-yellow-100 disabled:opacity-50"
                    >
                      In Progress
                    </button>
                  )}
                  {item.status !== 'RESOLVED' && (
                    <button
                      onClick={() => resolveMutation.mutate(item.id)}
                      disabled={resolveMutation.isPending}
                      className="rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-100 disabled:opacity-50"
                    >
                      {resolveMutation.isPending ? 'Resolving...' : 'Resolve'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="text-gray-500">No feedback yet</p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Reply to Feedback</h2>
            <div className="mt-2 rounded-md bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500">Original message:</p>
              <p className="mt-1 text-sm text-gray-700">{replyTarget.message}</p>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="mt-4 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              rows={4}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setReplyTarget(null)}
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || replyMutation.isPending}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
            {replyMutation.isError && (
              <p className="mt-2 text-sm text-red-600">Failed to send reply. Please try again.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
