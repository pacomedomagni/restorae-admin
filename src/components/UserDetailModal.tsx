'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function UserDetailModal({ isOpen, onClose, userId }: UserDetailModalProps) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user details when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      setError(null);
      api.get(`/admin/users/${userId}`)
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch((err) => {
          setError('Failed to load user details');
          setLoading(false);
        });
    }
  }, [isOpen, userId]);

  const disableMutation = useMutation({
    mutationFn: () => api.patch(`/admin/users/${userId}/disable`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const enableMutation = useMutation({
    mutationFn: () => api.patch(`/admin/users/${userId}/enable`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => api.get(`/admin/users/${userId}/export`),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-${userId}-data.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.post(`/admin/users/${userId}/delete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
        <div className="flex h-64 items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      </Modal>
    );
  }

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
      <div className="space-y-6">
        {/* User Info */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Profile</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium">{user.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Name:</span>
              <span className="font-medium">{user.name || 'Anonymous'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role:</span>
              <span className="font-medium">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {user.isActive ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Joined:</span>
              <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            {user.lastActiveAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Last Active:</span>
                <span className="font-medium">{new Date(user.lastActiveAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subscription */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Subscription</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tier:</span>
              <span className={`font-medium ${
                user.subscription?.tier === 'PREMIUM' ? 'text-purple-600' :
                user.subscription?.tier === 'LIFETIME' ? 'text-yellow-600' : ''
              }`}>
                {user.subscription?.tier || 'FREE'}
              </span>
            </div>
            {user.subscription?.isTrialing && (
              <div className="flex justify-between">
                <span className="text-gray-500">Trial Ends:</span>
                <span className="font-medium text-orange-600">
                  {new Date(user.subscription.trialEndsAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {user.subscription?.currentPeriodEnd && (
              <div className="flex justify-between">
                <span className="text-gray-500">Period Ends:</span>
                <span className="font-medium">
                  {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Activity Stats */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Activity</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-2xl font-bold text-gray-900">{user._count?.moodEntries || 0}</div>
              <div className="text-xs text-gray-500">Mood Entries</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-2xl font-bold text-gray-900">{user._count?.journalEntries || 0}</div>
              <div className="text-xs text-gray-500">Journal Entries</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-2xl font-bold text-gray-900">{user._count?.customRituals || 0}</div>
              <div className="text-xs text-gray-500">Custom Rituals</div>
            </div>
          </div>
        </div>

        {/* Devices */}
        {user.devices && user.devices.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Devices</h4>
            <div className="space-y-2">
              {user.devices.map((device: any) => (
                <div key={device.id} className="flex justify-between text-sm rounded-md bg-gray-50 p-2">
                  <div>
                    <span className="text-gray-900 font-medium">{device.deviceName || 'Unknown Device'}</span>
                    <span className="text-gray-400 ml-2">({device.platform})</span>
                  </div>
                  <span className="text-gray-400">
                    {device.lastActiveAt ? new Date(device.lastActiveAt).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Actions</h4>
          <div className="flex flex-wrap gap-2">
            {user.isActive ? (
              <button
                onClick={() => disableMutation.mutate()}
                disabled={disableMutation.isPending}
                className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
              >
                {disableMutation.isPending ? 'Disabling...' : 'Disable Account'}
              </button>
            ) : (
              <button
                onClick={() => enableMutation.mutate()}
                disabled={enableMutation.isPending}
                className="rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
              >
                {enableMutation.isPending ? 'Enabling...' : 'Enable Account'}
              </button>
            )}
            <button
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              className="rounded-md bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:opacity-50"
            >
              {exportMutation.isPending ? 'Exporting...' : 'Export Data (GDPR)'}
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
