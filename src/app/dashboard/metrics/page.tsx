'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  ChartBarIcon, 
  ServerIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  CpuChipIcon,
  BoltIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface MetricsSummary {
  uptime: {
    seconds: number;
    formatted: string;
  };
  requests: {
    total: number;
    errors5xx: number;
    errors4xx: number;
    errorRate: number;
  };
  latency: {
    count: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null;
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  alerts: {
    healthy: boolean;
    criticalAlerts: number;
    warningAlerts: number;
    totalAlerts: number;
    active: Array<{
      name: string;
      severity: string;
      metric: string;
      currentValue: number;
      threshold: number;
      triggeredAt: string;
    }>;
  };
  appEvents: {
    moodEvents: number;
    breathingEvents: number;
    journalEvents: number;
    storyEvents: number;
    errors: number;
    totalReceived: number;
  };
}

interface AlertThreshold {
  name: string;
  metric: string;
  condition: string;
  value: number;
  severity: string;
  cooldownMinutes?: number;
}

export default function MetricsPage() {
  const { data: metrics, isLoading, refetch, isRefetching } = useQuery<MetricsSummary>({
    queryKey: ['metrics-summary'],
    queryFn: () => api.get('/admin/metrics/summary'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: thresholds } = useQuery<{ thresholds: AlertThreshold[] }>({
    queryKey: ['alert-thresholds'],
    queryFn: () => api.get('/admin/metrics/alerts/thresholds'),
  });

  const { data: alertHistory } = useQuery<{ history: any[] }>({
    queryKey: ['alert-history'],
    queryFn: () => api.get('/admin/metrics/alerts/history'),
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-500">Loading metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Metrics</h1>
          <p className="mt-1 text-sm text-gray-500">Real-time system health and performance monitoring</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <ArrowPathIcon className={clsx('h-4 w-4', isRefetching && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* System Health Status */}
      <div className={clsx(
        'rounded-lg p-4',
        metrics?.alerts.healthy ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      )}>
        <div className="flex items-center gap-3">
          {metrics?.alerts.healthy ? (
            <>
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-green-800">All Systems Operational</span>
            </>
          ) : (
            <>
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                {metrics?.alerts.criticalAlerts} Critical, {metrics?.alerts.warningAlerts} Warning Alert(s)
              </span>
            </>
          )}
          <span className="ml-auto text-sm text-gray-500">
            Uptime: {metrics?.uptime.formatted}
          </span>
        </div>
      </div>

      {/* Active Alerts */}
      {metrics?.alerts.active && metrics.alerts.active.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            Active Alerts
          </h3>
          <div className="mt-4 space-y-3">
            {metrics.alerts.active.map((alert, i) => (
              <div
                key={i}
                className={clsx(
                  'rounded-lg p-4 border-l-4',
                  alert.severity === 'critical' 
                    ? 'bg-red-50 border-red-500' 
                    : 'bg-yellow-50 border-yellow-500'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{alert.name}</p>
                    <p className="text-sm text-gray-600">
                      {alert.metric}: {alert.currentValue} (threshold: {alert.threshold})
                    </p>
                  </div>
                  <span className={clsx(
                    'rounded px-2 py-1 text-xs font-medium uppercase',
                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  )}>
                    {alert.severity}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Requests */}
        <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500">Total Requests</dt>
              <dd className="text-2xl font-semibold text-gray-900">
                {metrics?.requests.total.toLocaleString() || 0}
              </dd>
            </div>
          </div>
        </div>

        {/* Error Rate */}
        <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className={clsx(
              'flex-shrink-0 rounded-md p-3',
              (metrics?.requests.errorRate || 0) > 5 ? 'bg-red-500' : 'bg-green-500'
            )}>
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500">Error Rate</dt>
              <dd className={clsx(
                'text-2xl font-semibold',
                (metrics?.requests.errorRate || 0) > 5 ? 'text-red-600' : 'text-green-600'
              )}>
                {metrics?.requests.errorRate || 0}%
              </dd>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            5xx: {metrics?.requests.errors5xx || 0} | 4xx: {metrics?.requests.errors4xx || 0}
          </p>
        </div>

        {/* Latency P95 */}
        <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className={clsx(
              'flex-shrink-0 rounded-md p-3',
              (metrics?.latency?.p95 || 0) > 1000 ? 'bg-yellow-500' : 'bg-green-500'
            )}>
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500">Latency (P95)</dt>
              <dd className="text-2xl font-semibold text-gray-900">
                {metrics?.latency?.p95 || 0}ms
              </dd>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Avg: {metrics?.latency?.avg || 0}ms | P99: {metrics?.latency?.p99 || 0}ms
          </p>
        </div>

        {/* Memory Usage */}
        <div className="rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className={clsx(
              'flex-shrink-0 rounded-md p-3',
              (metrics?.memory.heapUsedMB || 0) > 500 ? 'bg-yellow-500' : 'bg-blue-500'
            )}>
              <CpuChipIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500">Memory (Heap)</dt>
              <dd className="text-2xl font-semibold text-gray-900">
                {metrics?.memory.heapUsedMB || 0} MB
              </dd>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Total: {metrics?.memory.heapTotalMB || 0} MB | RSS: {metrics?.memory.rssMB || 0} MB
          </p>
        </div>
      </div>

      {/* App Events */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <BoltIcon className="h-5 w-5 text-brand-500" />
          Mobile App Events
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Events received from the mobile app ({metrics?.appEvents.totalReceived.toLocaleString()} total)
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <div className="text-2xl font-semibold text-brand-600">
              {metrics?.appEvents.moodEvents.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-500">Mood Events</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <div className="text-2xl font-semibold text-blue-600">
              {metrics?.appEvents.breathingEvents.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-500">Breathing Events</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <div className="text-2xl font-semibold text-purple-600">
              {metrics?.appEvents.journalEvents.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-500">Journal Events</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <div className="text-2xl font-semibold text-indigo-600">
              {metrics?.appEvents.storyEvents.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-500">Story Events</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <div className={clsx(
              'text-2xl font-semibold',
              (metrics?.appEvents.errors || 0) > 10 ? 'text-red-600' : 'text-gray-600'
            )}>
              {metrics?.appEvents.errors.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-500">App Errors</div>
          </div>
        </div>
      </div>

      {/* Alert Thresholds Configuration */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <ServerIcon className="h-5 w-5 text-gray-500" />
          Alert Thresholds
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Configured thresholds that trigger alerts
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Threshold</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {thresholds?.thresholds.map((t, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{t.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{t.metric}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{t.condition}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{t.value}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'rounded px-2 py-1 text-xs font-medium uppercase',
                      t.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      t.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    )}>
                      {t.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert History */}
      {alertHistory?.history && alertHistory.history.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Alert History</h3>
          <p className="text-sm text-gray-500 mt-1">Recent alerts (last 50)</p>
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {alertHistory.history.map((alert, i) => (
              <div
                key={i}
                className={clsx(
                  'rounded p-3 text-sm flex items-center justify-between',
                  alert.resolved ? 'bg-gray-50' : 'bg-red-50'
                )}
              >
                <div>
                  <span className="font-medium">{alert.threshold.name}</span>
                  <span className="text-gray-500 ml-2">
                    {alert.threshold.metric}: {alert.currentValue}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={clsx(
                    'rounded px-2 py-0.5 text-xs',
                    alert.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  )}>
                    {alert.resolved ? 'Resolved' : 'Active'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(alert.triggeredAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
