import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sliders,
  Play,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Info,
  RefreshCw,
  Scale,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IntelligenceBadge } from '../../components/ui/IntelligenceBadge';
import { ModelStatusBadge } from '../../components/ui/ModelStatusBadge';
import { ModelRegistryModal } from '../../components/ui/ModelRegistryModal';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDeals, useRunSimulation } from '../../hooks/useIntelligenceApi';
import { SimulationResult } from '../../types';

export const SimulationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dealId = searchParams.get('dealId') || '';
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);

  const { data: dealsData } = useDeals();
  const deals = dealsData?.deals || [];

  const selectedDealId = dealId || (deals.length > 0 ? deals[0].id : '');
  const selectedDeal = deals.find((d) => d.id === selectedDealId);

  // Levers state
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [contractDurationMonths, setContractDurationMonths] = useState<number>(24);
  const [productPackage, setProductPackage] = useState<string>(
    selectedDeal?.product || 'Enterprise Intelligence Suite'
  );

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  const runSimulationMutation = useRunSimulation();

  const handleRunSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedDealId) return;

    setSimError(null);
    try {
      const res = await runSimulationMutation.mutateAsync({
        dealId: selectedDealId,
        scenario: {
          discountPercent,
          contractDurationMonths,
          productPackage,
          baselineDiscountPercent: 5,
          baselineContractDurationMonths: 12,
        },
      });
      setSimulationResult(res as unknown as SimulationResult);
    } catch (err: any) {
      setSimError(err.message || 'Simulation execution failed on ML service.');
    }
  };

  const baselineData = simulationResult?.baseline || simulationResult?.currentScenario;
  const scenarioData = simulationResult?.scenario || simulationResult?.whatIfScenario;

  const baselineWinProb = baselineData?.winProbability !== undefined
    ? (baselineData.winProbability <= 1 ? Math.round(baselineData.winProbability * 100) : baselineData.winProbability)
    : 55;

  const scenarioWinProb = scenarioData?.winProbability !== undefined
    ? (scenarioData.winProbability <= 1 ? Math.round(scenarioData.winProbability * 100) : scenarioData.winProbability)
    : 55;

  const baselineRiskProb = baselineData?.riskProbability !== undefined
    ? (baselineData.riskProbability <= 1 ? Math.round(baselineData.riskProbability * 100) : baselineData.riskProbability)
    : (baselineData?.riskScore || 45);

  const scenarioRiskProb = scenarioData?.riskProbability !== undefined
    ? (scenarioData.riskProbability <= 1 ? Math.round(scenarioData.riskProbability * 100) : scenarioData.riskProbability)
    : (scenarioData?.riskScore || 45);

  const probDeltaFormatted = simulationResult?.delta?.winProbability !== undefined
    ? (simulationResult.delta.winProbability <= 1
        ? (simulationResult.delta.winProbability * 100).toFixed(1)
        : simulationResult.delta.winProbability)
    : (scenarioWinProb - baselineWinProb);

  const riskDeltaFormatted = simulationResult?.delta?.riskProbability !== undefined
    ? (simulationResult.delta.riskProbability <= 1
        ? (simulationResult.delta.riskProbability * 100).toFixed(1)
        : simulationResult.delta.riskProbability)
    : (scenarioRiskProb - baselineRiskProb);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
              Strategic What-If Decision Lab
            </h1>
            <IntelligenceBadge source="SIMULATION_ESTIMATE" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate commercial levers (discount, tenure, package) against calibrated ML models to project outcome shifts.
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
        </div>
      </div>

      <ModelRegistryModal
        isOpen={isRegistryOpen}
        onClose={() => setIsRegistryOpen(false)}
        initialModelName="what-if-simulation"
      />

      {/* Prominent Counterfactual Caution Banner */}
      <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-xs text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold uppercase tracking-wider font-mono text-[11px] text-amber-300">
            COUNTERFACTUAL CAUTION · OBSERVATIONAL SALES ASSOCIATION
          </p>
          <p className="text-amber-200/80 leading-relaxed font-mono text-[11px]">
            The simulation estimates associations derived from 235 historical closed enterprise deals. Observational data reflects historical patterns, not guaranteed causal effects. Projections assume unadjusted parameters remain invariant.
          </p>
        </div>
      </div>

      {/* Deal Context Selector */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Target Deal:
            </span>
            <select
              value={selectedDealId}
              onChange={(e) => setSearchParams({ dealId: e.target.value })}
              className="bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.client} — ₹{(d.value || 0).toLocaleString()} ({d.stage})
                </option>
              ))}
            </select>
          </div>

          {selectedDeal && (
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>Baseline Value: ₹{(selectedDeal.value || 0).toLocaleString()}</span>
              <span>·</span>
              <span>Stage: {selectedDeal.stage}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Simulator Workspace: Levers & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Levers Input Console (4 cols) */}
        <div className="lg:col-span-4">
          <Card className="p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Decision Levers
                </span>
                <h3 className="text-base font-semibold text-slate-100 font-display">Configure Scenario</h3>
              </div>
              <ModelStatusBadge status="MODEL_READY" version="1.0.0" onClick={() => setIsRegistryOpen(true)} />
            </div>

            <form onSubmit={handleRunSimulation} className="space-y-4">
              {/* Discount Lever */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300 font-medium">Proposed Discount (%)</label>
                  <span className="font-mono text-amber-400 font-semibold tabular-nums">
                    {discountPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0% (Catalog)</span>
                  <span>10%</span>
                  <span>25%</span>
                  <span>40% (Max)</span>
                </div>
              </div>

              {/* Contract Duration Lever */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300 font-medium">Contract Duration (Months)</label>
                  <span className="font-mono text-indigo-400 font-semibold tabular-nums">
                    {contractDurationMonths}m
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="36"
                  step="6"
                  value={contractDurationMonths}
                  onChange={(e) => setContractDurationMonths(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>6 mo</span>
                  <span>12 mo (Annual)</span>
                  <span>24 mo</span>
                  <span>36 mo</span>
                </div>
              </div>

              {/* Package Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Product Tier / Architecture Package
                </label>
                <select
                  value={productPackage}
                  onChange={(e) => setProductPackage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Enterprise Intelligence Suite">Enterprise Intelligence Suite</option>
                  <option value="Mission-Critical Realtime Tier">Mission-Critical Realtime Tier</option>
                  <option value="Product 01">Product 01 (Enterprise Core)</option>
                  <option value="Product 06">Product 06 (Professional Suite)</option>
                  <option value="Product 10">Product 10 (Enterprise Platform)</option>
                  <option value="Product 20">Product 20 (Realtime Engine)</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="intelligence"
                  size="md"
                  isLoading={runSimulationMutation.isPending}
                  className="w-full text-xs"
                  leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                >
                  Execute Model Simulation
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Results Comparison (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {simError && (
            <ErrorState
              title="Simulation Engine Error"
              error={simError}
              onRetry={() => handleRunSimulation()}
            />
          )}

          {!simulationResult && !simError && (
            <EmptyState
              icon={<Scale className="w-6 h-6 text-amber-400" />}
              title="Simulator Standing By"
              description="Adjust commercial levers on the left and click 'Execute Model Simulation' to calculate verified scenario deltas across trained models."
              actionLabel="Run Default Scenario"
              onAction={() => handleRunSimulation()}
            />
          )}

          {simulationResult && (
            <div className="space-y-6">
              {/* Comparison Matrix Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Baseline */}
                <Card className="p-5 space-y-4 border-slate-800 bg-[#0e1424]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Baseline Configuration
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      BASELINE (5% / 12m)
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contract Value:</span>
                      <span className="font-mono font-semibold text-slate-100 tabular-nums">
                        ₹{(baselineData?.dealValue || baselineData?.projectedValue || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Model Win Probability:</span>
                      <span className="font-mono font-semibold text-slate-100 tabular-nums">
                        {baselineWinProb}%
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Model Risk Exposure:</span>
                      <span className="font-mono font-semibold text-slate-100 tabular-nums">
                        {baselineRiskProb}%
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Expected Sales Cycle:</span>
                      <span className="font-mono text-slate-100 tabular-nums">
                        {baselineData?.expectedCycleDays} days
                      </span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400">Expected Deal Value:</span>
                      <span className="font-mono font-bold text-slate-200 tabular-nums">
                        ₹{(baselineData?.expectedValue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* What-If Projected */}
                <Card className="p-5 space-y-4 border-indigo-500/40 bg-indigo-950/20 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-900/50">
                    <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-semibold">
                      Proposed Scenario
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                      MODEL ESTIMATE
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Contract Value:</span>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-slate-100 tabular-nums">
                          ₹{(scenarioData?.dealValue || scenarioData?.projectedValue || 0).toLocaleString()}
                        </span>
                        {simulationResult.delta?.expectedValue !== undefined && (
                          <span className={`block text-[10px] font-mono ${simulationResult.delta.expectedValue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {simulationResult.delta.expectedValue >= 0 ? '+' : ''}
                            ₹{simulationResult.delta.expectedValue.toLocaleString()} EV delta
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-300">Model Win Probability:</span>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                          {scenarioWinProb}%
                        </span>
                        <span className={`block text-[10px] font-mono ${Number(probDeltaFormatted) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {Number(probDeltaFormatted) >= 0 ? '+' : ''}{probDeltaFormatted}% delta
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-300">Model Risk Exposure:</span>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-slate-100 tabular-nums">
                          {scenarioRiskProb}%
                        </span>
                        <span className={`block text-[10px] font-mono ${Number(riskDeltaFormatted) <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {Number(riskDeltaFormatted) >= 0 ? '+' : ''}{riskDeltaFormatted}% risk shift
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-300">Expected Sales Cycle:</span>
                      <div className="text-right">
                        <span className="font-mono text-slate-100 tabular-nums">
                          {scenarioData?.expectedCycleDays} days
                        </span>
                        {simulationResult.delta?.expectedCycleDays !== undefined && (
                          <span className="block text-[10px] font-mono text-cyan-400">
                            {simulationResult.delta.expectedCycleDays >= 0 ? `+${simulationResult.delta.expectedCycleDays}` : simulationResult.delta.expectedCycleDays} days
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-indigo-900/50">
                      <span className="text-slate-300">Expected Deal Value:</span>
                      <span className="font-mono font-bold text-indigo-300 tabular-nums">
                        ₹{(scenarioData?.expectedValue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Strategic Model Interpretations */}
              <Card className="p-5 space-y-4">
                <CardHeader
                  title="Strategic Model Associations"
                  subtitle={`Under the trained model, historical precedents in this cluster associate parameter changes with specific tradeoffs.`}
                  badge={<IntelligenceBadge source="SIMULATION_ESTIMATE" />}
                />

                {simulationResult.strategicTradeoffs && (
                  <div className="space-y-2">
                    {simulationResult.strategicTradeoffs.map((tradeoff, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                        {tradeoff}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Historical Precedent Support */}
              {simulationResult.historicalSupport?.similarDeals && simulationResult.historicalSupport.similarDeals.length > 0 && (
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 font-display">
                        Historical Precedent Evidence ({simulationResult.historicalSupport.sampleCount} deals scanned)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Actual historical closed deals exhibiting comparable commercial parameters.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Retrieved Precedents
                    </span>
                  </div>

                  <div className="space-y-3">
                    {simulationResult.historicalSupport.similarDeals.map((precedent: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">
                            {precedent.client} ({precedent.dealId})
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            precedent.outcome === 'WON'
                              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                              : 'bg-rose-950/60 border-rose-800 text-rose-300'
                          }`}>
                            CLOSED {precedent.outcome}
                          </span>
                        </div>

                        <div className="text-slate-400 font-mono text-[11px] flex flex-wrap gap-x-4 gap-y-1">
                          <span>Value: ₹{(precedent.dealValue || 0).toLocaleString()} INR</span>
                          <span>Industry: {precedent.industry}</span>
                          <span>Similarity: {(precedent.similarityScore * 100).toFixed(1)}%</span>
                        </div>

                        {precedent.strategyUsed && (
                          <p className="text-slate-300 italic text-[11px] pt-1">
                            Strategy: "{precedent.strategyUsed}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Model Limitations Notice */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-400 flex items-start gap-2.5 font-mono">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300">Model Version {simulationResult.modelVersion || '1.0.0'} · Limitations: </span>
                  {simulationResult.limitations && simulationResult.limitations.length > 0
                    ? simulationResult.limitations.join(' ')
                    : 'Simulation reflects historical associations from observational sales data. Parameters outside the scenario levers are held constant.'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
