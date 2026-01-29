'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PlayIcon,
  StarIcon,
  ClockIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { storiesApi } from '@/lib/api';
import ConfirmModal from '@/components/ConfirmModal';
import Modal from '@/components/Modal';

const moodOptions = [
  { id: 'CALM', name: 'Calm', emoji: '😌' },
  { id: 'DREAMY', name: 'Dreamy', emoji: '💭' },
  { id: 'COZY', name: 'Cozy', emoji: '🛋️' },
  { id: 'MAGICAL', name: 'Magical', emoji: '✨' },
];

const categoryOptions = [
  { id: 'NATURE', name: 'Nature', icon: '🌿' },
  { id: 'TRAVEL', name: 'Travel', icon: '✈️' },
  { id: 'FANTASY', name: 'Fantasy', icon: '🧙' },
  { id: 'MEDITATION', name: 'Meditation', icon: '🧘' },
  { id: 'SOUNDSCAPES', name: 'Soundscapes', icon: '🎧' },
  { id: 'CLASSICS', name: 'Classics', icon: '📚' },
];

const statusColors: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
}

export default function StoriesPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStory, setEditingStory] = useState<any>(null);
  const [deletingStory, setDeletingStory] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const { data: stories, isLoading } = useQuery({
    queryKey: ['admin-stories'],
    queryFn: storiesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => storiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories'] });
      setDeletingStory(null);
    },
  });

  const filteredStories = stories?.filter((story: any) => {
    if (filterCategory === 'all') return true;
    return story.category === filterCategory;
  }) || [];

  const freeCount = stories?.filter((s: any) => !s.isPremium).length || 0;
  const premiumCount = stories?.filter((s: any) => s.isPremium).length || 0;
  const totalDuration = stories?.reduce((acc: number, s: any) => acc + (s.duration || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bedtime Stories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage sleep stories with calming narratives
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Story
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <MoonIcon className="h-8 w-8 text-indigo-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Stories</p>
              <p className="text-2xl font-bold text-gray-900">{stories?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <StarIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Free</p>
              <p className="text-2xl font-bold text-gray-900">{freeCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <StarIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Premium</p>
              <p className="text-2xl font-bold text-gray-900">{premiumCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Duration</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(totalDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory('all')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            filterCategory === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categoryOptions.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filterCategory === cat.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story: any) => (
            <div
              key={story.id}
              className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow"
            >
              {/* Artwork */}
              <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-purple-600">
                {story.artworkUrl && (
                  <img
                    src={story.artworkUrl}
                    alt={story.title}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-semibold text-white">{story.title}</h3>
                  {story.subtitle && (
                    <p className="text-sm text-white/80">{story.subtitle}</p>
                  )}
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  {story.isPremium && (
                    <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-medium text-white">
                      Premium
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[story.status]}`}>
                    {story.status}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>🎙️ {story.narrator || 'Unknown'}</span>
                  <span>⏱️ {formatDuration(story.duration || 0)}</span>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {story.category && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {categoryOptions.find(c => c.id === story.category)?.icon} {categoryOptions.find(c => c.id === story.category)?.name || story.category}
                    </span>
                  )}
                  {story.mood && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
                      {moodOptions.find(m => m.id === story.mood)?.emoji} {moodOptions.find(m => m.id === story.mood)?.name || story.mood}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-gray-400">
                    {story.listenCount || 0} plays
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingStory(story)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingStory(story)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingStory) && (
        <StoryFormModal
          story={editingStory}
          onClose={() => {
            setShowCreateModal(false);
            setEditingStory(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingStory}
        onClose={() => setDeletingStory(null)}
        onConfirm={() => deleteMutation.mutate(deletingStory?.id)}
        title="Delete Story"
        message={`Are you sure you want to delete "${deletingStory?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// Story Form Modal Component
function StoryFormModal({ 
  story, 
  onClose 
}: { 
  story?: any; 
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    slug: story?.slug || '',
    title: story?.title || '',
    subtitle: story?.subtitle || '',
    description: story?.description || '',
    narrator: story?.narrator || '',
    duration: story?.duration || 1800,
    audioUrl: story?.audioUrl || '',
    artworkUrl: story?.artworkUrl || '',
    category: story?.category || 'NATURE',
    mood: story?.mood || 'CALM',
    isPremium: story?.isPremium || false,
    status: story?.status || 'DRAFT',
    order: story?.order || 0,
    tags: story?.tags || [],
  });

  const [tagInput, setTagInput] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => storiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => storiesApi.update(story.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (story) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t: string) => t !== tag) });
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen onClose={onClose} title={story ? 'Edit Story' : 'Add New Story'}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="moonlit-meadow"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="The Moonlit Meadow"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Subtitle</label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="A peaceful journey through nature"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="A soothing bedtime story..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Narrator</label>
            <input
              type="text"
              value={formData.narrator}
              onChange={(e) => setFormData({ ...formData, narrator: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Sarah Johnson"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Audio URL</label>
          <input
            type="url"
            value={formData.audioUrl}
            onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="https://cdn.restorae.com/stories/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Artwork URL</label>
          <input
            type="url"
            value={formData.artworkUrl}
            onChange={(e) => setFormData({ ...formData, artworkUrl: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="https://cdn.restorae.com/artwork/..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mood</label>
            <select
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {moodOptions.map((mood) => (
                <option key={mood.id} value={mood.id}>
                  {mood.emoji} {mood.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              min={0}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Add a tag..."
            />
            <button
              type="button"
              onClick={addTag}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {formData.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-indigo-400 hover:text-indigo-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPremium}
              onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Premium Content</span>
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
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : story ? 'Save Changes' : 'Create Story'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
