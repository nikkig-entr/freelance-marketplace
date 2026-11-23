import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, BriefcaseIcon, UserGroupIcon, ArrowRightIcon, CheckIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const categories = [
  { name: 'Web Development', count: '12,400+', icon: BriefcaseIcon, color: 'bg-blue-100 text-blue-600', bgImage: '/media/projects/projects-code-thumb.webp' },
  { name: 'Design & Creative', count: '8,200+', icon: UserGroupIcon, color: 'bg-purple-100 text-purple-600', bgImage: '/media/projects/projects-design-thumb.webp' },
  { name: 'Mobile Development', count: '5,600+', icon: BriefcaseIcon, color: 'bg-green-100 text-green-600', bgImage: '/media/projects/projects-code-thumb.webp' },
  { name: 'Writing & Content', count: '4,100+', icon: UserGroupIcon, color: 'bg-orange-100 text-orange-600', bgImage: '/media/projects/projects-design-thumb.webp' },
  { name: 'Data Science & AI', count: '3,800+', icon: BriefcaseIcon, color: 'bg-pink-100 text-pink-600', bgImage: '/media/projects/projects-code-thumb.webp' },
  { name: 'Marketing & SEO', count: '2,900+', icon: UserGroupIcon, color: 'bg-indigo-100 text-indigo-600', bgImage: '/media/projects/projects-design-thumb.webp' },
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
    skills: ['React Native', 'Firebase', 'Redux'],
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
    skills: ['Figma', 'Design Systems', 'Branding'],
    posted: '1 day ago',
    proposals: 24,
    featured: true,
    remote: true,
  },
];

const talentHighlights = [
  {
    name: 'Alexandra M.',
    title: 'Senior Full-Stack Developer',
    skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    rating: 4.9,
    jobs: 127,
    earnings: '$185K+',
    avatar: '/media/community/community-team-thumb.webp',
    badges: ['Top Rated', 'Verified', 'Pro'],
  },
  {
    name: 'David K.',
    title: 'UX/UI Designer',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research'],
    rating: 4.8,
    jobs: 89,
    earnings: '$142K+',
    avatar: '/media/community/community-handshake-thumb.webp',
    badges: ['Top Rated', 'Verified'],
  },
  {
    name: 'Priya S.',
    title: 'Mobile Developer',
    skills: ['React Native', 'Swift', 'Kotlin', 'Firebase'],
    rating: 5.0,
    jobs: 64,
    earnings: '$98K+',
    avatar: '/media/community/community-team-thumb.webp',
    badges: ['Rising Talent', 'Verified', 'Pro'],
  },
];

export function ProjectsSection() {
  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
          <div>
            <Badge variant="secondary" size="lg" className="mb-4 inline-flex">
              37,000+ Active Opportunities
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-secondary-900 tracking-tight">
              Find Your Next <span className="text-primary-600">Project or Talent</span>
            </h2>
            <p className="mt-4 text-lg text-secondary-600 max-w-2xl">
              From quick fixes to enterprise transformations. Browse projects or hire verified freelancers.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild size="lg">
              <Link to="/projects">
                <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                Browse All Projects
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/talent">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Find Freelancers
              </Link>
            </Button>
          </div>
        </div>

        {/* Category Grid with Images */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-secondary-900 mb-8">Explore by Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link key={index} to="/projects" className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow block">
                <picture>
                  <source
                    srcSet={category.bgImage.replace('.webp', '-384w.webp').replace('.webp', '-640w.webp').replace('.webp', '-960w.webp').replace('.webp', '-1280w.webp')}
                    type="image/webp"
                  />
                  <img
                    src={category.bgImage.replace('-thumb', '')}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </picture>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/90 via-secondary-900/20 to-transparent" />
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className={`w-10 h-10 rounded-xl ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <category.icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-1">{category.name}</h4>
                  <p className="text-secondary-300 text-sm">{category.count} projects</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Projects */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-secondary-900">Featured Projects This Week</h3>
            <Button variant="ghost" asChild size="sm">
              <Link to="/projects">
                View All <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <Card key={project.id} className={`relative p-6 h-full ${project.featured ? 'border-primary-200 shadow-lg' : 'border-secondary-200'}`}>
                {project.featured && (
                  <Badge variant="primary" className="absolute -top-3 left-4">Featured</Badge>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-secondary-900">{project.title}</h4>
                    <p className="text-sm text-secondary-500 mt-0.5">{project.client}</p>
                  </div>
                  {project.featured && (
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-secondary-600 mb-4">
                  <span className="font-medium text-secondary-900">{project.budget}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CheckIcon className="w-3 h-3 text-success-500" />
                    {project.proposals} proposals
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.skills.map((skill) => (
                    <Badge key={skill} variant="outline" size="sm">{skill}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-secondary-500">
                  <span className="flex items-center gap-1">
                    {project.remote && (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                        Remote
                      </>
                    )}
                  </span>
                  <span>{project.posted}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Top Talent */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-secondary-900">Top Available Talent</h3>
            <Button variant="ghost" asChild size="sm">
              <Link to="/talent">
                View All <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {talentHighlights.map((talent, index) => (
              <Card key={index} className="p-6 border-secondary-200">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={talent.avatar}
                    alt={talent.name}
                    className="w-14 h-14 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="font-semibold text-secondary-900">{talent.name}</h4>
                    <p className="text-sm text-secondary-500">{talent.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold text-yellow-500">{talent.rating}</span>
                  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span className="text-sm text-secondary-500">{talent.jobs} jobs • {talent.earnings} earned</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {talent.skills.map((skill) => (
                    <Badge key={skill} variant="outline" size="sm">{skill}</Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {talent.badges.map((badge) => (
                    <Badge key={badge} variant="secondary" size="sm">{badge}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Visual Showcase */}
        <div className="relative rounded-3xl overflow-hidden bg-secondary-100">
          <div className="relative lg:grid lg:grid-cols-2 lg:gap-0">
            {/* Code side */}
            <div className="relative aspect-[4/3] lg:aspect-auto min-h-[400px]">
              <picture>
                <source
                  srcSet="
                    /media/projects/projects-code-384w.webp 384w,
                    /media/projects/projects-code-640w.webp 640w,
                    /media/projects/projects-code-960w.webp 960w,
                    /media/projects/projects-code-1280w.webp 1280w
                  "
                  type="image/webp"
                />
                <img
                  src="/media/projects/projects-code.jpg"
                  alt="Developer writing code"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </picture>
              <div className="absolute inset-0 bg-primary-600/10" />
            </div>

            {/* Design side */}
            <div className="relative aspect-[4/3] lg:aspect-auto min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
              <picture>
                <source
                  srcSet="
                    /media/projects/projects-design-384w.webp 384w,
                    /media/projects/projects-design-640w.webp 640w,
                    /media/projects/projects-design-960w.webp 960w,
                    /media/projects/projects-design-1280w.webp 1280w
                  "
                  type="image/webp"
                />
                <img
                  src="/media/projects/projects-design.jpg"
                  alt="Design tools and UI mockups"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  loading="lazy"
                />
              </picture>
              <div className="relative z-10 max-w-md">
                <Badge variant="primary" className="mb-4">Design & Code</Badge>
                <h3 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-4">
                  Build beautiful, functional products
                </h3>
                <p className="text-secondary-600 mb-6">
                  Whether you're a developer crafting clean architecture or a designer creating stunning interfaces,
                  FreelanceHub connects you with projects that match your skills.
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
    </section>
  );
}