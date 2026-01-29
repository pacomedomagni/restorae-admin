'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
  CreditCardIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  MoonIcon,
  TrophyIcon,
  SparklesIcon,
  LightBulbIcon,
  ServerStackIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Content', href: '/dashboard/content', icon: DocumentTextIcon },
  { name: 'Stories', href: '/dashboard/stories', icon: MoonIcon },
  { name: 'Achievements', href: '/dashboard/achievements', icon: TrophyIcon },
  { name: 'Coach Marks', href: '/dashboard/coach-marks', icon: LightBulbIcon },
  { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
  { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: CreditCardIcon },
  { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
  { name: 'Feedback', href: '/dashboard/feedback', icon: ChatBubbleLeftRightIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Metrics', href: '/dashboard/metrics', icon: ServerStackIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <span className="text-2xl font-bold text-white">Restorae</span>
        <span className="ml-2 rounded bg-brand-600 px-2 py-0.5 text-xs text-white">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon
                className={clsx(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-brand-400' : 'text-gray-400 group-hover:text-gray-300'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-400">View profile</p>
          </div>
        </div>
      </div>
    </div>
  );
}
