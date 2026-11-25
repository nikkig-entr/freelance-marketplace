import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/Button';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { Search, Code, Palette, Smartphone, PenTool, Brain, Megaphone, Database, Zap } from 'lucide-react';

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

export function TalentPage() {
  return (
    <section className="section">
      <AmbientBackground size="lg" opacity="default">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-headline-1 text-[var(--color-text)]">
              Find Top <span className="text-gradient-accent">Talent</span>
            </h2>
            <p className="mt-4 text-body text-[var(--color-text-muted)] max-w-2xl mx-auto">
              Browse 50K+ verified freelancers across every skill and specialization. Filter by expertise, rate, and availability.
            </p>
          </div>

          <div className="glass-card p-6 mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-subtle)]" />
              <input
                type="search"
                placeholder="Search freelancers by skill, name, or keyword..."
                className="w-full pl-12 pr-4 py-4 bg-transparent border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-subtle)] text-lg focus:outline-none focus:border-[var(--color-accent)]"
                aria-label="Search freelancers"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to="/talent"
                className="group glass-card-hover p-5 text-center relative overflow-hidden"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110">
                  <category.icon className="w-6 h-6 text-[var(--color-accent)]" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-[var(--color-text)] mb-1">{category.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{category.count} freelancers</p>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button variant="outline" asChild size="lg">
              <Link to="/categories">Browse All Categories</Link>
            </Button>
          </div>
        </div>
      </AmbientBackground>
    </section>
  );
}