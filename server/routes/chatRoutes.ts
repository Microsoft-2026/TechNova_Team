import { Router } from 'express';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { ChatIntelligenceService } from '../services/chatIntelligenceService';
import { db } from '../db/store';

export const chatRouter = Router();

// POST /chat or /api/chat
chatRouter.post('/', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const companyId = req.companyId || 'comp_apex_01';
    const { messages, dealId } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_MESSAGES', message: 'Chat messages array is required.' },
      });
    }

    const result = await ChatIntelligenceService.chat(companyId, messages, dealId);

    // Audit log chat interaction
    db.logAudit({
      companyId,
      userId: req.user?.id,
      action: 'AI_CHAT_QUERY',
      targetResource: dealId ? `Deal: ${dealId}` : 'General Knowledge Base',
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('[chatRouter] Error handling chat message:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'CHAT_ERROR', message: err.message || 'Internal chat agent error' },
    });
  }
});

// GET /chat/deals - Quick list of available deals for context binding
chatRouter.get('/deals', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const deals = db.getDeals(companyId);
  const simplified = deals.map((d) => ({
    id: d.id,
    client: d.client,
    value: d.value,
    stage: d.stage,
    risk: d.risk,
    winProbability: d.winProbability,
  }));
  return res.json({ deals: simplified });
});
