'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Cog6ToothIcon, FlagIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface SystemConfig {
  trialDuration: number;
  maxMoodEntriesFree: number;
  dataRetentionDays: number;
  maintenanceMode: boolean;
}

interface LegalContent {
  id: string;
  type: string;
  title: string;
  version: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch feature flags
  const { data: featureFlags, isLoading: flagsLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => api.get('/admin/settings/feature-flags'),
  });

  // Fetch system config
  const { data: systemConfig, isLoading: configLoading } = useQuery({
    queryKey: ['system-config'],
    queryFn: () => api.get('/admin/settings/config'),
  });

  // Fetch legal content
  const { data: legalContent, isLoading: legalLoading } = useQuery({
    queryKey: ['legal-content'],
    queryFn: () => api.get('/admin/settings/legal'),
  });

  const [flags, setFlags] = useState<FeatureFlag[]>([]);

  useEffect(() => {
    if (featureFlags) {
      setFlags(featureFlags);
    }
  }, [featureFlags]);

  const { register, handleSubmit, reset } = useForm<SystemConfig>();

  useEffect(() => {
    if (systemConfig) {
      reset(systemConfig);
    }
  }, [systemConfig, reset]);

  // Toggle feature flag mutation
  const toggleFlagMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      api.patch(`/admin/settings/feature-flags/${key}`, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });

  // Save config mutation
  const saveConfigMutation = useMutation({
    mutationFn: (data: SystemConfig) => api.patch('/admin/settings/config', data),
    onSuccess: () => {
      setSaved(true);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save settings');
      setTimeout(() => setError(null), 5000);
    },
  });

  const toggleFlag = (key: string) => {
    const flag = flags.find(f => f.key === key);
    if (flag) {
      const newEnabled = !flag.enabled;
      setFlags(flags.map(f => f.key === key ? { ...f, enabled: newEnabled } : f));
      toggleFlagMutation.mutate({ key, enabled: newEnabled });
    }
  };

  const onSubmit = (data: SystemConfig) => {
    saveConfigMutation.mutate(data);
  };

  // Default flags if API not available yet
  const displayFlags = flags.length > 0 ? flags : [
    { key: 'onboarding_v2', label: 'New Onboarding Flow', description: 'Use the updated onboarding experience', enabled: true },
    { key: 'social_sharing', label: 'Social Sharing', description: 'Allow users to share achievements', enabled: false },
    { key: 'ai_journal', label: 'AI Journal Insights', description: 'AI-powered journal analysis', enabled: false },
    { key: 'voice_notes', label: 'Voice Notes', description: 'Record voice journal entries', enabled: false },
    { key: 'community', label: 'Community Features', description: 'Social community features', enabled: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">App configuration and system settings</p>
      </div>

      {/* Feature Flags */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FlagIcon className="h-5 w-5 mr-2 text-brand-600" />
          Feature Flags
        </h3>
        <p className="mt-1 text-sm text-gray-500">Toggle features on or off for all users</p>
        
        {flagsLoading ? (
          <div className="mt-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {displayFlags.map((flag) => (
              <div key={flag.key} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-gray-900">{flag.label}</div>
                  <div className="text-sm text-gray-500">{flag.description || flag.key}</div>
                </div>
                <button
                  onClick={() => toggleFlag(flag.key)}
                  disabled={toggleFlagMutation.isPending}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    flag.enabled ? 'bg-brand-600' : 'bg-gray-200'
                  } ${toggleFlagMutation.isPending ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                      flag.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Config */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Cog6ToothIcon className="h-5 w-5 mr-2 text-brand-600" />
          System Configuration
        </h3>
        
        {saved && (
          <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
            ✓ Settings saved successfully!
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
            ✗ {error}
          </div>
        )}

        {configLoading ? (
          <div className="mt-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Free Trial Duration (days)
                </label>
                <input
                  type="number"
                  {...register('trialDuration', { min: 0, max: 365, valueAsNumber: true })}
                  defaultValue={7}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Mood Entries (Free Users)
                </label>
                <input
                  type="number"
                  {...register('maxMoodEntriesFree', { min: 0, valueAsNumber: true })}
                  defaultValue={30}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data Retention Period (days)
                </label>
                <input
                  type="number"
                  {...register('dataRetentionDays', { min: 30, valueAsNumber: true })}
                  defaultValue={365}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maintenance Mode
                </label>
                <select
                  {...register('maintenanceMode')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="false">Disabled</option>
                  <option value="true">Enabled</option>
                </select>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={saveConfigMutation.isPending}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
              >
                {saveConfigMutation.isPending ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Legal Content */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-brand-600" />
          Legal Content
        </h3>
        <p className="mt-1 text-sm text-gray-500">Manage privacy policy, terms of service, and other legal documents</p>
        
        {legalLoading ? (
          <div className="mt-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {(legalContent || [
              { id: '1', type: 'privacy', title: 'Privacy Policy', version: '1.0', updatedAt: new Date().toISOString() },
              { id: '2', type: 'terms', title: 'Terms of Service', version: '1.0', updatedAt: new Date().toISOString() },
              { id: '3', type: 'cookie', title: 'Cookie Policy', version: '1.0', updatedAt: new Date().toISOString() },
            ]).map((doc: LegalContent) => (
              <div key={doc.id} className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                <div>
                  <span className="font-medium text-gray-900">{doc.title}</span>
                  <span className="ml-2 text-xs text-gray-400">v{doc.version}</span>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(doc.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Would open a rich text editor modal
                    alert('Legal content editor would open here');
                  }}
                  className="text-sm text-brand-600 hover:text-brand-500"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
