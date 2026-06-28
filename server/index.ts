import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { handleChatRequest } from './ai.js';
import { isServerSupabaseConfigured } from './auth.js';

const app = express();
const PORT = Number(process.env.API_PORT) || 3001;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: Boolean(process.env.HF_API_KEY && process.env.HF_API_KEY !== 'PASTE_HUGGINGFACE_API_KEY_HERE'),
    authEnforced: isServerSupabaseConfigured,
  });
});

app.post('/api/chat', handleChatRequest);

app.listen(PORT, () => {
  console.log(`Nexora API server running on http://localhost:${PORT}`);
});
