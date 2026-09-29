import React from 'react';
import { AlertCircle, RefreshCw, ServerCrash } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  error?: Error | null | unknown;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Unavailable',
  error,
  message,
  onRetry,
  className = '',
}) => {
  const errorMessage =
    message || (error instanceof Error ? error.message : 'The requested intelligence resource could not be loaded.');

  const isNetworkFailure =
    errorMessage.toLowerCase().includes('connect') ||
    errorMessage.toLowerCase().includes('network') ||
    errorMessage.toLowerCase().includes('failed to fetch');

  return (
    <div
      className={`border border-rose-900/40 rounded-xl p-6 md:p-8 bg-rose-950/10 text-left flex flex-col sm:flex-row items-start gap-4 ${className}`}
    >
      <div className="p-2.5 rounded-lg bg-rose-900/30 text-rose-400 shrink-0">
        {isNetworkFailure ? (
          <ServerCrash className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <h4 className="text-sm font-semibold text-rose-300 tracking-tight">{title}</h4>
        <p className="text-xs text-rose-200/80 leading-relaxed font-mono">{errorMessage}</p>



        {onRetry && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="border-rose-800/60 hover:bg-rose-900/30 text-rose-200"
            >
              Retry Request
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
