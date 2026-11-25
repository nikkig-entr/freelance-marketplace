import { Link } from '@tanstack/react-router';
import { ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Code, Palette, Smartphone, PenTool, Brain, Megaphone, Globe, Database, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

const categories = [
  { name: 'Web Development', count: '12,400+', icon: Code },
  { name: 'Design & Creative', count: '8,200+', icon: Palette },
  { name: 'Mobile Development', count: '5,600+', icon: Smartphone },
  { name: 'Writing & Content', count: '4,100+', icon: PenTool },
  { name: 'Data Science & AI', count: '3,800+', icon: Brain },
  { name: 'Marketing & SEO', count: '2,900+', icon: Megaphone },
  { name: 'DevOps & Cloud', count: '2,400+', icon: Zap },
  { name: 'Backend & API', count: '3,200+', icon: Database },
];

const featuredProjects = [
  {
    id: 1,
    title: 'React Dashboard Redesign',
    client: 'FinTech Startup',
    budget: '$3,000 - $5,000',
    skills: ['React', 'TypeScript', 'Tailwind', 'D3.js'],
    posted: '2 hours ago',
    proposals: 12,
    featured: true,
    remote: true,
  },
  {
    id: 2,
    title: 'Mobile App for Fitness Tracking',
    client: 'HealthTech Inc.',
    budget: '$8,000 - $15,000',
    skills: ['React Native', 'Firebase', 'Redux', 'TypeScript'],
    posted: '5 hours ago',
    proposals: 8,
    featured: false,
    remote: true,
  },
  {
    id: 3,
    title: 'Brand Identity & Design System',
    client: 'E-commerce Brand',
    budget: '$2,500 - $4,000',
    skills: ['Figma', 'Design Systems', 'Branding', 'Illustration'],
    posted: '1 day ago',
    proposals: 24,
    featured: true,
    remote: true,
  },
];

export function CategoriesProjectsSection() {
  return (
    <section className="section">
      <AmbientBackground size="lg" opacity="default">
        <div className="container">
        {/* Categories - Clean Typography */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="primary" size="md" className="mb-4 inline-flex">
                Explore by Category
              </Badge>
              <h2 className="text-headline-1 text-[var(--color-text)]">
                Find Your <span className="text-gradient-accent">Specialization</span>
              </h2>
            </div>
            <Button variant="outline" asChild size="md">
              <Link to="/categories">View All <ChevronRightIcon className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to="/projects"
                className="group glass-card-hover p-5 text-center relative overflow-hidden"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110">
                  <category.icon className="w-6 h-6 text-[var(--color-accent)]" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-[var(--color-text)] mb-1">{category.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{category.count} projects</p>
                {/* Subtle hover glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Projects - Clean Cards */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="primary" size="md" className="mb-4 inline-flex">
                This Week's Highlights
              </Badge>
              <h2 className="text-headline-1 text-[var(--color-text)]">
                Featured <span className="text-gradient-accent">Projects</span>
              </h2>
            </div>
            <Button variant="outline" asChild size="md">
              <Link to="/projects">Browse All <ChevronRightIcon className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <article
                key={project.id}
                className={`relative glass-card-hover p-6 h-full ${project.featured ? 'border-[var(--color-accent)]/30 gradient-border-accent' : ''}`}
              >
                {project.featured && (
                  <Badge variant="primary" className="absolute -top-3 left-4">Featured</Badge>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">{project.title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{project.client}</p>
                  </div>
                  {project.featured && (
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-4">
                  <span className="font-medium text-[var(--color-text)]">{project.budget}</span>
                  <span className="text-[var(--color-border)]">•</span>
                  <span className="flex items-center gap-1.5">
                    <CheckIcon className="w-3.5 h-3.5 text-[var(--color-gray-500)]" />
                    {project.proposals} proposals
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {project.skills.map((skill) => (
                    <Badge key={skill} variant="outline" size="sm">{skill}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)] pt-4 border-t border-[var(--color-border)]">
                  <span className="flex items-center gap-1.5">
                    {project.remote && (
                      <>
                        <Globe className="w-4 h-4" />
                        Remote
                      </>
                    )}
                  </span>
                  <span>{project.posted}</span>
                </div>

                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/projects/$projectId" params={{ projectId: String(project.id) }} search={{ tab: 'details' }}>View Details</Link>
                </Button>
              </article>
            ))}
          </div>
        </div>

        {/* Visual Showcase - Minimal Split */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="lg:grid lg:grid-cols-2">
            {/* Code side */}
            <div className="relative aspect-[4/3] lg:aspect-auto min-h-[350px] p-8 lg:p-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gray-800)] via-black to-[var(--color-gray-800)]" />
              <div className="relative z-10 text-center max-w-md">
                <Code className="w-14 h-14 text-[var(--color-accent)]/50 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">Build with Code</h3>
                <p className="text-[var(--color-text-muted)] max-w-xs mx-auto">Clean architecture, modern stacks, scalable solutions</p>
              </div>
            </div>

            {/* Design side */}
            <div className="relative aspect-[4/3] lg:aspect-auto min-h-[350px] flex flex-col items-center justify-center p-8 lg:p-12 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gray-800)] via-black to-[var(--color-gray-800)]" />
              <div className="relative z-10 max-w-md">
                <Palette className="w-14 h-14 text-[var(--color-gray-500)]/50 mx-auto mb-4" />
                <Badge variant="primary" className="mb-4 inline-block">Design & Creative</Badge>
                <h3 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-4">
                  Craft Beautiful Experiences
                </h3>
                <p className="text-[var(--color-text-muted)] mb-6">
                  From brand identities to design systems. Create stunning interfaces that users love.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/projects">Find Projects</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/talent">Hire Talent</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AmbientBackground>
    </section>
  );
}