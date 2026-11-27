import { Link } from '@tanstack/react-router';
import { FileText, Search, Shield, ArrowRightIcon } from 'lucide-react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export function AIToolsPage() {
  return (
    <section className="min-h-screen bg-[var(--color-bg)] py-16 lg:py-24">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-4 border border-white/15 px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            AI Assistant Platform
          </span>
          <h2 className="font-heading font-bold text-[var(--color-text)] text-[clamp(2.5rem,5vw,4rem)] tracking-tight">
            Three AI Tools That <span className="text-white">Change Everything</span>
          </h2>
          <p className="mt-4 text-[var(--color-text-muted)] font-[Instrument_Serif] italic text-[clamp(1rem,2vw,1.25rem)] max-w-2xl mx-auto">
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
              className="border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300 p-6 lg:p-8 h-full flex flex-col"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="w-13 h-13 border border-white/15 flex items-center justify-center mb-6">
                <tool.icon className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)] inline-block mb-4 border border-white/15 px-3 py-1">
                {tool.id === 'parse-tz' ? 'Decomposition' : tool.id === 'ai-match' ? 'Matching' : 'Generation'}
              </span>
              <h3 className="font-heading font-semibold text-[var(--color-text)] text-xl mb-2">{tool.title}</h3>
              <p className="font-mono text-xs text-[var(--color-text-muted)] mb-6">{tool.subtitle}</p>
              <p className="text-[var(--color-text-muted)] leading-relaxed flex-1 mb-6">{tool.description}</p>
              <div className="space-y-2 mb-6">
                {tool.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <CheckCircleIcon className="w-4 h-4 text-white flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/ai-tools"
                className="border border-white w-full py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors text-center flex items-center justify-center gap-2"
              >
                Learn More
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>

        <div className="text-center">
          <div className="border border-white/15 p-8 lg:p-12 max-w-3xl mx-auto">
            <h3 className="font-heading font-bold text-[var(--color-text)] text-[clamp(1.5rem,3vw,2rem)] tracking-tight mb-4">
              Ready to experience AI-powered freelancing?
            </h3>
            <p className="text-[var(--color-text-muted)] font-[Instrument_Serif] italic mb-8 max-w-xl mx-auto">
              Join thousands of freelancers and clients using AI to work smarter, not harder.
              Start your 14-day Pro trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="border border-white px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors text-center w-full sm:w-auto"
              >
                Start Free Trial
              </Link>
              <Link
                to="/ai-tools"
                className="border border-white/15 px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors text-center w-full sm:w-auto"
              >
                Explore AI Tools
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}