import fs from 'fs';
import path from 'path';
import { db } from '../db/store';
import {
  DealEntity,
  RetainedLessonEntity,
  RiskSignalEntity,
  DealIntelligenceEntity,
  KnowledgeDocEntity,
  KnowledgeChunkEntity,
  ActivityEntity,
} from '../types/backendTypes';

const DATASETS_DIR = path.resolve(process.cwd(), 'datasets');
const companyId = 'comp_apex_01';

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

export function runIngestion() {
  console.log('[Ingestion] Starting ingestion from datasets directory...');

  // 1. Load CSVs
  const clientsFile = path.join(DATASETS_DIR, 'clients.csv');
  const dealsFile = path.join(DATASETS_DIR, 'deals.csv');
  const repsFile = path.join(DATASETS_DIR, 'sales_reps.csv');
  const productsFile = path.join(DATASETS_DIR, 'products.csv');
  const competitorsFile = path.join(DATASETS_DIR, 'competitors.csv');
  const lessonsFile = path.join(DATASETS_DIR, 'lessons.csv');
  const objectionsFile = path.join(DATASETS_DIR, 'objections.csv');
  const featuresFile = path.join(DATASETS_DIR, 'product_features.csv');

  const clients = fs.existsSync(clientsFile) ? parseCSV(fs.readFileSync(clientsFile, 'utf-8')) : [];
  const rawDeals = fs.existsSync(dealsFile) ? parseCSV(fs.readFileSync(dealsFile, 'utf-8')) : [];
  const reps = fs.existsSync(repsFile) ? parseCSV(fs.readFileSync(repsFile, 'utf-8')) : [];
  const products = fs.existsSync(productsFile) ? parseCSV(fs.readFileSync(productsFile, 'utf-8')) : [];
  const competitors = fs.existsSync(competitorsFile) ? parseCSV(fs.readFileSync(competitorsFile, 'utf-8')) : [];
  const lessons = fs.existsSync(lessonsFile) ? parseCSV(fs.readFileSync(lessonsFile, 'utf-8')) : [];
  const objections = fs.existsSync(objectionsFile) ? parseCSV(fs.readFileSync(objectionsFile, 'utf-8')) : [];
  const features = fs.existsSync(featuresFile) ? parseCSV(fs.readFileSync(featuresFile, 'utf-8')) : [];

  console.log(
    `[Ingestion] Parsed ${clients.length} clients, ${rawDeals.length} deals, ${reps.length} reps, ${products.length} products, ${competitors.length} competitors, ${lessons.length} lessons, ${objections.length} objections, ${features.length} features.`
  );

  const clientMap = new Map(clients.map((c) => [c.client_id, c]));
  const repMap = new Map(reps.map((r) => [r.sales_rep_id, r]));

  // 2. Ingest Deals
  const ingestedDeals: DealEntity[] = [];

  for (const row of rawDeals) {
    const client = clientMap.get(row.client_id);
    const rep = repMap.get(row.sales_rep_id);

    let stage: DealEntity['stage'] = 'QUALIFIED';
    let status: DealEntity['status'] = 'ACTIVE';

    if (row.stage === 'Closed Won') {
      stage = 'WON';
      status = 'WON';
    } else if (row.stage === 'Closed Lost') {
      stage = 'LOST';
      status = 'LOST';
    } else if (row.stage === 'Negotiation') {
      stage = 'NEGOTIATION';
      status = 'ACTIVE';
    } else if (row.stage === 'Proposal') {
      stage = 'PROPOSAL';
      status = 'ACTIVE';
    } else if (row.stage === 'Evaluation') {
      stage = 'DEMO';
      status = 'ACTIVE';
    } else if (row.stage === 'Discovery') {
      stage = 'QUALIFIED';
      status = 'ACTIVE';
    }

    // Objections for this deal
    const dealObjs = objections.filter((o) => o.deal_id === row.deal_id);
    const hasHighSev = dealObjs.some((o) => o.severity?.toUpperCase() === 'HIGH');
    const hasMedSev = dealObjs.some((o) => o.severity?.toUpperCase() === 'MEDIUM');

    // Competitors for this deal
    const dealComps = competitors.filter((c) => c.deal_id === row.deal_id);
    const compPreferred = dealComps.some((c) => c.competitor_status === 'Preferred');

    let risk: DealEntity['risk'] = 'LOW';
    let riskScore = 15;

    if (hasHighSev || compPreferred) {
      risk = 'HIGH';
      riskScore = 78;
    } else if (hasMedSev || dealObjs.length > 1) {
      risk = 'MEDIUM';
      riskScore = 48;
    }

    const clientName = client?.company_name || row.deal_name || `Account ${row.client_id}`;
    const industry = client?.industry || 'Enterprise Technology';
    const repName = rep?.sales_rep_name || 'Sarah Chen';

    ingestedDeals.push({
      id: row.deal_id,
      companyId,
      client: clientName,
      industry,
      value: parseInt(row.deal_value, 10) || 150000,
      currency: 'USD',
      product: row.product || 'Enterprise Intelligence Suite',
      stage,
      owner: repName,
      ownerId: row.sales_rep_id,
      risk,
      riskScore,
      status,
      summary: `${clientName} (${client?.region || 'Global'}, ${client?.company_size || 'Enterprise'}): In negotiation for ${row.product}. Primary hurdles: ${dealObjs.map((o) => o.objection).slice(0, 2).join(', ') || 'Standard evaluation'}. Competitor status: ${dealComps.map((c) => `${c.competitor_name} (${c.competitor_status})`).join('; ') || 'None'}.`,
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 3. Ingest Lessons
  const ingestedLessons: RetainedLessonEntity[] = lessons.map((l, idx) => {
    const parentDeal = ingestedDeals.find((d) => d.id === l.deal_id);
    const outcome = l.result === 'Won' ? 'WON' : 'LOST';
    return {
      id: l.lesson_id || `les_${idx}`,
      companyId,
      dealId: l.deal_id,
      dealName: parentDeal?.client || `Deal ${l.deal_id}`,
      title: `${l.situation}: ${l.lesson}`,
      category: l.situation.toLowerCase().includes('pricing') ? 'PRICING' : l.situation.toLowerCase().includes('compet') ? 'COMPETITIVE' : 'OBJECTION_HANDLING',
      takeaway: `${l.lesson} (Strategy used: ${l.strategy_used}, Result: ${l.result})`,
      context: `Encountered objection: "${l.objection}" in ${l.situation}.`,
      outcome,
      retainedAt: new Date(Date.now() - idx * 86400000).toISOString(),
      appliedCount: 1,
    };
  });

  // 4. Ingest Objections as RiskSignals
  const ingestedRiskSignals: RiskSignalEntity[] = objections.map((o, idx) => {
    const severity = (o.severity?.toUpperCase() || 'MEDIUM') as RiskSignalEntity['severity'];
    const category = o.objection_type?.toUpperCase().includes('PRICE') ? 'PRICING' : o.objection_type?.toUpperCase().includes('COMPET') ? 'COMPETITOR' : 'OBJECTION';
    return {
      id: o.objection_id || `risk_${idx}`,
      dealId: o.deal_id,
      companyId,
      signal: o.objection,
      severity: severity === 'HIGH' || severity === 'MEDIUM' || severity === 'LOW' || severity === 'CRITICAL' ? severity : 'MEDIUM',
      category: category as any,
      explanation: `Client expressed concern regarding ${o.objection}. Status: ${o.resolution_status}. Prescribed resolution action: ${o.resolution_action}.`,
      evidence: `Expressed during interaction ${o.source_interaction_id}. Client reaction: ${o.client_reaction}.`,
      detectedAt: new Date().toISOString(),
    };
  });

  // 5. Ingest Product Features into Knowledge Docs
  const productDocs: KnowledgeDocEntity[] = products.map((p) => {
    const pFeatures = features.filter((f) => f.product_id === p.product_id);
    const content = `Product: ${p.product} (Series: ${p.series})
Standard Price: ₹${parseInt(p.sales_price, 10).toLocaleString()} INR
Key Capabilities:
${pFeatures.map((f) => `- ${f.feature} (${f.category}): ${f.availability} — ${f.description}`).join('\n')}`;

    return {
      id: `doc_${p.product_id}`,
      companyId,
      title: `${p.product} Specification & Battlecard`,
      category: 'PRODUCT_DOC',
      uploadedAt: new Date().toISOString(),
      sizeBytes: Buffer.byteLength(content, 'utf-8'),
      status: 'INDEXED',
      chunkCount: 1,
      content,
    };
  });

  const productChunks: KnowledgeChunkEntity[] = productDocs.map((doc, idx) => ({
    id: `chk_${doc.id}_0`,
    docId: doc.id,
    companyId,
    chunkIndex: 0,
    snippet: doc.content.slice(0, 500),
  }));

  // Read current db data, prepend new records
  const dbData = (db as any).data;
  dbData.deals = ingestedDeals;
  dbData.retainedLessons = [...ingestedLessons, ...dbData.retainedLessons];
  dbData.riskSignals = [...ingestedRiskSignals, ...dbData.riskSignals];
  dbData.knowledgeDocs = [...productDocs, ...dbData.knowledgeDocs];
  dbData.knowledgeChunks = [...productChunks, ...dbData.knowledgeChunks];

  db.persist();
  console.log(`[Ingestion] Ingested ${ingestedDeals.length} deals, ${ingestedLessons.length} lessons, ${ingestedRiskSignals.length} risk signals, ${productDocs.length} product docs into persistent database.`);
}

runIngestion();
