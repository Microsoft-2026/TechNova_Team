import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Plus,
  FileText,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RiskBadge, StageBadge, StatusBadge } from '../../components/ui/StatusBadge';
import { ExplainabilityPanel } from '../../components/ui/ExplainabilityDrawer';
import { IntelligenceLoopFlow } from '../../components/ui/IntelligenceLoopFlow';
import { TableSkeleton, CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useDashboardSummary } from '../../hooks/useIntelligenceApi';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: summary, isLoading, isError, error, refetch } = useDashboardSummary();

  return (
    <div className="space-y-6">
      {/* Top Banner: Intelligence Loop */}
      <IntelligenceLoopFlow />

      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
            Deal Intelligence Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time synthesis of pipeline intent, previous deal recall, risk signals, and attention queue.
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
            Refresh Feed
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/deals/new')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Create Deal
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <CardSkeleton count={6} />
          <TableSkeleton rows={4} cols={5} />
        </div>
      )}

      {/* Error / Offline State */}
      {isError && (
        <ErrorState
          title="Unable to load dashboard intelligence summary"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {/* Populated / API State */}
      {summary && !isLoading && !isError && (
        <div className="space-y-6">
          {/* Executive Metrics Grid - strictly populated from API */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Active Deals</span>
                <Briefcase className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-semibold font-mono tabular-nums text-slate-100">
                {summary.activeDealsCount ?? 0}
              </p>
              <span className="text-[11px] text-slate-400">In active stages</span>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>High Risk</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-semibold font-mono tabular-nums text-rose-400">
                {summary.highRiskDealsCount ?? 0}
              </p>
              <span className="text-[11px] text-rose-400/80">Requires mitigation</span>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Negotiations</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-semibold font-mono tabular-nums text-amber-400">
                {summary.negotiationsCount ?? 0}
              </p>
              <span className="text-[11px] text-slate-400">Near close stage</span>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Meetings</span>
                <Calendar className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-semibold font-mono tabular-nums text-slate-100">
                {summary.upcomingMeetingsCount ?? 0}
              </p>
              <span className="text-[11px] text-slate-400">Scheduled next 7d</span>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Won Deals</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-semibold font-mono tabular-nums text-emerald-400">
                {summary.wonDealsCount ?? 0}
              </p>
              <span className="text-[11px] text-emerald-400/80">Historical retained</span>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Lost Deals</span>
                <XCircle className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-semibold font-mono tabular-nums text-slate-300">
                {summary.lostDealsCount ?? 0}
              </p>
              <span className="text-[11px] text-slate-400">Reflective lessons</span>
            </div>
          </div>

          {/* Section: Attention Queue (What needs attention right now?) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader
                  title="Attention Queue"
                  subtitle="Deals with critical blockers, missing stakeholders, or pending counter-actions identified by the intelligence layer."
                  action={
                    <Link
                      to="/deals"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1"
                    >
                      All Deals <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  }
                />

                {!summary.attentionQueue || summary.attentionQueue.length === 0 ? (
                  <EmptyState
                    title="Attention Queue Clear"
                    description="No urgent deal risks or unresolved transcript objections currently flagged by the intelligence engine."
                    actionLabel="View All Deals"
                    onAction={() => navigate('/deals')}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono">
                          <th className="pb-3 font-medium">Deal ID / Client</th>
                          <th className="pb-3 font-medium">Value</th>
                          <th className="pb-3 font-medium">Stage</th>
                          <th className="pb-3 font-medium">Risk Level</th>
                          <th className="pb-3 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {summary.attentionQueue.map((deal) => (
                          <tr key={deal.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 pr-3">
                              <Link
                                to={`/deals/${deal.id}`}
                                className="font-semibold text-slate-200 hover:text-indigo-400 block"
                              >
                                {deal.client}
                              </Link>
                              <span className="font-mono text-[10px] text-slate-400">
                                {deal.id} · {deal.product}
                              </span>
                            </td>
                            <td className="py-3 font-mono font-medium text-slate-200 tabular-nums">
                              ₹{(deal.value || 0).toLocaleString()}
                            </td>
                            <td className="py-3">
                              <StageBadge stage={deal.stage} />
                            </td>
                            <td className="py-3">
                              <RiskBadge level={deal.risk} score={deal.riskScore} />
                            </td>
                            <td className="py-3 text-right">
                              <Link
                                to={`/deals/${deal.id}?tab=intelligence`}
                                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-mono text-[11px]"
                              >
                                Analyze <ArrowRight className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Live AI Insights Feed */}
              <Card>
                <CardHeader
                  title="Live AI Intelligence Insights"
                  subtitle="Explainable observations generated across transcripts, meetings, and CRM updates."
                />

                {!summary.aiInsights || summary.aiInsights.length === 0 ? (
                  <EmptyState
                    title="No AI Insights Generated Yet"
                    description="Upload a call transcript or run intelligence analysis on an active deal to generate explainable recommendations."
                    actionLabel="Upload Transcript"
                    onAction={() => navigate('/upload-transcripts')}
                  />
                ) : (
                  <div className="space-y-3">
                    {summary.aiInsights.map((insight) => (
                      <ExplainabilityPanel
                        key={insight.id}
                        title={insight.title}
                        recommendation={insight.suggestedAction || insight.detail}
                        why={insight.why}
                        evidence={insight.evidence}
                        source={insight.source || 'AI_INSIGHT'}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar Column: Recent Activities & Upcoming Deals */}
            <div className="space-y-6">
              {/* Upcoming Deals */}
              <Card>
                <CardHeader
                  title="Upcoming Deals"
                  subtitle="Deals scheduled for review or close this cycle."
                />

                {!summary.upcomingDeals || summary.upcomingDeals.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No upcoming deals reported by backend.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {summary.upcomingDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <Link
                            to={`/deals/${deal.id}`}
                            className="font-semibold text-slate-200 hover:text-indigo-400 block"
                          >
                            {deal.client}
                          </Link>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                            <span>₹{(deal.value || 0).toLocaleString()}</span>
                            <span>·</span>
                            <StageBadge stage={deal.stage} />
                          </div>
                        </div>
                        <RiskBadge level={deal.risk} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader
                  title="Recent Activity Feed"
                  subtitle="Grounded chronological event stream."
                />

                {!summary.recentActivities || summary.recentActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No recorded activities returned from API.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {summary.recentActivities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/40 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span className="font-semibold text-slate-300">{act.title}</span>
                          <span className="font-mono text-slate-400">
                            {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : ''}
                          </span>
                        </div>
                        {act.description && (
                          <p className="text-slate-300 text-xs">{act.description}</p>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 pt-1">
                          <span>By: {act.author}</span>
                          {act.clientName && <span>· Deal: {act.clientName}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
