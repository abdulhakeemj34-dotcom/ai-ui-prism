import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

const MAX_RETRIES = 3;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured || !supabase) return {};

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function checkAiHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return false;
    const data = (await res.json()) as { aiConfigured?: boolean };
    return Boolean(data.aiConfigured);
  } catch {
    return false;
  }
}

export async function sendChatMessage(
  messages: ChatMessage[],
  onChunk?: (text: string) => void,
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({ messages, stream: Boolean(onChunk) }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error ?? `Request failed (${response.status})`);
      }

      if (onChunk && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            const line = part.replace(/^data: /, '').trim();
            if (line === '[DONE]') continue;
            if (!line) continue;
            try {
              const parsed = JSON.parse(line) as { text?: string };
              if (parsed.text) {
                fullText += parsed.text;
                onChunk(parsed.text);
              }
            } catch {
              // skip
            }
          }
        }

        return fullText.trim() || 'I could not generate a response.';
      }

      const data = (await response.json()) as { text?: string };
      return data.text?.trim() || 'I could not generate a response.';
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES - 1) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }

  throw lastError ?? new Error('Failed to get AI response');
}
