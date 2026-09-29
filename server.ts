import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { authRouter } from './server/routes/authRoutes';
import { dashboardRouter } from './server/routes/dashboardRoutes';
import { dealRouter } from './server/routes/dealRoutes';
import { suggestionRouter } from './server/routes/suggestionRoutes';
import { knowledgeRouter } from './server/routes/knowledgeRoutes';
import { reportRouter } from './server/routes/reportRoutes';
import { systemRouter } from './server/routes/systemRoutes';
import { modelRouter } from './server/routes/modelRoutes';
import { chatRouter } from './server/routes/chatRoutes';
import { riskRouter } from './server/routes/riskRoutes';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register API Routes
app.use('/auth', authRouter);
app.use('/api/auth', authRouter);

app.use('/dashboard', dashboardRouter);
app.use('/api/dashboard', dashboardRouter);

app.use('/deals', dealRouter);
app.use('/api/deals', dealRouter);

app.use('/suggestions', suggestionRouter);
app.use('/api/suggestions', suggestionRouter);

app.use('/knowledge', knowledgeRouter);
app.use('/api/knowledge', knowledgeRouter);

app.use('/reports', reportRouter);
app.use('/api/reports', reportRouter);

app.use('/models', modelRouter);
app.use('/api/models', modelRouter);

app.use('/chat', chatRouter);
app.use('/api/chat', chatRouter);

app.use('/risk', riskRouter);
app.use('/api/risk', riskRouter);

app.use('/api', systemRouter);
app.use('/', systemRouter); // exposes /health, /users/me, /company

// Mount Vite or static frontend
async function startServer() {
  if (process.env.NODE_ENV === 'production' && process.env.SERVE_STATIC === 'true') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Deal Intelligence Agent] Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Deal Intelligence Agent] Startup error:', err);
  process.exit(1);
});
