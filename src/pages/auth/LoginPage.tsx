import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const { login, isLoading, error: authError, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const fillDemoCredentials = () => {
    setEmail('schen@enterprise.com');
    setPassword('Password123!');
    setFormError(null);
    setInfoNotice(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setInfoNotice(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both email address and password.');
      return;
    }

    try {
      await login({ email, password, rememberMe });
      navigate(from, { replace: true });
    } catch {
      // Handled in store error state
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-950/60">
            DIA
          </div>
          <span className="font-display font-bold text-lg text-slate-100">Deal Intelligence Agent</span>
        </Link>
        <h2 className="text-xl font-display font-semibold tracking-tight text-slate-200">
          Sign in to Deal Intelligence Command Center
        </h2>
        <p className="text-xs text-slate-400">
          Enter your enterprise credentials to access active deal intelligence.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#111827] py-8 px-6 shadow-xl border border-slate-800 rounded-xl sm:px-10 space-y-5">
          {/* Quick Demo Fill Banner */}
          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/50 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono font-semibold text-indigo-300 uppercase tracking-wider">Demo Account</span>
              <p className="text-slate-300 font-mono text-[11px]">schen@enterprise.com</p>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="px-2.5 py-1 text-[11px] font-medium bg-indigo-600/80 hover:bg-indigo-600 text-white rounded border border-indigo-500/50 transition-colors shrink-0"
            >
              Fill Credentials
            </button>
          </div>

          {(formError || authError) && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="font-semibold">{formError || authError}</p>
            </div>
          )}

          {infoNotice && (
            <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/60 text-xs text-sky-300 flex items-start gap-2.5">
              <p>{infoNotice}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rep@enterprise.com"
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setInfoNotice('Password reset is managed by your enterprise identity provider or backend administrator.')}
                className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="intelligence"
              size="lg"
              className="w-full text-xs"
              isLoading={isLoading}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an enterprise account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
