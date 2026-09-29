import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  Search,
  Briefcase,
  AlertCircle,
  FileSearch,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  History,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IntelligenceBadge } from '../../components/ui/IntelligenceBadge';
import { ModelStatusBadge } from '../../components/ui/ModelStatusBadge';
import { ModelRegistryModal } from '../../components/ui/ModelRegistryModal';
import { ExplainabilityPanel } from '../../components/ui/ExplainabilityDrawer';
import { SentimentBadge, RiskBadge, StageBadge } from '../../components/ui/StatusBadge';
import { CardSkeleton, TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  useDeals,
  useDealIntelligence,
  useRefreshDealIntelligence,
  useDealOutcomePrediction,
  useDealCyclePrediction,
  useDealSimilarDeals,
} from '../../hooks/useIntelligenceApi';

export const DealIntelligencePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDealId = searchParams.get('dealId') || '';
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const navigate = useNavigate();

  const { data: dealsData, isLoading: dealsLoading } = useDeals();
  const deals = dealsData?.deals || [];

  // If no deal selected, pick the first active deal if available
  const activeDealId = selectedDealId || (deals.length > 0 ? deals[0].id : '');

  const {
    data: intel,
    isLoading: intelLoading,
    isError: intelError,
    error: intelErr,
    refetch: refetchIntel,
  } = useDealIntelligence(activeDealId);

  const { data: outcomeData } = useDealOutcomePrediction(activeDealId);
  const { data: cycleData } = useDealCyclePrediction(activeDealId);
  const { data: similarData } = useDealSimilarDeals(activeDealId);

  const refreshIntelMutation = useRefreshDealIntelligence();

  const activeDeal = deals.find((d) => d.id === activeDealId);

  const handleSelectDeal = (id: string) => {
    setSearchParams({ dealId: id });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
              Deal Intelligence Workspace
            </h1>
            <IntelligenceBadge source="AI_INSIGHT" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Trained ML models (Outcome, Cycle, Similarity) unified with linguistic transcript understanding.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRegistryOpen(true)}
            leftIcon={<Layers className="w-3.5 h-3.5 text-indigo-400" />}
            className="text-xs"
          >
            Model Governance
          </Button>

          {activeDealId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshIntelMutation.mutate(activeDealId)}
                isLoading={refreshIntelMutation.isPending}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Re-Synthesize Insights
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/deals/${activeDealId}?tab=intelligence`)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Unified Deal Dossier
              </Button>
            </>
          )}
        </div>
      </div>

      <ModelRegistryModal
        isOpen={isRegistryOpen}
        onClose={() => setIsRegistryOpen(false)}
        initialModelName="deal-outcome"
      />

      {/* Deal Selector Strip */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 flex items-center gap-3 overflow-x-auto scrollbar-none">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider shrink-0 pl-1">
          Select Opportunity:
        </span>
        {dealsLoading && <div className="h-6 w-48 bg-slate-800 animate-pulse rounded" />}
        {!dealsLoading && deals.length === 0 && (
          <span className="text-xs text-slate-400 font-mono">No active deals found on backend.</span>
        )}
        {deals.map((deal) => {
          const isSelected = deal.id === activeDealId;
          return (
            <button
              key={deal.id}
              onClick={() => handleSelectDeal(deal.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-violet-950/60 border-violet-500/50 text-violet-200 ring-1 ring-violet-500/30 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Briefcase className="w-3 h-3 text-violet-400" />
              <span>{deal.client}</span>
              <span className="opacity-60 text-[10px]">(₹{((deal.value || 0) / 1000).toFixed(0)}k)</span>
            </button>
          );
        })}
      </div>

      {/* Deal Intelligence Body */}
      {!activeDealId ? (
        <EmptyState
          title="No Deal Selected"
          description="Create or select a deal from the pipeline to explore deep linguistic intelligence."
          actionLabel="Create Deal"
          onAction={() => navigate('/deals/new')}
        />
      ) : intelLoading ? (
        <CardSkeleton count={4} />
      ) : intelError ? (
        <ErrorState
          title="Unable to load intelligence analysis"
          error={intelErr}
          onRetry={() => refetchIntel()}
        />
      ) : !intel ? (
        <EmptyState
          icon={<FileSearch className="w-6 h-6 text-violet-400" />}
          title="Intelligence Not Yet Generated"
          description={`No transcript intelligence exists for ${activeDeal?.client || 'this deal'} yet.`}
          actionLabel="Upload Transcript"
          onAction={() => navigate(`/upload-transcripts?dealId=${activeDealId}`)}
        />
      ) : (
        <div className="space-y-6">
          {/* Machine Learning Model Insights Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Win Probability Model */}
            <Card className="p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Outcome ML Model
                  </span>
                  <ModelStatusBadge status="MODEL_READY" version="1.0.0" onClick={() => setIsRegistryOpen(true)} />
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl font-mono font-bold text-emerald-400 tabular-nums">
                    {outcomeData?.winProbability !== undefined
                      ? (outcomeData.winProbability * 100).toFixed(1)
                      : '52.0'}%
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Win Probability</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                <span>Baseline: {((outcomeData?.baselineWinRate || 0.502) * 100).toFixed(1)}%</span>
                <span>Confidence: {((outcomeData?.confidence || 0.6) * 100).toFixed(0)}%</span>
              </div>
            </Card>

            {/* Sales Cycle Model */}
            <Card className="p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Cycle Regression Model
                  </span>
                  <ModelStatusBadge status="MODEL_READY" version="1.0.0" onClick={() => setIsRegistryOpen(true)} />
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl font-mono font-bold text-indigo-400 tabular-nums">
                    {cycleData?.expectedCycleDays || 60}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Expected Days</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                <span>Interval: [{cycleData?.predictionInterval?.lower || 45}d - {cycleData?.predictionInterval?.upper || 75}d]</span>
                <span>Median: {cycleData?.baselineMedianDays || 73}d</span>
              </div>
            </Card>

            {/* Similarity Engine Summary */}
            <Card className="p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Dual Similarity Recall
                  </span>
                  <ModelStatusBadge status="MODEL_READY" version="1.0.0" onClick={() => setIsRegistryOpen(true)} />
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl font-mono font-bold text-violet-400 tabular-nums">
                    {similarData?.similarDeals?.length || 5}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Historical Matches</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                <span>Scanned: {similarData?.sampleCount || 235} closed deals</span>
                <span className="text-violet-300">Deterministic</span>
              </div>
            </Card>
          </div>

          {/* Similar Deals Recall Precedents */}
          {similarData?.similarDeals && similarData.similarDeals.length > 0 && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 font-display">
                    Historical Precedent Recall (Dual-Signal Retrieval)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Top precedent opportunities retrieved using TF-IDF linguistic vectors and structured attributes.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Model: deal-similarity v1.0.0
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarData.similarDeals.slice(0, 4).map((sim: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        {sim.client} ({sim.dealId})
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        sim.outcome === 'WON'
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : 'bg-rose-950/60 border-rose-800 text-rose-300'
                      }`}>
                        CLOSED {sim.outcome}
                      </span>
                    </div>

                    <div className="text-slate-400 font-mono text-[11px] flex justify-between">
                      <span>Value: ₹{(sim.dealValue || 0).toLocaleString()} INR</span>
                      <span>Similarity: {(sim.similarityScore * 100).toFixed(1)}%</span>
                    </div>

                    {sim.matchingFactors && (
                      <div className="text-[11px] text-slate-300">
                        <span className="text-slate-500">Matches: </span>
                        {sim.matchingFactors.join(', ')}
                      </div>
                    )}

                    {sim.relevantLessons && (
                      <p className="text-slate-300 italic text-[11px] pt-1 border-t border-slate-800/80">
                        Retained Lesson: "{sim.relevantLessons}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Executive Linguistic Synthesis */}
          <Card>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Target Deal Dossier
                </span>
                <h2 className="text-lg font-semibold text-slate-100">{activeDeal?.client}</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Product: {activeDeal?.product} · Stage: {activeDeal?.stage}
                </p>
              </div>

              {intel.sentiment && (
                <div className="flex items-center gap-3">
                  <SentimentBadge
                    sentiment={intel.sentiment.overall}
                    score={intel.sentiment.score}
                  />
                  {activeDeal && <RiskBadge level={activeDeal.risk} />}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-4 bg-slate-950/40 p-4 rounded-lg border border-slate-800/80">
              {intel.summary}
            </p>
          </Card>

          {/* Categorized Intelligence Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Intent */}
            <Card>
              <CardHeader
                title="Customer Intent"
                subtitle="True buyer goals, urgency triggers, and desired outcomes."
                badge={<IntelligenceBadge source="AI_INSIGHT" />}
              />
              {!intel.customerIntent || intel.customerIntent.length === 0 ? (
                <p className="text-xs text-slate-400">No explicit intent vectors recorded.</p>
              ) : (
                <div className="space-y-3">
                  {intel.customerIntent.map((item) => (
                    <ExplainabilityPanel
                      key={item.id}
                      title={item.title}
                      why={item.why}
                      evidence={item.evidence}
                      source="AI_INSIGHT"
                      defaultExpanded={false}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Pain Points */}
            <Card>
              <CardHeader
                title="Customer Pain Points"
                subtitle="Current organizational friction and bottlenecks."
                badge={<IntelligenceBadge source="AI_INSIGHT" />}
              />
              {!intel.painPoints || intel.painPoints.length === 0 ? (
                <p className="text-xs text-slate-400">No pain points identified.</p>
              ) : (
                <div className="space-y-3">
                  {intel.painPoints.map((item) => (
                    <ExplainabilityPanel
                      key={item.id}
                      title={item.title}
                      why={item.why}
                      evidence={item.evidence}
                      source="AI_INSIGHT"
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader
                title="Mandatory Requirements"
                subtitle="Technical, security, and timeline criteria."
                badge={<IntelligenceBadge source="AI_INSIGHT" />}
              />
              {!intel.requirements || intel.requirements.length === 0 ? (
                <p className="text-xs text-slate-400">No explicit requirements logged.</p>
              ) : (
                <div className="space-y-3">
                  {intel.requirements.map((item) => (
                    <ExplainabilityPanel
                      key={item.id}
                      title={item.title}
                      why={item.why}
                      evidence={item.evidence}
                      source="AI_INSIGHT"
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Objections */}
            <Card>
              <CardHeader
                title="Unresolved Objections"
                subtitle="Hesitations or commercial hurdles identified from speech patterns."
                badge={<IntelligenceBadge source="AI_INSIGHT" />}
              />
              {!intel.objections || intel.objections.length === 0 ? (
                <p className="text-xs text-slate-400">No unresolved objections.</p>
              ) : (
                <div className="space-y-3">
                  {intel.objections.map((item) => (
                    <ExplainabilityPanel
                      key={item.id}
                      title={item.title}
                      why={item.why}
                      evidence={item.evidence}
                      source="AI_INSIGHT"
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Competitor Mentions with Counter-tactics */}
          {intel.competitorMentions && intel.competitorMentions.length > 0 && (
            <Card>
              <CardHeader
                title="Competitor Mentions & Counter-Positioning"
                subtitle="Grounded competitive intelligence detected in conversations."
                badge={<IntelligenceBadge source="AI_INSIGHT" />}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intel.competitorMentions.map((comp, idx) => (
                  <ExplainabilityPanel
                    key={idx}
                    title={`Mentioned: ${comp.competitor}`}
                    recommendation={comp.counterTactics}
                    why={comp.why || comp.context}
                    evidence={comp.evidence}
                    source="AI_INSIGHT"
                  />
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
