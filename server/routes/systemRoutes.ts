import { Router } from 'express';
import { db } from '../db/store';
import { optionalAuth, requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

export const systemRouter = Router();

// GET /health
systemRouter.get('/health', (req, res) => {
  return res.json({
    status: 'healthy',
    service: 'Deal Intelligence Agent Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// GET /users/me
systemRouter.get('/users/me', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
  const company = db.getCompany(req.user.companyId);
  return res.json({
    id: req.user.id,
    fullName: req.user.fullName,
    email: req.user.email,
    company: company?.name || 'Enterprise Org',
    role: req.user.role,
  });
});

// GET /company
systemRouter.get('/company', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const company = db.getCompany(companyId);
  if (!company) return res.status(404).json({ success: false, error: { code: 'COMPANY_NOT_FOUND' } });
  return res.json(company);
});
