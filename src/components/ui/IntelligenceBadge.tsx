import React from 'react';
import { Sparkles, Brain, Database, BookOpen, AlertTriangle } from 'lucide-react';
import { SourceType } from '../../types';

interface IntelligenceBadgeProps {
  source: SourceType | 'SIMULATION_ESTIMATE';
  className?: string;
  size?: 'sm' | 'md';
}

export const IntelligenceBadge: React.FC<IntelligenceBadgeProps> = ({
  source,
  className = '',
  size = 'sm',
}) => {
  const configs = {
    AI_INSIGHT: {
      label: 'AI INSIGHT',
      icon: <Sparkles className="w-3 h-3 text-violet-400" />,
      textColor: 'text-violet-300',
      border: 'border-violet-500/20 bg-violet-950/20',
    },
    FROM_MEMORY: {
      label: 'FROM MEMORY',
      icon: <Brain className="w-3 h-3 text-amber-400" />,
      textColor: 'text-amber-300',
      border: 'border-amber-500/20 bg-amber-950/20',
    },
    FROM_CRM: {
      label: 'FROM CRM',
      icon: <Database className="w-3 h-3 text-indigo-400" />,
      textColor: 'text-indigo-300',
      border: 'border-indigo-500/20 bg-indigo-950/20',
    },
    FROM_KNOWLEDGE_BASE: {
      label: 'FROM KNOWLEDGE BASE',
      icon: <BookOpen className="w-3 h-3 text-cyan-400" />,
      textColor: 'text-cyan-300',
      border: 'border-cyan-500/20 bg-cyan-950/20',
    },
    SIMULATION_ESTIMATE: {
      label: 'ESTIMATE · HISTORICAL PATTERNS',
      icon: <AlertTriangle className="w-3 h-3 text-amber-400" />,
      textColor: 'text-amber-300',
      border: 'border-amber-500/20 bg-amber-950/20',
    },
  };

  const current = configs[source] || configs.AI_INSIGHT;
  const textSize = size === 'sm' ? 'text-[11px] py-0.5 px-2' : 'text-xs py-1 px-2.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono font-medium tracking-wide uppercase border ${current.border} ${current.textColor} ${textSize} ${className}`}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
};
