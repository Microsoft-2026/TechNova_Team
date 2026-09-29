/**
 * Deal Intelligence Agent - Data Models and API Contracts
 * Strictly typed interfaces corresponding to backend models and documented endpoints.
 */

export type DealStage =
  | 'LEAD'
  | 'QUALIFIED'
  | 'DEMO'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'APPROVAL'
  | 'WON'
  | 'LOST';

export type DealStatus = 'ACTIVE' | 'WON' | 'LOST' | 'ON_HOLD';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SentimentType = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';

export type SourceType =
  | 'AI_INSIGHT'
  | 'FROM_MEMORY'
  | 'FROM_CRM'
  | 'FROM_KNOWLEDGE_BASE';

export interface User {
  id: string;
  fullName: string;
  email: string;
  company: string;
  role: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
}

export interface Deal {
  id: string;
  client: string;
  industry: string;
  value: number;
  currency?: string;
  product: string;
  stage: DealStage;
  owner: string;
  risk: RiskLevel;
  riskScore?: number;
  status: DealStatus;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  closeDate?: string;
  winProbability?: number;
  summary?: string;
}

export interface Activity {
  id: string;
  dealId?: string;
  clientName?: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'STATUS_CHANGE' | 'ANALYSIS_GENERATED';
  title: string;
  description?: string;
  timestamp: string;
  author: string;
}

export interface AIInsightItem {
  id: string;
  dealId?: string;
  dealName?: string;
  title: string;
  detail: string;
  why: string;
  evidence: string;
  source: SourceType;
  createdAt: string;
  confidenceScore?: number;
  suggestedAction?: string;
}

export interface DashboardSummary {
  activeDealsCount: number;
  upcomingMeetingsCount: number;
  wonDealsCount: number;
  lostDealsCount: number;
  negotiationsCount: number;
  highRiskDealsCount: number;
  attentionQueue: Deal[];
  upcomingDeals: Deal[];
  recentActivities: Activity[];
  aiInsights: AIInsightItem[];
}

export interface Transcript {
  id: string;
  dealId: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt';
  uploadedAt: string;
  status: 'PENDING' | 'PARSING' | 'UNDERSTANDING' | 'RETRIEVING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  rawText?: string;
  wordCount?: number;
}

export interface EvidenceReference {
  quote: string;
  speaker?: string;
  timestampOrLine?: string;
  context?: string;
}

export interface IntelligencePoint {
  id: string;
  title: string;
  description: string;
  why: string;
  evidence: EvidenceReference[];
  confidence?: number;
  category?: string;
}

export interface DealIntelligence {
  dealId: string;
  customerIntent: IntelligencePoint[];
  painPoints: IntelligencePoint[];
  requirements: IntelligencePoint[];
  objections: IntelligencePoint[];
  competitorMentions: {
    competitor: string;
    context: string;
    strengthsBroughtUp?: string;
    counterTactics?: string;
    why: string;
    evidence: EvidenceReference[];
  }[];
  actionItems: {
    id: string;
    title: string;
    assignee?: string;
    dueDate?: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'PENDING' | 'COMPLETED';
    why: string;
    evidence?: string;
  }[];
  sentiment: {
    overall: SentimentType;
    score: number; // -1.0 to 1.0 or 0 to 100
    progression: { stage: string; score: number }[];
    explanation: string;
  };
  summary: string;
  lastAnalyzedAt: string;
}

export interface SimilarDealRecall {
  dealId: string;
  client: string;
  industry: string;
  value: number;
  outcome: 'WON' | 'LOST';
  similarityScore: number; // 0 - 100%
  matchingFactors: string[];
  keyDifferences: string[];
  finalStrategyUsed: string;
  relevantLessons: string;
  closedDate: string;
}

export interface DealRecallResult {
  dealId: string;
  querySummary: string;
  similarDeals: SimilarDealRecall[];
  patternSynthesis: string;
}

export interface DealReflectResult {
  dealId: string;
  winningFactors: string[];
  losingFactors: string[];
  tacticalAdvice: {
    title: string;
    advice: string;
    derivedFromDeals: string[];
  }[];
  historicalWinRateInCluster: number;
  reflectionSummary: string;
}

export interface RetainedLesson {
  id: string;
  dealId?: string;
  dealName?: string;
  title: string;
  category: 'PRICING' | 'PRODUCT_FIT' | 'OBJECTION_HANDLING' | 'TIMING' | 'COMPETITIVE';
  takeaway: string;
  context: string;
  outcome: 'WON' | 'LOST';
  retainedAt: string;
  appliedCount: number;
}

export interface Suggestion {
  id: string;
  dealId: string;
  clientName?: string;
  actionType: 'SCHEDULE_DEMO' | 'FOLLOW_UP' | 'ADDRESS_OBJECTION' | 'OFFER_DISCOUNT' | 'TECHNICAL_WORKSHOP' | 'EXECUTIVE_SPONSOR' | 'SECURITY_REVIEW';
  title: string;
  description: string;
  why: string;
  evidence: string;
  similarDeals?: {
    dealId: string;
    client: string;
    outcome: string;
  }[];
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  priority: 'URGENT' | 'RECOMMENDED' | 'OPTIONAL';
  status: 'ACTIVE' | 'APPLIED' | 'DISMISSED';
  createdAt: string;
}

export interface RiskSignal {
  id: string;
  signal: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'INACTIVITY' | 'BUDGET' | 'COMPETITOR' | 'APPROVAL' | 'OBJECTION' | 'STAKEHOLDER' | 'PRICING' | 'CONTRACT';
  explanation: string;
  evidence?: string;
  detectedAt: string;
}

export type ModelStatus = 'MODEL_READY' | 'MODEL_TRAINING' | 'MODEL_UNAVAILABLE' | 'INSUFFICIENT_DATA' | 'MODEL_ERROR';

export interface ModelRegistryEntry {
  modelName: string;
  version: string;
  algorithm: string;
  trainedAt: string;
  features: string[];
  metrics: Record<string, any>;
  datasetVersion: string;
  status: string;
  notes?: string;
}

export interface ModelStatusResponse {
  status: ModelStatus;
  activeModelsCount: number;
  models: Record<string, ModelRegistryEntry>;
}

export interface MlRiskFactor {
  feature: string;
  rawFeatureKey?: string;
  impact: number;
  direction: 'INCREASES_RISK' | 'DECREASES_RISK';
  rawImpact?: number;
}

export interface DealRiskAnalysis {
  dealId: string;
  overallRisk: RiskLevel;
  riskScore: number; // 0 to 100
  riskProbability?: number; // 0.0 to 1.0
  riskLevel?: RiskLevel;
  modelVersion?: string;
  confidence?: number;
  topRiskFactors?: MlRiskFactor[];
  signals: RiskSignal[];
  explanation: string;
  explanationDetails?: {
    summary: string;
    drivers: MlRiskFactor[];
    evidence: string[];
    historicalComparisons: any[];
    limitations: string[];
  };
  evidence?: string[];
  limitations?: string[];
  mitigationSteps: string[];
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

export interface OutcomePrediction {
  dealId: string;
  winProbability: number;
  outcomeClass: 'LIKELY_WON' | 'UNCERTAIN' | 'LIKELY_LOST';
  modelVersion: string;
  baselineWinRate: number;
  confidence: number;
  topDrivers: {
    feature: string;
    impact: number;
    direction: 'INCREASES_WIN_PROBABILITY' | 'DECREASES_WIN_PROBABILITY';
    rawImpact?: number;
  }[];
  limitations: string[];
  explanationDetails?: any;
}

export interface CyclePrediction {
  dealId: string;
  expectedCycleDays: number;
  predictionInterval: {
    lower: number;
    upper: number;
  };
  baselineMedianDays: number;
  modelVersion: string;
  metrics?: Record<string, any>;
}

export interface SimulationScenarioInput {
  discountPercent: number;
  contractDurationMonths: number;
  productPackage: string;
  includedSupportLevel?: string;
  paymentTerms?: string;
  baselineDiscountPercent?: number;
  baselineContractDurationMonths?: number;
}

export interface SimulationResult {
  dealId: string;
  baseline: {
    discountPercent: number;
    contractDurationMonths: number;
    productPackage: string;
    dealValue: number;
    winProbability: number;
    riskProbability: number;
    expectedCycleDays: number;
    expectedValue: number;
  };
  scenario: {
    parameters: {
      discountPercent: number;
      contractDurationMonths: number;
      productPackage: string;
    };
    dealValue: number;
    winProbability: number;
    riskProbability: number;
    expectedCycleDays: number;
    expectedValue: number;
  };
  delta: {
    winProbability: number;
    riskProbability: number;
    expectedCycleDays: number;
    expectedValue: number;
  };
  historicalSupport: {
    sampleCount: number;
    similarDeals: any[];
  };
  strategicTradeoffs: string[];
  modelVersion: string;
  limitations: string[];
  // Legacy compatibility fields if needed
  currentScenario?: any;
  whatIfScenario?: any;
  confidenceInterval?: {
    minProbability: number;
    maxProbability: number;
  };
  disclaimer?: string;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: 'PLAYBOOK' | 'PRODUCT_DOC' | 'PRICING_GUIDE' | 'POLICY' | 'COMPETITIVE_BATTLECARD';
  uploadedAt: string;
  sizeBytes: number;
  status: 'INDEXED' | 'PROCESSING' | 'FAILED';
  chunkCount: number;
  version?: string;
  author?: string;
}

export interface Citation {
  docId: string;
  docTitle: string;
  category: string;
  snippet: string;
  relevanceScore: number; // 0 - 100
  chunkIndex?: number;
}

export interface KnowledgeAnswer {
  question: string;
  answer: string;
  citations: Citation[];
  confidence: number;
  isStreaming?: boolean;
}

export interface ReportsData {
  timeframe: string;
  monthlyDeals: {
    month: string;
    pipelineValue: number;
    closedWon: number;
    closedLost: number;
  }[];
  winLossRate: {
    wonRate: number;
    lostRate: number;
    averageCycleDaysWon: number;
    averageCycleDaysLost: number;
  };
  revenueForecast: {
    month: string;
    conservative: number;
    expected: number;
    optimistic: number;
  }[];
  topCustomers: {
    client: string;
    totalValue: number;
    dealCount: number;
    industry: string;
  }[];
  stageDistribution: {
    stage: DealStage;
    count: number;
    value: number;
  }[];
}

export interface DealClosePayload {
  outcome: 'WON' | 'LOST';
  reason: string;
  competitorWon?: string;
  lessonsLearned: string[];
  actualValue?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
  suggestedPrompts?: string[];
  dealContext?: {
    id: string;
    client: string;
    stage: string;
    value: number;
    risk?: string;
    winProbability?: number;
  };
  modelUsed?: string;
}

export interface ChatRequestPayload {
  messages: { role: 'user' | 'assistant'; content: string }[];
  dealId?: string;
}

export interface ChatResponsePayload {
  success: boolean;
  reply: string;
  citations: Citation[];
  suggestedPrompts: string[];
  confidence: number;
  dealContext?: {
    id: string;
    client: string;
    stage: string;
    value: number;
    risk?: string;
    winProbability?: number;
  };
  modelUsed: string;
}

