import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { projectService } from '@/services/api';
import { Project, ProjectStatus } from '@/types';
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
  status: ProjectStatus;
}

interface Category {
  id: number;
  name: string;
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

  const fetchProject = useCallback(async () => {
    try {
      const data = await projectService.get<Project>(String(projectId));
      const projectData = data;
      setProject(projectData);
      setValue('title', projectData.title);
      setValue('description', projectData.description);
      setValue('requirements', projectData.requirements || '');
      setValue('category_id', projectData.category_id || 0);
      setValue('skills', (projectData.required_skills || []).join(', '));
      setValue('budget_min', String((projectData.budget_min || 0) / 100));
      setValue('budget_max', projectData.budget_max ? String(projectData.budget_max / 100) : '');
      setValue('is_fixed_price', projectData.is_fixed_price);
      setValue('deadline_days', projectData.deadline_days ? String(projectData.deadline_days) : '');
      setValue('status', projectData.status);
    } catch {
      toast.error('Failed to load project');
      navigate({ to: '/projects/$projectId', params: { projectId: String(projectId) }, search: { tab: 'details' } });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, navigate, setValue]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await projectService.getCategories<{ items: Category[] }>();
      setCategories(data.items || []);
    } catch {
      console.error('Failed to fetch categories');
    }
  }, []);

  useEffect(() => {
    fetchProject();
    fetchCategories();
  }, [fetchProject, fetchCategories]);

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
      await projectService.update(String(projectId), projectData);
      toast.success('Project updated successfully!');
      navigate({ to: '/projects/$projectId', params: { projectId: String(projectId) }, search: { tab: 'details' } });
    } catch {
      toast.error('Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
          <div className="h-8 bg-white/10 w-1/4" />
          <div className="space-y-6">
            <div className="h-12 bg-white/10" />
            <div className="h-12 bg-white/10" />
            <div className="h-12 bg-white/10" />
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
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link
            to="/projects/$projectId"
            params={{ projectId: String(projectId) }}
            search={{ tab: 'details' }}
            className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2rem,4vw,3rem)] tracking-tight">Edit Project</h1>
            <p className="mt-1 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">Update your project details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Basic Info */}
          <div className="border border-white/15 p-6 lg:p-8 space-y-8">
            <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2vw,1.5rem)] tracking-tight border-b border-white/15 pb-4">Project Details</h2>

            <div>
              <label htmlFor="title" className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Project Title *</label>
              <input
                id="title"
                type="text"
                className={`w-full border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white ${errors.title ? 'border-[var(--color-gray-500)]' : ''}`}
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 10, message: 'Title must be at least 10 characters' },
                  maxLength: { value: 255, message: 'Title must be less than 255 characters' },
                })}
              />
              {errors.title && <p className="mt-1 font-mono text-xs text-[var(--color-gray-500)]">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="category_id" className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Category</label>
              <select
                id="category_id"
                className="w-full border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg appearance-none text-[var(--color-text)] focus:ring-0 focus:border-white"
                {...register('category_id', { valueAsNumber: true })}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Description *</label>
              <textarea
                id="description"
                rows={6}
                className={`w-full border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white resize-none ${errors.description ? 'border-[var(--color-gray-500)]' : ''}`}
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 50, message: 'Description must be at least 50 characters' },
                })}
              />
              {errors.description && <p className="mt-1 font-mono text-xs text-[var(--color-gray-500)]">{errors.description.message}</p>}
            </div>

            <div>
              <label htmlFor="requirements" className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Requirements (Optional)</label>
              <textarea
                id="requirements"
                rows={4}
                className="w-full border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white resize-none"
                {...register('requirements')}
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Skills Required</label>
              <input
                id="skills"
                type="text"
                className="w-full border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
                placeholder="React, TypeScript, Node.js (comma separated)"
                {...register('skills')}
              />
              <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">Separate skills with commas</p>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="border border-white/15 p-6 lg:p-8 space-y-8">
            <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2vw,1.5rem)] tracking-tight border-b border-white/15 pb-4">Budget & Timeline</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="budget_min" className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Minimum Budget (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] font-mono">$</span>
                  <input
                    id="budget_min"
                    type="number"
                    min="10"
                    step="10"
                    className={`w-full border-0 border-b border-white/30 bg-transparent pl-8 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white ${errors.budget_min ? 'border-[var(--color-gray-500)]' : ''}`}
                    {...register('budget_min', {
                      required: 'Minimum budget is required',
                      min: { value: 10, message: 'Minimum budget must be at least $10' },
                    })}
                  />
                </div>
                {errors.budget_min && <p className="mt-1 font-mono text-xs text-[var(--color-gray-500)]">{errors.budget_min.message}</p>}
              </div>

              <div>
                <label htmlFor="budget_max" className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Maximum Budget (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] font-mono">$</span>
                  <input
                    id="budget_max"
                    type="number"
                    min="10"
                    step="10"
                    className="w-full border-0 border-b border-white/30 bg-transparent pl-8 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
                    {...register('budget_max')}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border border-white/30 bg-transparent text-white focus:ring-2 focus:ring-white"
                  {...register('is_fixed_price')}
                />
                <span className="font-mono text-xs text-[var(--color-text-muted)]">Fixed price project (not hourly)</span>
              </label>
            </div>

            <div>
              <label htmlFor="deadline_days" className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Deadline (days)</label>
              <input
                id="deadline_days"
                type="number"
                min="1"
                max="365"
                className="w-full border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
                {...register('deadline_days', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Status */}
          <div className="border border-white/15 p-6 lg:p-8 space-y-8">
            <h2 className="font-heading font-semibold text-[var(--color-text)] text-[clamp(1.25rem,2vw,1.5rem)] tracking-tight border-b border-white/15 pb-4">Status</h2>
            <div>
              <label htmlFor="status" className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Project Status</label>
              <select
                id="status"
                className="w-full border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg appearance-none text-[var(--color-text)] focus:ring-0 focus:border-white"
                {...register('status')}
              >
                <option value="draft">Draft</option>
                <option value="open">Open for Bids</option>
              </select>
              <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">
                Only draft projects can be edited. Once published, you cannot change the status back to draft.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              to="/projects/$projectId"
              params={{ projectId: String(projectId) }}
              search={{ tab: 'details' }}
              className="border border-white/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
            >
              Cancel
            </Link>
            {canPublish && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await projectService.publish(String(projectId));
                    toast.success('Project published!');
                    navigate({ to: '/projects/$projectId', params: { projectId: String(projectId) }, search: { tab: 'details' } });
                  } catch {
                    toast.error('Failed to publish');
                  }
                }}
                className="border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Publish Project
              </button>
            )}
            <button type="submit" disabled={isLoading} className="border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors flex items-center gap-2">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}