import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Plus,
  RefreshCw,
  Sliders,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useSystemHealth } from '../../hooks/useIntelligenceApi';
import { getApiBaseUrl } from '../../lib/api/client';

export const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: health, isError, isLoading, refetch } = useSystemHealth();
  const apiBase = getApiBaseUrl();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/deals/new')) return ['Deals', 'New Deal'];
    if (path.startsWith('/deals/')) return ['Deals', 'Deal Intelligence Workspace'];
    if (path === '/dashboard') return ['Command Center', 'Dashboard'];
    if (path === '/deals') return ['Command Center', 'Deals'];
    if (path === '/deal-tracking') return ['Command Center', 'Deal Tracking'];
    if (path === '/deal-intelligence') return ['Intelligence', 'Deal Intelligence'];
    if (path === '/upload-transcripts') return ['Intelligence', 'Transcript Intelligence'];
    if (path === '/deal-memory') return ['Intelligence', 'Deal Memory'];
    if (path === '/suggestions') return ['Intelligence', 'Suggestions'];
    if (path === '/risk-analysis') return ['Intelligence', 'Risk Analysis'];
    if (path === '/simulation') return ['Intelligence', 'What-If Simulation'];
    if (path === '/knowledge-base') return ['Knowledge', 'Knowledge Base'];
    if (path === '/reports') return ['Analytics', 'Reports'];
    if (path === '/settings') return ['System', 'Settings'];
    return ['Command Center', 'Overview'];
  };

  const crumbs = getBreadcrumbs();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0d121f]/90 backdrop-blur-sm px-6 flex items-center justify-between shrink-0 z-20">
      {/* Zone 1: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-slate-400">{crumbs[0]}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-100 font-semibold tracking-tight">{crumbs[1]}</span>
      </div>

      {/* Zone 2: Intelligence Loop status / Central indicator */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-slate-300">Intelligence Layer Active</span>
        </div>
      </div>

      {/* Zone 3: Connection health + Actions */}
      <div className="flex items-center gap-3">
        {/* Backend health ping */}
        <button
          onClick={() => refetch()}
          title={`Backend: ${apiBase || 'Current Origin'} - Click to re-check connection`}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${
            isLoading
              ? 'bg-slate-900 border-slate-800 text-slate-400'
              : isError
              ? 'bg-rose-950/40 border-rose-900/40 text-rose-300 hover:bg-rose-950/60'
              : 'bg-emerald-950/40 border-emerald-900/40 text-emerald-300 hover:bg-emerald-950/60'
          }`}
        >
          {isLoading ? (
            <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
          ) : isError ? (
            <AlertCircle className="w-3 h-3 text-rose-400" />
          ) : (
            <CheckCircle className="w-3 h-3 text-emerald-400" />
          )}
          <span className="hidden sm:inline">
            {isLoading ? 'Checking' : isError ? 'Backend Offline' : 'API Connected'}
          </span>
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/upload-transcripts')}
          leftIcon={<Activity className="w-3.5 h-3.5 text-indigo-400" />}
          className="hidden sm:inline-flex text-xs"
        >
          Upload Transcript
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/deals/new')}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          New Deal
        </Button>
      </div>
    </header>
  );
};
