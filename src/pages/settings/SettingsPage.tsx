import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  User,
  Building,
  Bell,
  Key,
  Layers,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Shield,
  Activity,
  Cpu,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ModelStatusBadge } from '../../components/ui/ModelStatusBadge';
import { useAuthStore } from '../../store/authStore';
import { getApiBaseUrl, setApiBaseUrlOverride } from '../../lib/api/client';
import { useSystemHealth, useModelStatus } from '../../hooks/useIntelligenceApi';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState<'BACKEND' | 'ML_GOVERNANCE' | 'PROFILE' | 'COMPANY' | 'NOTIFICATIONS' | 'INTEGRATIONS'>('BACKEND');

  // Backend config
  const currentUrl = getApiBaseUrl();
  const [apiUrl, setApiUrl] = useState(currentUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: healthData, isError, isLoading, refetch: refetchHealth } = useSystemHealth();
  const { data: modelStatusData, isLoading: modelsLoading, refetch: refetchModels } = useModelStatus();

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrlOverride(apiUrl);
    setSaveSuccess(true);
    refetchHealth();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const integrations = [
    {
      name: 'Salesforce CRM',
      category: 'CRM Synchronization',
      status: 'Not connected',
      note: 'Awaiting backend OAuth credentials & tenant sync.',
    },
    {
      name: 'HubSpot Sales Hub',
      category: 'Inbound Contacts',
      status: 'Not connected',
      note: 'Not configured on active backend environment.',
    },
    {
      name: 'Gong / Chorus Audio Streams',
      category: 'Call Transcripts',
      status: 'Not connected',
      note: 'Direct recording ingestion webhooks disabled.',
    },
    {
      name: 'Slack Deal Rooms',
      category: 'Alert Dispatch',
      status: 'Not connected',
      note: 'Enterprise webhook dispatch not provisioned.',
    },
    {
      name: 'Google Workspace Calendar & Gmail',
      category: 'Meeting Activity',
      status: 'Not connected',
      note: 'Requires workspace OAuth integration.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
          System & Workspace Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage backend endpoints, profile credentials, notifications, and integration connections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar (3 cols) */}
        <div className="md:col-span-3 space-y-1">
          <Card className="p-2 space-y-0.5">
            {[
              { id: 'BACKEND', label: 'Backend API & Health', icon: Server },
              { id: 'PROFILE', label: 'User Profile', icon: User },
              { id: 'COMPANY', label: 'Company & Workspace', icon: Building },
              { id: 'INTEGRATIONS', label: 'Integrations', icon: Layers },
              { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
            ].map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </Card>
        </div>

        {/* Content Pane (9 cols) */}
        <div className="md:col-span-9 space-y-6">
          {/* Section: Backend & Health */}
          {activeSection === 'BACKEND' && (
            <Card className="p-6 space-y-6">
              <CardHeader
                title="Backend API Configuration & Health Probe"
                subtitle="Configure the target Deal Intelligence Agent backend service URL."
              />

              {/* Live Connection Health Badge */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[#0e1424] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg border ${
                      isLoading
                        ? 'bg-slate-900 border-slate-800 text-slate-400'
                        : isError
                        ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                        : 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                    }`}
                  >
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-100">
                        {isLoading
                          ? 'Checking Health...'
                          : isError
                          ? 'Backend Unreachable'
                          : 'Intelligence Backend Online'}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          isError ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
                        }`}
                      >
                        {isError ? 'DISCONNECTED' : 'HEALTHY'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Endpoint: {currentUrl || '(Relative /)'}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchHealth()}
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
                  className="text-xs"
                >
                  Ping Health
                </Button>
              </div>

              {/* Form to change target URL */}
              <form onSubmit={handleSaveApiUrl} className="space-y-4">
                <Input
                  label="VITE_API_BASE_URL (Target Backend Host)"
                  placeholder="e.g. https://api.deal-intelligence.internal or http://localhost:8000"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  hint="Leave empty to use relative origin (default Vite proxy). All endpoints (/deals, /auth, etc.) will be dispatched to this base URL."
                />

                {saveSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>API Base URL successfully updated and persisted!</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setApiUrl('');
                      setApiBaseUrlOverride('');
                      refetchHealth();
                    }}
                  >
                    Reset to Default
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Endpoint Configuration
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Section: Profile */}
          {activeSection === 'PROFILE' && (
            <Card className="p-6 space-y-6">
              <CardHeader
                title="Account & Identity"
                subtitle="Your authenticated session details from the backend directory."
              />

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" value={user?.fullName || 'Not authenticated'} readOnly />
                  <Input label="Email Address" value={user?.email || 'N/A'} readOnly />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Enterprise Role" value={user?.role || 'Account Executive'} readOnly />
                  <Input label="Assigned Company" value={user?.company || 'Enterprise'} readOnly />
                </div>
              </div>
            </Card>
          )}

          {/* Section: Company */}
          {activeSection === 'COMPANY' && (
            <Card className="p-6 space-y-6">
              <CardHeader
                title="Organization Workspace"
                subtitle="Intelligence tenancy and memory boundaries."
              />
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  Tenant Memory Partition:{' '}
                  <span className="font-mono text-indigo-300 font-semibold">
                    {user?.company ? `${user.company.toLowerCase().replace(/\s+/g, '-')}-cluster` : 'default-enterprise-cluster'}
                  </span>
                </p>
                <p className="text-slate-400 leading-relaxed">
                  All previous deal recall vectors and retained organizational lessons are securely isolated to your enterprise cluster.
                </p>
              </div>
            </Card>
          )}

          {/* Section: Integrations */}
          {activeSection === 'INTEGRATIONS' && (
            <Card className="p-6 space-y-6">
              <CardHeader
                title="Third-Party Ecosystem Integrations"
                subtitle="Status of enterprise CRM, recording pipelines, and messaging webhooks."
              />

              <div className="space-y-3">
                {integrations.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-800 bg-[#0e1424] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-100 block">{item.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{item.category}</span>
                      <p className="text-[11px] text-slate-500 mt-1">{item.note}</p>
                    </div>

                    <div className="shrink-0">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Section: Notifications */}
          {activeSection === 'NOTIFICATIONS' && (
            <Card className="p-6 space-y-4">
              <CardHeader
                title="Intelligence Alerts & Escalations"
                subtitle="Configure urgency thresholds for risk signals and newly recalled deal strategies."
              />
              <div className="space-y-3 text-xs text-slate-300">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/40 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-indigo-600" />
                  <div>
                    <span className="font-semibold block text-slate-200">Critical Deal Risk Escalations</span>
                    <span className="text-slate-400 text-[11px]">Notify when customer inactivity or competitor threats exceed score of 70.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/40 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-indigo-600" />
                  <div>
                    <span className="font-semibold block text-slate-200">Transcript Ingestion Complete</span>
                    <span className="text-slate-400 text-[11px]">Notify when newly uploaded meeting audio or text finishes linguistic analysis.</span>
                  </div>
                </label>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
