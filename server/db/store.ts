import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  CompanyEntity,
  UserEntity,
  DealEntity,
  ActivityEntity,
  TranscriptEntity,
  DealIntelligenceEntity,
  SuggestionEntity,
  RiskSignalEntity,
  RetainedLessonEntity,
  KnowledgeDocEntity,
  KnowledgeChunkEntity,
  JobEntity,
  AuditLogEntity,
} from '../types/backendTypes';

interface DatabaseSchema {
  companies: CompanyEntity[];
  users: UserEntity[];
  deals: DealEntity[];
  activities: ActivityEntity[];
  transcripts: TranscriptEntity[];
  intelligence: DealIntelligenceEntity[];
  suggestions: SuggestionEntity[];
  riskSignals: RiskSignalEntity[];
  retainedLessons: RetainedLessonEntity[];
  knowledgeDocs: KnowledgeDocEntity[];
  knowledgeChunks: KnowledgeChunkEntity[];
  jobs: JobEntity[];
  auditLogs: AuditLogEntity[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Store {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
    if (this.data.companies.length === 0) {
      this.seedInitialData();
    } else {
      this.ensureCoreEntities();
    }
  }

  private ensureCoreEntities() {
    let changed = false;
    const coreDeals: DealEntity[] = [
      {
        id: 'DEAL-2041',
        companyId: 'comp_apex_01',
        client: 'Meridian Global Logistics',
        industry: 'Supply Chain & Logistics',
        value: 285000,
        currency: 'INR',
        product: 'Enterprise Intelligence Suite',
        stage: 'NEGOTIATION',
        owner: 'Sarah Chen',
        ownerId: 'usr_sarah_chen',
        risk: 'HIGH',
        riskScore: 78,
        status: 'ACTIVE',
        summary: 'Global freight carrier evaluating automated freight routing intelligence. Stalled at procurement due to custom SLA penalty clauses and sudden vendor evaluation by competitor Nexis Logistics.',
        lastActivityAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'DEAL-1982',
        companyId: 'comp_apex_01',
        client: 'Vanguard Biopharma',
        industry: 'Life Sciences & Biotech',
        value: 410000,
        currency: 'INR',
        product: 'Mission-Critical Realtime Tier',
        stage: 'PROPOSAL',
        owner: 'Sarah Chen',
        ownerId: 'usr_sarah_chen',
        risk: 'MEDIUM',
        riskScore: 42,
        status: 'ACTIVE',
        summary: 'Clinical research organization reviewing AI document intelligence for FDA 21 CFR Part 11 trial verification. Technical evaluation passed; waiting for Legal audit.',
        lastActivityAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'DEAL-2105',
        companyId: 'comp_apex_01',
        client: 'FinTech Zenith Labs',
        industry: 'Financial Technology',
        value: 175000,
        currency: 'INR',
        product: 'Enterprise Intelligence Suite',
        stage: 'DEMO',
        owner: 'Sarah Chen',
        ownerId: 'usr_sarah_chen',
        risk: 'LOW',
        riskScore: 18,
        status: 'ACTIVE',
        summary: 'Payment processor upgrading core routing infrastructure. Completed discovery; demo scheduled for compliance and engineering teams.',
        lastActivityAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'DEAL-1850',
        companyId: 'comp_apex_01',
        client: 'OmniHealth Hospital System',
        industry: 'Healthcare Provider',
        value: 320000,
        currency: 'INR',
        product: 'Enterprise Intelligence Suite',
        stage: 'APPROVAL',
        owner: 'Sarah Chen',
        ownerId: 'usr_sarah_chen',
        risk: 'MEDIUM',
        riskScore: 55,
        status: 'ACTIVE',
        summary: 'Hospital network deploying patient scheduling optimization. Security review finished; final CIO sign-off pending board approval next week.',
        lastActivityAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'DEAL-1420',
        companyId: 'comp_apex_01',
        client: 'Atlas Freight Systems',
        industry: 'Supply Chain & Logistics',
        value: 260000,
        currency: 'INR',
        product: 'Enterprise Intelligence Suite',
        stage: 'WON',
        owner: 'David Ross',
        risk: 'LOW',
        riskScore: 20,
        status: 'WON',
        summary: 'Logistics operator with multi-terminal freight tracking. Encountered identical SLA objection and competitor matching. Won by offering Dedicated Solutions Architect during phase 1.',
        lastActivityAt: new Date(Date.now() - 120 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
      },
      {
        id: 'DEAL-1510',
        companyId: 'comp_apex_01',
        client: 'Pacific Maritime Logistics',
        industry: 'Supply Chain & Logistics',
        value: 290000,
        currency: 'INR',
        product: 'Enterprise Intelligence Suite',
        stage: 'LOST',
        owner: 'Elena Rostova',
        risk: 'HIGH',
        riskScore: 85,
        status: 'LOST',
        summary: 'Port logistics provider evaluated against Nexis Logistics. Deal stalled for 6 weeks without technical workshop; customer closed with Nexis due to perceived deployment delay.',
        lastActivityAt: new Date(Date.now() - 140 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 210 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 140 * 86400000).toISOString(),
      },
    ];

    const dealIds = new Set(this.data.deals.map((d) => d.id));
    for (const d of coreDeals) {
      if (!dealIds.has(d.id)) {
        this.data.deals.unshift(d);
        changed = true;
      }
    }

    if (changed) {
      this.persist();
    }
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading db.json, initializing fresh store', e);
    }
    return {
      companies: [],
      users: [],
      deals: [],
      activities: [],
      transcripts: [],
      intelligence: [],
      suggestions: [],
      riskSignals: [],
      retainedLessons: [],
      knowledgeDocs: [],
      knowledgeChunks: [],
      jobs: [],
      auditLogs: [],
    };
  }

  public persist() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database file', e);
    }
  }

  private seedInitialData() {
    const companyId = 'comp_apex_01';
    const company: CompanyEntity = {
      id: companyId,
      name: 'Apex Enterprise Technologies',
      domain: 'apextech.internal',
      memoryBankId: 'bank_apex_prod',
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const passwordHash = bcrypt.hashSync('Password123!', 10);
    const user: UserEntity = {
      id: 'usr_sarah_chen',
      companyId,
      fullName: 'Sarah Chen',
      email: 'schen@enterprise.com',
      role: 'sales',
      passwordHash,
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const initialDeals: DealEntity[] = [
      {
        id: 'DEAL-2041',
        companyId,
        client: 'Meridian Global Logistics',
        industry: 'Supply Chain & Logistics',
        value: 285000,
        currency: 'INR',
        product: 'Enterprise Intelligence Suite',
        stage: 'NEGOTIATION',
        owner: 'Sarah Chen',
        ownerId: user.id,
        risk: 'HIGH',
        riskScore: 78,
        status: 'ACTIVE',
        summary: 'Global freight carrier evaluating automated freight routing intelligence. Stalled at procurement due to custom SLA penalty clauses and sudden vendor evaluation by competitor Nexis Logistics.',
        lastActivityAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'DEAL-1982',
        companyId,
        client: 'Vanguard Biopharma',
        industry: 'Life Sciences & Biotech',
        value: 410000,
        currency: 'INR',
        product: 'Mission-Critical Realtime Tier',
        stage: 'PROPOSAL',
        owner: 'Sarah Chen',
        ownerId: user.id,
        risk: 'MEDIUM',
        riskScore: 42,
        status: 'ACTIVE',
        summary: 'Clinical research organization reviewing AI document intelligence for FDA 21 CFR Part 11 trial verification. Technical evaluation passed; waiting for Legal audit.',
        lastActivityAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'DEAL-2105',
        companyId,
        client: 'FinTech Zenith Labs',
        industry: 'Financial Technology',
        value: 175000,
        currency: 'INR',
        product: 'Enterprise Intelligence Suite',
        stage: 'DEMO',
        owner: 'Sarah Chen',
        ownerId: user.id,
        risk: 'LOW',
        riskScore: 18,
        status: 'ACTIVE',
        summary: 'Series C payments gateway modernizing merchant dispute intelligence. Scheduled architecture review next Tuesday.',
        lastActivityAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'DEAL-1850',
        companyId,
        client: 'OmniHealth Hospital System',
        industry: 'Healthcare Provider',
        value: 320000,
        currency: 'INR',
        product: 'Enterprise Intelligence Suite',
        stage: 'APPROVAL',
        owner: 'Sarah Chen',
        ownerId: user.id,
        risk: 'MEDIUM',
        riskScore: 55,
        status: 'ACTIVE',
        summary: 'Hospital network deploying patient scheduling optimization. Security review finished; final CIO sign-off pending board approval next week.',
        lastActivityAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Historical Completed Deals for Recall & Reflection
      {
        id: 'DEAL-1420',
        companyId,
        client: 'Atlas Freight Systems',
        industry: 'Supply Chain & Logistics',
        value: 260000,
        currency: 'INR',
        product: 'Enterprise Intelligence Suite',
        stage: 'WON',
        owner: 'David Ross',
        risk: 'LOW',
        riskScore: 20,
        status: 'WON',
        summary: 'Logistics operator with multi-terminal freight tracking. Encountered identical SLA objection and competitor matching. Won by offering Dedicated Solutions Architect during phase 1.',
        lastActivityAt: new Date(Date.now() - 120 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
      },
      {
        id: 'DEAL-1510',
        companyId,
        client: 'Pacific Maritime Logistics',
        industry: 'Supply Chain & Logistics',
        value: 290000,
        currency: 'INR',
        product: 'Enterprise Intelligence Suite',
        stage: 'LOST',
        owner: 'Elena Rostova',
        risk: 'HIGH',
        riskScore: 85,
        status: 'LOST',
        summary: 'Port logistics provider evaluated against Nexis Logistics. Deal stalled for 6 weeks without technical workshop; customer closed with Nexis due to perceived deployment delay.',
        lastActivityAt: new Date(Date.now() - 140 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 210 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 140 * 86400000).toISOString(),
      },
    ];

    const initialRetainedLessons: RetainedLessonEntity[] = [
      {
        id: 'les_1',
        companyId,
        dealId: 'DEAL-1420',
        dealName: 'Atlas Freight Systems',
        title: 'Overcoming Logistics SLA Deadlock',
        category: 'OBJECTION_HANDLING',
        takeaway: 'When freight logistics buyers demand custom SLA downtime penalties, provide a dedicated Solutions Architect for the first 90 days instead of reducing gross margins. Proved 100% effective in closing Atlas Freight.',
        context: 'Encountered strict SLA pushback and Nexis competitive pressure.',
        outcome: 'WON',
        retainedAt: new Date(Date.now() - 110 * 86400000).toISOString(),
        appliedCount: 4,
      },
      {
        id: 'les_2',
        companyId,
        dealId: 'DEAL-1510',
        dealName: 'Pacific Maritime Logistics',
        title: 'Fatal Inactivity During Dual Vendor Audits',
        category: 'COMPETITIVE',
        takeaway: 'Never let more than 10 days elapse without an architectural validation session when competitor Nexis is actively participating in procurement. Pacific Maritime was lost solely due to cadence lapse.',
        context: 'Dual vendor evaluation with Nexis Logistics.',
        outcome: 'LOST',
        retainedAt: new Date(Date.now() - 135 * 86400000).toISOString(),
        appliedCount: 2,
      },
    ];

    const initialKnowledgeDocs: KnowledgeDocEntity[] = [
      {
        id: 'doc_sla_policy',
        companyId,
        title: 'Enterprise Master Service Agreement & SLA Guidelines',
        category: 'POLICY',
        uploadedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        sizeBytes: 48200,
        status: 'INDEXED',
        chunkCount: 3,
        content: `Standard Enterprise Service Level Agreement (SLA):
Section 3.1: Standard guaranteed availability is 99.9% uptime excluding scheduled maintenance windows.
Section 3.4: In the event of confirmed unscheduled downtime exceeding 0.1% per calendar month, customer qualifies for a 5% service credit against the following quarter invoicing. Under no circumstances may cash liquidated damages exceed 15% of annual contract value.
Section 4.2: For mission-critical logistics and healthcare tiers, Account Executives may attach the Enterprise Resiliency Addendum, granting 99.95% uptime backing with dedicated Tier-1 solutions engineering support.`,
      },
      {
        id: 'doc_nexis_battlecard',
        companyId,
        title: 'Competitive Battlecard: Nexis Logistics',
        category: 'COMPETITIVE_BATTLECARD',
        uploadedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        sizeBytes: 32100,
        status: 'INDEXED',
        chunkCount: 2,
        content: `Nexis Logistics Competitive Analysis:
Strengths: Nexis discounts aggressively up-front by up to 35% on multi-year commitments.
Weaknesses: Nexis relies on batch ETL processing with 4-hour latency, whereas our Deal Intelligence engine processes events in sub-second streaming.
Winning Counter-Tactic: Offer an onsite Technical Architecture Day. Demonstrate that Nexis real-world integration costs exceed their up-front license discounts by 2.4x.`,
      },
    ];

    const initialKnowledgeChunks: KnowledgeChunkEntity[] = [
      {
        id: 'chk_1',
        docId: 'doc_sla_policy',
        companyId,
        chunkIndex: 0,
        snippet: 'Standard guaranteed availability is 99.9% uptime. Cash liquidated damages may not exceed 15% of annual contract value. Enterprise Resiliency Addendum provides 99.95% backing.',
      },
      {
        id: 'chk_2',
        docId: 'doc_nexis_battlecard',
        companyId,
        chunkIndex: 0,
        snippet: 'Nexis discounts up to 35% but runs 4-hour batch latency. Win by running an architecture proof comparing real integration costs.',
      },
    ];

    const initialSuggestions: SuggestionEntity[] = [
      {
        id: 'sug_2041_1',
        dealId: 'DEAL-2041',
        companyId,
        clientName: 'Meridian Global Logistics',
        actionType: 'TECHNICAL_WORKSHOP',
        title: 'Schedule Enterprise Resiliency Architecture Workshop',
        description: 'Propose a 1-day dedicated technical architecture session with Meridian VP Infrastructure to walk through the Enterprise Resiliency Addendum and sub-second streaming benchmark.',
        why: 'Transcript analysis indicates Meridian is comparing us against Nexis Logistics. Recalled historical deal DEAL-1420 (Atlas Freight) overcame identical pushback using this exact tactic to close won.',
        evidence: '"We need guaranteed sub-minute freight dispatch and our procurement requires strict SLA downtime penalties." — VP Logistics (Discovery Call, Min 14:10)',
        similarDeals: [
          { dealId: 'DEAL-1420', client: 'Atlas Freight Systems', outcome: 'WON' },
          { dealId: 'DEAL-1510', client: 'Pacific Maritime Logistics', outcome: 'LOST' },
        ],
        impact: 'HIGH',
        priority: 'URGENT',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
    ];

    const initialRiskSignals: RiskSignalEntity[] = [
      {
        id: 'risk_sig_1',
        dealId: 'DEAL-2041',
        companyId,
        signal: 'Competitor Nexis Logistics actively competing in procurement',
        severity: 'HIGH',
        category: 'COMPETITOR',
        explanation: 'Customer verbally mentioned reviewing Nexis proposals with aggressive 30% discount terms.',
        evidence: 'Nexis offered us an introductory discount and claims equivalent batch throughput.',
        detectedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'risk_sig_2',
        dealId: 'DEAL-2041',
        companyId,
        signal: 'Unresolved Custom SLA Penalty Clause',
        severity: 'HIGH',
        category: 'CONTRACT',
        explanation: 'Procurement requested uncapped penalty clauses not permitted under standard MSAs.',
        evidence: 'We cannot sign without custom penalty clauses if dispatch goes down.',
        detectedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
    ];

    const initialActivities: ActivityEntity[] = [
      {
        id: 'act_1',
        dealId: 'DEAL-2041',
        companyId,
        clientName: 'Meridian Global Logistics',
        type: 'CALL',
        title: 'Executive Procurement Sync',
        description: 'Discussed SLA terms and pricing tiers with VP Logistics.',
        author: 'Sarah Chen',
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 'act_2',
        dealId: 'DEAL-1982',
        companyId,
        clientName: 'Vanguard Biopharma',
        type: 'MEETING',
        title: 'Legal & Compliance Audit',
        description: 'Reviewed HIPAA and 21 CFR Part 11 certification standards.',
        author: 'Sarah Chen',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];

    const initialIntelligence: DealIntelligenceEntity = {
      dealId: 'DEAL-2041',
      companyId,
      summary: 'Meridian Global Logistics requires high-throughput real-time freight tracking. High competitor pressure from Nexis Logistics offering steep discounts. Deal is winnable by leaning into sub-second latency and executive architecture support.',
      sentiment: {
        overall: 'MIXED',
        score: 35,
        progression: [
          { stage: 'Initial Call', score: 65 },
          { stage: 'Procurement Meeting', score: 35 },
        ],
        explanation: 'Strong enthusiasm from engineering team tempered by commercial hesitation from procurement regarding penalty clauses.',
      },
      customerIntent: [
        {
          id: 'int_1',
          title: 'Automate Dispatch Decisioning Across 40 Distribution Hubs',
          description: 'Eliminate manual logistics scheduling bottlenecks across continental distribution centers.',
          why: 'Logistics directors spend 14 hours weekly manually resolving route collisions.',
          evidence: [
            { quote: 'We need automated scheduling that eliminates manual dispatcher overrides across all 40 terminals.', speaker: 'VP Logistics', timestampOrLine: '12:40' },
          ],
        },
      ],
      painPoints: [
        {
          id: 'pain_1',
          title: 'Severe Cost Penalty from 4-Hour Batch Latency',
          description: 'Current legacy software takes up to 4 hours to re-route freight during inclement weather.',
          why: 'Direct operational losses when drivers wait idle for dispatch updates.',
          evidence: [
            { quote: 'When a storm hits, our dispatchers sit blind for up to 4 hours waiting for batch runs.', speaker: 'Director Operations', timestampOrLine: '18:15' },
          ],
        },
      ],
      requirements: [
        {
          id: 'req_1',
          title: 'Sub-second Event Stream & SOC2 Type II Certification',
          description: 'Mandatory technical baseline for cloud provider.',
          why: 'Security audit requirement for logistics cloud infrastructure.',
          evidence: [
            { quote: 'Real-time telemetry under 2 seconds and SOC2 compliance are hard prerequisites.', speaker: 'Chief Architect', timestampOrLine: '08:22' },
          ],
        },
      ],
      objections: [
        {
          id: 'obj_1',
          title: 'Rigid Standard SLA Penalty Caps',
          description: 'Procurement wants financial penalties exceeding our standard 15% annual cap.',
          why: 'Previous negative experience with another SaaS vendor experiencing multi-day outage.',
          evidence: [
            { quote: 'We were burned by a vendor outage last year and cannot sign without custom penalty terms.', speaker: 'Procurement Lead', timestampOrLine: '32:04' },
          ],
        },
      ],
      competitorMentions: [
        {
          competitor: 'Nexis Logistics',
          context: 'Competitor participating in simultaneous RFP with aggressive price concessions.',
          strengthsBroughtUp: 'Low up-front license cost (30% discount)',
          counterTactics: 'Highlight that Nexis uses 4-hour batch processing which directly causes the dispatch delay they are trying to solve.',
          why: 'Nexis cannot deliver sub-second streaming.',
          evidence: [
            { quote: 'Nexis offered us a 30% discount on their standard package.', speaker: 'Procurement Lead', timestampOrLine: '35:10' },
          ],
        },
      ],
      actionItems: [
        {
          id: 'act_item_1',
          title: 'Deliver Enterprise Resiliency Addendum proposal',
          assignee: 'Sarah Chen',
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
          priority: 'HIGH',
          status: 'PENDING',
          why: 'Directly resolves the SLA penalty hurdle.',
          evidence: 'Resolves Section 4.2 procurement objection.',
        },
      ],
      lastAnalyzedAt: new Date().toISOString(),
    };

    this.data.companies = [company];
    this.data.users = [user];
    this.data.deals = initialDeals;
    this.data.activities = initialActivities;
    this.data.intelligence = [initialIntelligence];
    this.data.suggestions = initialSuggestions;
    this.data.riskSignals = initialRiskSignals;
    this.data.retainedLessons = initialRetainedLessons;
    this.data.knowledgeDocs = initialKnowledgeDocs;
    this.data.knowledgeChunks = initialKnowledgeChunks;
    this.persist();
  }

  // --- Companies ---
  public getCompany(id: string) {
    return this.data.companies.find((c) => c.id === id);
  }

  public getCompanyByDomain(domain: string) {
    return this.data.companies.find((c) => c.domain === domain);
  }

  public createCompany(name: string, domain: string): CompanyEntity {
    const newCompany: CompanyEntity = {
      id: `comp_${Date.now()}`,
      name,
      domain,
      memoryBankId: `bank_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.companies.push(newCompany);
    this.persist();
    return newCompany;
  }

  // --- Users ---
  public getUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): UserEntity {
    const newUser: UserEntity = {
      ...user,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  // --- Deals ---
  public getDeals(companyId: string, filters?: { search?: string; stage?: string; risk?: string; status?: string }) {
    let deals = this.data.deals.filter((d) => d.companyId === companyId);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      deals = deals.filter(
        (d) =>
          d.client.toLowerCase().includes(q) ||
          d.industry.toLowerCase().includes(q) ||
          d.product.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q)
      );
    }
    if (filters?.stage && filters.stage !== 'ALL') {
      deals = deals.filter((d) => d.stage === filters.stage);
    }
    if (filters?.risk && filters.risk !== 'ALL') {
      deals = deals.filter((d) => d.risk === filters.risk);
    }
    if (filters?.status && filters.status !== 'ALL') {
      deals = deals.filter((d) => d.status === filters.status);
    }
    return deals;
  }

  public getDeal(companyId: string, id: string) {
    return this.data.deals.find((d) => d.companyId === companyId && d.id === id);
  }

  public createDeal(companyId: string, deal: Partial<DealEntity>): DealEntity {
    const newDeal: DealEntity = {
      id: deal.id || `DEAL-${Math.floor(1000 + Math.random() * 9000)}`,
      companyId,
      client: deal.client || 'Untitled Opportunity',
      industry: deal.industry || 'Enterprise Software',
      value: deal.value || 100000,
      currency: deal.currency || 'INR',
      product: deal.product || 'Enterprise Intelligence Suite',
      stage: deal.stage || 'QUALIFIED',
      owner: deal.owner || 'Assigned User',
      ownerId: deal.ownerId,
      risk: deal.risk || 'LOW',
      riskScore: deal.riskScore || 25,
      status: deal.status || 'ACTIVE',
      summary: deal.summary || '',
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.deals.unshift(newDeal);
    this.persist();
    return newDeal;
  }

  public updateDeal(companyId: string, id: string, updates: Partial<DealEntity>): DealEntity | null {
    const deal = this.getDeal(companyId, id);
    if (!deal) return null;
    Object.assign(deal, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return deal;
  }

  public deleteDeal(companyId: string, id: string): boolean {
    const index = this.data.deals.findIndex((d) => d.companyId === companyId && d.id === id);
    if (index === -1) return false;
    this.data.deals.splice(index, 1);
    this.persist();
    return true;
  }

  // --- Activities ---
  public getActivities(companyId: string, dealId?: string) {
    let acts = this.data.activities.filter((a) => a.companyId === companyId);
    if (dealId) {
      acts = acts.filter((a) => a.dealId === dealId);
    }
    return acts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public createActivity(activity: ActivityEntity) {
    this.data.activities.unshift(activity);
    this.persist();
    return activity;
  }

  // --- Transcripts ---
  public getTranscripts(companyId: string, dealId: string) {
    return this.data.transcripts.filter((t) => t.companyId === companyId && t.dealId === dealId);
  }

  public saveTranscript(transcript: TranscriptEntity) {
    this.data.transcripts.unshift(transcript);
    this.persist();
    return transcript;
  }

  public updateTranscriptStatus(id: string, status: TranscriptEntity['status']) {
    const tr = this.data.transcripts.find((t) => t.id === id);
    if (tr) {
      tr.status = status;
      this.persist();
    }
  }

  // --- Deal Intelligence ---
  public getIntelligence(companyId: string, dealId: string) {
    return this.data.intelligence.find((i) => i.companyId === companyId && i.dealId === dealId);
  }

  public saveIntelligence(intel: DealIntelligenceEntity) {
    const idx = this.data.intelligence.findIndex(
      (i) => i.companyId === intel.companyId && i.dealId === intel.dealId
    );
    if (idx >= 0) {
      this.data.intelligence[idx] = intel;
    } else {
      this.data.intelligence.push(intel);
    }
    this.persist();
    return intel;
  }

  // --- Suggestions ---
  public getSuggestions(companyId: string, dealId?: string) {
    let suggs = this.data.suggestions.filter((s) => s.companyId === companyId);
    if (dealId) {
      suggs = suggs.filter((s) => s.dealId === dealId);
    }
    return suggs;
  }

  public saveSuggestion(sug: SuggestionEntity) {
    this.data.suggestions.unshift(sug);
    this.persist();
    return sug;
  }

  public updateSuggestionStatus(companyId: string, id: string, status: SuggestionEntity['status']) {
    const sug = this.data.suggestions.find((s) => s.companyId === companyId && s.id === id);
    if (!sug) return null;
    sug.status = status;
    this.persist();
    return sug;
  }

  // --- Risk Signals ---
  public getRiskSignals(companyId: string, dealId: string) {
    return this.data.riskSignals.filter((r) => r.companyId === companyId && r.dealId === dealId);
  }

  public saveRiskSignal(sig: RiskSignalEntity) {
    this.data.riskSignals.push(sig);
    this.persist();
    return sig;
  }

  // --- Retained Lessons ---
  public getRetainedLessons(companyId: string) {
    return this.data.retainedLessons.filter((l) => l.companyId === companyId);
  }

  public saveRetainedLesson(lesson: RetainedLessonEntity) {
    this.data.retainedLessons.unshift(lesson);
    this.persist();
    return lesson;
  }

  // --- Knowledge Docs & Chunks ---
  public getKnowledgeDocs(companyId: string, category?: string) {
    let docs = this.data.knowledgeDocs.filter((d) => d.companyId === companyId);
    if (category && category !== 'ALL') {
      docs = docs.filter((d) => d.category === category);
    }
    return docs;
  }

  public saveKnowledgeDoc(doc: KnowledgeDocEntity, chunks: KnowledgeChunkEntity[]) {
    this.data.knowledgeDocs.unshift(doc);
    this.data.knowledgeChunks.push(...chunks);
    this.persist();
    return doc;
  }

  public getKnowledgeChunks(companyId: string) {
    return this.data.knowledgeChunks.filter((c) => c.companyId === companyId);
  }

  // --- Jobs ---
  public createJob(job: JobEntity) {
    this.data.jobs.unshift(job);
    this.persist();
    return job;
  }

  public getJob(id: string) {
    return this.data.jobs.find((j) => j.id === id);
  }

  public updateJob(id: string, updates: Partial<JobEntity>) {
    const job = this.getJob(id);
    if (job) {
      Object.assign(job, updates, { updatedAt: new Date().toISOString() });
      this.persist();
    }
    return job;
  }

  // --- Audit Log ---
  public logAudit(log: Omit<AuditLogEntity, 'id' | 'timestamp'>) {
    this.data.auditLogs.unshift({
      ...log,
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    this.persist();
  }
}

export const db = new Store();
