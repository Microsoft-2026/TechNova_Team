import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Upload,
  Sparkles,
  FileText,
  Quote,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  AlertCircle,
  Shield,
  FileCheck,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { IntelligenceBadge } from '../../components/ui/IntelligenceBadge';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { DealCopilotChat } from '../../components/chat/DealCopilotChat';
import {
  useKnowledgeDocs,
  useUploadKnowledgeDoc,
} from '../../hooks/useIntelligenceApi';
import { Citation, KnowledgeAnswer } from '../../types';

export const KnowledgeBasePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ASK' | 'DOCS'>('ASK');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('PLAYBOOK');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: docsData, isLoading: docsLoading, isError: docsError, error: docsErr, refetch: refetchDocs } =
    useKnowledgeDocs({
      search: searchTerm || undefined,
      category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
    });

  const uploadMutation = useUploadKnowledgeDoc();

  const docs = docsData?.docs || [];

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadError(null);

    try {
      await uploadMutation.mutateAsync({
        file: uploadFile,
        category: uploadCategory,
      });
      setShowUploadModal(false);
      setUploadFile(null);
      refetchDocs();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document to knowledge base');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
              Organizational Knowledge & RAG
            </h1>
            <IntelligenceBadge source="FROM_KNOWLEDGE_BASE" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounding engine connecting playbooks, pricing sheets, technical specifications, and compliance rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="cyan"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Tabs: Ask RAG vs Documents Library */}
      {/* Tabs: AI Copilot vs Documents Library */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-lg max-w-md">
        <button
          onClick={() => setActiveTab('ASK')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'ASK'
              ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Knowledge & Deal Copilot</span>
        </button>
        <button
          onClick={() => setActiveTab('DOCS')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-mono font-medium transition-colors ${
            activeTab === 'DOCS'
              ? 'bg-slate-800 text-slate-100 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Indexed Documents ({docs.length})
        </button>
      </div>

      {/* Tab: AI Knowledge & Deal Copilot */}
      {activeTab === 'ASK' && (
        <div className="h-[680px]">
          <DealCopilotChat
            title="Organizational Knowledge & Deal Copilot"
            compact={false}
          />
        </div>
      )}

      {/* Tab: Indexed Documents Library */}
      {activeTab === 'DOCS' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-7">
                <Input
                  placeholder="Filter indexed documents by name or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                  className="text-xs"
                />
              </div>

              <div className="sm:col-span-5">
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Document Categories' },
                    { value: 'PLAYBOOK', label: 'Sales Playbooks' },
                    { value: 'PRODUCT_DOC', label: 'Product Docs & Specs' },
                    { value: 'PRICING_GUIDE', label: 'Pricing & Discount Guides' },
                    { value: 'POLICY', label: 'Compliance & Legal Policies' },
                    { value: 'COMPETITIVE_BATTLECARD', label: 'Battlecards' },
                  ]}
                  className="text-xs"
                />
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            {docsLoading && (
              <div className="p-6">
                <TableSkeleton rows={4} cols={5} />
              </div>
            )}

            {docsError && (
              <div className="p-6">
                <ErrorState
                  title="Unable to load knowledge documents"
                  error={docsErr}
                  onRetry={() => refetchDocs()}
                />
              </div>
            )}

            {!docsLoading && !docsError && docs.length === 0 && (
              <div className="p-6">
                <EmptyState
                  icon={<BookOpen className="w-6 h-6 text-slate-400" />}
                  title="Knowledge Base Empty"
                  description="No organization documents are currently indexed. Upload product documentation or playbooks to activate grounded RAG answers."
                  actionLabel="Upload First Document"
                  onAction={() => setShowUploadModal(true)}
                />
              </div>
            )}

            {!docsLoading && !docsError && docs.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono">
                      <th className="py-3 px-4 font-medium">Document Title</th>
                      <th className="py-3 px-4 font-medium">Category</th>
                      <th className="py-3 px-4 font-medium">Indexed Chunks</th>
                      <th className="py-3 px-4 font-medium">File Size</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {docs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-200 block">{doc.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{doc.id}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-300">
                          {doc.category}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300 tabular-nums">
                          {doc.chunkCount ?? 0} chunks
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 tabular-nums">
                          {((doc.sizeBytes || 0) / 1024).toFixed(0)} KB
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/20">
                            {doc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-slate-100">
                Index Document into Knowledge Base
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {uploadError && (
                <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  {uploadError}
                </div>
              )}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Document Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                >
                  <option value="PLAYBOOK">Sales Playbook</option>
                  <option value="PRODUCT_DOC">Product Specs & Documentation</option>
                  <option value="PRICING_GUIDE">Pricing Guide</option>
                  <option value="POLICY">Compliance Policy</option>
                  <option value="COMPETITIVE_BATTLECARD">Competitive Battlecard</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">File Upload</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="cyan"
                  size="sm"
                  isLoading={uploadMutation.isPending}
                >
                  Upload & Index
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
