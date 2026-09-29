import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Sparkles, X, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import { DealCopilotChat } from './DealCopilotChat';
import { useChatDeals } from '../../hooks/useIntelligenceApi';

export const GlobalDealCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const location = useLocation();

  const { data: dealsData } = useChatDeals();
  const deals = dealsData?.deals || [];

  // Extract deal ID from URL path if user is viewing a deal
  const dealMatch = location.pathname.match(/\/deals\/(DEAL-[0-9a-zA-Z_-]+)/);
  const currentDealId = dealMatch ? dealMatch[1] : undefined;
  const currentDeal = deals.find((d) => d.id === currentDealId);

  // Keyboard shortcut: Cmd+K or Ctrl+K to toggle copilot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setIsMinimized(false);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating Action Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white font-medium text-xs shadow-lg shadow-indigo-900/40 hover:shadow-indigo-800/60 hover:scale-105 active:scale-95 transition-all duration-200 border border-indigo-400/30 cursor-pointer"
            aria-label="Open Deal Intelligence Copilot"
            title="Open Deal Intelligence Copilot (Ctrl+K / ⌘K)"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-indigo-900 animate-ping" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-semibold tracking-tight text-white flex items-center gap-1.5">
                AI Deal Copilot
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-950/70 border border-indigo-400/40 text-indigo-200">
                  ⌘K
                </span>
              </span>
              {currentDeal ? (
                <span className="text-[10px] text-indigo-200 truncate max-w-[140px] font-mono">
                  {currentDeal.client}
                </span>
              ) : (
                <span className="text-[10px] text-indigo-200/80 font-mono">
                  Grounded Strategy
                </span>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 ease-out shadow-2xl ${
            isMaximized
              ? 'inset-4 sm:inset-8 w-auto h-auto'
              : isMinimized
              ? 'bottom-6 right-6 w-80 h-14'
              : 'bottom-6 right-6 w-[94vw] sm:w-[500px] h-[640px] max-h-[85vh]'
          }`}
        >
          {isMinimized ? (
            <div className="h-full bg-[#0d121f] border border-slate-800 rounded-xl px-4 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-100">Deal Intelligence Copilot</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200"
                  title="Expand"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-rose-400"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <DealCopilotChat
              initialDealId={currentDealId}
              compact={!isMaximized}
              onClose={() => setIsOpen(false)}
              onMinimize={() => setIsMinimized(true)}
              isMaximized={isMaximized}
              onToggleMaximize={() => setIsMaximized((prev) => !prev)}
            />
          )}
        </div>
      )}
    </>
  );
};
