import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Quote,
  Copy,
  Check,
  RotateCcw,
  Download,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  X,
  Briefcase,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Info,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { IntelligenceBadge } from '../ui/IntelligenceBadge';
import { RiskBadge, StageBadge } from '../ui/StatusBadge';
import { useChatIntelligence, useChatDeals } from '../../hooks/useIntelligenceApi';
import { ChatMessage, Citation } from '../../types';

interface DealCopilotChatProps {
  initialDealId?: string;
  title?: string;
  compact?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const DEFAULT_PROMPTS = [
  { label: 'Analyze Deal Risks', prompt: 'What are the biggest risk factors and vulnerabilities on this deal?' },
  { label: 'Counter Competitor Discounts', prompt: 'How do we counter competitor price discounting without reducing our margins?' },
  { label: 'SLA Objection Strategy', prompt: 'What is our corporate policy and playbook for handling strict SLA penalty clauses?' },
  { label: 'Draft Follow-up Email', prompt: 'Draft a high-impact executive follow-up email to the buyer addressing their primary concerns.' },
];

export const DealCopilotChat: React.FC<DealCopilotChatProps> = ({
  initialDealId,
  title = 'Deal Intelligence Copilot',
  compact = false,
  onClose,
  onMinimize,
  isMaximized,
  onToggleMaximize,
}) => {
  const [selectedDealId, setSelectedDealId] = useState<string>(initialDealId || '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: dealsData } = useChatDeals();
  const chatMutation = useChatIntelligence();

  const deals = dealsData?.deals || [];
  const currentDeal = deals.find((d) => d.id === selectedDealId);

  // Sync initialDealId if it changes
  useEffect(() => {
    if (initialDealId) {
      setSelectedDealId(initialDealId);
    }
  }, [initialDealId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMutation.isPending]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      dealContext: currentDeal
        ? {
            id: currentDeal.id,
            client: currentDeal.client,
            stage: currentDeal.stage,
            value: currentDeal.value,
            risk: currentDeal.risk,
            winProbability: currentDeal.winProbability,
          }
        : undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');

    try {
      const payloadMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await chatMutation.mutateAsync({
        messages: payloadMessages,
        dealId: selectedDealId || undefined,
      });

      const assistantMessage: ChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toISOString(),
        citations: res.citations,
        suggestedPrompts: res.suggestedPrompts,
        dealContext: res.dealContext,
        modelUsed: res.modelUsed,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `**Intelligence Connection Error:** ${
          err?.message || 'Unable to connect to the Deal Intelligence Agent. Please try again.'
        }`,
        timestamp: new Date().toISOString(),
        modelUsed: 'Error Handler',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const transcriptText = messages
      .map(
        (m) =>
          `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role === 'user' ? 'USER' : 'DEAL INTELLIGENCE AGENT'}:\n${
            m.content
          }\n`
      )
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deal-intelligence-chat-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render markdown text formatting (headers, bold, bullet points, blockquotes)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-semibold text-slate-100 text-sm mt-3 mb-1 tracking-tight flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-bold text-slate-100 text-sm mt-3 mb-1.5 border-b border-slate-800 pb-1">
            {line.replace('## ', '')}
          </h3>
        );
      }
      // Blockquotes
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="pl-3 py-1 my-1.5 border-l-2 border-indigo-500/60 bg-indigo-950/20 text-indigo-200 italic text-xs rounded-r"
          >
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      // Bullet items
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().replace(/^[-•*]\s+/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 text-xs my-0.5 leading-relaxed">
            {renderInlineMarkdown(itemText)}
          </li>
        );
      }
      // Numbered items
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={idx} className="text-slate-300 text-xs my-1 pl-1 leading-relaxed">
            {renderInlineMarkdown(line.trim())}
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Standard line
      return (
        <p key={idx} className="text-slate-300 text-xs leading-relaxed">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (text: string) => {
    // Process bold **text** and `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-slate-100 font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-cyan-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0d121f] text-slate-100 overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-900/50 shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-100 animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-slate-100 text-sm tracking-tight truncate">
                {title}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-violet-950/70 border border-violet-800/60 text-violet-300 hidden sm:inline-flex">
                Gemini 3.8 Flash
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono truncate">
              {currentDeal
                ? `Context: ${currentDeal.client} ($${(currentDeal.value / 1000).toFixed(0)}k)`
                : 'Context: Organization Knowledge Base & Playbooks'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {messages.length > 0 && (
            <>
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleExportChat}
                title="Export transcript"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors text-xs"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              title={isMaximized ? 'Restore size' : 'Maximize'}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {onMinimize && (
            <button
              onClick={onMinimize}
              title="Minimize chat"
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              title="Close chat"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Deal Context Selector Bar */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0">Deal Focus:</span>
          <select
            value={selectedDealId}
            onChange={(e) => setSelectedDealId(e.target.value)}
            className="bg-slate-950/80 border border-slate-700/80 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500 max-w-full font-mono"
          >
            <option value="">🏢 All Playbooks (No Specific Deal)</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.client} — ${d.value.toLocaleString()} ({d.stage})
              </option>
            ))}
          </select>
        </div>

        {currentDeal && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <StageBadge stage={currentDeal.stage as any} />
            <RiskBadge level={currentDeal.risk as any} />
          </div>
        )}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-display font-semibold text-slate-100 text-base">
                How can I assist your deal strategy today?
              </h3>
              <p className="text-xs text-slate-400">
                Ground answers in verified sales playbooks, historical won/lost deal precedents, objection handling scripts, and risk signals.
              </p>
            </div>

            {/* Quick Starter Pills */}
            <div className="w-full max-w-lg pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {DEFAULT_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  className="p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 transition-all text-xs group flex flex-col gap-1"
                >
                  <span className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {item.label}
                  </span>
                  <span className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}
            >
              {/* Message Bubble */}
              <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%]">
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-600/40 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl text-xs space-y-2 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                      : 'bg-[#121929] border border-slate-800/90 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Context Badge if attached */}
                  {msg.dealContext && msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800/80 text-[10px] font-mono text-indigo-300">
                      <Briefcase className="w-3 h-3 text-indigo-400" />
                      <span>Opportunity: {msg.dealContext.client} (${(msg.dealContext.value / 1000).toFixed(0)}k · {msg.dealContext.stage})</span>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="space-y-1 font-sans">
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      renderFormattedContent(msg.content)
                    )}
                  </div>

                  {/* Citations Preview Accordion */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2.5 mt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-cyan-400" />
                          Source Citations ({msg.citations.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((cit, cIdx) => {
                          const citKey = `${msg.id}_cit_${cIdx}`;
                          const isExpanded = expandedCitationId === citKey;
                          return (
                            <div key={citKey} className="w-full">
                              <button
                                onClick={() => setExpandedCitationId(isExpanded ? null : citKey)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono border transition-colors ${
                                  isExpanded
                                    ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-200'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <Quote className="w-3 h-3 text-cyan-400 shrink-0" />
                                  <span className="truncate">[{cIdx + 1}] {cit.docTitle}</span>
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  <span className="text-[10px] text-cyan-400/80">{cit.relevanceScore}% match</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="mt-1 p-2.5 rounded bg-slate-950 border border-cyan-900/40 text-[11px] font-mono text-slate-300 leading-relaxed space-y-1">
                                  <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">
                                    Document Excerpt:
                                  </div>
                                  <p className="italic text-slate-200">"{cit.snippet}"</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Message Bottom Utility Bar */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                      <span>{msg.modelUsed || 'Gemini 3.8 Flash'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="Copy response"
                          className="hover:text-slate-200 flex items-center gap-1 transition-colors"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <div className="flex items-center gap-1 ml-1 border-l border-slate-800 pl-2">
                          <button
                            onClick={() =>
                              setFeedbackState((prev) => ({
                                ...prev,
                                [msg.id]: prev[msg.id] === 'up' ? undefined! : 'up',
                              }))
                            }
                            className={`p-0.5 rounded hover:text-slate-200 ${
                              feedbackState[msg.id] === 'up' ? 'text-emerald-400' : ''
                            }`}
                            title="Helpful response"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() =>
                              setFeedbackState((prev) => ({
                                ...prev,
                                [msg.id]: prev[msg.id] === 'down' ? undefined! : 'down',
                              }))
                            }
                            className={`p-0.5 rounded hover:text-slate-200 ${
                              feedbackState[msg.id] === 'down' ? 'text-rose-400' : ''
                            }`}
                            title="Needs improvement"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5 font-semibold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Contextual Suggested Next Prompts */}
              {msg.role === 'assistant' && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                <div className="ml-9 mt-1 flex flex-wrap gap-1.5 max-w-[85%]">
                  {msg.suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p)}
                      className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-[11px] text-slate-300 hover:text-indigo-200 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {/* Thinking Indicator */}
        {chatMutation.isPending && (
          <div className="flex items-start gap-2.5 max-w-[85%]">
            <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-600/40 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#121929] border border-slate-800/90 text-slate-200 rounded-tl-none text-xs flex items-center gap-2.5 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                Gemini 3.8 Flash analyzing telemetry, competitor tactics, and internal playbooks...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-800 bg-[#0B0F19]/90 shrink-0 space-y-2">
        <div className="relative flex items-center">
          <textarea
            ref={inputRef}
            rows={compact ? 2 : 2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentDeal
                ? `Ask about ${currentDeal.client} (objections, risks, competitor rebuttal, pricing)...`
                : 'Ask a sales strategy question or query company playbooks...'
            }
            className="w-full pl-3 pr-20 py-2 rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 text-xs resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 font-sans"
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
            <Button
              variant="primary"
              size="sm"
              disabled={!inputValue.trim() || chatMutation.isPending}
              isLoading={chatMutation.isPending}
              onClick={() => handleSendMessage()}
              className="h-7 px-2.5 text-xs rounded-md"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Active Grounding: {currentDeal ? currentDeal.client : 'Enterprise Knowledge Base'}
          </span>
          <span className="hidden sm:inline">Press Enter to send · Shift+Enter for newline</span>
        </div>
      </div>
    </div>
  );
};
