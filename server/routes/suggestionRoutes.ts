import { Router } from 'express';
import { db } from '../db/store';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

export const suggestionRouter = Router();

// GET /suggestions
suggestionRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const dealId = req.query.dealId as string | undefined;

  const suggestions = db.getSuggestions(companyId, dealId);
  return res.json({ suggestions });
});

// POST /suggestions/:id/apply
suggestionRouter.post('/:id/apply', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const updated = db.updateSuggestionStatus(companyId, req.params.id, 'APPLIED');
  if (!updated) {
    return res.status(404).json({ success: false, error: { code: 'SUGGESTION_NOT_FOUND' } });
  }

  db.createActivity({
    id: `act_${Date.now()}`,
    dealId: updated.dealId,
    companyId,
    clientName: updated.clientName,
    type: 'ACTION_APPLIED' as any,
    title: `Next-Best-Action Executed: ${updated.title}`,
    description: `Applied recommendation: ${updated.description}`,
    author: req.user?.fullName || 'System',
    timestamp: new Date().toISOString(),
  });

  return res.json({ success: true, suggestion: updated });
});

// POST /suggestions/:id/dismiss
suggestionRouter.post('/:id/dismiss', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const updated = db.updateSuggestionStatus(companyId, req.params.id, 'DISMISSED');
  if (!updated) {
    return res.status(404).json({ success: false, error: { code: 'SUGGESTION_NOT_FOUND' } });
  }
  return res.json({ success: true, id: req.params.id });
});
