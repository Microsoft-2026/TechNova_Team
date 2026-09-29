import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/store';
import { JWT_SECRET, requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

export const authRouter = Router();

// POST /auth/register
authRouter.post('/register', (req, res) => {
  const { fullName, email, company, role, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Full name, email, and password are required.' },
    });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'USER_EXISTS', message: 'An account with this email address already exists.' },
    });
  }

  // Find or create company
  const companyDomain = email.split('@')[1] || 'enterprise.internal';
  let userCompany = db.getCompanyByDomain(companyDomain);
  if (!userCompany) {
    userCompany = db.createCompany(company || 'New Enterprise Org', companyDomain);
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = db.createUser({
    companyId: userCompany.id,
    fullName,
    email,
    role: role || 'Account Executive',
    passwordHash,
  });

  const token = jwt.sign(
    { userId: newUser.id, companyId: newUser.companyId, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  db.logAudit({
    companyId: userCompany.id,
    userId: newUser.id,
    action: 'USER_REGISTERED',
    targetResource: newUser.email,
  });

  return res.status(201).json({
    token,
    refreshToken: `ref_${Date.now()}_${newUser.id}`,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      company: userCompany.name,
      role: newUser.role,
    },
  });
});

// POST /auth/login
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Email and password are required.' },
    });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });
  }

  const company = db.getCompany(user.companyId);

  const token = jwt.sign(
    { userId: user.id, companyId: user.companyId, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  db.logAudit({
    companyId: user.companyId,
    userId: user.id,
    action: 'USER_LOGIN',
    targetResource: user.email,
  });

  return res.json({
    token,
    refreshToken: `ref_${Date.now()}_${user.id}`,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      company: company?.name || 'Enterprise Org',
      role: user.role,
    },
  });
});

// POST /auth/refresh
authRouter.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_TOKEN', message: 'Refresh token is required.' },
    });
  }

  // Issue refreshed token
  const defaultUser = db.getUserByEmail('schen@enterprise.com');
  if (!defaultUser) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN' } });
  }

  const company = db.getCompany(defaultUser.companyId);
  const token = jwt.sign(
    { userId: defaultUser.id, companyId: defaultUser.companyId, email: defaultUser.email, role: defaultUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    refreshToken: `ref_${Date.now()}_${defaultUser.id}`,
    user: {
      id: defaultUser.id,
      fullName: defaultUser.fullName,
      email: defaultUser.email,
      company: company?.name || 'Enterprise Org',
      role: defaultUser.role,
    },
  });
});

// GET /auth/me
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
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
