import type { Request, Response as ExpressResponse } from 'express';
import { authenticateRequest } from './auth.js';
import { checkAiRateLimit } from './rate-limit.js';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };
type SubscriptionPlan = import('./auth.js').SubscriptionPlan;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

function getModelForPlan(plan: SubscriptionPlan): string {
  switch (plan) {
    case 'premium_plus':
      return process.env.HF_PREMIUM_PLUS_MODEL || process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
    case 'premium':
      return process.env.HF_PREMIUM_MODEL || process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
    default:
      return process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
  }
}

function getMaxTokens(plan: SubscriptionPlan): number {
  switch (plan) {
    case 'premium_plus':
      return 1024;
    case 'premium':
      return 768;
    default:
      return 512;
  }
}

function formatPrompt(messages: ChatMessage[]): string {
  const system = messages.find((m) => m.role === 'system');
  const conversation = messages.filter((m) => m.role !== 'system');
  let prompt = system ? `<s>[INST] ${system.content} [/INST]</s>\n` : '';

  for (const msg of conversation) {
    if (msg.role === 'user') {
      prompt += `<s>[INST] ${msg.content} [/INST]`;
    } else {
      prompt += ` ${msg.content}</s>\n`;
    }
  }

  return prompt;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 503 && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error('Request failed after retries');
}

export async function handleChatRequest(req: Request, res: ExpressResponse) {
  const apiKey = process.env.HF_API_KEY;

  if (!apiKey || apiKey === 'PASTE_HUGGINGFACE_API_KEY_HERE') {
    res.status(503).json({
      error: 'AI service not configured. Set HF_API_KEY in your .env file.',
    });
    return;
  }

  const { messages, stream = true } = req.body as {
    messages?: ChatMessage[];
    stream?: boolean;
  };

  if (!messages?.length) {
    res.status(400).json({ error: 'Messages are required' });
    return;
  }

  try {
    const auth = await authenticateRequest(req);
    const limit = checkAiRateLimit(auth.userId, auth.plan);

    if (!limit.allowed) {
      res.status(limit.statusCode).json({ error: limit.error });
      return;
    }

    const model = getModelForPlan(auth.plan);
    const maxTokens = getMaxTokens(auth.plan);
    const prompt = formatPrompt(messages);
    const url = `https://api-inference.huggingface.co/models/${model}`;

    const hfResponse = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens,
          return_full_text: false,
          temperature: 0.7,
          top_p: 0.9,
        },
        options: { wait_for_model: true },
        stream,
      }),
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      res.status(hfResponse.status).json({
        error: `AI model error: ${errorText.slice(0, 200)}`,
      });
      return;
    }

    if (stream && hfResponse.body) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = hfResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line) as { token?: { text?: string }; generated_text?: string };
            const text = parsed.token?.text ?? parsed.generated_text ?? '';
            if (text) {
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const data = (await hfResponse.json()) as Array<{ generated_text?: string }> | { generated_text?: string };
    const text = Array.isArray(data)
      ? data[0]?.generated_text ?? ''
      : data.generated_text ?? '';

    res.json({
      text: text.trim() || 'I could not generate a response. Please try again.',
      remainingToday: limit.remainingToday,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const statusCode =
      typeof err === 'object' && err && 'statusCode' in err && typeof err.statusCode === 'number'
        ? err.statusCode
        : 500;
    res.status(statusCode).json({ error: message });
  }
}
