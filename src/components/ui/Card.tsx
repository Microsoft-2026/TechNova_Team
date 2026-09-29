import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'interactive' | 'glow';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: 'bg-[#111827]/90 border border-slate-800/80 shadow-sm shadow-black/20',
    subtle: 'bg-[#0F172A]/70 border border-slate-800/50',
    interactive:
      'bg-[#111827]/90 border border-slate-800/80 hover:border-indigo-500/40 transition-colors duration-150 cursor-pointer shadow-sm hover:shadow-indigo-950/20',
    glow: 'bg-[#111827]/90 border border-indigo-500/30 shadow-md shadow-indigo-950/30',
  };

  return (
    <div
      className={`rounded-xl p-5 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, badge, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 pb-4 border-b border-slate-800/60 mb-4 ${className}`}>
    <div>
      <div className="flex items-center gap-2.5">
        <h3 className="font-display font-semibold text-slate-100 text-base tracking-tight">{title}</h3>
        {badge}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
