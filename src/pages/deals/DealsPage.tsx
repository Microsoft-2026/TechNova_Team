import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { RiskBadge, StageBadge, StatusBadge } from '../../components/ui/StatusBadge';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useDeals, useDeleteDeal } from '../../hooks/useIntelligenceApi';
import { DealStage, RiskLevel } from '../../types';

export const DealsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [dealToDelete, setDealToDelete] = useState<{ id: string; clientName: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useDeals({
    search: searchTerm || undefined,
    stage: stageFilter !== 'ALL' ? stageFilter : undefined,
    risk: riskFilter !== 'ALL' ? riskFilter : undefined,
    page,
  });

  const deleteDealMutation = useDeleteDeal();

  const deals = data?.deals || [];
  const total = data?.total || deals.length;

  const confirmDelete = async () => {
    if (!dealToDelete) return;
    setErrorMessage(null);
    try {
      await deleteDealMutation.mutateAsync(dealToDelete.id);
      setDealToDelete(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete deal');
      setDealToDelete(null);
    }
  };

  const handleDelete = (id: string, clientName: string) => {
    setDealToDelete({ id, clientName });
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
            Deals Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise pipeline records synchronized with the intelligence and memory layer.
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
            Refresh
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

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5">
            <Input
              placeholder="Search by client, industry, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="text-xs"
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Stages' },
                { value: 'LEAD', label: 'Lead' },
                { value: 'QUALIFIED', label: 'Qualified' },
                { value: 'DEMO', label: 'Demo' },
                { value: 'PROPOSAL', label: 'Proposal' },
                { value: 'NEGOTIATION', label: 'Negotiation' },
                { value: 'APPROVAL', label: 'Approval' },
                { value: 'WON', label: 'Closed Won' },
                { value: 'LOST', label: 'Closed Lost' },
              ]}
              className="text-xs"
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Risk Levels' },
                { value: 'LOW', label: 'Low Risk' },
                { value: 'MEDIUM', label: 'Medium Risk' },
                { value: 'HIGH', label: 'High Risk' },
                { value: 'CRITICAL', label: 'Critical Risk' },
              ]}
              className="text-xs"
            />
          </div>

          <div className="sm:col-span-1 text-right">
            <span className="text-[11px] font-mono text-slate-400">
              {total} {total === 1 ? 'deal' : 'deals'}
            </span>
          </div>
        </div>
      </Card>

      {/* Table Content */}
      <Card className="p-0 overflow-hidden">
        {isLoading && (
          <div className="p-6">
            <TableSkeleton rows={6} cols={7} />
          </div>
        )}

        {isError && (
          <div className="p-6">
            <ErrorState
              title="Unable to load pipeline deals"
              error={error}
              onRetry={() => refetch()}
            />
          </div>
        )}

        {!isLoading && !isError && deals.length === 0 && (
          <div className="p-6">
            <EmptyState
              icon={<Briefcase className="w-6 h-6 text-slate-400" />}
              title="No Deals Found"
              description={
                searchTerm || stageFilter !== 'ALL' || riskFilter !== 'ALL'
                  ? 'No pipeline deals matched your current search filters.'
                  : 'Your enterprise CRM pipeline is currently empty or has not been synced.'
              }
              actionLabel="Create New Deal"
              onAction={() => navigate('/deals/new')}
            />
          </div>
        )}

        {!isLoading && !isError && deals.length > 0 && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono">
                    <th className="py-3 px-4 font-medium">Deal ID</th>
                    <th className="py-3 px-4 font-medium">Client / Industry</th>
                    <th className="py-3 px-4 font-medium">Product</th>
                    <th className="py-3 px-4 font-medium">Value</th>
                    <th className="py-3 px-4 font-medium">Stage</th>
                    <th className="py-3 px-4 font-medium">Risk</th>
                    <th className="py-3 px-4 font-medium">Owner</th>
                    <th className="py-3 px-4 font-medium">Last Activity</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deals.map((deal) => (
                    <tr
                      key={deal.id}
                      className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/deals/${deal.id}`)}
                    >
                      <td className="py-3.5 px-4 font-mono text-[11px] text-indigo-400 font-medium">
                        {deal.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-100 group-hover:text-indigo-300 block">
                          {deal.client}
                        </span>
                        <span className="text-[10px] text-slate-400">{deal.industry}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {deal.product}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-100 tabular-nums">
                        ₹{(deal.value || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <StageBadge stage={deal.stage} />
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={deal.risk} score={deal.riskScore} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {deal.owner}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {deal.lastActivityAt
                          ? new Date(deal.lastActivityAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/deals/${deal.id}`}
                          className="p-1 text-slate-400 hover:text-indigo-400 inline-block transition-colors"
                          title="Open Deal Intelligence"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(deal.id, deal.client)}
                          className="p-1 text-slate-400 hover:text-rose-400 inline-block transition-colors"
                          title="Delete deal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900/30 text-xs text-slate-400 font-mono">
              <span>Showing {deals.length} of {total} records</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  className="h-7 text-xs px-2.5"
                >
                  Previous
                </Button>
                <span>Page {page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deals.length < 20}
                  onClick={() => setPage(page + 1)}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  className="h-7 text-xs px-2.5"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* In-app Delete Confirmation Modal */}
      {dealToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-100">Delete Deal</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete the deal for <strong className="text-white">"{dealToDelete.clientName}"</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDealToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={confirmDelete}
                isLoading={deleteDealMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
