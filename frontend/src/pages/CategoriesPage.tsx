import { Link } from '@tanstack/react-router';
import { SparklesIcon, CodeBracketIcon, PaintBrushIcon, MegaphoneIcon, VideoCameraIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { AuthLayout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';

const categories = [
  { name: 'Web Development', icon: CodeBracketIcon, count: 245, subcategories: ['Frontend', 'Backend', 'Full Stack', 'DevOps'] },
  { name: 'Design & Creative', icon: PaintBrushIcon, count: 189, subcategories: ['UI/UX', 'Graphic Design', 'Illustration', 'Branding'] },
  { name: 'Marketing & Sales', icon: MegaphoneIcon, count: 156, subcategories: ['SEO', 'Social Media', 'Content Marketing', 'Email Marketing'] },
  { name: 'Video & Animation', icon: VideoCameraIcon, count: 98, subcategories: ['Video Editing', 'Motion Graphics', '3D Animation', 'Explainer Videos'] },
  { name: 'AI & Machine Learning', icon: CpuChipIcon, count: 67, subcategories: ['ML Models', 'NLP', 'Computer Vision', 'Data Science'] },
  { name: 'Mobile Development', icon: CodeBracketIcon, count: 134, subcategories: ['iOS', 'Android', 'React Native', 'Flutter'] },
];

export function CategoriesPage() {
  return (
    <AuthLayout>
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-[var(--color-bg)]" />
          </div>
          <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
        </Link>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-[var(--color-text)]">Browse Categories</h1>
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">Find the perfect category for your project or skills</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.name} hover className="h-full" asChild>
              <Link to="/projects" search={{ category: category.name }}>
                <div className="p-6 space-y-4">
                  <div className="w-14 h-14 bg-[var(--color-accent-muted)] rounded-xl flex items-center justify-center">
                    <category.icon className="w-7 h-7 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--color-text)]">{category.name}</h3>
                    <p className="text-[var(--color-text-muted)] mt-1">{category.count} active projects</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((sub) => (
                      <span key={sub} className="text-xs px-2 py-1 bg-[var(--color-surface-muted)] rounded text-[var(--color-text-muted)]">
                        {sub}
                      </span>
                    ))}
                  </div>
                  <Button variant="outline" fullWidth className="mt-4">View Projects</Button>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}