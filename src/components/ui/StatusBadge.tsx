import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  AlertOctagon,
  Smile,
  Meh,
  Frown,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRightCircle,
} from 'lucide-react';
import { DealStage, DealStatus, RiskLevel, SentimentType } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, className = '' }) => {
  const configs = {
    LOW: {
      label: 'Low Risk',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
      text: 'text-emerald-400',
      border: 'border-emerald-500/20 bg-emerald-950/20',
    },
    MEDIUM: {
      label: 'Medium Risk',
      icon: <ShieldQuestion className="w-3.5 h-3.5 text-amber-400" />,
      text: 'text-amber-400',
      border: 'border-amber-500/20 bg-amber-950/20',
    },
    HIGH: {
      label: 'High Risk',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
      text: 'text-rose-400',
      border: 'border-rose-500/20 bg-rose-950/20',
    },
    CRITICAL: {
      label: 'Critical Risk',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-red-500" />,
      text: 'text-red-400 font-semibold',
      border: 'border-red-500/30 bg-red-950/30',
    },
  };

  const current = configs[level] || configs.LOW;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono border ${current.border} ${current.text} ${className}`}
    >
      {current.icon}
      <span>{current.label}</span>
      {score !== undefined && (
        <span className="opacity-75 text-[11px] tabular-nums">({score})</span>
      )}
    </span>
  );
};

interface StageBadgeProps {
  stage: DealStage;
  className?: string;
}

export const StageBadge: React.FC<StageBadgeProps> = ({ stage, className = '' }) => {
  const stageLabels: Record<DealStage, { label: string; text: string; border: string }> = {
    LEAD: { label: 'Lead', text: 'text-slate-300', border: 'border-slate-700 bg-slate-800/40' },
    QUALIFIED: { label: 'Qualified', text: 'text-sky-300', border: 'border-sky-500/30 bg-sky-950/20' },
    DEMO: { label: 'Demo', text: 'text-indigo-300', border: 'border-indigo-500/30 bg-indigo-950/20' },
    PROPOSAL: { label: 'Proposal', text: 'text-purple-300', border: 'border-purple-500/30 bg-purple-950/20' },
    NEGOTIATION: { label: 'Negotiation', text: 'text-amber-300', border: 'border-amber-500/30 bg-amber-950/20' },
    APPROVAL: { label: 'Approval', text: 'text-orange-300', border: 'border-orange-500/30 bg-orange-950/20' },
    WON: { label: 'Closed Won', text: 'text-emerald-400', border: 'border-emerald-500/30 bg-emerald-950/20' },
    LOST: { label: 'Closed Lost', text: 'text-rose-400', border: 'border-rose-500/30 bg-rose-950/20' },
  };

  const config = stageLabels[stage] || stageLabels.LEAD;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${config.border} ${config.text} ${className}`}
    >
      <ArrowRightCircle className="w-3 h-3 opacity-70" />
      <span>{config.label}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: DealStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const configs = {
    ACTIVE: {
      label: 'Active',
      icon: <Activity className="w-3 h-3 text-sky-400" />,
      text: 'text-sky-300',
      border: 'border-sky-500/20 bg-sky-950/20',
    },
    WON: {
      label: 'Won',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
      text: 'text-emerald-300',
      border: 'border-emerald-500/20 bg-emerald-950/20',
    },
    LOST: {
      label: 'Lost',
      icon: <XCircle className="w-3 h-3 text-rose-400" />,
      text: 'text-rose-300',
      border: 'border-rose-500/20 bg-rose-950/20',
    },
    ON_HOLD: {
      label: 'On Hold',
      icon: <Clock className="w-3 h-3 text-amber-400" />,
      text: 'text-amber-300',
      border: 'border-amber-500/20 bg-amber-950/20',
    },
  };

  const current = configs[status] || configs.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono border ${current.border} ${current.text} ${className}`}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
};

export const SentimentBadge: React.FC<{ sentiment: SentimentType; score?: number; className?: string }> = ({
  sentiment,
  score,
  className = '',
}) => {
  const configs = {
    POSITIVE: {
      label: 'Positive',
      icon: <Smile className="w-3.5 h-3.5 text-emerald-400" />,
      text: 'text-emerald-300',
      border: 'border-emerald-500/20 bg-emerald-950/20',
    },
    NEUTRAL: {
      label: 'Neutral',
      icon: <Meh className="w-3.5 h-3.5 text-slate-400" />,
      text: 'text-slate-300',
      border: 'border-slate-600/30 bg-slate-800/20',
    },
    NEGATIVE: {
      label: 'Negative',
      icon: <Frown className="w-3.5 h-3.5 text-rose-400" />,
      text: 'text-rose-300',
      border: 'border-rose-500/20 bg-rose-950/20',
    },
    MIXED: {
      label: 'Mixed Signals',
      icon: <Activity className="w-3.5 h-3.5 text-amber-400" />,
      text: 'text-amber-300',
      border: 'border-amber-500/20 bg-amber-950/20',
    },
  };

  const current = configs[sentiment] || configs.NEUTRAL;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono border ${current.border} ${current.text} ${className}`}
    >
      {current.icon}
      <span>{current.label}</span>
      {score !== undefined && <span className="opacity-75 tabular-nums">({score})</span>}
    </span>
  );
};
