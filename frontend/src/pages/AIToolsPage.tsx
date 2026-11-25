import { Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { FileText, Search, Shield, ArrowRightIcon } from 'lucide-react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export function AIToolsPage() {
  return (
    <section className="section">
      <AmbientBackground size="lg" opacity="default">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="primary" size="md" className="mb-4 inline-flex" dot>
              <span className="w-3.5 h-3.5 relative">
                <div className="w-3.5 h-3.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
              </span>
              AI Assistant Platform
            </Badge>
            <h2 className="text-headline-1 text-[var(--color-text)]">
              Three AI Tools That <span className="text-gradient-accent">Change Everything</span>
            </h2>
            <p className="mt-4 text-body text-[var(--color-text-muted)] max-w-2xl mx-auto">
              Built directly into your workflow. No separate subscriptions, no context switching — just intelligence where you need it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                id: 'parse-tz',
                title: 'Parse TZ',
                subtitle: 'Technical Specification Decomposition',
                icon: FileText,
                description: 'Upload a project brief or technical specification and our AI instantly breaks it down into structured milestones, tasks, required skills, and time estimates.',
                features: ['Milestone breakdown', 'Task decomposition', 'Skill requirements', 'Time estimates', 'Budget ranges'],
              },
              {
                id: 'ai-match',
                title: 'AI Match',
                subtitle: 'Intelligent Talent Discovery',
                icon: Search,
                description: 'Describe your project needs and our matching engine analyzes 50K+ verified freelancers to surface the top 5 candidates with match scores, relevant experience, and availability.',
                features: ['Match scoring', 'Skill matching', 'Availability check', 'Rate comparison', 'Verified profiles'],
              },
              {
                id: 'smart-contract',
                title: 'Smart Contract',
                subtitle: 'AI-Generated Legal Agreements',
                icon: Shield,
                description: 'Generate legally-sound contracts tailored to your project type, jurisdiction, and requirements. Includes IP clauses, payment terms, confidentiality, and dispute resolution.',
                features: ['Jurisdiction-aware', 'IP transfer clauses', 'Escrow integration', 'GDPR compliant', 'E-signature ready'],
              },
            ].map((tool, index) => (
              <article
                key={tool.id}
                className="relative glass-card-hover p-6 lg:p-8 h-full flex flex-col"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="w-13 h-13 rounded-xl bg-[var(--color-accent-muted)] flex items-center justify-center mb-6">
                  <tool.icon className="w-6 h-6 text-[var(--color-accent)]" aria-hidden="true" />
                </div>
                <Badge variant="primary" size="sm" className="mb-4 inline-block">
                  {tool.id === 'parse-tz' ? 'Decomposition' : tool.id === 'ai-match' ? 'Matching' : 'Generation'}
                </Badge>
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">{tool.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-6">{tool.subtitle}</p>
                <p className="text-[var(--color-text-muted)] leading-relaxed flex-1 mb-6">{tool.description}</p>
                <div className="space-y-2 mb-6">
                  {tool.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                      <CheckCircleIcon className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" asChild size="md" className="w-full">
                  <Link to="/ai-tools">Learn More <ArrowRightIcon className="w-4 h-4 ml-2" /></Link>
                </Button>
              </article>
            ))}
          </div>

          <div className="text-center">
            <div className="glass-card p-8 lg:p-12 max-w-3xl mx-auto gradient-border-accent">
              <h3 className="text-headline-3 text-[var(--color-text)] mb-4">
                Ready to experience AI-powered freelancing?
              </h3>
              <p className="text-[var(--color-text-muted)] mb-8 max-w-xl mx-auto">
                Join thousands of freelancers and clients using AI to work smarter, not harder.
                Start your 14-day Pro trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="primary" size="lg" asChild>
                  <Link to="/register">Start Free Trial</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/ai-tools">Explore AI Tools</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AmbientBackground>
    </section>
  );
}