import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  GitPullRequest,
  Sparkles,
  FileText,
  Brain,
  Compass,
  AlertTriangle,
  Sliders,
  BookOpen,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  interface NavItem {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
  }

  interface NavSection {
    label: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      label: 'COMMAND CENTER',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Deals', path: '/deals', icon: Briefcase },
        { name: 'Deal Tracking', path: '/deal-tracking', icon: GitPullRequest },
      ],
    },
    {
      label: 'INTELLIGENCE',
      items: [
        { name: 'Deal Intelligence', path: '/deal-intelligence', icon: Sparkles, color: 'text-violet-400' },
        { name: 'Transcript Intelligence', path: '/upload-transcripts', icon: FileText, color: 'text-indigo-400' },
        { name: 'Deal Memory', path: '/deal-memory', icon: Brain, color: 'text-amber-400' },
        { name: 'Suggestions', path: '/suggestions', icon: Compass, color: 'text-indigo-300' },
        { name: 'Risk Analysis', path: '/risk-analysis', icon: AlertTriangle, color: 'text-rose-400' },
        { name: 'Simulation', path: '/simulation', icon: Sliders, color: 'text-amber-400' },
      ],
    },
    {
      label: 'KNOWLEDGE',
      items: [
        { name: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen, color: 'text-cyan-400' },
      ],
    },
    {
      label: 'ANALYTICS',
      items: [
        { name: 'Reports', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#0d121f] border-r border-slate-800/80 transition-all duration-200 select-none z-30 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        {!isCollapsed && (
          <NavLink to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-900/50 shrink-0">
              DIA
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display font-semibold text-slate-100 text-sm tracking-tight truncate">
                Deal Intelligence
              </span>
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider truncate">
                Agent Layer
              </span>
            </div>
          </NavLink>
        )}

        {isCollapsed && (
          <NavLink to="/dashboard" className="mx-auto" title="Deal Intelligence Agent">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
          </NavLink>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            {!isCollapsed ? (
              <h4 className="px-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                {section.label}
              </h4>
            ) : (
              <div className="h-2" />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={isCollapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-200 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${item.color || ''}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>



      {/* User profile & Collapse toggle Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {user?.fullName || 'Active Session'}
                </span>
                <span className="text-[10px] text-slate-400 truncate font-mono">
                  {user?.role || user?.email || 'Sales Exec'}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 text-slate-400 hover:text-slate-200"
              title="Expand"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
