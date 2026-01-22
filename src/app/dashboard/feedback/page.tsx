'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function FeedbackPage() {
  const queryClient = useQueryClient();

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback & Support</h1>
        <p className="mt-1 text-sm text-gray-500">User feedback and support requests</p>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          </div>
        ) : feedback?.length > 0 ? (
          feedback.map((item: any) => (
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
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      {item.user?.email || item.email || 'Anonymous'}
                    </span>
                    <span>•</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => window.alert('Reply functionality coming soon')}
                    className="rounded-md bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-100"
                  >
                    Reply
                  </button>
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
    </div>
  );
}
