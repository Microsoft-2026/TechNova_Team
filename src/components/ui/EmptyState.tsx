import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  secondaryAction?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-slate-800/80 rounded-xl bg-slate-900/30 ${className}`}
    >
      {icon && <div className="mb-3.5 p-3 rounded-lg bg-slate-800/50 text-slate-400">{icon}</div>}
      <h4 className="text-sm font-semibold text-slate-200 tracking-tight">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5 leading-relaxed">{description}</p>
      <div className="flex items-center gap-3">
        {actionLabel && onAction && (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
};
