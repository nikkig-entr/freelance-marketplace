import { Link } from 'react-router-dom';
import { ChevronRightIcon, MagnifyingGlassIcon, UserGroupIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Code, Palette, Smartphone, PenTool, Brain, Megaphone, Briefcase, Zap, Database, Globe, Layers, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const categories = [
  { name: 'Web Development', count: '12,400+', icon: Code, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' },
  { name: 'Design & Creative', count: '8,200+', icon: Palette, gradient: 'from-purple-500 to-pink-500', bg: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' },
  { name: 'Mobile Development', count: '5,600+', icon: Smartphone, gradient: 'from-green-500 to-emerald-500', bg: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' },
  { name: 'Writing & Content', count: '4,100+', icon: PenTool, gradient: 'from-orange-500 to-amber-500', bg: 'bg-gradient-to-br from-orange-500/20 to-amber-500/20' },
  { name: 'Data Science & AI', count: '3,800+', icon: Brain, gradient: 'from-indigo-500 to-purple-500', bg: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20' },
  { name: 'Marketing & SEO', count: '2,900+', icon: Megaphone, gradient: 'from-pink-500 to-rose-500', bg: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20' },
  { name: 'DevOps & Cloud', count: '2,400+', icon: Zap, gradient: 'from-red-500 to-orange-500', bg: 'bg-gradient-to-br from-red-500/20 to-orange-500/20' },
  { name: 'Backend & API', count: '3,200+', icon: Database, gradient: 'from-teal-500 to-cyan-500', bg: 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20' },
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
    <section className="section relative">
      {/* Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-amber/3 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal/3 blur-3xl" />
      </div>

      <div className="container relative">
        {/* Categories */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="primary" size="lg" className="mb-4 inline-flex">
                Explore by Category
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-cream tracking-tight">
                Find Your <span className="text-gradient">Specialization</span>
              </h2>
            </div>
            <Button variant="outline" asChild size="md">
              <Link to="/categories">View All <ChevronRightIcon className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to="/projects"
                className="group glass-card-hover p-5 text-center relative overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl ${category.bg} flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110`}>
                  <category.icon className={`w-7 h-7 bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent`} aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-cream mb-1">{category.name}</h3>
                <p className="text-sm text-muted">{category.count} projects</p>
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Projects */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="primary" size="lg" className="mb-4 inline-flex">
                This Week's Highlights
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-cream tracking-tight">
                Featured <span className="text-gradient">Projects</span>
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
                className={`relative glass-card-hover p-6 h-full ${project.featured ? 'border-amber/30 gradient-border-amber' : ''}`}
              >
                {project.featured && (
                  <Badge variant="primary" className="absolute -top-3 left-4">Featured</Badge>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-cream">{project.title}</h3>
                    <p className="text-sm text-muted mt-0.5">{project.client}</p>
                  </div>
                  {project.featured && (
                    <div className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse-soft" />
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted mb-4">
                  <span className="font-medium text-cream">{project.budget}</span>
                  <span className="text-white/[0.1]">•</span>
                  <span className="flex items-center gap-1.5">
                    <CheckIcon className="w-3.5 h-3.5 text-teal" />
                    {project.proposals} proposals
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {project.skills.map((skill) => (
                    <Badge key={skill} variant="outline" size="sm">{skill}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted pt-4 border-t border-white/[0.06]">
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
                  <Link to={`/projects/${project.id}`}>View Details</Link>
                </Button>
              </article>
            ))}
          </div>
        </div>

        {/* Visual Showcase */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="lg:grid lg:grid-cols-2">
            {/* Code side */}
            <div className="relative aspect-[4/3] lg:aspect-auto min-h-[350px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-obsidian to-purple-500/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <Code className="w-16 h-16 text-amber/50 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-cream mb-2">Build with Code</h3>
                  <p className="text-muted max-w-xs mx-auto">Clean architecture, modern stacks, scalable solutions</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-[url('/media/placeholders/pattern.svg')] opacity-[0.02]" />
            </div>

            {/* Design side */}
            <div className="relative aspect-[4/3] lg:aspect-auto min-h-[350px] flex flex-col items-center justify-center p-8 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-obsidian to-pink-500/20" />
              <div className="relative z-10 max-w-md">
                <Palette className="w-16 h-16 text-teal/50 mx-auto mb-4" />
                <Badge variant="primary" className="mb-4 inline-block">Design & Creative</Badge>
                <h3 className="text-2xl sm:text-3xl font-bold text-cream mb-4">
                  Craft Beautiful Experiences
                </h3>
                <p className="text-muted mb-6">
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
              <div className="absolute inset-0 bg-[url('/media/placeholders/pattern.svg')] opacity-[0.02]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}