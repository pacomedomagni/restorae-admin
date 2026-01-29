'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  TrophyIcon,
  StarIcon,
  FireIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { achievementsApi } from '@/lib/api';
import ConfirmModal from '@/components/ConfirmModal';
import Modal from '@/components/Modal';

const categories = [
  { id: 'all', name: 'All', icon: '🏆' },
  { id: 'consistency', name: 'Consistency', icon: '🔥' },
  { id: 'session', name: 'Session', icon: '🎯' },
  { id: 'mindfulness', name: 'Mindfulness', icon: '🧘' },
  { id: 'exploration', name: 'Exploration', icon: '🧭' },
  { id: 'mastery', name: 'Mastery', icon: '👑' },
  { id: 'special', name: 'Special', icon: '⭐' },
];

const tiers = [
  { id: 'bronze', name: 'Bronze', color: 'bg-amber-600' },
  { id: 'silver', name: 'Silver', color: 'bg-gray-400' },
  { id: 'gold', name: 'Gold', color: 'bg-yellow-400' },
  { id: 'platinum', name: 'Platinum', color: 'bg-cyan-300' },
];

const tierColors: Record<string, string> = {
  bronze: 'bg-amber-100 text-amber-800 border-amber-300',
  silver: 'bg-gray-100 text-gray-800 border-gray-300',
  gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  platinum: 'bg-cyan-100 text-cyan-800 border-cyan-300',
};

export default function AchievementsPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);
  const [deletingAchievement, setDeletingAchievement] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['admin-achievements'],
    queryFn: achievementsApi.getAll,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => achievementsApi.getLeaderboard(5),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => achievementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-achievements'] });
      setDeletingAchievement(null);
    },
  });

  const filteredAchievements = achievements?.filter((a: any) => {
    if (filterCategory === 'all') return true;
    return a.category === filterCategory;
  }) || [];

  // Stats
  const totalUnlocks = achievements?.reduce((acc: number, a: any) => acc + (a._count?.unlockedBy || 0), 0) || 0;
  const activeCount = achievements?.filter((a: any) => a.isActive).length || 0;
  const secretCount = achievements?.filter((a: any) => a.isSecret).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage badges, rewards, and gamification
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Achievement
        </button>
      </div>

      {/* Stats & Leaderboard */}
      <div className="grid grid-cols-5 gap-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{achievements?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <StarIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <LockClosedIcon className="h-8 w-8 text-gray-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Secret</p>
              <p className="text-2xl font-bold text-gray-900">{secretCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <FireIcon className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Unlocks</p>
              <p className="text-2xl font-bold text-gray-900">{totalUnlocks}</p>
            </div>
          </div>
        </div>

        {/* Mini Leaderboard */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Top Players</h3>
          <div className="space-y-1">
            {leaderboard?.slice(0, 3).map((user: any, i: number) => (
              <div key={user.id} className="flex items-center text-sm">
                <span className="w-4 font-bold text-gray-400">{i + 1}</span>
                <span className="ml-2 truncate text-gray-900">{user.user?.name || 'User'}</span>
                <span className="ml-auto text-purple-600">Lv.{user.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filterCategory === cat.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAchievements.map((achievement: any) => (
            <div
              key={achievement.id}
              className={`rounded-lg bg-white p-4 shadow hover:shadow-md transition-shadow border-l-4 ${
                tierColors[achievement.tier] || 'border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{achievement.icon || '🏆'}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{achievement.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {achievement.isSecret && (
                    <LockClosedIcon className="h-4 w-4 text-gray-400" title="Secret" />
                  )}
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${
                    tierColors[achievement.tier]
                  }`}>
                    {achievement.tier}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {achievement.description}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>+{achievement.xpReward} XP</span>
                  <span>{achievement._count?.unlockedBy || 0} unlocks</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingAchievement(achievement)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingAchievement(achievement)}
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

      {/* Create/Edit Modal */}
      {(showCreateModal || editingAchievement) && (
        <AchievementFormModal
          achievement={editingAchievement}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAchievement(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingAchievement}
        onClose={() => setDeletingAchievement(null)}
        onConfirm={() => deleteMutation.mutate(deletingAchievement?.id)}
        title="Delete Achievement"
        message={`Are you sure you want to delete "${deletingAchievement?.name}"? This will also remove it from all users who have unlocked it.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// Achievement Form Modal
function AchievementFormModal({
  achievement,
  onClose,
}: {
  achievement?: any;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    slug: achievement?.slug || '',
    name: achievement?.name || '',
    description: achievement?.description || '',
    icon: achievement?.icon || '🏆',
    category: achievement?.category || 'session',
    tier: achievement?.tier || 'bronze',
    xpReward: achievement?.xpReward || 25,
    order: achievement?.order || 0,
    isActive: achievement?.isActive ?? true,
    isSecret: achievement?.isSecret || false,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => achievementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-achievements'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => achievementsApi.update(achievement.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-achievements'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (achievement) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Common emoji options for achievements
  const emojiOptions = ['🏆', '⭐', '🌟', '💎', '👑', '🔥', '💪', '🎯', '🧘', '🌊', '🌱', '📝', '⏱️', '🦁', '🐦', '🦉', '🎖️', '💯', '🚀', '🧭', '📚', '🛡️', '⚔️'];

  return (
    <Modal isOpen onClose={onClose} title={achievement ? 'Edit Achievement' : 'Add New Achievement'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="first-breath"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="First Breath"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="Complete your first breathing session"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
          <div className="flex flex-wrap gap-2">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData({ ...formData, icon: emoji })}
                className={`w-10 h-10 text-xl rounded-md ${
                  formData.icon === emoji
                    ? 'bg-purple-100 ring-2 ring-purple-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {categories.filter(c => c.id !== 'all').map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tier</label>
            <select
              value={formData.tier}
              onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {tiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">XP Reward</label>
            <input
              type="number"
              value={formData.xpReward}
              onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              min={0}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isSecret}
              onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Secret (hidden until unlocked)</span>
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
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : achievement ? 'Save Changes' : 'Create Achievement'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
