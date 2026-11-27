import { Link } from '@tanstack/react-router';
import { SparklesIcon, CodeBracketIcon, PaintBrushIcon, MegaphoneIcon, VideoCameraIcon, CpuChipIcon } from '@heroicons/react/24/outline';

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
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
            <div className="w-10 h-10 border border-white/15 flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-[var(--color-text)]">FreelanceHub</span>
          </Link>
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2.5rem,5vw,4rem)] tracking-tight">Browse Categories</h1>
            <p className="mt-4 text-[var(--color-text-muted)] font-[Instrument_Serif] italic text-[clamp(1rem,2vw,1.25rem)]">Find the perfect category for your project or skills</p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to="/projects"
              search={{ category: category.name }}
              className="border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300 flex flex-col h-full"
            >
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="w-14 h-14 border border-white/15 flex items-center justify-center">
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-[var(--color-text)] text-xl">{category.name}</h3>
                  <p className="font-mono text-xs text-[var(--color-text-muted)] mt-1">{category.count} active projects</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {category.subcategories.map((sub) => (
                    <span key={sub} className="font-mono text-xs px-3 py-1 border border-white/15 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-white/30 transition-colors">
                      {sub}
                    </span>
                  ))}
                </div>
                <div className="border-t border-white/15 pt-4 mt-4">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)] hover:text-white transition-colors">
                    View Projects
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}