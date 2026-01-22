'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FeatureFlag {
  key: string;
  label: string;
  enabled: boolean;
}

interface SystemConfig {
  trialDuration: number;
  maxMoodEntriesFree: number;
  dataRetentionDays: number;
}

export default function SettingsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    { key: 'onboarding_v2', label: 'New Onboarding Flow', enabled: true },
    { key: 'social_sharing', label: 'Social Sharing', enabled: false },
    { key: 'ai_journal', label: 'AI Journal Insights', enabled: false },
    { key: 'voice_notes', label: 'Voice Notes', enabled: false },
    { key: 'community', label: 'Community Features', enabled: false },
  ]);

  const [saved, setSaved] = useState(false);

  const { register, handleSubmit } = useForm<SystemConfig>({
    defaultValues: {
      trialDuration: 7,
      maxMoodEntriesFree: 30,
      dataRetentionDays: 365,
    },
  });

  const toggleFlag = (key: string) => {
    setFlags(flags.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  const onSubmit = (data: SystemConfig) => {
    // Would save to backend
    console.log('Saving config:', data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">App configuration and system settings</p>
      </div>

      {/* Feature Flags */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900">Feature Flags</h3>
        <div className="mt-4 space-y-4">
          {flags.map((flag) => (
            <div key={flag.key} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{flag.label}</div>
                <div className="text-sm text-gray-500">{flag.key}</div>
              </div>
              <button
                onClick={() => toggleFlag(flag.key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  flag.enabled ? 'bg-brand-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    flag.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System Config */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900">System Configuration</h3>
        
        {saved && (
          <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
            ✓ Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Free Trial Duration (days)
            </label>
            <input
              type="number"
              {...register('trialDuration', { min: 0, max: 365 })}
              className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Mood Entries (Free Users)
            </label>
            <input
              type="number"
              {...register('maxMoodEntriesFree', { min: 0 })}
              className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data Retention Period (days)
            </label>
            <input
              type="number"
              {...register('dataRetentionDays', { min: 30 })}
              className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* Legal Content */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900">Legal Content</h3>
        <div className="mt-4 space-y-3">
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((doc) => (
            <div key={doc} className="flex items-center justify-between rounded-md border border-gray-200 p-3">
              <span className="text-sm font-medium text-gray-900">{doc}</span>
              <button className="text-sm text-brand-600 hover:text-brand-500">Edit</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
