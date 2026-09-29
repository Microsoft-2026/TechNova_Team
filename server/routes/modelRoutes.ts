import { Router } from 'express';
import { PythonMlBridge } from '../services/pythonMlBridge';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

export const modelRouter = Router();

// GET /models/status or /api/models/status
modelRouter.get('/status', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const result = await PythonMlBridge.execute({ task: 'status' });
  return res.json(result);
});

// GET /models/:modelName or /api/models/:modelName
modelRouter.get('/:modelName', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const modelName = req.params.modelName;
  const result = await PythonMlBridge.execute({ task: 'model', modelName });
  if (result.error) {
    return res.status(404).json({
      status: 'MODEL_UNAVAILABLE',
      model: modelName,
      message: result.error,
    });
  }
  return res.json(result);
});
