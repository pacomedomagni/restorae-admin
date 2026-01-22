'use client';

import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Search */}
      <div className="flex flex-1 items-center">
        <div className="w-full max-w-lg">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full rounded-md border-0 bg-gray-50 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm"
              placeholder="Search..."
              type="search"
            />
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" />
          <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
