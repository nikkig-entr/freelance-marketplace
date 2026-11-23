import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { Project, Category } from '../../types';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface EditProjectForm {
  title: string;
  description: string;
  requirements: string;
  category_id: number;
  skills: string;
  budget_min: string;
  budget_max: string;
  is_fixed_price: boolean;
  deadline_days: string;
  status: 'draft' | 'open';
}

export function EditProjectPage() {
  const params = useParams({ from: '/projects/$projectId/edit' });
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditProjectForm>();

  const projectId = parseInt(params.projectId);

  useEffect(() => {
    fetchProject();
    fetchCategories();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const data = await api.getProject(projectId);
      setProject(data);
      setValue('title', data.title);
      setValue('description', data.description);
      setValue('requirements', data.requirements || '');
      setValue('category_id', data.category_id || 0);
      setValue('skills', data.skills.join(', '));
      setValue('budget_min', String(data.budget_min / 100));
      setValue('budget_max', data.budget_max ? String(data.budget_max / 100) : '');
      setValue('is_fixed_price', data.is_fixed_price);
      setValue('deadline_days', data.deadline_days ? String(data.deadline_days) : '');
      setValue('status', data.status);
    } catch (error) {
      toast.error('Failed to load project');
      navigate(`/projects/${projectId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.items || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const onSubmit = async (data: EditProjectForm) => {
    setIsLoading(true);
    try {
      const projectData = {
        title: data.title,
        description: data.description,
        requirements: data.requirements || undefined,
        category_id: data.category_id || undefined,
        skills: data.skills.split(',').map((s) => s.trim()).filter(Boolean),
        budget_min: parseInt(data.budget_min) * 100,
        budget_max: data.budget_max ? parseInt(data.budget_max) * 100 : undefined,
        is_fixed_price: data.is_fixed_price,
        deadline_days: data.deadline_days ? parseInt(data.deadline_days) : undefined,
        status: data.status,
      };
      await api.updateProject(projectId, projectData);
      toast.success('Project updated successfully!');
      navigate(`/projects/${projectId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="space-y-6">
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const canPublish = project.status === 'draft';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/projects/${projectId}`} className="text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
            <p className="mt-1 text-gray-600">Update your project details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>

            <div>
              <label htmlFor="title" className="label">Project Title *</label>
              <input
                id="title"
                type="text"
                className={`input ${errors.title ? 'input-error' : ''}`}
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 10, message: 'Title must be at least 10 characters' },
                  maxLength: { value: 255, message: 'Title must be less than 255 characters' },
                })}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="category_id" className="label">Category</label>
              <select
                id="category_id"
                className="input"
                {...register('category_id', { valueAsNumber: true })}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="label">Description *</label>
              <textarea
                id="description"
                rows={6}
                className={`input resize-none ${errors.description ? 'input-error' : ''}`}
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 50, message: 'Description must be at least 50 characters' },
                })}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div>
              <label htmlFor="requirements" className="label">Requirements (Optional)</label>
              <textarea
                id="requirements"
                rows={4}
                className="input resize-none"
                {...register('requirements')}
              />
            </div>

            <div>
              <label className="label">Skills Required</label>
              <input
                id="skills"
                type="text"
                className="input"
                placeholder="React, TypeScript, Node.js (comma separated)"
                {...register('skills')}
              />
              <p className="mt-1 text-sm text-gray-500">Separate skills with commas</p>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Budget & Timeline</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="budget_min" className="label">Minimum Budget (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="budget_min"
                    type="number"
                    min="10"
                    step="10"
                    className={`input pl-8 ${errors.budget_min ? 'input-error' : ''}`}
                    {...register('budget_min', {
                      required: 'Minimum budget is required',
                      min: { value: 10, message: 'Minimum budget must be at least $10' },
                    })}
                  />
                </div>
                {errors.budget_min && <p className="mt-1 text-sm text-red-600">{errors.budget_min.message}</p>}
              </div>

              <div>
                <label htmlFor="budget_max" className="label">Maximum Budget (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="budget_max"
                    type="number"
                    min="10"
                    step="10"
                    className="input pl-8"
                    {...register('budget_max')}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  {...register('is_fixed_price')}
                />
                <span className="text-sm text-gray-700">Fixed price project (not hourly)</span>
              </label>
            </div>

            <div>
              <label htmlFor="deadline_days" className="label">Deadline (days)</label>
              <input
                id="deadline_days"
                type="number"
                min="1"
                max="365"
                className="input"
                {...register('deadline_days', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Status */}
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            <div>
              <label htmlFor="status" className="label">Project Status</label>
              <select
                id="status"
                className="input"
                {...register('status')}
              >
                <option value="draft">Draft</option>
                <option value="open">Open for Bids</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Only draft projects can be edited. Once published, you cannot change the status back to draft.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link to={`/projects/${projectId}`} className="btn-secondary">
              Cancel
            </Link>
            {canPublish && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.publishProject(projectId);
                    toast.success('Project published!');
                    navigate(`/projects/${projectId}`);
                  } catch (error: any) {
                    toast.error(error.response?.data?.error?.message || 'Failed to publish');
                  }
                }}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Publish Project
              </button>
            )}
            <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Need to import Link
import { Link } from '@tanstack/react-router';