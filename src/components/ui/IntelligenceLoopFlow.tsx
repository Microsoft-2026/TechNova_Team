import React from 'react';
import {
  FileSearch,
  BookOpen,
  Brain,
  Sparkles,
  Compass,
  Sliders,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export type LoopStage =
  | 'UNDERSTAND'
  | 'RETRIEVE'
  | 'RECALL'
  | 'REFLECT'
  | 'RECOMMEND'
  | 'SIMULATE'
  | 'RETAIN';

interface IntelligenceLoopFlowProps {
  currentStage?: LoopStage;
  dealId?: string;
  className?: string;
  compact?: boolean;
}

export const IntelligenceLoopFlow: React.FC<IntelligenceLoopFlowProps> = ({
  currentStage,
  dealId,
  className = '',
  compact = false,
}) => {
  const steps: Array<{
    id: LoopStage;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    activeBg: string;
    route: string;
  }> = [
    {
      id: 'UNDERSTAND',
      label: 'Understand',
      description: 'Transcript intent & signals',
      icon: <FileSearch className="w-3.5 h-3.5" />,
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300',
      route: dealId ? `/deals/${dealId}?tab=transcripts` : '/upload-transcripts',
    },
    {
      id: 'RETRIEVE',
      label: 'Retrieve',
      description: 'Org knowledge RAG',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300',
      route: '/knowledge-base',
    },
    {
      id: 'RECALL',
      label: 'Recall',
      description: 'Prior deal matches',
      icon: <Brain className="w-3.5 h-3.5" />,
      color: 'text-cyan-300',
      activeBg: 'bg-cyan-950/60 border-cyan-400/40 text-cyan-200',
      route: dealId ? `/deals/${dealId}?tab=recall` : '/deal-memory?layer=recall',
    },
    {
      id: 'REFLECT',
      label: 'Reflect',
      description: 'Historical win/loss lessons',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      color: 'text-violet-400',
      activeBg: 'bg-violet-950/60 border-violet-500/40 text-violet-300',
      route: dealId ? `/deals/${dealId}?tab=reflect` : '/deal-memory?layer=reflect',
    },
    {
      id: 'RECOMMEND',
      label: 'Recommend',
      description: 'Next best action',
      icon: <Compass className="w-3.5 h-3.5" />,
      color: 'text-indigo-300',
      activeBg: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200',
      route: dealId ? `/deals/${dealId}?tab=suggestions` : '/suggestions',
    },
    {
      id: 'SIMULATE',
      label: 'Simulate',
      description: 'What-if strategic levers',
      icon: <Sliders className="w-3.5 h-3.5" />,
      color: 'text-amber-400',
      activeBg: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
      route: dealId ? `/deals/${dealId}?tab=simulation` : '/simulation',
    },
    {
      id: 'RETAIN',
      label: 'Retain',
      description: 'Closed deal memory',
      icon: <Award className="w-3.5 h-3.5" />,
      color: 'text-amber-300',
      activeBg: 'bg-amber-950/60 border-amber-400/40 text-amber-200',
      route: dealId ? `/deals/${dealId}?tab=retain` : '/deal-memory?layer=retain',
    },
  ];

  return (
    <div
      className={`border border-slate-800/80 rounded-xl bg-slate-900/60 p-3 sm:p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Deal Intelligence Loop
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Understand → Retrieve → Recall → Reflect → Recommend → Simulate → Retain
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
        {steps.map((step, idx) => {
          const isActive = currentStage === step.id;
          return (
            <React.Fragment key={step.id}>
              <Link
                to={step.route}
                className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all shrink-0 select-none ${
                  isActive
                    ? `${step.activeBg} ring-1 ring-white/10 font-semibold shadow-sm`
                    : 'border-slate-800/60 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className={isActive ? 'text-inherit' : step.color}>{step.icon}</span>
                <span className="whitespace-nowrap">{step.label}</span>
              </Link>
              {idx < steps.length - 1 && (
                <span className="text-slate-700 font-mono text-xs px-0.5 select-none shrink-0">
                  →
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
