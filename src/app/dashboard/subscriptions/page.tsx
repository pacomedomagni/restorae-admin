'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import SubscriptionModal from '@/components/SubscriptionModal';

export default function SubscriptionsPage() {
  const [managingSub, setManagingSub] = useState<{ userId: string; tier: string } | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: () => api.get('/admin/subscriptions/stats'),
  });

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => api.get('/admin/subscriptions'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="mt-1 text-sm text-gray-500">Manage user subscriptions</p>
      </div>

      {/* Stats */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Total</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
          </div>
          <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Free</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.free}</dd>
          </div>
          <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Premium</dt>
            <dd className="mt-1 text-3xl font-semibold text-purple-600">{stats.premium}</dd>
          </div>
          <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Lifetime</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.lifetime}</dd>
          </div>
          <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Conversion</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.conversionRate}%</dd>
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Period End
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : subscriptions?.length > 0 ? (
              subscriptions.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {sub.user?.name || 'Anonymous'}
                    </div>
                    <div className="text-sm text-gray-500">{sub.user?.email || '-'}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        sub.tier === 'PREMIUM'
                          ? 'bg-purple-100 text-purple-800'
                          : sub.tier === 'LIFETIME'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {sub.tier}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {sub.isTrialing && (
                      <span className="text-orange-600">Trialing</span>
                    )}
                    {sub.cancelledAt && (
                      <span className="text-red-600">Cancelled</span>
                    )}
                    {!sub.isTrialing && !sub.cancelledAt && sub.tier !== 'FREE' && (
                      <span className="text-green-600">Active</span>
                    )}
                    {sub.tier === 'FREE' && !sub.isTrialing && (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {sub.currentPeriodEnd
                      ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                      : sub.trialEndsAt
                      ? new Date(sub.trialEndsAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => setManagingSub({ userId: sub.userId, tier: sub.tier })}
                      className="text-brand-600 hover:text-brand-900"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No subscriptions found
                </td>
              </tr>
            )}

      {managingSub && (
        <SubscriptionModal
          isOpen={!!managingSub}
          onClose={() => setManagingSub(null)}
          userId={managingSub.userId}
          currentTier={managingSub.tier}
        />
      )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
