'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import ContentFormModal from '@/components/ContentFormModal';
import ConfirmModal from '@/components/ConfirmModal';

const contentTypes = [
  { id: 'all', name: 'All' },
  { id: 'BREATHING', name: 'Breathing' },
  { id: 'GROUNDING', name: 'Grounding' },
  { id: 'RESET', name: 'Reset' },
  { id: 'FOCUS', name: 'Focus' },
  { id: 'SOS', name: 'SOS' },
  { id: 'SITUATIONAL', name: 'Situational' },
  { id: 'JOURNAL_PROMPT', name: 'Journal Prompts' },
  { id: 'RITUAL', name: 'Rituals' },
  { id: 'AMBIENT_SOUND', name: 'Ambient Sounds' },
];

export default function ContentPage() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [deletingContent, setDeletingContent] = useState<any>(null);

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', selectedType],
    queryFn: () =>
     

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/content/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setDeletingContent(null);
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      publish ? api.post(`/admin/content/${id}/publish`) : api.post(`/admin/content/${id}/unpublish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  }); api.get(
        `/admin/content${selectedType !== 'all' ? `?type=${selectedType}` : ''}`
      ),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage exercises, prompts, and other content
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Content
        </button>
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        {contentTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              selectedType === type.id
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* Content Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Premium
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : content?.length > 0 ? (
              content.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      {item.icon && (
                        <span className="mr-2 text-lg">{item.icon}</span>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {item.type}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {item.category || '-'}
                  </td>
                      onClick={() =>
                        publishMutation.mutate({
                          id: item.id,
                          publish: item.status !== 'PUBLISHED',
                        })
                      }
                      className="text-green-600 hover:text-green-900 mr-3"
                      title={item.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    >
                      {item.status === 'PUBLISHED' ? '👁️' : '📝'}
                    </button>
                    <button
                      onClick={() => setEditingContent(item)}
                      className="text-brand-600 hover:text-brand-900 mr-3"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingContent(item)}
                      className="text-red-600 hover:text-red-900"
                     font-semibold leading-5 ${
                        item.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {item.isPremium ? '✓' : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button className="text-brand-600 hover:text-brand-900 mr-3">

      <ContentFormModal
        isOpen={showCreateModal || !!editingContent}
        onClose={() => {
          setShowCreateModal(false);
          setEditingContent(null);
        }}
        content={editingContent}
      />

      <ConfirmModal
        isOpen={!!deletingContent}
        onClose={() => setDeletingContent(null)}
        title="Delete Content"
        message={`Are you sure you want to delete "${deletingContent?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
        onConfirm={() => deleteMutation.mutate(deletingContent.id)}
      />
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No content found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
