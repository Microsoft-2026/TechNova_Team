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

export interface CompanyEntity {
  id: string;
  name: string;
  domain: string;
  memoryBankId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserEntity {
  id: string;
  companyId: string;
  fullName: string;
  email: string;
  role: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealEntity {
  id: string;
  companyId: string;
  client: string;
  industry: string;
  value: number;
  currency: string;
  product: string;
  stage: DealStage;
  ownerId?: string;
  owner: string;
  risk: RiskLevel;
  riskScore: number;
  status: DealStatus;
  summary: string;
  winProbability?: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEntity {
  id: string;
  dealId: string;
  companyId: string;
  clientName?: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'STATUS_CHANGE' | 'ANALYSIS_GENERATED';
  title: string;
  description: string;
  author: string;
  timestamp: string;
}

export interface TranscriptEntity {
  id: string;
  dealId: string;
  companyId: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt';
  status: 'PENDING' | 'PARSING' | 'UNDERSTANDING' | 'RETRIEVING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  rawText: string;
  uploadedAt: string;
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

export interface DealIntelligenceEntity {
  dealId: string;
  companyId: string;
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
    score: number;
    progression: { stage: string; score: number }[];
    explanation: string;
  };
  summary: string;
  lastAnalyzedAt: string;
}

export interface RetainedLessonEntity {
  id: string;
  companyId: string;
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

export interface SuggestionEntity {
  id: string;
  dealId: string;
  companyId: string;
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

export interface RiskSignalEntity {
  id: string;
  dealId: string;
  companyId: string;
  signal: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'INACTIVITY' | 'BUDGET' | 'COMPETITOR' | 'APPROVAL' | 'OBJECTION' | 'STAKEHOLDER' | 'PRICING' | 'CONTRACT';
  explanation: string;
  evidence?: string;
  detectedAt: string;
}

export interface KnowledgeDocEntity {
  id: string;
  companyId: string;
  title: string;
  category: 'PLAYBOOK' | 'PRODUCT_DOC' | 'PRICING_GUIDE' | 'POLICY' | 'COMPETITIVE_BATTLECARD';
  uploadedAt: string;
  sizeBytes: number;
  status: 'INDEXED' | 'PROCESSING' | 'FAILED';
  chunkCount: number;
  content: string;
}

export interface KnowledgeChunkEntity {
  id: string;
  docId: string;
  companyId: string;
  chunkIndex: number;
  snippet: string;
}

export interface JobEntity {
  id: string;
  companyId: string;
  dealId?: string;
  type: 'TRANSCRIPT_EXTRACTION' | 'INTELLIGENCE_SYNTHESIS' | 'MEMORY_INDEXING';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  currentStage: string;
  progressMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntity {
  id: string;
  companyId: string;
  userId?: string;
  action: string;
  targetResource: string;
  timestamp: string;
}

export interface Citation {
  docId: string;
  docTitle: string;
  category: string;
  snippet: string;
  relevanceScore: number;
  chunkIndex?: number;
}
