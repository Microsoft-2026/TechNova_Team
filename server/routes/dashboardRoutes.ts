import { Router } from 'express';
import { db } from '../db/store';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

export const dashboardRouter = Router();

// GET /dashboard/summary
dashboardRouter.get('/summary', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deals = db.getDeals(companyId);
  const activities = db.getActivities(companyId);
  const suggestions = db.getSuggestions(companyId);
  const riskSignals = deals.flatMap((d) => db.getRiskSignals(companyId, d.id));

  const activeDeals = deals.filter((d) => d.status === 'ACTIVE');
  const wonDeals = deals.filter((d) => d.stage === 'WON' || d.status === 'WON');
  const lostDeals = deals.filter((d) => d.stage === 'LOST' || d.status === 'LOST');
  const negotiations = activeDeals.filter((d) => d.stage === 'NEGOTIATION');
  const highRiskDeals = activeDeals.filter((d) => d.risk === 'HIGH' || d.risk === 'CRITICAL');

  // Attention Queue: high risk or negotiation deals
  const attentionQueue = activeDeals
    .filter((d) => d.risk === 'HIGH' || d.risk === 'CRITICAL' || d.stage === 'NEGOTIATION')
    .slice(0, 5);

  const upcomingDeals = activeDeals.slice(0, 5);

  // Synthesize Live AI Insights from active suggestions & risk signals
  const aiInsights = suggestions.slice(0, 4).map((sug) => ({
    id: sug.id,
    dealId: sug.dealId,
    dealName: sug.clientName,
    title: sug.title,
    detail: sug.description,
    why: sug.why,
    evidence: sug.evidence,
    source: 'AI_INSIGHT' as const,
    createdAt: sug.createdAt,
    suggestedAction: sug.description,
  }));

  if (aiInsights.length === 0 && riskSignals.length > 0) {
    const topRisk = riskSignals[0];
    const riskDeal = deals.find((d) => d.id === topRisk.dealId);
    aiInsights.push({
      id: `insight_${topRisk.id}`,
      dealId: topRisk.dealId,
      dealName: riskDeal?.client || 'Active Deal',
      title: `Risk Alert: ${topRisk.signal}`,
      detail: topRisk.explanation,
      why: 'Transcript and timeline monitoring flagged critical vulnerability.',
      evidence: topRisk.evidence || 'Identified during automated signal extraction.',
      source: 'AI_INSIGHT' as const,
      createdAt: topRisk.detectedAt,
      suggestedAction: 'Schedule executive alignment to mitigate objection.',
    });
  }

  return res.json({
    activeDealsCount: activeDeals.length,
    upcomingMeetingsCount: activities.filter((a) => a.type === 'MEETING' || a.type === 'CALL').length,
    wonDealsCount: wonDeals.length,
    lostDealsCount: lostDeals.length,
    negotiationsCount: negotiations.length,
    highRiskDealsCount: highRiskDeals.length,
    attentionQueue,
    upcomingDeals,
    recentActivities: activities.slice(0, 8),
    aiInsights,
  });
});
