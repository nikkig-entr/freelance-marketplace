import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { projectService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const projectSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title is too long'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(10000, 'Description is too long'),
  category: z.string().min(1, 'Please select a category'),
  subcategory: z.string().optional(),
  tags: z.string().optional(),
  budget_min: z.coerce.number().min(1000, 'Minimum budget is $10').optional(),
  budget_max: z.coerce.number().min(1000, 'Maximum budget is $10').optional(),
  is_fixed_price: z.boolean(),
  deadline: z.string().optional(),
  estimated_duration_days: z.coerce.number().min(1).max(365).optional(),
  required_skills: z.string().optional(),
  experience_level: z.string(),
  english_level: z.string(),
  is_urgent: z.boolean().optional(),
  is_featured: z.boolean().optional(),
}).refine((data) => data.budget_min && data.budget_max ? data.budget_max >= data.budget_min : true, {
  message: 'Maximum budget must be greater than minimum budget',
  path: ['budget_max'],
});

type ProjectForm = z.infer<typeof projectSchema>;

const categories = [
  { value: 'Web Development', label: 'Web Development' },
  { value: 'Mobile Development', label: 'Mobile Development' },
  { value: 'Design & Creative', label: 'Design & Creative' },
  { value: 'Writing & Translation', label: 'Writing & Translation' },
  { value: 'Marketing & Sales', label: 'Marketing & Sales' },
  { value: 'Data Science & AI', label: 'Data Science & AI' },
  { value: 'DevOps & Engineering', label: 'DevOps & Engineering' },
  { value: 'Finance & Accounting', label: 'Finance & Accounting' },
  { value: 'Legal & Admin', label: 'Legal & Admin' },
];

const experienceLevels = [
  { value: 'any', label: 'Any Experience' },
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid (2-5 years)' },
  { value: 'senior', label: 'Senior (5-10 years)' },
  { value: 'expert', label: 'Expert (10+ years)' },
];

const englishLevels = [
  { value: 'any', label: 'Any Level' },
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native/Bilingual' },
];

export function CreateProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  const isClient = hasRole(['client']);

  if (!isClient) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-secondary-900">Access Denied</h1>
        <p className="mt-2 text-secondary-600">Only clients can create projects.</p>
        <Button asChild className="mt-4">
          <a href="/projects">Browse Projects</a>
        </Button>
      </div>
    );
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      is_fixed_price: true,
      experience_level: 'any',
      english_level: 'any',
      is_urgent: false,
      is_featured: false,
    },
  });

  const watchedFixedPrice = watch('is_fixed_price');

  const { mutate: createProject, isPending } = useMutation({
    mutationFn: (data: ProjectForm) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : [],
        required_skills: data.required_skills ? data.required_skills.split(',').map((s) => s.trim()) : [],
        budget_min: data.budget_min ? Math.round(data.budget_min * 100) : null,
        budget_max: data.budget_max ? Math.round(data.budget_max * 100) : null,
      };
      return projectService.create(payload);
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] });
      toast.success('Project created successfully!');
      navigate(`/projects/${project.uuid}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create project');
    },
    onSettled: () => setIsSubmitting(false),
  });

  const onSubmit = (data: ProjectForm) => {
    setIsSubmitting(true);
    createProject(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Projects
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <BriefcaseIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-secondary-900">Create New Project</h1>
              <p className="text-secondary-600">Fill in the details below to post your project</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardTitle title="Basic Information" subtitle="Required fields marked with *" />
          <div className="space-y-6">
            <Input
              label="Project Title *"
              placeholder="e.g., Build a React E-commerce Platform"
              error={errors.title?.message}
              {...register('title')}
            />

            <Textarea
              label="Description *"
              placeholder="Describe your project in detail. Include requirements, expectations, and any specific technologies or tools needed."
              rows={6}
              error={errors.description?.message}
              {...register('description')}
            />

            <Select
              label="Category *"
              placeholder="Select a category"
              options={categories}
              error={errors.category?.message}
              {...register('category')}
            />

            <Input
              label="Subcategory"
              placeholder="e.g., Frontend, Backend, UI/UX"
              error={errors.subcategory?.message}
              {...register('subcategory')}
            />

            <Input
              label="Tags (comma-separated)"
              placeholder="React, TypeScript, Tailwind, Stripe"
              error={errors.tags?.message}
              {...register('tags')}
            />
          </div>
        </Card>

        {/* Budget & Timeline */}
        <Card>
          <CardTitle title="Budget & Timeline" />
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                  {...register('is_fixed_price')}
                />
                <span className="text-sm font-medium text-secondary-700">Fixed Price Project</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Budget (USD) *"
                type="number"
                placeholder="1000"
                min="10"
                error={errors.budget_min?.message}
                {...register('budget_min', { valueAsNumber: Number })}
              />
              <Input
                label="Maximum Budget (USD) *"
                type="number"
                placeholder="5000"
                min="10"
                error={errors.budget_max?.message}
                {...register('budget_max', { valueAsNumber: Number })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Deadline (Optional)"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                error={errors.deadline?.message}
                {...register('deadline')}
              />
              <Input
                label="Estimated Duration (Days)"
                type="number"
                placeholder="30"
                min="1"
                max="365"
                error={errors.estimated_duration_days?.message}
                {...register('estimated_duration_days', { valueAsNumber: Number })}
              />
            </div>
          </div>
        </Card>

        {/* Requirements */}
        <Card>
          <CardTitle title="Requirements" />
          <div className="space-y-6">
            <Input
              label="Required Skills (comma-separated)"
              placeholder="React, TypeScript, Node.js, PostgreSQL"
              error={errors.required_skills?.message}
              {...register('required_skills')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Experience Level"
                options={experienceLevels}
                {...register('experience_level')}
              />
              <Select
                label="English Level"
                options={englishLevels}
                {...register('english_level')}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                  {...register('is_urgent')}
                />
                <span className="text-sm font-medium text-secondary-700">Mark as Urgent</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                  {...register('is_featured')}
                />
                <span className="text-sm font-medium text-secondary-700">Featured Project (Pro/Agency only)</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-secondary-200">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting || isPending} size="lg">
            <BriefcaseIcon className="w-5 h-5 mr-2" />
            Create Project
          </Button>
        </div>
      </form>
    </div>
  );
}