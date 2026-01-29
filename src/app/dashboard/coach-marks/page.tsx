'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  LightBulbIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { coachMarksApi } from '@/lib/api';
import ConfirmModal from '@/components/ConfirmModal';
import Modal from '@/components/Modal';

const screens = [
  { id: 'all', name: 'All Screens' },
  { id: 'HomeScreen', name: 'Home' },
  { id: 'ToolsScreen', name: 'Tools' },
  { id: 'JournalScreen', name: 'Journal' },
  { id: 'BreathingScreen', name: 'Breathing' },
  { id: 'FocusSessionScreen', name: 'Focus Session' },
  { id: 'StoryPlayerScreen', name: 'Story Player' },
  { id: 'ProfileScreen', name: 'Profile' },
];

const positions = [
  { id: 'top', name: 'Top' },
  { id: 'bottom', name: 'Bottom' },
  { id: 'left', name: 'Left' },
  { id: 'right', name: 'Right' },
  { id: 'center', name: 'Center' },
];

const statusColors: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

export default function CoachMarksPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoachMark, setEditingCoachMark] = useState<any>(null);
  const [deletingCoachMark, setDeletingCoachMark] = useState<any>(null);
  const [filterScreen, setFilterScreen] = useState('all');

  const { data: coachMarks, isLoading } = useQuery({
    queryKey: ['admin-coach-marks'],
    queryFn: coachMarksApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coachMarksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coach-marks'] });
      setDeletingCoachMark(null);
    },
  });

  const filteredCoachMarks = coachMarks?.filter((cm: any) => {
    if (filterScreen === 'all') return true;
    return cm.screen === filterScreen;
  }) || [];

  // Stats
  const activeCount = coachMarks?.filter((cm: any) => cm.isActive).length || 0;
  const publishedCount = coachMarks?.filter((cm: any) => cm.status === 'PUBLISHED').length || 0;

  // Group by screen
  const screenCounts = screens.slice(1).reduce((acc, screen) => {
    acc[screen.id] = coachMarks?.filter((cm: any) => cm.screen === screen.id).length || 0;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coach Marks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage onboarding tips and UI guidance
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Coach Mark
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <LightBulbIcon className="h-8 w-8 text-teal-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{coachMarks?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <DevicePhoneMobileIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <ArrowPathIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Published</p>
              <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
            </div>
          </div>
        </div>

        {/* Screen Breakdown */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">By Screen</h3>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {screens.slice(1, 5).map((screen) => (
              <div key={screen.id} className="flex items-center justify-between">
                <span className="text-gray-600 truncate">{screen.name}</span>
                <span className="font-medium ml-1">{screenCounts[screen.id]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Screen Filter */}
      <div className="flex flex-wrap gap-2">
        {screens.map((screen) => (
          <button
            key={screen.id}
            onClick={() => setFilterScreen(screen.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filterScreen === screen.id
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {screen.name}
          </button>
        ))}
      </div>

      {/* Coach Marks Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCoachMarks.map((coachMark: any) => (
            <div
              key={coachMark.id}
              className="rounded-lg bg-white p-4 shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <LightBulbIcon className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{coachMark.title}</h3>
                    <p className="text-xs text-gray-500">{coachMark.key}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${statusColors[coachMark.status]}`}>
                    {coachMark.status}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                {coachMark.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                  📱 {coachMark.screen}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                  📍 {coachMark.position}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                  #️⃣ Order: {coachMark.order}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${coachMark.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs text-gray-400">
                    {coachMark.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingCoachMark(coachMark)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingCoachMark(coachMark)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCoachMarks.length === 0 && (
        <div className="text-center py-12">
          <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No coach marks</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterScreen === 'all' 
              ? 'Get started by creating a new coach mark.' 
              : `No coach marks found for ${screens.find(s => s.id === filterScreen)?.name}.`
            }
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Coach Mark
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCoachMark) && (
        <CoachMarkFormModal
          coachMark={editingCoachMark}
          onClose={() => {
            setShowCreateModal(false);
            setEditingCoachMark(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingCoachMark}
        onClose={() => setDeletingCoachMark(null)}
        onConfirm={() => deleteMutation.mutate(deletingCoachMark?.id)}
        title="Delete Coach Mark"
        message={`Are you sure you want to delete "${deletingCoachMark?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// Coach Mark Form Modal
function CoachMarkFormModal({
  coachMark,
  onClose,
}: {
  coachMark?: any;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    key: coachMark?.key || '',
    screen: coachMark?.screen || 'HomeScreen',
    title: coachMark?.title || '',
    description: coachMark?.description || '',
    position: coachMark?.position || 'bottom',
    order: coachMark?.order || 1,
    isActive: coachMark?.isActive ?? true,
    status: coachMark?.status || 'DRAFT',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => coachMarksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coach-marks'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => coachMarksApi.update(coachMark.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coach-marks'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coachMark) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen onClose={onClose} title={coachMark ? 'Edit Coach Mark' : 'Add New Coach Mark'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Key</label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="home-welcome"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Screen</label>
            <select
              value={formData.screen}
              onChange={(e) => setFormData({ ...formData, screen: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {screens.slice(1).map((screen) => (
                <option key={screen.id} value={screen.id}>
                  {screen.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Welcome to Restorae"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="This is where you'll find your personalized recommendations..."
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              min={1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : coachMark ? 'Save Changes' : 'Create Coach Mark'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
