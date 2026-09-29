import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  Award,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Briefcase,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IntelligenceBadge } from '../../components/ui/IntelligenceBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  useDeals,
  useDealRecall,
  useDealReflect,
} from '../../hooks/useIntelligenceApi';

export const DealMemoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeLayer = searchParams.get('layer') || 'recall';
  const dealId = searchParams.get('dealId') || '';
  const navigate = useNavigate();

  const { data: dealsData } = useDeals();
  const deals = dealsData?.deals || [];

  const selectedDealId = dealId || (deals.length > 0 ? deals[0].id : '');
  const selectedDeal = deals.find((d) => d.id === selectedDealId);

  const {
    data: recallData,
    isLoading: recallLoading,
    isError: recallError,
    error: recallErr,
    refetch: refetchRecall,
  } = useDealRecall(selectedDealId);

  const {
    data: reflectData,
    isLoading: reflectLoading,
    isError: reflectError,
    error: reflectErr,
    refetch: refetchReflect,
  } = useDealReflect(selectedDealId);

  const setLayer = (layer: string) => {
    setSearchParams({ layer, dealId: selectedDealId });
  };

  const setDeal = (id: string) => {
    setSearchParams({ layer: activeLayer, dealId: id });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
              Institutional Deal Memory
            </h1>
            <IntelligenceBadge source="FROM_MEMORY" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical deal recall, cross-cycle reflection, and retained organizational sales lessons.
          </p>
        </div>

        {selectedDealId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchRecall();
              refetchReflect();
            }}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Refresh Memory Synthesizer
          </Button>
        )}
      </div>

      {/* Visual Memory Flow Pipeline */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0e1424] space-y-3">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span>Memory Architecture</span>
          <span className="text-slate-600">·</span>
          <span>Current Opportunity → Recall Precedents → Reflect Outcomes → Retained Lessons</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 shrink-0">
            {selectedDeal ? selectedDeal.client : 'Select Deal'}
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
          <button
            onClick={() => setLayer('recall')}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-colors shrink-0 ${
              activeLayer === 'recall'
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            1. RECALL (Similar Historical Deals)
          </button>
          <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
          <button
            onClick={() => setLayer('reflect')}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-colors shrink-0 ${
              activeLayer === 'reflect'
                ? 'bg-violet-950/60 border-violet-500/50 text-violet-200 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            2. REFLECT (Why Did They Win/Lose?)
          </button>
          <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
          <button
            onClick={() => setLayer('retain')}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-colors shrink-0 ${
              activeLayer === 'retain'
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-200 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            3. RETAIN (Institutional Wisdom)
          </button>
        </div>
      </div>

      {/* Deal Context Switcher */}
      <div className="flex items-center gap-3 overflow-x-auto p-3 rounded-xl bg-slate-900/60 border border-slate-800 scrollbar-none">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider shrink-0 pl-1">
          Active Deal Context:
        </span>
        {deals.length === 0 ? (
          <span className="text-xs text-slate-400 font-mono">No deals found on backend.</span>
        ) : (
          deals.map((d) => (
            <button
              key={d.id}
              onClick={() => setDeal(d.id)}
              className={`px-3 py-1 rounded-lg border text-xs font-mono transition-colors shrink-0 ${
                d.id === selectedDealId
                  ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200 font-medium'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {d.client} (₹{((d.value || 0) / 1000).toFixed(0)}k)
            </button>
          ))
        )}
      </div>

      {/* Layer 1: RECALL */}
      {activeLayer === 'recall' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                Layer 1: Previous Deal Recall
              </h2>
              <p className="text-xs text-slate-400">
                "Have we seen a deal like this before?" Vector search over historical deal memory.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/30">
              RECALL ENGINE
            </span>
          </div>

          {recallLoading && <CardSkeleton count={3} />}
          {recallError && (
            <ErrorState
              title="Unable to recall similar historical deals"
              error={recallErr}
              onRetry={() => refetchRecall()}
            />
          )}

          {!recallLoading && !recallError && (!recallData || !recallData.similarDeals || recallData.similarDeals.length === 0) && (
            <EmptyState
              icon={<Brain className="w-6 h-6 text-cyan-400" />}
              title="No Historical Precedents Matched"
              description="No historical deals in the database matched this opportunity cluster closely enough."
              actionLabel="Try Another Deal"
              onAction={() => {}}
            />
          )}

          {recallData && (
            <div className="space-y-6">
              {recallData.patternSynthesis && (
                <Card className="p-5 border-cyan-900/30 bg-cyan-950/10">
                  <CardHeader
                    title="Cross-Deal Pattern Synthesis"
                    subtitle="Identified semantic correlations across historical evaluations."
                    badge={<IntelligenceBadge source="FROM_MEMORY" />}
                  />
                  <p className="text-xs text-slate-200 leading-relaxed font-mono">
                    {recallData.patternSynthesis}
                  </p>
                </Card>
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                  Semantically Matched Precedent Deals
                </h3>

                {recallData.similarDeals?.map((deal) => (
                  <Card key={deal.dealId} className="p-5 space-y-4 border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-sm text-slate-100">{deal.client}</span>
                          <span
                            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                              deal.outcome === 'WON'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            OUTCOME: {deal.outcome}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Deal ID: {deal.dealId} · Industry: {deal.industry} · Value: ₹{(deal.value || 0).toLocaleString()} · Closed: {deal.closedDate}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/40 tabular-nums">
                          {deal.similarityScore}% Match
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-emerald-400 font-semibold font-mono text-[11px] block">
                          Tactical Strategy Deployed
                        </span>
                        <p className="text-slate-300 leading-relaxed">{deal.finalStrategyUsed}</p>
                      </div>

                      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-amber-400 font-semibold font-mono text-[11px] block">
                          Retained Institutional Lesson
                        </span>
                        <p className="text-slate-300 leading-relaxed">{deal.relevantLessons}</p>
                      </div>
                    </div>

                    {deal.matchingFactors && deal.matchingFactors.length > 0 && (
                      <div className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-slate-500">Matching Dimensions:</span>
                        {deal.matchingFactors.map((factor, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                            {factor}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Layer 2: REFLECT */}
      {activeLayer === 'reflect' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                Layer 2: Reflective Outcome Analysis
              </h2>
              <p className="text-xs text-slate-400">
                "What did those deals teach us?" Deconstructing why matched opportunities succeeded or failed.
              </p>
            </div>
            <span className="text-xs font-mono text-violet-300 bg-violet-950/40 px-2.5 py-1 rounded border border-violet-500/30">
              REFLECT ENGINE
            </span>
          </div>

          {reflectLoading && <CardSkeleton count={3} />}
          {reflectError && (
            <ErrorState
              title="Unable to load reflective synthesis"
              error={reflectErr}
              onRetry={() => refetchReflect()}
            />
          )}

          {!reflectLoading && !reflectError && !reflectData && (
            <EmptyState
              icon={<Sparkles className="w-6 h-6 text-violet-400" />}
              title="No Reflection Generated"
              description="Click to synthesize reflective learnings from historical wins and losses in this deal's cluster."
              actionLabel="Run Reflection"
              onAction={() => refetchReflect()}
            />
          )}

          {reflectData && (
            <div className="space-y-6">
              <Card className="p-5 border-violet-900/30 bg-violet-950/10 space-y-3">
                <CardHeader
                  title="Reflective Synthesis"
                  badge={<IntelligenceBadge source="FROM_MEMORY" />}
                />
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  {reflectData.reflectionSummary}
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-300 pt-2 border-t border-slate-800">
                  <span>Historical Cluster Win Rate:</span>
                  <span className="font-semibold text-emerald-400 text-sm tabular-nums">
                    {reflectData.historicalWinRateInCluster}%
                  </span>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader
                    title="Key Drivers Behind Historical Wins"
                    badge={<span className="text-emerald-400 text-xs font-mono font-bold">WON</span>}
                  />
                  <ul className="space-y-2.5 text-xs text-slate-300 list-disc list-inside">
                    {reflectData.winningFactors?.map((f, i) => (
                      <li key={i} className="leading-relaxed">{f}</li>
                    ))}
                  </ul>
                </Card>

                <Card>
                  <CardHeader
                    title="Fatal Hurdles in Historical Losses"
                    badge={<span className="text-rose-400 text-xs font-mono font-bold">LOST</span>}
                  />
                  <ul className="space-y-2.5 text-xs text-slate-300 list-disc list-inside">
                    {reflectData.losingFactors?.map((f, i) => (
                      <li key={i} className="leading-relaxed text-rose-300/90">{f}</li>
                    ))}
                  </ul>
                </Card>
              </div>

              {reflectData.tacticalAdvice && reflectData.tacticalAdvice.length > 0 && (
                <Card>
                  <CardHeader
                    title="Actionable Tactics for Current Evaluation"
                    subtitle="Specific steps proven to overcome observed hurdles in this cluster."
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reflectData.tacticalAdvice.map((adv, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                        <span className="font-semibold text-indigo-300">{adv.title}</span>
                        <p className="text-slate-300 leading-relaxed">{adv.advice}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Layer 3: RETAIN */}
      {activeLayer === 'retain' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                Layer 3: Retained Organizational Memory
              </h2>
              <p className="text-xs text-slate-400">
                "What should the organization remember?" Institutional takeaways captured from closed evaluations.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-500/30">
              RETAIN ENGINE
            </span>
          </div>

          <Card className="p-6">
            <CardHeader
              title="Continuous Knowledge Retention"
              subtitle="Every time an Account Executive closes a deal, the post-decision factors are indexed here."
            />
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                Organizational sales wisdom typically leaves when top performers depart. Deal Intelligence Agent preserves this knowledge as structured, queryable vectors.
              </p>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <span className="text-amber-400 font-mono font-semibold uppercase text-[11px] block">
                  How Retained Lessons Are Applied
                </span>
                <p className="text-slate-300">
                  When a future deal reaches the proposal stage with similar competitors or objections, these retained takeaways appear as instant tactical recommendations.
                </p>
              </div>

              {selectedDeal && selectedDeal.status === 'ACTIVE' && (
                <div className="pt-2">
                  <Button
                    variant="amber"
                    size="sm"
                    onClick={() => navigate(`/deals/${selectedDeal.id}?tab=outcome`)}
                  >
                    Close Deal & Record Institutional Lesson for {selectedDeal.client}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
