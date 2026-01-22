'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';

interface ContentFormData {
  type: string;
  slug: string;
  name: string;
  description: string;
  category?: string;
  duration?: number;
  icon?: string;
  isPremium: boolean;
  tags: string;
  bestFor: string;
  data: string;
}

interface ContentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  content?: any;
}

const contentTypes = [
  'BREATHING',
  'GROUNDING',
  'RESET',
  'FOCUS',
  'SOS',
  'SITUATIONAL',
  'JOURNAL_PROMPT',
  'RITUAL',
  'AMBIENT_SOUND',
];

export default function ContentFormModal({ isOpen, onClose, content }: ContentFormModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContentFormData>({
    defaultValues: content ? {
      ...content,
      tags: content.tags?.join(', ') || '',
      bestFor: content.bestFor?.join(', ') || '',
      data: JSON.stringify(content.data || {}, null, 2),
    } : {
      isPremium: false,
      tags: '',
      bestFor: '',
      data: '{}',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ContentFormData) => {
      const payload = {
        ...data,
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        bestFor: data.bestFor.split(',').map(t => t.trim()).filter(Boolean),
        data: JSON.parse(data.data),
        duration: data.duration ? Number(data.duration) : undefined,
      };

      if (content) {
        return api.patch(`/admin/content/${content.id}`, payload);
      }
      return api.post('/admin/content', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      reset();
      onClose();
    },
  });

  const onSubmit = (data: ContentFormData) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={content ? 'Edit Content' : 'Create Content'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type *</label>
            <select
              {...register('type', { required: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              disabled={!!content}
            >
              <option value="">Select type...</option>
              {contentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Slug *</label>
            <input
              {...register('slug', { required: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              disabled={!!content}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            {...register('name', { required: true })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              {...register('category')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
            <input
              type="number"
              {...register('duration')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Icon</label>
            <input
              {...register('icon')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="🧘"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input
            {...register('tags')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="beginner, popular"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Best For (comma-separated)</label>
          <input
            {...register('bestFor')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Stress, Anxiety, Sleep"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Data (JSON)</label>
          <textarea
            {...register('data', { 
              validate: (value) => {
                try {
                  JSON.parse(value);
                  return true;
                } catch {
                  return 'Invalid JSON';
                }
              }
            })}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
          />
          {errors.data && <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('isPremium')}
            className="h-4 w-4 rounded border-gray-300 text-brand-600"
          />
          <label className="ml-2 text-sm text-gray-700">Premium content</label>
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
            disabled={mutation.isPending}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : content ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
