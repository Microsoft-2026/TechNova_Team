import React, { useState } from 'react';
import {
  Compass,
  Check,
  X,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Quote,
  Brain,
  Filter,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IntelligenceBadge } from '../../components/ui/IntelligenceBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  useSuggestions,
  useApplySuggestion,
  useDismissSuggestion,
  useDeals,
} from '../../hooks/useIntelligenceApi';
import { Suggestion } from '../../types';

export const SuggestionsPage: React.FC = () => {
  const [dealFilter, setDealFilter] = useState<string>('ALL');
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: dealsData } = useDeals();
  const deals = dealsData?.deals || [];

  const { data, isLoading, isError, error, refetch } = useSuggestions(
    dealFilter !== 'ALL' ? dealFilter : undefined
  );

  const applyMutation = useApplySuggestion();
  const dismissMutation = useDismissSuggestion();

  const suggestions = data?.suggestions || [];

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApply = async (id: string) => {
    setErrorMessage(null);
    try {
      await applyMutation.mutateAsync(id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to apply suggestion');
    }
  };

  const handleDismiss = async (id: string) => {
    setErrorMessage(null);
    try {
      await dismissMutation.mutateAsync(id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dismiss suggestion');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {errorMessage && (
        <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 text-xs flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-slate-400 hover:text-slate-200 ml-2">✕</button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
              Next-Best-Action Recommendations
            </h1>
            <IntelligenceBadge source="AI_INSIGHT" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic, explainable guidance backed by conversation grounding and historical precedents.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          className="text-xs"
        >
          Refresh Guidance
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Filter by Deal:
          </span>
          <select
            value={dealFilter}
            onChange={(e) => setDealFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Active Deals</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.client} (₹{((d.value || 0) / 1000).toFixed(0)}k)
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-mono text-slate-400 tabular-nums">
          {suggestions.length} recommendations active
        </span>
      </Card>

      {/* Content */}
      {isLoading && <CardSkeleton count={3} />}

      {isError && (
        <ErrorState
          title="Unable to load next-best-action recommendations"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && suggestions.length === 0 && (
        <EmptyState
          icon={<Compass className="w-6 h-6 text-indigo-400" />}
          title="No Active Suggestions"
          description="The intelligence agent has evaluated current pipeline signals and found no urgent interventions required."
          actionLabel="View Dashboard"
          onAction={() => (window.location.href = '/dashboard')}
        />
      )}

      {!isLoading && !isError && suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map((sug) => {
            const isExpanded = expandedMap[sug.id] !== false; // default open
            return (
              <Card
                key={sug.id}
                className="p-5 border-slate-800 hover:border-slate-700/80 transition-colors space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <IntelligenceBadge source="AI_INSIGHT" />
                      <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20">
                        {sug.actionType?.replace('_', ' ')}
                      </span>
                      {sug.priority && (
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                            sug.priority === 'URGENT'
                              ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {sug.priority}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-slate-100">{sug.title}</h3>
                    {sug.clientName && (
                      <p className="text-xs text-slate-400 font-mono">
                        Target Deal: <span className="text-slate-200">{sug.clientName}</span> (ID: {sug.dealId})
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDismiss(sug.id)}
                      isLoading={dismissMutation.isPending}
                      leftIcon={<X className="w-3.5 h-3.5 text-rose-400" />}
                      className="text-xs text-slate-400 hover:text-rose-300"
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApply(sug.id)}
                      isLoading={applyMutation.isPending}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Apply Action
                    </Button>
                  </div>
                </div>

                {/* Recommended Action Body */}
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-medium">
                  {sug.description}
                </div>

                {/* Expandable Explainability Accordion */}
                <div className="pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => toggleExpand(sug.id)}
                    className="flex items-center justify-between w-full text-xs font-mono text-indigo-400 hover:text-indigo-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Hide Explainability & Evidence' : 'Why this recommendation? (Explainability & Grounding)'}</span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 text-xs">
                      {/* Why */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-violet-400 uppercase tracking-wider font-semibold">
                          Reasoning & Context (Why?)
                        </span>
                        <p className="text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
                          {sug.why}
                        </p>
                      </div>

                      {/* Evidence */}
                      {sug.evidence && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                            <Quote className="w-3 h-3" /> Grounded Evidence Quote
                          </span>
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 italic">
                            "{sug.evidence}"
                          </div>
                        </div>
                      )}

                      {/* Similar Deals */}
                      {sug.similarDeals && sug.similarDeals.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                            <Brain className="w-3 h-3" /> Precedent Deal Successes
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {sug.similarDeals.map((sim) => (
                              <div
                                key={sim.dealId}
                                className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                              >
                                <span className="font-semibold text-slate-200">{sim.client}</span>
                                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  {sim.outcome}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
