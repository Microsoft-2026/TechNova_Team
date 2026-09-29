import React, { useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  FileSearch,
  Brain,
  Sliders,
  AlertTriangle,
  Award,
  Compass,
  CheckCircle,
  XCircle,
  RefreshCw,
  Quote,
  Smile,
  ShieldCheck,
  TrendingUp,
  FileText,
  Upload,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RiskBadge, StageBadge, StatusBadge, SentimentBadge } from '../../components/ui/StatusBadge';
import { IntelligenceBadge } from '../../components/ui/IntelligenceBadge';
import { ExplainabilityPanel } from '../../components/ui/ExplainabilityDrawer';
import { TableSkeleton, CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { DealCopilotChat } from '../../components/chat/DealCopilotChat';
import {
  useDeal,
  useDealIntelligence,
  useDealRecall,
  useDealReflect,
  useDealRisk,
  useSuggestions,
  useRefreshDealIntelligence,
  useCloseDeal,
} from '../../hooks/useIntelligenceApi';
import { DealStage, SentimentType, Suggestion } from '../../types';

export const DealDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const navigate = useNavigate();

  const { data: deal, isLoading: dealLoading, isError: dealError, error: dealErr, refetch: refetchDeal } = useDeal(id || '');
  const { data: intel, isLoading: intelLoading, isError: intelError, error: intelErr, refetch: refetchIntel } = useDealIntelligence(id || '');
  const { data: recall, isLoading: recallLoading, isError: recallError, refetch: refetchRecall } = useDealRecall(id || '');
  const { data: reflect, isLoading: reflectLoading, isError: reflectError, refetch: refetchReflect } = useDealReflect(id || '');
  const { data: riskAnalysis, isLoading: riskLoading, isError: riskError, refetch: refetchRisk } = useDealRisk(id || '');
  const { data: suggestionsData, isLoading: suggLoading, refetch: refetchSugg } = useSuggestions(id);

  const refreshIntelMutation = useRefreshDealIntelligence();
  const closeDealMutation = useCloseDeal();

  // Close deal state
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeOutcome, setCloseOutcome] = useState<'WON' | 'LOST'>('WON');
  const [closeReason, setCloseReason] = useState('');
  const [closeLesson, setCloseLesson] = useState('');
  const [closeError, setCloseError] = useState<string | null>(null);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'copilot', label: 'AI Copilot', icon: Sparkles, color: 'text-indigo-400' },
    { id: 'intelligence', label: 'Intelligence', icon: Sparkles, color: 'text-violet-400' },
    { id: 'transcripts', label: 'Transcripts', icon: FileSearch, color: 'text-indigo-400' },
    { id: 'recall', label: 'Recall (Memory)', icon: Brain, color: 'text-cyan-400' },
    { id: 'reflect', label: 'Reflect', icon: Sparkles, color: 'text-violet-400' },
    { id: 'suggestions', label: 'Next-Best-Action', icon: Compass, color: 'text-indigo-300' },
    { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle, color: 'text-rose-400' },
    { id: 'simulation', label: 'What-If Simulation', icon: Sliders, color: 'text-amber-400' },
    { id: 'outcome', label: 'Outcome & Retain', icon: Award, color: 'text-amber-400' },
  ];

  const handleCloseDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !closeReason.trim()) return;
    setCloseError(null);

    try {
      await closeDealMutation.mutateAsync({
        id,
        payload: {
          outcome: closeOutcome,
          reason: closeReason.trim(),
          lessonsLearned: closeLesson.trim() ? [closeLesson.trim()] : [],
        },
      });
      setShowCloseModal(false);
      refetchDeal();
    } catch (err: any) {
      setCloseError(err.message || 'Failed to close deal');
    }
  };

  if (dealLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 animate-pulse rounded" />
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (dealError || !deal) {
    return (
      <ErrorState
        title={`Unable to load deal ${id}`}
        error={dealErr}
        onRetry={() => refetchDeal()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Back and Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/deals"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-display font-bold text-slate-100">{deal.client}</h1>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20">
                {deal.id}
              </span>
              <StageBadge stage={deal.stage} />
              <RiskBadge level={deal.risk} score={deal.riskScore} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {deal.product} · {deal.industry} · Owner: {deal.owner} · Value: ₹{(deal.value || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshIntelMutation.mutate(id!)}
            isLoading={refreshIntelMutation.isPending}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Re-Analyze Intelligence
          </Button>

          {deal.status === 'ACTIVE' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCloseModal(true)}
              className="text-xs border-amber-500/30 text-amber-300 hover:bg-amber-950/40"
            >
              Close & Retain Lesson
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800/80 pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.color || ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader
                title="Deal Scope & Summary"
                subtitle="Captured from CRM records and synthesized communications."
                badge={<IntelligenceBadge source="FROM_CRM" />}
              />
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-lg border border-slate-800/80">
                {deal.summary || 'No narrative summary provided in CRM yet. Run transcript intelligence to populate.'}
              </p>
            </Card>

            {/* Quick Intelligence Snapshot if available */}
            {intel && (
              <Card>
                <CardHeader
                  title="Synthesized Buyer Intent"
                  subtitle="Ground-truth intent identified across call recordings."
                  badge={<IntelligenceBadge source="AI_INSIGHT" />}
                />
                <div className="space-y-3">
                  {intel.customerIntent?.map((pt) => (
                    <ExplainabilityPanel
                      key={pt.id}
                      title={pt.title}
                      why={pt.why}
                      evidence={pt.evidence}
                      source="AI_INSIGHT"
                    />
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Commercial Terms" />
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Target Value</span>
                  <span className="font-mono font-semibold text-slate-100 tabular-nums">
                    ₹{(deal.value || 0).toLocaleString()} {deal.currency || 'INR'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Current Stage</span>
                  <StageBadge stage={deal.stage} />
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Risk Assessment</span>
                  <RiskBadge level={deal.risk} score={deal.riskScore} />
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Last Active</span>
                  <span className="font-mono text-slate-300">
                    {deal.lastActivityAt ? new Date(deal.lastActivityAt).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Created Date</span>
                  <span className="font-mono text-slate-300">
                    {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Fast Actions" />
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs justify-start bg-indigo-600 hover:bg-indigo-500"
                  onClick={() => setTab('copilot')}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                >
                  Ask Deal Copilot
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start"
                  onClick={() => setTab('transcripts')}
                  leftIcon={<Upload className="w-3.5 h-3.5 text-indigo-400" />}
                >
                  Upload Call Transcript
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start"
                  onClick={() => setTab('simulation')}
                  leftIcon={<Sliders className="w-3.5 h-3.5 text-amber-400" />}
                >
                  Simulate Pricing & Levers
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start"
                  onClick={() => setTab('recall')}
                  leftIcon={<Brain className="w-3.5 h-3.5 text-cyan-400" />}
                >
                  Recall Similar Precedents
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: AI Copilot */}
      {activeTab === 'copilot' && (
        <div className="h-[700px]">
          <DealCopilotChat
            initialDealId={id}
            title={`Deal Copilot · ${deal.client}`}
            compact={false}
          />
        </div>
      )}

      {/* Tab: Intelligence */}
      {activeTab === 'intelligence' && (
        <div className="space-y-6">
          {intelLoading && <CardSkeleton count={3} />}

          {intelError && (
            <ErrorState
              title="Unable to load deal intelligence"
              error={intelErr}
              onRetry={() => refetchIntel()}
            />
          )}

          {!intelLoading && !intelError && !intel && (
            <EmptyState
              icon={<Sparkles className="w-6 h-6 text-violet-400" />}
              title="Intelligence Not Yet Computed"
              description="No transcript intelligence found for this deal. Upload meeting transcripts or run an analysis to extract intent, objections, and action items."
              actionLabel="Upload Transcript"
              onAction={() => setTab('transcripts')}
            />
          )}

          {intel && (
            <div className="space-y-6">
              {/* Sentiment & Summary bar */}
              <Card>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Intelligence Synthesis
                    </span>
                    <h3 className="text-base font-semibold text-slate-100">
                      Linguistic Analysis & Buyer Sentiment
                    </h3>
                  </div>
                  {intel.sentiment && (
                    <div className="flex items-center gap-3">
                      <SentimentBadge
                        sentiment={intel.sentiment.overall}
                        score={intel.sentiment.score}
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-3">{intel.summary}</p>
                {intel.sentiment?.explanation && (
                  <p className="text-[11px] text-slate-400 font-mono mt-2 bg-slate-950/60 p-2.5 rounded border border-slate-800">
                    Sentiment Diagnosis: {intel.sentiment.explanation}
                  </p>
                )}
              </Card>

              {/* Categorized Intelligence Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pain Points */}
                <Card>
                  <CardHeader
                    title="Uncovered Pain Points"
                    subtitle="Direct friction articulated by the client."
                    badge={<IntelligenceBadge source="AI_INSIGHT" />}
                  />
                  {!intel.painPoints || intel.painPoints.length === 0 ? (
                    <p className="text-xs text-slate-400">No explicit pain points detected.</p>
                  ) : (
                    <div className="space-y-3">
                      {intel.painPoints.map((pt) => (
                        <ExplainabilityPanel
                          key={pt.id}
                          title={pt.title}
                          why={pt.why}
                          evidence={pt.evidence}
                        />
                      ))}
                    </div>
                  )}
                </Card>

                {/* Objections */}
                <Card>
                  <CardHeader
                    title="Identified Objections"
                    subtitle="Hesitations regarding pricing, timing, or technical fit."
                    badge={<IntelligenceBadge source="AI_INSIGHT" />}
                  />
                  {!intel.objections || intel.objections.length === 0 ? (
                    <p className="text-xs text-slate-400">No major objections flagged.</p>
                  ) : (
                    <div className="space-y-3">
                      {intel.objections.map((obj) => (
                        <ExplainabilityPanel
                          key={obj.id}
                          title={obj.title}
                          why={obj.why}
                          evidence={obj.evidence}
                        />
                      ))}
                    </div>
                  )}
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader
                    title="Technical & Operational Requirements"
                    subtitle="Mandatory client specifications."
                    badge={<IntelligenceBadge source="AI_INSIGHT" />}
                  />
                  {!intel.requirements || intel.requirements.length === 0 ? (
                    <p className="text-xs text-slate-400">No hard requirements documented.</p>
                  ) : (
                    <div className="space-y-3">
                      {intel.requirements.map((req) => (
                        <ExplainabilityPanel
                          key={req.id}
                          title={req.title}
                          why={req.why}
                          evidence={req.evidence}
                        />
                      ))}
                    </div>
                  )}
                </Card>

                {/* Competitor Mentions */}
                <Card>
                  <CardHeader
                    title="Competitor Mentions & Counter-Tactics"
                    subtitle="Alternative vendors evaluated by the buyer."
                    badge={<IntelligenceBadge source="AI_INSIGHT" />}
                  />
                  {!intel.competitorMentions || intel.competitorMentions.length === 0 ? (
                    <p className="text-xs text-slate-400">No competitor discussions detected.</p>
                  ) : (
                    <div className="space-y-3">
                      {intel.competitorMentions.map((comp, idx) => (
                        <ExplainabilityPanel
                          key={idx}
                          title={`Competitor: ${comp.competitor}`}
                          recommendation={comp.counterTactics}
                          why={comp.why || comp.context}
                          evidence={comp.evidence}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Action Items */}
              {intel.actionItems && intel.actionItems.length > 0 && (
                <Card>
                  <CardHeader
                    title="Intelligence-Derived Action Items"
                    subtitle="Extracted tasks assigned to the deal team."
                  />
                  <div className="space-y-2">
                    {intel.actionItems.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-200">{act.title}</span>
                          {act.why && <p className="text-[11px] text-slate-400">{act.why}</p>}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          Priority: {act.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Transcripts */}
      {activeTab === 'transcripts' && (
        <Card>
          <CardHeader
            title="Meeting & Call Transcripts"
            subtitle="Upload PDFs, DOCX, or text transcripts to feed the Deal Intelligence Layer."
          />
          <div className="space-y-4">
            <div className="border border-dashed border-slate-700/80 rounded-xl p-8 text-center bg-slate-900/40">
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-200">
                Upload Call Recording Transcript
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Supported formats: PDF, DOCX, TXT. Transcripts are ingested, parsed for speaker intent, and grounded into memory.
              </p>
              <Button
                variant="intelligence"
                size="sm"
                onClick={() => navigate('/upload-transcripts')}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
              >
                Go to Transcript Ingestion Center
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Recall (Deal Memory) */}
      {activeTab === 'recall' && (
        <div className="space-y-6">
          {recallLoading && <CardSkeleton count={2} />}
          {recallError && (
            <ErrorState
              title="Unable to run deal recall query"
              error={recallError}
              onRetry={() => refetchRecall()}
            />
          )}

          {!recallLoading && !recallError && !recall && (
            <EmptyState
              icon={<Brain className="w-6 h-6 text-cyan-400" />}
              title="No Deal Recall Executed"
              description="Click below to query historical deals with similar products, deal size, or customer industry."
              actionLabel="Run Historical Recall"
              onAction={() => refetchRecall()}
            />
          )}

          {recall && (
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Historical Pattern Synthesis"
                  subtitle="Learned organizational dynamics for similar opportunity clusters."
                  badge={<IntelligenceBadge source="FROM_MEMORY" />}
                />
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-lg border border-slate-800">
                  {recall.patternSynthesis}
                </p>
              </Card>

              <div className="space-y-3">
                <h3 className="text-sm font-mono font-semibold text-slate-200 uppercase tracking-wider">
                  Matched Historical Precedents ({recall.similarDeals?.length || 0})
                </h3>
                {recall.similarDeals?.map((item) => (
                  <Card key={item.dealId} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100">{item.client}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              item.outcome === 'WON'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            Outcome: {item.outcome}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ID: {item.dealId} · Industry: {item.industry} · Value: ₹{(item.value || 0).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-500/30 tabular-nums">
                        {item.similarityScore}% Similarity Match
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-emerald-400 font-semibold text-[11px] block">
                          Winning/Closing Strategy Used
                        </span>
                        <p className="text-slate-300 mt-0.5">{item.finalStrategyUsed}</p>
                      </div>
                      <div>
                        <span className="text-amber-400 font-semibold text-[11px] block">
                          Institutional Lesson Retained
                        </span>
                        <p className="text-slate-300 mt-0.5">{item.relevantLessons}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Reflect */}
      {activeTab === 'reflect' && (
        <div className="space-y-6">
          {reflectLoading && <CardSkeleton count={2} />}
          {reflectError && (
            <ErrorState
              title="Unable to load reflective analysis"
              error={reflectError}
              onRetry={() => refetchReflect()}
            />
          )}

          {!reflectLoading && !reflectError && !reflect && (
            <EmptyState
              icon={<Sparkles className="w-6 h-6 text-violet-400" />}
              title="No Reflection Generated"
              description="Analyze what historical deal cycles teach us about winning this specific evaluation."
              actionLabel="Generate Reflection"
              onAction={() => refetchReflect()}
            />
          )}

          {reflect && (
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Reflective Summary"
                  subtitle="Aggregate behavioral patterns from closed deals."
                  badge={<IntelligenceBadge source="FROM_MEMORY" />}
                />
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-lg border border-slate-800">
                  {reflect.reflectionSummary}
                </p>
                <div className="mt-3 text-xs font-mono text-slate-400">
                  Cluster Win Rate: <span className="text-emerald-400 font-semibold tabular-nums">{reflect.historicalWinRateInCluster}%</span>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader title="Historical Winning Drivers" />
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                    {reflect.winningFactors?.map((f, i) => (
                      <li key={i} className="leading-relaxed">{f}</li>
                    ))}
                  </ul>
                </Card>

                <Card>
                  <CardHeader title="Fatal Loss Factors" />
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                    {reflect.losingFactors?.map((f, i) => (
                      <li key={i} className="leading-relaxed text-rose-300/90">{f}</li>
                    ))}
                  </ul>
                </Card>
              </div>

              {reflect.tacticalAdvice && reflect.tacticalAdvice.length > 0 && (
                <Card>
                  <CardHeader title="Tactical Recommendations for this Stage" />
                  <div className="space-y-3">
                    {reflect.tacticalAdvice.map((adv, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1 text-xs">
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

      {/* Tab: Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100">
              Explainable Next-Best-Action Suggestions
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Grounded in customer transcripts and memory precedents
            </span>
          </div>

          {suggLoading && <CardSkeleton count={3} />}

          {!suggLoading && (!suggestionsData?.suggestions || suggestionsData.suggestions.length === 0) ? (
            <EmptyState
              title="No Suggestions Pending"
              description="The intelligence agent has no unapplied suggestions for this deal at its current stage."
              actionLabel="Re-analyze Deal"
              onAction={() => refreshIntelMutation.mutate(id!)}
            />
          ) : (
            <div className="space-y-4">
              {suggestionsData?.suggestions.map((sug) => (
                <ExplainabilityPanel
                  key={sug.id}
                  title={sug.title}
                  recommendation={sug.description}
                  why={sug.why}
                  evidence={sug.evidence}
                  similarDeals={sug.similarDeals}
                  source="AI_INSIGHT"
                  defaultExpanded={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Risk */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          {riskLoading && <CardSkeleton count={2} />}
          {riskError && (
            <ErrorState
              title="Unable to load risk signals"
              error={riskError}
              onRetry={() => refetchRisk()}
            />
          )}

          {riskAnalysis && (
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Overall Risk Profile
                    </span>
                    <h3 className="text-base font-semibold text-slate-100">
                      Vulnerability & Objection Matrix
                    </h3>
                  </div>
                  <RiskBadge level={riskAnalysis.overallRisk} score={riskAnalysis.riskScore} />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-3">{riskAnalysis.explanation}</p>
              </Card>

              <Card>
                <CardHeader title="Detected Risk Signals" subtitle="Derived from transcripts and deal stagnation." />
                <div className="space-y-3">
                  {riskAnalysis.signals?.map((sig) => (
                    <div
                      key={sig.id}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{sig.signal}</span>
                        <RiskBadge level={sig.severity} />
                      </div>
                      <p className="text-slate-400 text-xs">{sig.explanation}</p>
                      {sig.evidence && (
                        <p className="font-mono text-[11px] text-slate-500 italic">
                          Evidence: "{sig.evidence}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Tab: Simulation */}
      {activeTab === 'simulation' && (
        <Card>
          <CardHeader
            title="Strategic What-If Simulation"
            subtitle="Explore how pricing, term duration, and packaging impact projected win probabilities."
            badge={<IntelligenceBadge source="SIMULATION_ESTIMATE" />}
          />
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Run real-time scenario modeling on this deal. To access the multi-lever simulation lab:
            </p>
            <Button
              variant="amber"
              size="sm"
              onClick={() => navigate(`/simulation?dealId=${deal.id}`)}
              leftIcon={<Sliders className="w-3.5 h-3.5" />}
            >
              Launch Simulation Lab for {deal.client}
            </Button>
          </div>
        </Card>
      )}

      {/* Tab: Outcome & Retain */}
      {activeTab === 'outcome' && (
        <Card>
          <CardHeader
            title="Institutional Memory & Retained Lessons"
            subtitle="Record outcomes to permanently train the Deal Intelligence layer."
            badge={<IntelligenceBadge source="FROM_MEMORY" />}
          />
          <div className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              When a deal closes, our intelligence layer conducts a retrospective analysis to determine what tactics worked and what fatal objections emerged. This ensures lessons learned here will be recalled in future deals.
            </p>

            {deal.status === 'ACTIVE' ? (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <h4 className="text-sm font-semibold text-slate-200">Close Deal & Capture Lesson</h4>
                <p className="text-xs text-slate-400">
                  Mark this deal as Won or Lost to inject institutional memory into the organizational knowledge graph.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCloseModal(true)}
                >
                  Enter Close Retrospective
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={deal.status} />
                  <span className="font-semibold text-slate-200">Deal Closed</span>
                </div>
                <p className="text-slate-400">
                  This deal has concluded and its insights have been indexed into the memory recall cluster.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Close Deal Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-slate-100">
                Close Deal Retrospective
              </h3>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCloseDealSubmit} className="space-y-4">
              {closeError && (
                <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  {closeError}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Final Deal Outcome
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCloseOutcome('WON')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 ${
                      closeOutcome === 'WON'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Closed Won
                  </button>
                  <button
                    type="button"
                    onClick={() => setCloseOutcome('LOST')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 ${
                      closeOutcome === 'LOST'
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Closed Lost
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Primary Deciding Factor / Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  placeholder="e.g. Technical superiority in latency test, or competitor discounted by 40%..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Institutional Lesson for Future Reps (Retain)
                </label>
                <textarea
                  rows={2}
                  value={closeLesson}
                  onChange={(e) => setCloseLesson(e.target.value)}
                  placeholder="What key advice should appear when a similar customer is recalled in the future?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCloseModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="intelligence"
                  size="sm"
                  isLoading={closeDealMutation.isPending}
                >
                  Save & Index Memory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
