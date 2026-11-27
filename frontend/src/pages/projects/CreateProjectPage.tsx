import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { projectService } from '@/services/api';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CreateProjectForm {
  title: string;
  description: string;
  requirements: string;
  category_id: number;
  skills: string;
  budget_min: string;
  budget_max: string;
  is_fixed_price: boolean;
  deadline_days: string;
}

interface Category {
  id: number;
  name: string;
}

export function CreateProjectPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectForm>({
    defaultValues: {
      is_fixed_price: true,
    },
  });

  const description = watch('description');
  const skillsInput = watch('skills');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (description.length > 50) {
        try {
          const data = await projectService.parseProject<{ skills: string[] }>(description);
          if (data.skills && data.skills.length > 0) {
            setSuggestedSkills(data.skills);
          }
        } catch (error) {
          console.error('Failed to parse project:', error);
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [description]);

  const fetchCategories = async () => {
    try {
      const data = await projectService.getCategories<{ items: Category[] }>();
      setCategories(data.items || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const onSubmit = async (data: CreateProjectForm) => {
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
      };
      const project = await projectService.create<{ id: number }>(projectData);
      toast.success('Project created successfully!');
      navigate({ to: '/projects/$projectId', params: { projectId: String(project.id) }, search: { tab: 'details' } });
    } catch {
      toast.error('Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const addSuggestedSkill = (skill: string) => {
    const current = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (!current.includes(skill)) {
      setValue('skills', [...current, skill].join(', '));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link to="/projects" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2rem,4vw,3rem)] tracking-tight">Create New Project</h1>
            <p className="mt-1 text-[var(--color-text-muted)] font-[Instrument_Serif] italic">Fill in the details below to post your project</p>
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
                placeholder="e.g., Build a React Native mobile app"
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
                className={`w-full border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg appearance-none text-[var(--color-text)] focus:ring-0 focus:border-white ${errors.category_id ? 'border-[var(--color-gray-500)]' : ''}`}
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
                placeholder="Describe your project in detail. What do you need built? What are the goals?"
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 50, message: 'Description must be at least 50 characters' },
                })}
              />
              {errors.description && <p className="mt-1 font-mono text-xs text-[var(--color-gray-500)]">{errors.description.message}</p>}
              {suggestedSkills.length > 0 && (
                <div className="mt-4 p-4 border border-white/15 bg-white/5">
                  <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-3">AI Suggested Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSuggestedSkill(skill)}
                        className="px-3 py-1.5 text-sm font-mono text-[var(--color-text)] border border-white/15 hover:border-white/30 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="requirements" className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Requirements (Optional)</label>
              <textarea
                id="requirements"
                rows={4}
                className="w-full border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white resize-none"
                placeholder="Any specific requirements, technologies, or constraints?"
                {...register('requirements')}
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase mb-2">Skills Required</label>
              <input
                id="skills"
                type="text"
                className="w-full border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg placeholder-[var(--color-text-subtle)] focus:ring-0 focus:border-white"
                placeholder="React, TypeScript, Node.js, PostgreSQL (comma separated)"
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
                    placeholder="500"
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
                    placeholder="1000"
                    {...register('budget_max')}
                  />
                </div>
                <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">Leave empty for fixed price</p>
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
                placeholder="14"
                {...register('deadline_days', { valueAsNumber: true })}
              />
              <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">Optional: Number of days to complete the project</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link to="/projects" className="border border-white/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={isLoading} className="border border-white px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors flex items-center gap-2">
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}