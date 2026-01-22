'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/admin/analytics/dashboard'),
  });

  const { data: retention } = useQuery({
    queryKey: ['retention'],
    queryFn: () => api.get('/admin/analytics/retention'),
  });

  const { data: moodTrends } = useQuery({
    queryKey: ['mood-trends'],
    queryFn: () => api.get('/admin/analytics/mood-trends'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Insights and metrics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="text-sm font-medium text-gray-500">Total Users</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.totalUsers || 0}</dd>
        </div>
        <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="text-sm font-medium text-gray-500">Daily Active</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.dau || 0}</dd>
        </div>
        <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="text-sm font-medium text-gray-500">Monthly Active</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.mau || 0}</dd>
        </div>
        <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="text-sm font-medium text-gray-500">Conversion Rate</dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600">{stats?.conversionRate || 0}%</dd>
        </div>
      </div>

      {/* Retention */}
      {retention && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Retention</h3>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <div className="text-sm text-gray-500">Weekly Retention</div>
              <div className="mt-1 text-2xl font-semibold">{retention.weeklyRetention}%</div>
              <div className="text-sm text-gray-400">{retention.weeklyActive} active users</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Monthly Retention</div>
              <div className="mt-1 text-2xl font-semibold">{retention.monthlyRetention}%</div>
              <div className="text-sm text-gray-400">{retention.monthlyActive} active users</div>
            </div>
          </div>
        </div>
      )}

      {/* Mood Distribution */}
      {moodTrends && moodTrends.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Mood Distribution (Last 30 Days)</h3>
          <div className="mt-4 space-y-3">
            {moodTrends.map((trend: any) => (
              <div key={trend.mood} className="flex items-center">
                <div className="w-24 text-sm text-gray-600 capitalize">{trend.mood}</div>
                <div className="flex-1">
                  <div className="h-4 rounded-full bg-gray-200">
                    <div
                      className="h-4 rounded-full bg-brand-500"
                      style={{
                        width: `${Math.min(100, (trend._count / Math.max(...moodTrends.map((t: any) => t._count))) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="ml-3 w-12 text-right text-sm text-gray-600">{trend._count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content & Engagement */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Content Engagement</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Mood Entries</span>
              <span className="font-semibold">{stats?.totalMoodEntries || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Journal Entries</span>
              <span className="font-semibold">{stats?.totalJournalEntries || 0}</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Subscription Metrics</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Premium Users</span>
              <span className="font-semibold">{stats?.premiumUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Conversion Rate</span>
              <span className="font-semibold text-green-600">{stats?.conversionRate || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
