import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  FileCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea, Select } from '../../components/ui/Input';
import { IntelligenceBadge } from '../../components/ui/IntelligenceBadge';
import { ExplainabilityPanel } from '../../components/ui/ExplainabilityDrawer';
import { SentimentBadge } from '../../components/ui/StatusBadge';
import { useDeals } from '../../hooks/useIntelligenceApi';
import { api, ApiError } from '../../lib/api/client';
import { Transcript } from '../../types';

export const TranscriptUploadPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialDealId = searchParams.get('dealId') || '';

  const { data: dealsData } = useDeals();
  const deals = dealsData?.deals || [];

  const [selectedDealId, setSelectedDealId] = useState(initialDealId);
  const [mode, setMode] = useState<'FILE' | 'PASTE'>('FILE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');

  // Processing state from backend
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<
    'IDLE' | 'PENDING' | 'PARSING' | 'UNDERSTANDING' | 'RETRIEVING' | 'ANALYZING' | 'COMPLETED' | 'FAILED'
  >('IDLE');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadedTranscript, setUploadedTranscript] = useState<Transcript | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExts = ['.pdf', '.docx', '.txt'];
      const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
      if (!hasValidExt) {
        setErrorMessage('Supported formats are PDF, DOCX, and TXT.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealId) {
      setErrorMessage('Please select a target deal to associate this transcript with.');
      return;
    }

    if (mode === 'FILE' && !selectedFile) {
      setErrorMessage('Please select a transcript file to upload.');
      return;
    }

    if (mode === 'PASTE' && !pastedText.trim()) {
      setErrorMessage('Please paste the transcript dialogue text.');
      return;
    }

    setIsSubmitting(true);
    setProcessingStatus('PARSING');
    setStatusMessage('Sending transcript payload to backend intelligence pipeline...');
    setErrorMessage(null);

    try {
      let result: Transcript;

      if (mode === 'FILE' && selectedFile) {
        result = await api.transcripts.upload(selectedDealId, selectedFile);
      } else {
        result = await api.transcripts.uploadText(
          selectedDealId,
          pastedText.trim(),
          sessionTitle.trim() || 'Pasted Call Transcript'
        );
      }

      setUploadedTranscript(result);
      setProcessingStatus(result.status || 'COMPLETED');
      setStatusMessage('Analysis complete. Transcripts processed into grounded intelligence.');
    } catch (err: any) {
      setProcessingStatus('FAILED');
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : 'Failed to process transcript on backend service. Please check connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight">
            Transcript Intelligence Ingestion
          </h1>
          <IntelligenceBadge source="AI_INSIGHT" />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Ingest customer call recordings, sales meeting notes, or chat logs to automatically extract intent, objections, and risk factors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Form (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Select target deal */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Deal / Opportunity *
                </label>
                <select
                  value={selectedDealId}
                  onChange={(e) => setSelectedDealId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg text-xs p-2.5 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  required
                >
                  <option value="">Select target deal...</option>
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.client} — ₹{(d.value || 0).toLocaleString()} ({d.product})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setMode('FILE')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === 'FILE'
                      ? 'bg-slate-800 text-slate-100 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Document File (PDF / DOCX / TXT)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('PASTE')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === 'PASTE'
                      ? 'bg-slate-800 text-slate-100 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Paste Transcript Text
                </button>
              </div>

              {/* File Upload Mode */}
              {mode === 'FILE' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Transcript Document
                  </label>
                  <label
                    htmlFor="file-upload"
                    className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 transition-colors group"
                  >
                    <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 mb-2 transition-colors" />
                    <span className="text-xs font-semibold text-slate-200">
                      {selectedFile ? selectedFile.name : 'Choose or drop transcript file here'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                        : 'PDF, DOCX, or TXT up to 25MB'}
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Text Paste Mode */}
              {mode === 'PASTE' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Session Name / Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Technical Discovery Call w/ VP Eng"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2.5 text-slate-100 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Raw Dialogue / Meeting Transcript
                    </label>
                    <textarea
                      rows={8}
                      placeholder="Speaker 1 (AE): Thanks for joining today...&#10;Speaker 2 (Customer): Our main challenge is scale and latency..."
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-3 font-mono text-slate-100 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="intelligence"
                size="md"
                isLoading={isSubmitting}
                className="w-full text-xs"
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Upload & Synthesize Intelligence
              </Button>
            </form>
          </Card>
        </div>

        {/* Processing Pipeline Stages sidebar */}
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              Pipeline Processing State
            </h3>

            <div className="space-y-3">
              {[
                { key: 'PARSING', label: '1. Parsing Text & Dialogue' },
                { key: 'UNDERSTANDING', label: '2. Extracting Intent & Sentiment' },
                { key: 'RETRIEVING', label: '3. Grounding Org Knowledge (RAG)' },
                { key: 'ANALYZING', label: '4. Memory Recall & Synthesis' },
                { key: 'COMPLETED', label: '5. Intelligence Ready' },
              ].map((step, idx) => {
                const isCurrent = processingStatus === step.key;
                const isPassed =
                  (processingStatus === 'COMPLETED' && step.key !== 'FAILED') ||
                  (processingStatus === 'ANALYZING' && idx < 3) ||
                  (processingStatus === 'UNDERSTANDING' && idx < 1);

                return (
                  <div
                    key={step.key}
                    className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-colors ${
                      isCurrent
                        ? 'bg-violet-950/40 border-violet-500/50 text-violet-200'
                        : isPassed
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>{step.label}</span>
                    {isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                    ) : isPassed ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </div>
                );
              })}
            </div>

            {statusMessage && (
              <p className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
                {statusMessage}
              </p>
            )}

            {uploadedTranscript && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate(`/deals/${selectedDealId}?tab=intelligence`)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  View Extracted Insights
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
