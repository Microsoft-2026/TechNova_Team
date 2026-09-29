import React from 'react';
import { CheckCircle2, Clock, AlertOctagon, AlertTriangle, Layers } from 'lucide-react';
import { ModelStatus } from '../../types';

interface ModelStatusBadgeProps {
  status?: ModelStatus | string;
  version?: string;
  showVersion?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ModelStatusBadge: React.FC<ModelStatusBadgeProps> = ({
  status = 'MODEL_READY',
  version,
  showVersion = true,
  className = '',
  onClick,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'MODEL_READY':
        return {
          label: 'Model Ready',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
          classes: 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300',
        };
      case 'MODEL_TRAINING':
        return {
          label: 'Model Training',
          icon: <Clock className="w-3 h-3 text-amber-400 animate-spin" />,
          classes: 'bg-amber-950/50 border-amber-800/60 text-amber-300',
        };
      case 'INSUFFICIENT_DATA':
        return {
          label: 'Insufficient Data',
          icon: <AlertTriangle className="w-3 h-3 text-amber-400" />,
          classes: 'bg-amber-950/50 border-amber-800/60 text-amber-300',
        };
      case 'MODEL_UNAVAILABLE':
        return {
          label: 'Model Unavailable',
          icon: <AlertOctagon className="w-3 h-3 text-slate-400" />,
          classes: 'bg-slate-900 border-slate-700 text-slate-400',
        };
      case 'MODEL_ERROR':
      default:
        return {
          label: 'Model Error',
          icon: <AlertOctagon className="w-3 h-3 text-rose-400" />,
          classes: 'bg-rose-950/50 border-rose-800/60 text-rose-300',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono select-none ${config.classes} ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      } ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
      {showVersion && version && (
        <>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 text-[10px]">v{version}</span>
        </>
      )}
    </div>
  );
};
