/**
 * Deal Intelligence Agent - React Query Hooks
 * 
 * Provides type-safe queries and mutations wrapping the central API client.
 * Connects directly: Page -> Hook -> Central API Client -> Backend.
 * Standard query settings for refetching and caching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api/client';
import { Deal, DealClosePayload, SimulationScenarioInput } from '../types';

export const queryKeys = {
  dashboard: ['dashboard', 'summary'] as const,
  deals: (params?: Record<string, any>) => ['deals', params] as const,
  deal: (id: string) => ['deal', id] as const,
  intelligence: (dealId: string) => ['deal', dealId, 'intelligence'] as const,
  recall: (dealId: string) => ['deal', dealId, 'recall'] as const,
  reflect: (dealId: string) => ['deal', dealId, 'reflect'] as const,
  risk: (dealId: string) => ['deal', dealId, 'risk'] as const,
  outcome: (dealId: string) => ['deal', dealId, 'outcome'] as const,
  cycle: (dealId: string) => ['deal', dealId, 'cycle'] as const,
  similar: (dealId: string) => ['deal', dealId, 'similar'] as const,
  dealMlModels: (dealId: string) => ['deal', dealId, 'ml-models'] as const,
  modelsStatus: ['models', 'status'] as const,
  modelCard: (name: string) => ['models', name] as const,
  suggestions: (dealId?: string) => ['suggestions', dealId] as const,
  knowledgeDocs: (params?: Record<string, any>) => ['knowledge', 'docs', params] as const,
  reports: (timeframe?: string) => ['reports', timeframe] as const,
  health: ['system', 'health'] as const,
};

// Dashboard Hook
export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.dashboard.getSummary(),
    retry: 1,
    staleTime: 30000,
  });
}

// Deals Hooks
export function useDeals(params?: { search?: string; stage?: string; risk?: string; status?: string; page?: number }) {
  return useQuery({
    queryKey: queryKeys.deals(params),
    queryFn: () => api.deals.list(params),
    retry: 1,
    staleTime: 15000,
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: queryKeys.deal(id),
    queryFn: () => api.deals.get(id),
    enabled: Boolean(id && id !== 'new'),
    retry: 1,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newDeal: Partial<Deal>) => api.deals.create(newDeal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Deal> }) => api.deals.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deal(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deals.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useCloseDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DealClosePayload }) =>
      api.deals.close(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deal(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

// Deal Intelligence Hook
export function useDealIntelligence(dealId: string) {
  return useQuery({
    queryKey: queryKeys.intelligence(dealId),
    queryFn: () => api.intelligence.get(dealId),
    enabled: Boolean(dealId),
    retry: 1,
  });
}

export function useRefreshDealIntelligence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dealId: string) => api.intelligence.refresh(dealId),
    onSuccess: (_, dealId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intelligence(dealId) });
    },
  });
}

// Deal Recall Hook (Memory)
export function useDealRecall(dealId: string) {
  return useQuery({
    queryKey: queryKeys.recall(dealId),
    queryFn: () => api.memory.recall(dealId),
    enabled: Boolean(dealId),
    retry: 1,
  });
}

// Deal Reflect Hook (Memory)
export function useDealReflect(dealId: string) {
  return useQuery({
    queryKey: queryKeys.reflect(dealId),
    queryFn: () => api.memory.reflect(dealId),
    enabled: Boolean(dealId),
    retry: 1,
  });
}

// Risk Analysis Hook
export function useDealRisk(dealId: string) {
  return useQuery({
    queryKey: queryKeys.risk(dealId),
    queryFn: () => api.deals.getRisk(dealId),
    enabled: Boolean(dealId),
    retry: 1,
  });
}

export function useRefreshRiskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dealId: string) => api.deals.refreshRisk(dealId),
    onSuccess: (_, dealId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.risk(dealId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.deal(dealId) });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

// ML Model Outcome Prediction Hook
export function useDealOutcomePrediction(dealId: string) {
  return useQuery({
    queryKey: queryKeys.outcome(dealId),
    queryFn: () => api.deals.getOutcome(dealId),
    enabled: Boolean(dealId),
    retry: 1,
  });
}

// ML Model Sales Cycle Prediction Hook
export function useDealCyclePrediction(dealId: string) {
  return useQuery({
    queryKey: queryKeys.cycle(dealId),
    queryFn: () => api.deals.getCycle(dealId),
    enabled: Boolean(dealId),
    retry: 1,
  });
}

// ML Model Similar Deals Hook
export function useDealSimilarDeals(dealId: string) {
  return useQuery({
    queryKey: queryKeys.similar(dealId),
    queryFn: () => api.deals.getSimilar(dealId),
    enabled: Boolean(dealId),
    retry: 1,
  });
}

// ML Aggregated Deal Models Hook
export function useDealIntelligenceModels(dealId: string) {
  return useQuery({
    queryKey: queryKeys.dealMlModels(dealId),
    queryFn: () => api.deals.getIntelligenceModels(dealId),
    enabled: Boolean(dealId),
    retry: 1,
  });
}

// Model Registry Status Hook
export function useModelStatus() {
  return useQuery({
    queryKey: queryKeys.modelsStatus,
    queryFn: () => api.models.getStatus(),
    retry: 1,
    staleTime: 60000,
  });
}

export function useModelCard(modelName: string) {
  return useQuery({
    queryKey: queryKeys.modelCard(modelName),
    queryFn: () => api.models.getModel(modelName),
    enabled: Boolean(modelName),
    retry: 1,
  });
}

// Suggestions Hooks
export function useSuggestions(dealId?: string) {
  return useQuery({
    queryKey: queryKeys.suggestions(dealId),
    queryFn: () => dealId ? api.suggestions.getForDeal(dealId) : api.suggestions.list(),
    retry: 1,
  });
}

export function useApplySuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.suggestions.apply(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
  });
}

export function useDismissSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.suggestions.dismiss(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
  });
}

// Simulation Hook
export function useRunSimulation() {
  return useMutation({
    mutationFn: ({ dealId, scenario }: { dealId: string; scenario: SimulationScenarioInput }) =>
      api.simulation.simulate(dealId, scenario),
  });
}

// Knowledge Base Hooks
export function useKnowledgeDocs(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.knowledgeDocs(params),
    queryFn: () => api.knowledge.getDocs(params),
    retry: 1,
  });
}

export function useUploadKnowledgeDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, category }: { file: File; category: string }) =>
      api.knowledge.uploadDoc(file, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', 'docs'] });
    },
  });
}

export function useAskKnowledgeBase() {
  return useMutation({
    mutationFn: (question: string) => api.knowledge.ask(question),
  });
}

// Chat Bot & Deal Intelligence Copilot Hooks
export function useChatIntelligence() {
  return useMutation({
    mutationFn: (payload: { messages: { role: 'user' | 'assistant'; content: string }[]; dealId?: string }) =>
      api.chat.send(payload),
  });
}

export function useChatDeals() {
  return useQuery({
    queryKey: ['chat', 'deals'],
    queryFn: () => api.chat.getDeals(),
    retry: 1,
    staleTime: 30000,
  });
}

// Reports Hook
export function useReports(timeframe = 'last_12_months') {
  return useQuery({
    queryKey: queryKeys.reports(timeframe),
    queryFn: () => api.reports.get(timeframe),
    retry: 1,
  });
}

// System Health Hook
export function useSystemHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api.system.ping(),
    retry: 0,
    refetchInterval: 30000,
  });
}
