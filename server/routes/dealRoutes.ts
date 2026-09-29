import { Router } from 'express';
import multer from 'multer';
import { db } from '../db/store';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { IntelligenceEngine } from '../services/intelligenceEngine';
import { PythonMlBridge } from '../services/pythonMlBridge';
import { TranscriptEntity } from '../types/backendTypes';

export const dealRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// GET /deals/memory/retained (Must be defined before /deals/:id)
dealRouter.get('/memory/retained', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const lessons = db.getRetainedLessons(companyId);
  return res.json({ lessons });
});

// GET /deals
dealRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const { search, stage, risk, status, page = 1, limit = 50 } = req.query;

  const deals = db.getDeals(companyId, {
    search: search as string,
    stage: stage as string,
    risk: risk as string,
    status: status as string,
  });

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 50;
  const start = (pageNum - 1) * limitNum;
  const paginated = deals.slice(start, start + limitNum);

  return res.json({
    deals: paginated,
    total: deals.length,
    page: pageNum,
    totalPages: Math.ceil(deals.length / limitNum) || 1,
  });
});

// POST /deals
dealRouter.post('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const { client, industry, value, currency, product, stage, owner, risk, status, summary } = req.body;

  if (!client) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_CLIENT', message: 'Client name is required.' },
    });
  }

  const created = db.createDeal(companyId, {
    client,
    industry,
    value: Number(value) || 100000,
    currency: currency || 'USD',
    product: product || 'Enterprise Intelligence Suite',
    stage: stage || 'QUALIFIED',
    owner: owner || req.user?.fullName || 'Sarah Chen',
    ownerId: req.user?.id,
    risk: risk || 'LOW',
    riskScore: risk === 'HIGH' ? 75 : risk === 'MEDIUM' ? 45 : 15,
    status: status || 'ACTIVE',
    summary: summary || '',
  });

  db.createActivity({
    id: `act_${Date.now()}`,
    dealId: created.id,
    companyId,
    clientName: created.client,
    type: 'NOTE',
    title: 'Deal Created in Intelligence Layer',
    description: `Initialized opportunity for ${created.client} valued at ₹${created.value.toLocaleString()}.`,
    author: req.user?.fullName || 'System',
    timestamp: new Date().toISOString(),
  });

  db.logAudit({
    companyId,
    userId: req.user?.id,
    action: 'DEAL_CREATED',
    targetResource: created.id,
  });

  return res.status(201).json(created);
});

// GET /deals/:id
dealRouter.get('/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deal = db.getDeal(companyId, req.params.id);
  if (!deal) {
    return res.status(404).json({
      success: false,
      error: { code: 'DEAL_NOT_FOUND', message: `Deal ${req.params.id} does not exist.` },
    });
  }
  return res.json(deal);
});

// PUT /deals/:id
dealRouter.put('/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const updated = db.updateDeal(companyId, req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'DEAL_NOT_FOUND', message: `Deal ${req.params.id} does not exist.` },
    });
  }

  if (req.body.stage) {
    db.createActivity({
      id: `act_${Date.now()}`,
      dealId: updated.id,
      companyId,
      clientName: updated.client,
      type: 'STATUS_CHANGE',
      title: `Stage Updated to ${req.body.stage}`,
      description: `Opportunity progressed to ${req.body.stage}.`,
      author: req.user?.fullName || 'System',
      timestamp: new Date().toISOString(),
    });
  }

  return res.json(updated);
});

// DELETE /deals/:id
dealRouter.delete('/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const ok = db.deleteDeal(companyId, req.params.id);
  if (!ok) {
    return res.status(404).json({
      success: false,
      error: { code: 'DEAL_NOT_FOUND', message: `Deal ${req.params.id} not found.` },
    });
  }
  return res.json({ success: true, id: req.params.id });
});

// POST /deals/:id/close
dealRouter.post('/:id/close', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const { outcome, reason, lessonsLearned, competitorWon } = req.body;

  const deal = db.getDeal(companyId, req.params.id);
  if (!deal) {
    return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND' } });
  }

  const updated = db.updateDeal(companyId, req.params.id, {
    status: outcome === 'WON' ? 'WON' : 'LOST',
    stage: outcome === 'WON' ? 'WON' : 'LOST',
  });

  // Retain lesson into institutional memory
  let retainedLesson;
  if (lessonsLearned && lessonsLearned.length > 0) {
    retainedLesson = db.saveRetainedLesson({
      id: `les_${Date.now()}`,
      companyId,
      dealId: deal.id,
      dealName: deal.client,
      title: `${outcome === 'WON' ? 'Winning Catalyst' : 'Loss Factor'}: ${deal.client}`,
      category: outcome === 'WON' ? 'OBJECTION_HANDLING' : 'COMPETITIVE',
      takeaway: lessonsLearned[0],
      context: reason || `Closed ${outcome}`,
      outcome,
      retainedAt: new Date().toISOString(),
      appliedCount: 1,
    });
  }

  db.createActivity({
    id: `act_${Date.now()}`,
    dealId: deal.id,
    companyId,
    clientName: deal.client,
    type: 'STATUS_CHANGE',
    title: `Deal Concluded as ${outcome}`,
    description: reason || `Opportunity marked as ${outcome}. Lessons retained to institutional memory.`,
    author: req.user?.fullName || 'System',
    timestamp: new Date().toISOString(),
  });

  return res.json({
    success: true,
    deal: updated,
    retainedLesson,
  });
});

// POST /deals/:id/transcripts
dealRouter.post('/:id/transcripts', optionalAuth, upload.single('file'), (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deal = db.getDeal(companyId, req.params.id);
  if (!deal) {
    return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND' } });
  }

  let textContent = '';
  let fileName = 'pasted_transcript.txt';
  let fileType: TranscriptEntity['fileType'] = 'txt';

  if (req.file) {
    fileName = req.file.originalname;
    const ext = fileName.split('.').pop()?.toLowerCase();
    fileType = ext === 'pdf' ? 'pdf' : ext === 'docx' ? 'docx' : 'txt';
    textContent = req.file.buffer.toString('utf-8');
  } else if (req.body.text) {
    textContent = req.body.text;
    fileName = req.body.title || 'Meeting Transcript.txt';
  }

  if (!textContent.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'EMPTY_TRANSCRIPT', message: 'Transcript content cannot be empty.' },
    });
  }

  const transcript: TranscriptEntity = {
    id: `tr_${Date.now()}`,
    dealId: deal.id,
    companyId,
    fileName,
    fileType,
    status: 'COMPLETED',
    rawText: textContent,
    uploadedAt: new Date().toISOString(),
  };

  db.saveTranscript(transcript);

  // Trigger intelligence analysis node
  IntelligenceEngine.analyzeTranscript(companyId, deal.id, textContent, fileName);

  db.createActivity({
    id: `act_${Date.now()}`,
    dealId: deal.id,
    companyId,
    clientName: deal.client,
    type: 'ANALYSIS_GENERATED',
    title: 'Transcript Ingested & Analyzed',
    description: `Processed dialogue for "${fileName}". Grounded customer intent and objections.`,
    author: req.user?.fullName || 'System',
    timestamp: new Date().toISOString(),
  });

  return res.status(201).json(transcript);
});

// GET /deals/:id/transcripts
dealRouter.get('/:id/transcripts', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const transcripts = db.getTranscripts(companyId, req.params.id);
  return res.json({ transcripts });
});

// GET /deals/:id/transcripts/:transcriptId
dealRouter.get('/:id/transcripts/:transcriptId', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const transcripts = db.getTranscripts(companyId, req.params.id);
  const found = transcripts.find((t) => t.id === req.params.transcriptId);
  if (!found) {
    return res.status(404).json({
      success: false,
      error: { code: 'TRANSCRIPT_NOT_FOUND', message: `Transcript ${req.params.transcriptId} not found.` },
    });
  }
  return res.json(found);
});

// GET /deals/:id/intelligence
dealRouter.get('/:id/intelligence', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  let intel = db.getIntelligence(companyId, req.params.id);

  if (!intel) {
    // Generate default synthesized intelligence based on deal profile
    const deal = db.getDeal(companyId, req.params.id);
    if (!deal) return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND' } });

    intel = IntelligenceEngine.analyzeTranscript(
      companyId,
      deal.id,
      `Discovery session with ${deal.client}. Evaluating ${deal.product}. Customer expresses interest in automating operations but raised questions on enterprise SLA uptime and competitive pricing.`,
      'Automated Initial Synthesis'
    );
  }

  return res.json(intel);
});

// POST /deals/:id/intelligence (Refresh)
dealRouter.post('/:id/intelligence', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deal = db.getDeal(companyId, req.params.id);
  if (!deal) return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND' } });

  const transcripts = db.getTranscripts(companyId, deal.id);
  const text = transcripts.length > 0 ? transcripts[0].rawText : `Discovery with ${deal.client} for ${deal.product}.`;

  const refreshed = IntelligenceEngine.analyzeTranscript(companyId, deal.id, text, 'Refreshed Synthesis');
  return res.json(refreshed);
});

// POST /deals/:id/recall
dealRouter.post('/:id/recall', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const result = IntelligenceEngine.recallSimilarDeals(companyId, req.params.id);
  if (!result) return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND' } });
  return res.json(result);
});

// POST /deals/:id/reflect
dealRouter.post('/:id/reflect', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const result = IntelligenceEngine.reflectOnCluster(companyId, req.params.id);
  return res.json(result);
});

// GET /deals/:id/risk
dealRouter.get('/:id/risk', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deal = db.getDeal(companyId, req.params.id);
  if (!deal) return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND' } });

  const signals = db.getRiskSignals(companyId, deal.id);

  // Execute trained Risk ML model
  const mlRisk = await PythonMlBridge.execute({ task: 'risk', dealId: req.params.id });

  const riskProb = mlRisk?.riskProbability !== undefined ? mlRisk.riskProbability : (deal.riskScore || 45) / 100;
  const riskLevel = mlRisk?.riskLevel || deal.risk;
  const riskScore = Math.round(riskProb * 100);

  return res.json({
    dealId: deal.id,
    overallRisk: riskLevel,
    riskLevel,
    riskProbability: riskProb,
    riskScore,
    modelVersion: mlRisk?.modelVersion || '1.0.0',
    confidence: mlRisk?.confidence || 0.65,
    topRiskFactors: mlRisk?.topRiskFactors || [],
    signals,
    explanation:
      mlRisk?.explanationDetails?.summary ||
      (signals.length > 0
        ? `Elevated risk identified: ${signals.map((s) => s.signal).join('; ')}.`
        : 'Deal metrics are stable with nominal progression across stages.'),
    explanationDetails: mlRisk?.explanationDetails,
    evidence: mlRisk?.evidence || [],
    limitations: mlRisk?.limitations || [],
    mitigationSteps: [
      'Present Enterprise Resiliency Addendum to satisfy legal requirements.',
      'Deploy solutions architect to demonstrate latency benchmarks against competing bids.',
    ],
    trend: riskLevel === 'HIGH' ? 'INCREASING' : riskLevel === 'MEDIUM' ? 'STABLE' : 'DECREASING',
  });
});

// POST /deals/:id/risk/refresh
dealRouter.post('/:id/risk/refresh', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deal = db.getDeal(companyId, req.params.id);
  if (!deal) return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND' } });

  const mlRisk = await PythonMlBridge.execute({ task: 'risk', dealId: req.params.id });
  const riskScore = mlRisk?.riskProbability ? Math.round(mlRisk.riskProbability * 100) : deal.riskScore;
  const riskLevel = mlRisk?.riskLevel || deal.risk;

  db.updateDeal(companyId, deal.id, {
    risk: riskLevel,
    riskScore,
  });

  return res.json({
    success: true,
    dealId: deal.id,
    risk: riskLevel,
    riskScore,
    mlRisk,
  });
});

// GET /deals/:id/outcome-prediction
dealRouter.get('/:id/outcome-prediction', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deal = db.getDeal(companyId, req.params.id);
  if (!deal) return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND' } });

  const outcome = await PythonMlBridge.execute({ task: 'outcome', dealId: req.params.id });
  return res.json(outcome);
});

// GET /deals/:id/cycle-prediction
dealRouter.get('/:id/cycle-prediction', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deal = db.getDeal(companyId, req.params.id);
  if (!deal) return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND' } });

  const cycle = await PythonMlBridge.execute({ task: 'cycle', dealId: req.params.id });
  return res.json(cycle);
});

// GET /deals/:id/similar
dealRouter.get('/:id/similar', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deal = db.getDeal(companyId, req.params.id);
  if (!deal) return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND' } });

  const similar = await PythonMlBridge.execute({ task: 'similar', dealId: req.params.id, topK: 5 });
  return res.json(similar);
});

// POST /deals/:id/simulation AND POST /deals/:id/simulate
const handleSimulation = async (req: AuthenticatedRequest, res: any) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deal = db.getDeal(companyId, req.params.id);
  if (!deal) return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND' } });

  const { discountPercent = 10, contractDurationMonths = 24, productPackage } = req.body;

  const simResult = await PythonMlBridge.execute({
    task: 'simulation',
    dealId: req.params.id,
    discount: Number(discountPercent),
    duration: Number(contractDurationMonths),
    product: productPackage || deal.product,
  });

  return res.json(simResult);
};

dealRouter.post('/:id/simulate', optionalAuth, handleSimulation);
dealRouter.post('/:id/simulation', optionalAuth, handleSimulation);

// GET /deals/:id/intelligence-models
dealRouter.get('/:id/intelligence-models', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deal = db.getDeal(companyId, req.params.id);
  if (!deal) return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND' } });

  const [risk, outcome, cycle, similar] = await Promise.all([
    PythonMlBridge.execute({ task: 'risk', dealId: req.params.id }),
    PythonMlBridge.execute({ task: 'outcome', dealId: req.params.id }),
    PythonMlBridge.execute({ task: 'cycle', dealId: req.params.id }),
    PythonMlBridge.execute({ task: 'similar', dealId: req.params.id, topK: 3 }),
  ]);

  return res.json({
    dealId: deal.id,
    risk,
    outcome,
    cycle,
    similar,
    modelVersion: '1.0.0',
    datasetVersion: 'v1.0-historical-235-closed-deals',
    timestamp: new Date().toISOString(),
  });
});

// GET /deals/:id/suggestions
dealRouter.get('/:id/suggestions', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const suggestions = db.getSuggestions(companyId, req.params.id);
  return res.json({ suggestions });
});
