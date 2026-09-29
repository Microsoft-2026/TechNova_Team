import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  Sliders,
  FileSearch,
  BookOpen,
  Compass,
  Award,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      name: 'Understand',
      desc: 'Deep linguistic and behavioral analysis of call transcripts, emails, and customer communications to extract real intent and unspoken objections.',
      icon: <FileSearch className="w-5 h-5 text-indigo-400" />,
      tag: 'TRANSCRIPT INTELLIGENCE',
      color: 'border-indigo-500/30 bg-indigo-950/20',
    },
    {
      step: '02',
      name: 'Retrieve',
      desc: 'Retrieval-augmented grounding across sales playbooks, technical documentation, security policies, and battlecards.',
      icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
      tag: 'ORGANIZATIONAL RAG',
      color: 'border-cyan-500/30 bg-cyan-950/20',
    },
    {
      step: '03',
      name: 'Recall',
      desc: 'Semantic vector similarity over every completed deal in company history to answer: "Have we seen a customer encounter this hurdle before?"',
      icon: <Brain className="w-5 h-5 text-cyan-300" />,
      tag: 'PREVIOUS DEAL RECALL',
      color: 'border-cyan-400/30 bg-cyan-950/20',
    },
    {
      step: '04',
      name: 'Reflect',
      desc: 'Synthesis of historical win/loss patterns from matched deal clusters to distill concrete tactical insights and fatal risk vectors.',
      icon: <Sparkles className="w-5 h-5 text-violet-400" />,
      tag: 'HISTORICAL REFLECTION',
      color: 'border-violet-500/30 bg-violet-950/20',
    },
    {
      step: '05',
      name: 'Recommend',
      desc: 'Deterministic next-best-action guidance complete with supporting evidence quotes, reasoning, and linked precedent deals.',
      icon: <Compass className="w-5 h-5 text-indigo-300" />,
      tag: 'EXPLAINABLE GUIDANCE',
      color: 'border-indigo-500/30 bg-indigo-950/20',
    },
    {
      step: '06',
      name: 'Simulate',
      desc: 'Interactive what-if strategic modeling across pricing discounts, contract duration, and packaging to project win probability shifts.',
      icon: <Sliders className="w-5 h-5 text-amber-400" />,
      tag: 'STRATEGIC WHAT-IF',
      color: 'border-amber-500/30 bg-amber-950/20',
    },
    {
      step: '07',
      name: 'Retain',
      desc: 'Post-close structured reflection embedding institutional memory into future deal evaluations so the organization never forgets a lesson.',
      icon: <Award className="w-5 h-5 text-amber-300" />,
      tag: 'INSTITUTIONAL MEMORY',
      color: 'border-amber-400/30 bg-amber-950/20',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Bar Contract: 3 zones */}
      <header className="h-16 border-b border-slate-800/80 bg-[#0d121f]/90 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        {/* Zone 1: Single text element wordmark */}
        <Link to="/" className="text-base font-display font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            DIA
          </span>
          <span>Deal Intelligence Agent</span>
        </Link>

        {/* Zone 2: Clean unboxed navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-slate-400">
          <a href="#loop" className="hover:text-slate-100 transition-colors">Intelligence Loop</a>
          <a href="#differentiators" className="hover:text-slate-100 transition-colors">Core Architecture</a>
          <a href="#pipeline" className="hover:text-slate-100 transition-colors">Strategic Simulation</a>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-xs">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" className="text-xs">
              Create Account
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 pt-20 pb-24 max-w-6xl mx-auto w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/30 text-indigo-300 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>The Next-Generation Sales Intelligence Layer</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight" style={{ textWrap: 'balance' }}>
          Your CRM stores the deal. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Your intelligence layer understands the deal.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Transform unstructured customer conversations, historical win/loss data, and organizational knowledge into grounded next-best actions, predictive risk signals, and what-if simulations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/dashboard">
            <Button variant="intelligence" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Intelligence Command Center
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="lg">
              Get Started
            </Button>
          </Link>
        </div>

        {/* High-level system proof architecture bar */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
            <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider">Foundation</span>
            <p className="text-sm font-semibold text-slate-200">Grounded in Raw Truth</p>
            <p className="text-xs text-slate-400">Pulls directly from live calls, transcripts, and CRM state.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">Memory</span>
            <p className="text-sm font-semibold text-slate-200">Historical Deal Recall</p>
            <p className="text-xs text-slate-400">Instantly compares against similar past wins and losses.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
            <span className="text-[11px] font-mono text-violet-400 uppercase tracking-wider">Explainability</span>
            <p className="text-sm font-semibold text-slate-200">Transparent Reasoning</p>
            <p className="text-xs text-slate-400">Every suggestion references exact quotes and precedents.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">Strategy</span>
            <p className="text-sm font-semibold text-slate-200">What-If Simulation</p>
            <p className="text-xs text-slate-400">Test discount and terms impact before submitting proposals.</p>
          </div>
        </div>
      </section>

      {/* The Core Intelligence Loop Section */}
      <section id="loop" className="px-6 md:px-12 py-20 border-t border-slate-800/80 bg-[#0d121f]/50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">
              The Closed-Loop Intelligence Architecture
            </span>
            <h2 className="text-3xl font-display font-bold text-slate-100 tracking-tight">
              From Raw Transcript to Retained Memory
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sales intelligence is not a one-way analysis. It is an evolving loop where every deal teaches the organization how to win the next one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map((item) => (
              <div
                key={item.step}
                className={`p-5 rounded-xl border ${item.color} space-y-3 transition-transform duration-150 hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold opacity-60 text-slate-400">{item.step}</span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300">
                      {item.tag}
                    </span>
                  </div>
                  {item.icon}
                </div>
                <h3 className="text-base font-display font-semibold text-slate-100">{item.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Differentiators Section */}
      <section id="differentiators" className="px-6 md:px-12 py-20 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Technical Rigor & Explainability
            </span>
            <h2 className="text-3xl font-display font-bold text-slate-100 tracking-tight">
              Why Deal Intelligence Agent Stands Apart
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Designed specifically for complex B2B sales cycles where generic CRM fields fail to capture buyer sentiment and risk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">Zero Black-Box Recommendations</h3>
                  <p className="text-xs text-slate-400 font-mono">Explainable AI with transcript citations</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every suggestion, risk signal, and recommended action comes with direct speaker quotes, timestamps, and confidence factors. Enterprise reps never execute an action without understanding the concrete evidence.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400 space-y-1">
                <span className="text-violet-400 block font-semibold">Evidence Attribution</span>
                <p className="text-slate-300 italic">"We need HIPAA compliance by Q3 or we cannot approve the contract." — VP Engineering (Minute 18:24)</p>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">Continuous Institutional Learning</h3>
                  <p className="text-xs text-slate-400 font-mono">Retained lessons across deal cycles</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When a deal closes—whether won or lost—the agent prompts structured reflection. When a new rep faces an identical competitor or objection six months later, the winning play is surfaced immediately.
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400 space-y-1">
                <span className="text-amber-400 block font-semibold">Retained Memory Extract</span>
                <p className="text-slate-300">Competitor X matched on price, but providing a dedicated technical architect accelerated close by 3 weeks.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#0d121f] px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              DIA
            </span>
            <span className="text-sm font-semibold text-slate-200">Deal Intelligence Agent</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-500">Autonomous Enterprise Sales Intelligence Layer</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <Link to="/login" className="hover:text-slate-200">Sign In</Link>
            <span>/</span>
            <Link to="/register" className="hover:text-slate-200">Register</Link>
            <span>/</span>
            <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300">Enter Command Center →</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
