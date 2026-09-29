import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  RefreshCw,
  PieChart as PieIcon,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useReports } from '../../hooks/useIntelligenceApi';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e'];

export const ReportsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState('last_12_months');
  const { data: reports, isLoading, isError, error, refetch } = useReports(timeframe);

  const hasMonthlyData = reports?.monthlyDeals && reports.monthlyDeals.length > 0;
  const hasForecastData = reports?.revenueForecast && reports.revenueForecast.length > 0;
  const hasTopCustomers = reports?.topCustomers && reports.topCustomers.length > 0;
  const hasStageData = reports?.stageDistribution && reports.stageDistribution.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
            Pipeline & Intelligence Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Data visualizations strictly populated from verified backend report endpoints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            options={[
              { value: 'last_30_days', label: 'Last 30 Days' },
              { value: 'last_quarter', label: 'Last Quarter' },
              { value: 'last_12_months', label: 'Last 12 Months' },
              { value: 'all_time', label: 'All Time' },
            ]}
            className="w-40 text-xs"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && <CardSkeleton count={4} />}

      {isError && (
        <ErrorState
          title="Unable to load reporting analytics"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && !reports && (
        <EmptyState
          icon={<BarChart3 className="w-6 h-6 text-slate-400" />}
          title="No Analytics Data Available"
          description="The analytics service returned no reports for this period."
          actionLabel="Refresh Reports"
          onAction={() => refetch()}
        />
      )}

      {!isLoading && !isError && reports && (
        <div className="space-y-6">
          {/* Win/Loss & Cycle Metric Cards */}
          {reports.winLossRate && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Win Rate
                </span>
                <p className="text-2xl font-mono font-semibold text-emerald-400 tabular-nums">
                  {reports.winLossRate.wonRate}%
                </p>
                <span className="text-[10px] text-slate-400">Historical closed opportunities</span>
              </Card>

              <Card className="p-4 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Loss Rate
                </span>
                <p className="text-2xl font-mono font-semibold text-rose-400 tabular-nums">
                  {reports.winLossRate.lostRate}%
                </p>
                <span className="text-[10px] text-slate-400">Reflective lessons extracted</span>
              </Card>

              <Card className="p-4 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Avg Cycle (Won)
                </span>
                <p className="text-2xl font-mono font-semibold text-slate-100 tabular-nums">
                  {reports.winLossRate.averageCycleDaysWon}d
                </p>
                <span className="text-[10px] text-slate-400">Days from lead to contract</span>
              </Card>

              <Card className="p-4 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Avg Cycle (Lost)
                </span>
                <p className="text-2xl font-mono font-semibold text-slate-300 tabular-nums">
                  {reports.winLossRate.averageCycleDaysLost}d
                </p>
                <span className="text-[10px] text-slate-400">Days before deal attrition</span>
              </Card>
            </div>
          )}

          {/* Charts Row 1: Monthly Trends & Revenue Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Deals Chart */}
            <Card className="p-5">
              <CardHeader
                title="Monthly Pipeline & Closes"
                subtitle="Closed Won vs Closed Lost volume by month."
              />
              {!hasMonthlyData ? (
                <EmptyState
                  title="No Monthly History"
                  description="No historical monthly deal data available for this timeframe."
                />
              ) : (
                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reports.monthlyDeals}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          borderColor: '#374151',
                          fontSize: '12px',
                        }}
                        formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`]}
                      />
                      <Bar dataKey="closedWon" name="Closed Won (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="closedLost" name="Closed Lost (₹)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Revenue Forecast Chart */}
            <Card className="p-5">
              <CardHeader
                title="Projected Revenue Forecast"
                subtitle="Conservative, Expected, and Optimistic model estimates."
              />
              {!hasForecastData ? (
                <EmptyState
                  title="No Forecast Model Available"
                  description="Revenue forecast model has not produced projections for this timeframe."
                />
              ) : (
                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reports.revenueForecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          borderColor: '#374151',
                          fontSize: '12px',
                        }}
                        formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`]}
                      />
                      <Line
                        type="monotone"
                        dataKey="optimistic"
                        name="Optimistic"
                        stroke="#06b6d4"
                        strokeDasharray="4 4"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="expected"
                        name="Expected"
                        stroke="#6366f1"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="conservative"
                        name="Conservative"
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* Charts Row 2: Top Customers Table & Pipeline Stage Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Customers (2 cols) */}
            <div className="lg:col-span-2">
              <Card className="p-5">
                <CardHeader
                  title="Top Client Value Concentration"
                  subtitle="Enterprise opportunities driving portfolio valuation."
                />
                {!hasTopCustomers ? (
                  <EmptyState
                    title="No Customer Records"
                    description="No top customer metrics reported by backend."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono">
                          <th className="pb-3 font-medium">Client</th>
                          <th className="pb-3 font-medium">Industry</th>
                          <th className="pb-3 font-medium">Deals Count</th>
                          <th className="pb-3 font-medium text-right">Aggregate Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {reports.topCustomers?.map((cust, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/20">
                            <td className="py-3 font-semibold text-slate-200">{cust.client}</td>
                            <td className="py-3 text-slate-400">{cust.industry}</td>
                            <td className="py-3 font-mono text-slate-300 tabular-nums">
                              {cust.dealCount}
                            </td>
                            <td className="py-3 text-right font-mono font-semibold text-slate-100 tabular-nums">
                              ₹{(cust.totalValue || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            {/* Stage Distribution Breakdown (1 col) */}
            <Card className="p-5">
              <CardHeader
                title="Stage Allocation"
                subtitle="Deals by pipeline phase."
              />
              {!hasStageData ? (
                <EmptyState
                  title="No Stage Data"
                  description="Pipeline stage distribution not available."
                />
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reports.stageDistribution}
                        dataKey="value"
                        nameKey="stage"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={45}
                        paddingAngle={3}
                      >
                        {reports.stageDistribution?.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          borderColor: '#374151',
                          fontSize: '12px',
                        }}
                        formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`, 'Pipeline Value']}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
