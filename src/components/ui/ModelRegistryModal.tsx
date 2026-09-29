import React, { useState } from 'react';
import { X, Layers, CheckCircle2, BarChart2, Shield, Activity, RefreshCw } from 'lucide-react';
import { useModelStatus } from '../../hooks/useIntelligenceApi';
import { Card } from './Card';
import { ModelStatusBadge } from './ModelStatusBadge';

interface ModelRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialModelName?: string;
}

export const ModelRegistryModal: React.FC<ModelRegistryModalProps> = ({
  isOpen,
  onClose,
  initialModelName = 'deal-risk',
}) => {
  const [selectedModel, setSelectedModel] = useState<string>(initialModelName);
  const { data: statusData, isLoading, refetch } = useModelStatus();

  if (!isOpen) return null;

  const models = statusData?.models || {};
  const currentModel = models[selectedModel] || Object.values(models)[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 font-display">
                Machine Learning Model Registry & Governance
              </h2>
              <p className="text-xs text-slate-400">
                Trained algorithms, validation metrics, and feature pipelines evaluated on historical sales data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              title="Refresh Registry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar + Detail */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[420px]">
          {/* Models List */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 p-3 space-y-1.5 bg-slate-950/40 shrink-0 overflow-y-auto">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2">
              Registered Models ({Object.keys(models).length})
            </span>
            {Object.keys(models).length === 0 && (
              <p className="text-xs text-slate-400 px-2 py-4">Loading model registry...</p>
            )}
            {Object.entries(models).map(([name, m]: [string, any]) => (
              <button
                key={name}
                onClick={() => setSelectedModel(name)}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex flex-col gap-1 ${
                  selectedModel === name
                    ? 'bg-indigo-950/60 border-indigo-600/40 text-indigo-200 font-medium'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-200">{name}</span>
                  <span className="text-[10px] font-mono text-slate-400">v{m.version}</span>
                </div>
                <span className="text-[10px] text-slate-400 truncate">{m.algorithm}</span>
              </button>
            ))}
          </div>

          {/* Model Detail View */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-[#0e1422]">
            {currentModel ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-100 font-mono">
                        {currentModel.modelName}
                      </h3>
                      <ModelStatusBadge status={currentModel.status} version={currentModel.version} />
                    </div>
                    <p className="text-xs text-indigo-300 font-mono">
                      Algorithm: {currentModel.algorithm}
                    </p>
                  </div>

                  <div className="text-right text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div>Dataset: {currentModel.datasetVersion}</div>
                    <div>Trained: {new Date(currentModel.trainedAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Holdout Test Metrics */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Holdout Evaluation Metrics
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(currentModel.metrics || {}).map(([k, val]: [string, any]) => {
                      if (typeof val === 'object') return null;
                      return (
                        <div key={k} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 uppercase truncate block">
                            {k}
                          </span>
                          <span className="text-lg font-bold font-mono text-slate-100 tabular-nums">
                            {typeof val === 'number' ? (val < 1 && val > 0 ? (val * 100).toFixed(1) + '%' : val) : String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Features Consumed */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Input Features ({currentModel.features?.length || 0})
                  </span>
                  <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 flex flex-wrap gap-1.5">
                    {(currentModel.features || []).map((feat: string) => (
                      <span
                        key={feat}
                        className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-[11px] font-mono text-slate-300"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Governance & Notes */}
                {currentModel.notes && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Audit Notes & Reproducibility
                    </span>
                    <p className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                      {currentModel.notes}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-400">Select a model to view card.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
