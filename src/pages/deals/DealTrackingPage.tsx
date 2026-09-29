import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  RefreshCw,
  Plus,
  ArrowRight,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useDeals, useUpdateDeal } from '../../hooks/useIntelligenceApi';
import { Deal, DealStage } from '../../types';

export const DealTrackingPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useDeals();
  const updateDealMutation = useUpdateDeal();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stages: Array<{ id: DealStage; label: string; color: string; border: string }> = [
    { id: 'LEAD', label: 'Lead', color: 'text-slate-300', border: 'border-slate-800' },
    { id: 'QUALIFIED', label: 'Qualified', color: 'text-sky-300', border: 'border-sky-900/40' },
    { id: 'DEMO', label: 'Demo', color: 'text-indigo-300', border: 'border-indigo-900/40' },
    { id: 'PROPOSAL', label: 'Proposal', color: 'text-purple-300', border: 'border-purple-900/40' },
    { id: 'NEGOTIATION', label: 'Negotiation', color: 'text-amber-300', border: 'border-amber-900/40' },
    { id: 'APPROVAL', label: 'Approval', color: 'text-orange-300', border: 'border-orange-900/40' },
    { id: 'WON', label: 'Won', color: 'text-emerald-400', border: 'border-emerald-900/40' },
    { id: 'LOST', label: 'Lost', color: 'text-rose-400', border: 'border-rose-900/40' },
  ];

  const deals = data?.deals || [];

  const handleStageChange = async (dealId: string, newStage: DealStage) => {
    setErrorMessage(null);
    try {
      await updateDealMutation.mutateAsync({
        id: dealId,
        data: { stage: newStage },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update deal stage');
    }
  };

  const getDaysAgo = (dateStr: string) => {
    if (!dateStr) return '0d';
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    return `${Math.max(0, diff)}d`;
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
          <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
            Pipeline Deal Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual stage progression powered by real-time CRM state and intelligence monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            Refresh Pipeline
          </Button>
          <Link to="/deals/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} className="text-xs">
              New Deal
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && <CardSkeleton count={4} />}

      {isError && (
        <ErrorState
          title="Unable to load tracking pipeline"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && deals.length === 0 && (
        <EmptyState
          title="No Deals in Pipeline"
          description="Your tracking pipeline is currently empty. Create a deal to begin tracking progression."
          actionLabel="Create First Deal"
          onAction={() => (window.location.href = '/deals/new')}
        />
      )}

      {/* Kanban Board / Pipeline Columns */}
      {!isLoading && !isError && deals.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-800">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            const totalStageValue = stageDeals.reduce((acc, curr) => acc + (curr.value || 0), 0);

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-72 flex flex-col rounded-xl bg-[#0e1424] border border-slate-800/80 p-3"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-semibold uppercase tracking-wider ${stage.color}`}>
                      {stage.label}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 tabular-nums">
                      {stageDeals.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    ₹{(totalStageValue / 1000).toFixed(0)}k
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 scrollbar-thin">
                  {stageDeals.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 font-mono border border-dashed border-slate-800/60 rounded-lg">
                      No active deals
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="p-3.5 rounded-lg border border-slate-800 bg-[#12192c] hover:border-indigo-500/40 transition-all duration-150 space-y-2.5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/deals/${deal.id}`}
                            className="font-semibold text-xs text-slate-100 hover:text-indigo-400 transition-colors line-clamp-1"
                          >
                            {deal.client}
                          </Link>
                          <RiskBadge level={deal.risk} />
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-semibold text-slate-200 tabular-nums">
                            ₹{(deal.value || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Age: {getDaysAgo(deal.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                          <span className="truncate max-w-[120px]">{deal.owner || 'Unassigned'}</span>
                          <span className="font-mono text-[10px]">
                            Act: {getDaysAgo(deal.lastActivityAt)}
                          </span>
                        </div>

                        {/* Quick stage transition selector */}
                        <div className="pt-1 flex items-center justify-between gap-1">
                          <select
                            value={deal.stage}
                            onChange={(e) => handleStageChange(deal.id, e.target.value as DealStage)}
                            className="w-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 rounded px-1.5 py-1 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            {stages.map((s) => (
                              <option key={s.id} value={s.id}>
                                Move: {s.label}
                              </option>
                            ))}
                          </select>

                          <Link
                            to={`/deals/${deal.id}`}
                            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 shrink-0"
                            title="Open intelligence workspace"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
