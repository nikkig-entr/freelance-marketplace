import { SparklesIcon, DocumentTextIcon, ArrowRightIcon, CheckCircleIcon, CpuChipIcon, MagnifyingGlassIcon, DocumentIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Code, Zap, Users, Shield, FileText, Search, Brain, Wand2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useState, useRef, useEffect } from 'react';

const aiFeatures = [
  {
    id: 'parse-tz',
    title: 'Parse TZ',
    subtitle: 'Technical Specification Decomposition',
    icon: FileText,
    accent: 'amber',
    description: 'Upload a project brief or technical specification and our AI instantly breaks it down into structured milestones, tasks, required skills, and time estimates.',
    demo: {
      input: 'Build a real-time chat app with React, Node.js, and WebSockets. Needs user auth, rooms, direct messages, file sharing, and mobile responsive UI.',
      output: [
        { phase: 'Setup & Architecture', tasks: ['Project initialization', 'Database schema design', 'WebSocket server setup', 'Auth system'], duration: 'Week 1-2' },
        { phase: 'Core Features', tasks: ['Real-time messaging', 'Room management', 'Direct messages', 'File upload'], duration: 'Week 3-5' },
        { phase: 'UI/UX', tasks: ['Responsive components', 'Dark mode', 'Notifications', 'Accessibility'], duration: 'Week 5-6' },
        { phase: 'Testing & Deploy', tasks: ['E2E tests', 'Load testing', 'CI/CD pipeline', 'Production deploy'], duration: 'Week 7' },
      ],
      skills: ['React', 'Node.js', 'Socket.io', 'PostgreSQL', 'TypeScript', 'Tailwind CSS'],
      timeline: '7 weeks',
      budget: '$8,000 - $12,000',
    },
  },
  {
    id: 'ai-match',
    title: 'AI Match',
    subtitle: 'Intelligent Talent Discovery',
    icon: Search,
    accent: 'teal',
    description: 'Describe your project needs and our matching engine analyzes 50K+ verified freelancers to surface the top 5 candidates with match scores, relevant experience, and availability.',
    demo: {
      input: 'Need a senior React developer for a 3-month fintech dashboard project. Must have D3.js, TypeScript, and experience with real-time data visualization.',
      output: [
        { name: 'Alexandra M.', title: 'Senior Full-Stack Developer', match: 98, skills: ['React', 'TypeScript', 'D3.js', 'PostgreSQL', 'AWS'], rate: '$120/hr', availability: 'Available now', badge: 'Top Rated' },
        { name: 'David K.', title: 'Frontend Architect', match: 95, skills: ['React', 'D3.js', 'TypeScript', 'GraphQL', 'Next.js'], rate: '$150/hr', availability: '2 weeks', badge: 'Verified' },
        { name: 'Priya S.', title: 'Data Visualization Expert', match: 92, skills: ['React', 'D3.js', 'Three.js', 'WebGL', 'Canvas API'], rate: '$110/hr', availability: 'Available now', badge: 'Rising Talent' },
        { name: 'Marcus J.', title: 'Full-Stack Engineer', match: 89, skills: ['React', 'Node.js', 'D3.js', 'TypeScript', 'Redis'], rate: '$95/hr', availability: '1 month', badge: 'Pro' },
        { name: 'Elena R.', title: 'UI Engineer', match: 87, skills: ['React', 'TypeScript', 'D3.js', 'Framer Motion', 'Storybook'], rate: '$105/hr', availability: 'Available now', badge: 'Verified' },
      ],
    },
  },
  {
    id: 'smart-contract',
    title: 'Smart Contract',
    subtitle: 'AI-Generated Legal Agreements',
    icon: Shield,
    accent: 'amber',
    description: 'Generate legally-sound contracts tailored to your project type, jurisdiction, and requirements. Includes IP clauses, payment terms, confidentiality, and dispute resolution.',
    demo: {
      input: 'Fixed-price contract for a React dashboard redesign. $5,000 total, 3 milestones, 6-week timeline. Client in Delaware, freelancer in Germany. IP transfer required.',
      output: {
        sections: [
          '1. Parties & Scope',
          '2. Deliverables & Milestones',
          '3. Payment Schedule (30% / 40% / 30%)',
          '4. Intellectual Property Assignment',
          '5. Confidentiality & NDA',
          '6. Warranties & Representations',
          '7. Limitation of Liability',
          '8. Termination Clauses',
          '9. Dispute Resolution (Arbitration)',
          '10. Governing Law (DE, US / Germany, EU)',
          '11. Digital Signatures',
        ],
        highlights: [
          'Jurisdiction-aware clauses (DE + US)',
          'Milestone-based escrow integration',
          'Automatic IP transfer on final payment',
          'GDPR-compliant data handling',
          'E-signature ready (DocuSign/HelloSign)',
        ],
      },
    },
  },
];

export function AIShowcaseSection() {
  const [activeFeature, setActiveFeature] = useState('parse-tz');
  const [isAnimating, setIsAnimating] = useState(false);

  const activeFeatureData = aiFeatures.find(f => f.id === activeFeature)!;

  return (
    <section className="section relative">
      {/* Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-amber/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber/3 blur-3xl animate-pulse-soft" />
      </div>

      <div className="container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" size="lg" className="mb-4 inline-flex" dot dotColor="#2DD4BF">
            <SparklesIcon className="w-4 h-4" />
            AI Assistant Platform
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-cream tracking-tight">
            Three AI Tools That <span className="text-gradient">Change Everything</span>
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Built directly into your workflow. No separate subscriptions, no context switching — just intelligence where you need it.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Feature Tabs */}
          <div className="lg:col-span-4">
            <div className="glass-card p-4 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber to-teal flex items-center justify-center">
                  <Brain className="w-6 h-6 text-obsidian" />
                </div>
                <div>
                  <p className="text-sm text-muted">Powered by</p>
                  <p className="font-semibold text-cream">FreelanceHub AI</p>
                </div>
              </div>

              <nav className="space-y-2" role="tablist" aria-label="AI Features">
                {aiFeatures.map((feature) => (
                  <button
                    key={feature.id}
                    role="tab"
                    aria-selected={activeFeature === feature.id}
                    aria-controls={`${feature.id}-panel`}
                    id={`${feature.id}-tab`}
                    onClick={() => {
                      setIsAnimating(true);
                      setActiveFeature(feature.id);
                      setTimeout(() => setIsAnimating(false), 300);
                    }}
                    className={`
                      w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-4
                      ${activeFeature === feature.id
                        ? 'bg-white/[0.05] border border-amber/30 shadow-lg shadow-amber/10'
                        : 'hover:bg-white/[0.03] border border-white/[0.06]'
                      }
                    `}
                  >
                    <div className={`
                      w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                      ${activeFeature === feature.id
                        ? `bg-${feature.accent}/20 text-${feature.accent} shadow-${feature.accent}-glow`
                        : 'bg-white/[0.03] text-muted border border-white/[0.08]'
                      }
                    `}>
                      <feature.icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`
                        font-semibold text-sm truncate transition-colors
                        ${activeFeature === feature.id ? 'text-cream' : 'text-muted'}
                      `}>
                        {feature.title}
                      </p>
                      <p className="text-xs text-muted/70 truncate mt-0.5">{feature.subtitle}</p>
                    </div>
                    {activeFeature === feature.id && (
                      <ArrowRightIcon className="w-5 h-5 text-amber flex-shrink-0" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Stats bar */}
              <div className="mt-8 pt-6 border-t border-white/[0.06] grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-amber">50K+</p>
                  <p className="text-xs text-muted">Profiles Analyzed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal">3.2x</p>
                  <p className="text-xs text-muted">Better Matches</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-cream">94%</p>
                  <p className="text-xs text-muted">Accuracy Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Demo Panel */}
          <div className="lg:col-span-8" id={`${activeFeature}-panel`} role="tabpanel" aria-labelledby={`${activeFeature}-tab`}>
            <div className={`
              glass-card p-6 lg:p-8 h-full
              ${isAnimating ? 'animate-in' : ''}
            `}>
              {/* Feature Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-xl bg-${activeFeatureData.accent}/20 flex items-center justify-center`}>
                  <activeFeatureData.icon className={`w-7 h-7 text-${activeFeatureData.accent}`} aria-hidden="true" />
                </div>
                <div>
                  <Badge variant={activeFeatureData.accent === 'amber' ? 'primary' : 'success'} size="sm" className="mb-2">
                    {activeFeatureData.accent === 'amber' ? 'Decomposition' : activeFeatureData.accent === 'teal' ? 'Matching' : 'Generation'}
                  </Badge>
                  <h3 className="text-2xl font-heading font-bold text-cream">{activeFeatureData.title}</h3>
                  <p className="text-sm text-muted mt-0.5">{activeFeatureData.subtitle}</p>
                </div>
              </div>

              {/* Demo Interface */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-cream">Input</h4>
                    <Badge variant="outline" size="sm">Natural Language</Badge>
                  </div>
                  <div className="glass-strong p-5 rounded-xl border border-white/[0.1] min-h-[200px]">
                    <p className="text-muted/70 whitespace-pre-wrap font-mono text-sm leading-relaxed">{activeFeatureData.demo.input}</p>
                  </div>
                  <Button variant="primary" className="w-full" leftIcon={<Wand2 className="w-4 h-4" />}>
                    Analyze with AI
                  </Button>
                </div>

                {/* Output */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-cream">AI Output</h4>
                    <Badge variant="outline" size="sm" className="text-teal border-teal/30">Live Preview</Badge>
                  </div>
                  <div className="glass-strong p-5 rounded-xl border border-white/[0.1] max-h-[400px] overflow-y-auto">
                    {activeFeatureData.id === 'parse-tz' && (
                      <div className="space-y-4">
                        {activeFeatureData.demo.output.map((phase, i) => (
                          <div key={i} className="space-y-2 p-4 glass-subtle rounded-xl">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-cream">{phase.phase}</span>
                              <Badge variant="secondary" size="sm">{phase.duration}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {phase.tasks.map((task, t) => (
                                <Badge key={t} variant="outline" size="sm" className="text-xs">{task}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]">
                          <div className="glass-subtle p-3 rounded-xl text-center">
                            <p className="text-xs text-muted">Required Skills</p>
                            <p className="text-sm font-medium text-cream mt-1">{activeFeatureData.demo.skills.length}</p>
                          </div>
                          <div className="glass-subtle p-3 rounded-xl text-center">
                            <p className="text-xs text-muted">Estimated Timeline</p>
                            <p className="text-sm font-medium text-amber mt-1">{activeFeatureData.demo.timeline}</p>
                          </div>
                          <div className="glass-subtle p-3 rounded-xl text-center">
                            <p className="text-xs text-muted">Budget Range</p>
                            <p className="text-sm font-medium text-teal mt-1">{activeFeatureData.demo.budget}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeFeatureData.id === 'ai-match' && (
                      <div className="space-y-3">
                        {activeFeatureData.demo.output.map((candidate, i) => (
                          <div key={i} className="glass-subtle p-4 rounded-xl border border-white/[0.06] hover:border-amber/20 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center">
                                  <Users className="w-5 h-5 text-muted" />
                                </div>
                                <div>
                                  <p className="font-medium text-cream">{candidate.name}</p>
                                  <p className="text-sm text-muted">{candidate.title}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-amber">{candidate.match}%</p>
                                <p className="text-xs text-muted">Match Score</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {candidate.skills.map((skill, s) => (
                                <Badge key={s} variant="outline" size="sm" className="text-xs">{skill}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted">{candidate.rate}</span>
                              <span className="text-teal">{candidate.availability}</span>
                              <Badge variant="primary" size="sm">{candidate.badge}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeFeatureData.id === 'smart-contract' && (
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-cream mb-3">Contract Sections</h5>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {activeFeatureData.demo.output.sections.map((section, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 glass-subtle rounded-xl">
                                <span className="w-6 h-6 rounded-full bg-amber/20 text-amber text-xs font-mono flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                <span className="text-sm text-cream">{section}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/[0.06]">
                          <h5 className="font-medium text-cream mb-3">Key Highlights</h5>
                          <div className="space-y-2">
                            {activeFeatureData.demo.output.highlights.map((highlight, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 glass-subtle rounded-xl">
                                <CheckCircleIcon className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-cream">{highlight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="mt-6 text-muted leading-relaxed">{activeFeatureData.description}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="glass-card p-8 lg:p-12 max-w-3xl mx-auto gradient-border">
            <h3 className="text-2xl sm:text-3xl font-bold text-cream mb-4">
              Ready to experience AI-powered freelancing?
            </h3>
            <p className="text-muted mb-8 max-w-xl mx-auto">
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
          </Card>
        </div>
      </div>
    </section>
  );
}