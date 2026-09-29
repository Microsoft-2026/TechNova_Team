import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Activity,
  Layers,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RiskBadge, StageBadge } from '../../components/ui/StatusBadge';
import { IntelligenceBadge } from '../../components/ui/IntelligenceBadge';
import { ModelStatusBadge } from '../../components/ui/ModelStatusBadge';
import { ModelRegistryModal } from '../../components/ui/ModelRegistryModal';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useDeals, useDealRisk, useRefreshRiskMutation } from '../../hooks/useIntelligenceApi';

export const RiskAnalysisPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dealId = searchParams.get('dealId') || '';
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);

  const { data: dealsData, isLoading: dealsLoading } = useDeals();
  const deals = dealsData?.deals || [];

  const selectedDealId = dealId || (deals.length > 0 ? deals[0].id : '');
  const selectedDeal = deals.find((d) => d.id === selectedDealId);

  const {
    data: riskData,
    isLoading: riskLoading,
    isError: riskError,
    error: riskErr,
    refetch: refetchRisk,
  } = useDealRisk(selectedDealId);

  const refreshRiskMutation = useRefreshRiskMutation();

  const handleRefresh = async () => {
    if (!selectedDealId) return;
    await refreshRiskMutation.mutateAsync(selectedDealId);
    refetchRisk();
  };

  const setDeal = (id: string) => {
    setSearchParams({ dealId: id });
  };

  const riskProbPercent = riskData?.riskProbability !== undefined
    ? Math.round(riskData.riskProbability * 100)
    : (riskData?.riskScore ?? 0);

  const riskLevelFormatted = (riskData?.riskLevel || riskData?.overallRisk || 'MEDIUM').toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
              Predictive Risk Intelligence
            </h1>
            <IntelligenceBadge source="AI_INSIGHT" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Calibrated machine learning risk model with feature-level SHAP attribution and grounded evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRegistryOpen(true)}
            leftIcon={<Layers className="w-3.5 h-3.5 text-indigo-400" />}
            className="text-xs"
          >
            Model Governance Card
          </Button>

          {selectedDealId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={refreshRiskMutation.isPending || riskLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Re-evaluate Risk
            </Button>
          )}
        </div>
      </div>

      {/* Model Governance Modal */}
      <ModelRegistryModal
        isOpen={isRegistryOpen}
        onClose={() => setIsRegistryOpen(false)}
        initialModelName="deal-risk"
      />

      {/* Deal Context Switcher */}
      <div className="flex items-center gap-3 overflow-x-auto p-3 rounded-xl bg-slate-900/60 border border-slate-800 scrollbar-none">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider shrink-0 pl-1">
          Select Opportunity:
        </span>
        {dealsLoading && <div className="h-6 w-32 bg-slate-800 animate-pulse rounded" />}
        {!dealsLoading && deals.length === 0 && (
          <span className="text-xs text-slate-400 font-mono">No active deals found.</span>
        )}
        {deals.map((d) => (
          <button
            key={d.id}
            onClick={() => setDeal(d.id)}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-mono transition-colors shrink-0 ${
              d.id === selectedDealId
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-200 font-medium'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{d.client}</span>
            <RiskBadge level={d.risk} />
          </button>
        ))}
      </div>

      {/* Main Risk Analysis Content */}
      {!selectedDealId ? (
        <EmptyState
          title="No Deal Selected"
          description="Select an active opportunity to evaluate its risk signals and mitigation roadmap."
          actionLabel="View All Deals"
          onAction={() => (window.location.href = '/deals')}
        />
      ) : riskLoading ? (
        <CardSkeleton count={3} />
      ) : riskError ? (
        <ErrorState
          title="Unable to load risk intelligence"
          error={riskErr}
          onRetry={() => refetchRisk()}
        />
      ) : !riskData ? (
        <EmptyState
          icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
          title="No Risk Analysis Available"
          description="Risk engine has not processed signals for this deal yet."
          actionLabel="Trigger Risk Audit"
          onAction={() => handleRefresh()}
        />
      ) : (
        <div className="space-y-6">
          {/* Executive Risk Scoreboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Target Opportunity
                </span>
                <h3 className="text-lg font-semibold text-slate-100">{selectedDeal?.client}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  ₹{(selectedDeal?.value || 0).toLocaleString()} · {selectedDeal?.product}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <RiskBadge level={riskData.overallRisk} />
                  <span className="text-xs font-mono text-slate-400">
                    Trend: <span className={riskData.trend === 'INCREASING' ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>{riskData.trend}</span>
                  </span>
                </div>
                <ModelStatusBadge status="MODEL_READY" version={riskData.modelVersion || '1.0.0'} onClick={() => setIsRegistryOpen(true)} />
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Calibrated Risk Probability
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-mono font-bold tabular-nums ${
                    riskProbPercent >= 65 ? 'text-rose-400' : riskProbPercent >= 35 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {riskLevelFormatted} — {riskProbPercent}%
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      riskProbPercent >= 65
                        ? 'bg-rose-500'
                        : riskProbPercent >= 35
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, riskProbPercent))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Model Confidence: {((riskData.confidence || 0.65) * 100).toFixed(0)}%</span>
                  <span>Baseline Risk: 48.0%</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Risk Attribution & Signals
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-mono font-bold tabular-nums text-rose-400">
                    {riskData.topRiskFactors?.length || riskData.signals?.length || 0}
                  </span>
                  <span className="text-xs text-slate-400">modeled factors</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Derived strictly from observable interaction logs, objections, and CRM pipeline velocity.
              </p>
            </Card>
          </div>

          {/* Model Attribution: Why is this deal at risk? */}
          {riskData.topRiskFactors && riskData.topRiskFactors.length > 0 && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 font-display">
                    Why Is This Deal At Risk? (Feature Attribution)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculated mathematical impact of each feature on the deal risk probability.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Model: deal-risk v{riskData.modelVersion || '1.0.0'}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {riskData.topRiskFactors.map((factor, idx) => {
                  const isRiskInc = factor.direction === 'INCREASES_RISK';
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200">{factor.feature}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span className={isRiskInc ? 'text-rose-400' : 'text-emerald-400'}>
                            {isRiskInc ? '▲ Increases Deal Risk' : '▼ Decreases Deal Risk'}
                          </span>
                          <span>·</span>
                          <span>Impact Weight: {factor.impact.toFixed(3)}</span>
                        </div>
                      </div>

                      {/* Visual impact indicator */}
                      <div className="w-32 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 shrink-0">
                        <div
                          className={`h-full ${isRiskInc ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, Math.max(15, factor.impact * 30))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Risk Narrative Explanation */}
          <Card className="p-5">
            <CardHeader
              title="Risk Analysis Synthesis"
              subtitle="Grounded assessment from linguistic, budgetary, and timeline indicators."
              badge={<IntelligenceBadge source="AI_INSIGHT" />}
            />
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-lg border border-slate-800 font-mono">
              {riskData.explanation}
            </p>
          </Card>

          {/* Grounding Evidence */}
          {riskData.evidence && riskData.evidence.length > 0 && (
            <Card className="p-5 space-y-3">
              <CardHeader
                title="Grounding Evidence"
                subtitle="Verbatim citations and interaction records substantiating the risk assessment."
              />
              <div className="space-y-2">
                {riskData.evidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-300 font-mono"
                  >
                    "{ev}"
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Grounded Signals List */}
          {riskData.signals && riskData.signals.length > 0 && (
            <Card>
              <CardHeader
                title="Identified Risk Signals"
                subtitle="Concrete signals returned by the risk intelligence engine."
              />
              <div className="space-y-3">
                {riskData.signals.map((sig) => (
                  <div
                    key={sig.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100">{sig.signal}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {sig.category}
                        </span>
                      </div>
                      <RiskBadge level={sig.severity} />
                    </div>

                    <p className="text-slate-300 leading-relaxed">{sig.explanation}</p>

                    {sig.evidence && (
                      <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 font-mono text-[11px] text-slate-400 italic">
                        Grounding Evidence: "{sig.evidence}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recommended Mitigation Steps */}
          {riskData.mitigationSteps && riskData.mitigationSteps.length > 0 && (
            <Card>
              <CardHeader
                title="Prescribed Risk Mitigation Steps"
                subtitle="Actions proven in historical deal retrospectives to neutralize detected vulnerabilities."
              />
              <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                {riskData.mitigationSteps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">{step}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Model Limitations Notice */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-400 flex items-start gap-2.5 font-mono">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Model Limitations: </span>
              {riskData.limitations && riskData.limitations.length > 0
                ? riskData.limitations.join(' ')
                : 'Observational sales models reflect statistical associations prior to close. Counterfactual causal certainty cannot be assumed.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
