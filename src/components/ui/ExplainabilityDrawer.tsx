import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Quote, Brain, ExternalLink } from 'lucide-react';
import { IntelligenceBadge } from './IntelligenceBadge';
import { EvidenceReference } from '../../types';

interface ExplainabilityPanelProps {
  title: string;
  recommendation?: string;
  why: string;
  evidence?: string | EvidenceReference[];
  similarDeals?: Array<{ dealId: string; client: string; outcome: string }>;
  source?: 'AI_INSIGHT' | 'FROM_MEMORY' | 'FROM_CRM' | 'FROM_KNOWLEDGE_BASE';
  className?: string;
  defaultExpanded?: boolean;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  title,
  recommendation,
  why,
  evidence,
  similarDeals,
  source = 'AI_INSIGHT',
  className = '',
  defaultExpanded = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <div
      className={`border rounded-xl transition-all duration-150 ${
        isOpen
          ? 'bg-slate-900/90 border-slate-700/80 shadow-md shadow-black/40'
          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/60'
      } ${className}`}
    >
      <div
        className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <IntelligenceBadge source={source} />
            <span className="text-sm font-semibold text-slate-100">{title}</span>
          </div>
          {recommendation && (
            <p className="text-xs text-slate-300 font-medium">
              Action: <span className="text-indigo-300">{recommendation}</span>
            </p>
          )}
        </div>

        <button
          type="button"
          className="flex items-center gap-1 text-xs font-mono text-indigo-400 hover:text-indigo-300 py-1 px-2 rounded bg-indigo-950/40 border border-indigo-500/20 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <span>{isOpen ? 'Hide Evidence' : 'Why? / Evidence'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3.5 text-xs text-slate-300">
          {/* Why Section */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-violet-400 font-semibold tracking-wide uppercase text-[11px]">
              <Sparkles className="w-3 h-3" />
              <span>Reasoning & Context</span>
            </div>
            <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
              {why}
            </p>
          </div>

          {/* Evidence Section */}
          {evidence && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold tracking-wide uppercase text-[11px]">
                <Quote className="w-3 h-3" />
                <span>Supporting Evidence from Grounding Sources</span>
              </div>
              {typeof evidence === 'string' ? (
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60 font-mono text-slate-300 text-[11px] leading-relaxed">
                  "{evidence}"
                </div>
              ) : (
                <div className="space-y-2">
                  {evidence.map((ref, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/60 space-y-1 font-mono text-[11px]"
                    >
                      <p className="text-slate-200 italic">"{ref.quote}"</p>
                      <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                        {ref.speaker && <span>Speaker: {ref.speaker}</span>}
                        {ref.timestampOrLine && <span>· Location: {ref.timestampOrLine}</span>}
                        {ref.context && <span>· {ref.context}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Similar Deals Section */}
          {similarDeals && similarDeals.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold tracking-wide uppercase text-[11px]">
                <Brain className="w-3 h-3" />
                <span>Historical Deal Precedents (Memory Recall)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {similarDeals.map((deal) => (
                  <div
                    key={deal.dealId}
                    className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/60 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{deal.client}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Deal ID: {deal.dealId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          deal.outcome === 'WON'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {deal.outcome}
                      </span>
                      <a
                        href={`/deals/${deal.dealId}`}
                        className="text-slate-400 hover:text-indigo-400"
                        title="View deal"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
