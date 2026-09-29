import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { DashboardPage } from './pages/dashboard/DashboardPage';
import { DealsPage } from './pages/deals/DealsPage';
import { NewDealPage } from './pages/deals/NewDealPage';
import { DealDetailPage } from './pages/deals/DealDetailPage';
import { DealTrackingPage } from './pages/deals/DealTrackingPage';
import { DealIntelligencePage } from './pages/intelligence/DealIntelligencePage';
import { TranscriptUploadPage } from './pages/transcripts/TranscriptUploadPage';
import { DealMemoryPage } from './pages/memory/DealMemoryPage';
import { SuggestionsPage } from './pages/suggestions/SuggestionsPage';
import { RiskAnalysisPage } from './pages/risk/RiskAnalysisPage';
import { SimulationPage } from './pages/simulation/SimulationPage';
import { KnowledgeBasePage } from './pages/knowledge/KnowledgeBasePage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/deals/new" element={<NewDealPage />} />
              <Route path="/deals/:id" element={<DealDetailPage />} />
              <Route path="/deal-tracking" element={<DealTrackingPage />} />
              <Route path="/deal-intelligence" element={<DealIntelligencePage />} />
              <Route path="/upload-transcripts" element={<TranscriptUploadPage />} />
              <Route path="/deal-memory" element={<DealMemoryPage />} />
              <Route path="/suggestions" element={<SuggestionsPage />} />
              <Route path="/risk-analysis" element={<RiskAnalysisPage />} />
              <Route path="/simulation" element={<SimulationPage />} />
              <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
