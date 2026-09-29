import { Router } from 'express';
import { db } from '../db/store';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { PythonMlBridge } from '../services/pythonMlBridge';

export const riskRouter = Router();

export async function computeDealRisk(companyId: string, dealId: string) {
  const deal = db.getDeal(companyId, dealId);
  if (!deal) return null;

  const signals = db.getRiskSignals(companyId, deal.id);
  const mlRisk = await PythonMlBridge.execute({ task: 'risk', dealId });

  const riskProb = mlRisk?.riskProbability !== undefined ? mlRisk.riskProbability : (deal.riskScore || 45) / 100;
  const riskLevel = mlRisk?.riskLevel || deal.risk;
  const riskScore = Math.round(riskProb * 100);

  return {
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
  };
}

// GET /risk or /api/risk
riskRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deals = db.getDeals(companyId);
  const activeDeals = deals.filter((d) => d.status === 'ACTIVE').slice(0, 20);

  const risks = await Promise.all(
    activeDeals.map(async (deal) => {
      return computeDealRisk(companyId, deal.id);
    })
  );

  return res.json({ risks: risks.filter(Boolean) });
});

// GET /risk/:dealId
riskRouter.get('/:dealId', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const risk = await computeDealRisk(companyId, req.params.dealId);
  if (!risk) {
    return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND', message: `Deal ${req.params.dealId} not found` } });
  }
  return res.json(risk);
});

// POST /risk/:dealId/refresh
riskRouter.post('/:dealId/refresh', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deal = db.getDeal(companyId, req.params.dealId);
  if (!deal) {
    return res.status(404).json({ success: false, error: { code: 'DEAL_NOT_FOUND' } });
  }

  const mlRisk = await PythonMlBridge.execute({ task: 'risk', dealId: req.params.dealId });
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
