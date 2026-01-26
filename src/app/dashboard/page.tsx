'use client';

import { useQuery } from '@tanstack/react-query';
import {
  UsersIcon,
  CurrencyDollarIcon,
  FaceSmileIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import GlassCard from '@/components/GlassCard';

interface StatCardProps {
  name: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ElementType;
}

function StatCard({ name, value, change, changeType, icon: Icon }: StatCardProps) {
  return (
    <GlassCard className="relative overflow-hidden group hover:bg-white/80 transition-all duration-300">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="h-24 w-24 text-brand-600 transform translate-x-4 -translate-y-4" />
      </div>
      <div className="flex items-center relative z-10">
        <div className="flex-shrink-0 p-3 bg-brand-50 rounded-xl">
          <Icon className="h-6 w-6 text-brand-600" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="truncate text-sm font-medium text-gray-500">{name}</dt>
            <dd className="flex items-baseline mt-1">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {change && (
                <div
                  className={`ml-2 flex items-baseline text-xs font-medium px-2 py-0.5 rounded-full ${
                    changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {change}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </GlassCard>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/admin/analytics/dashboard'),
  });

  const { data: feedback } = useQuery({
    queryKey: ['recent-feedback'],
    queryFn: () => api.get('/admin/analytics/feedback?limit=5'),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your Restorae wellness app
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          name="Total Users"
          value={stats?.totalUsers || 0}
          icon={UsersIcon}
        />
        <StatCard
          name="Premium Users"
          value={stats?.premiumUsers || 0}
          change={stats?.conversionRate ? `${stats.conversionRate}%` : undefined}
          changeType="positive"
          icon={CurrencyDollarIcon}
        />
        <StatCard
          name="Mood Entries"
          value={stats?.totalMoodEntries || 0}
          icon={FaceSmileIcon}
        />
        <StatCard
          name="Journal Entries"
          value={stats?.totalJournalEntries || 0}
          icon={BookOpenIcon}
        />
      </div>

      {/* Activity grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily Active Users */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Active Users</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Daily Active</span>
              <span className="text-lg font-semibold">{stats?.dau || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Monthly Active</span>
              <span className="text-lg font-semibold">{stats?.mau || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Recent Feedback</h3>
          <div className="mt-4 space-y-3">
            {feedback?.length > 0 ? (
              feedback.slice(0, 5).map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-3 border-b border-gray-100 pb-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.subject || item.type}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{item.message}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.type === 'BUG'
                        ? 'bg-red-100 text-red-800'
                        : item.type === 'FEATURE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No feedback yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
