export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isPlaceholder?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

export const DEMO_SUGGESTIONS = [
  'What can you help me with?',
  'Help me plan my day',
  'Summarize my tasks and goals',
] as const;
