import { Router } from 'express';
import multer from 'multer';
import { db } from '../db/store';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { IntelligenceEngine } from '../services/intelligenceEngine';
import { ChatIntelligenceService } from '../services/chatIntelligenceService';
import { KnowledgeDocEntity } from '../types/backendTypes';

export const knowledgeRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

// GET /knowledge/docs
knowledgeRouter.get('/docs', optionalAuth, (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const category = req.query.category as string | undefined;

  const docs = db.getKnowledgeDocs(companyId, category);
  return res.json({ docs });
});

// POST /knowledge/docs
knowledgeRouter.post('/docs', optionalAuth, upload.single('file'), (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const category = (req.body.category || 'PLAYBOOK') as KnowledgeDocEntity['category'];

  let fileName = 'Uploaded Document';
  let content = '';

  if (req.file) {
    fileName = req.file.originalname;
    content = req.file.buffer.toString('utf-8');
  } else if (req.body.content) {
    content = req.body.content;
    fileName = req.body.title || 'Knowledge Guide';
  }

  if (!content.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'EMPTY_CONTENT', message: 'Document content cannot be empty.' },
    });
  }

  const docId = `doc_${Date.now()}`;
  // Split into chunks (~250 chars)
  const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);
  const chunks = paragraphs.map((p, idx) => ({
    id: `chk_${docId}_${idx}`,
    docId,
    companyId,
    chunkIndex: idx,
    snippet: p.trim(),
  }));

  const doc: KnowledgeDocEntity = {
    id: docId,
    companyId,
    title: fileName,
    category,
    uploadedAt: new Date().toISOString(),
    sizeBytes: Buffer.byteLength(content, 'utf-8'),
    status: 'INDEXED',
    chunkCount: chunks.length,
    content,
  };

  db.saveKnowledgeDoc(doc, chunks);

  db.logAudit({
    companyId,
    userId: req.user?.id,
    action: 'KNOWLEDGE_DOC_INDEXED',
    targetResource: doc.title,
  });

  return res.status(201).json(doc);
});

// POST /knowledge/ask
knowledgeRouter.post('/ask', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const companyId = req.companyId || 'comp_apex_01';
  const { question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'EMPTY_QUESTION', message: 'Question prompt cannot be empty.' },
    });
  }

  try {
    const response = await ChatIntelligenceService.queryKnowledgeGrounded(companyId, question.trim());
    return res.json(response);
  } catch (err: any) {
    const fallback = IntelligenceEngine.queryKnowledgeBase(companyId, question.trim());
    return res.json(fallback);
  }
});
