export interface MemoryEntry {
  id: string;
  key: string;
  value: string;
  category: 'preference' | 'context' | 'fact' | 'conversation';
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary {
  id: string;
  sessionId: string;
  summary: string;
  messageCount: number;
  createdAt: string;
}

export interface UserMemory {
  entries: MemoryEntry[];
  conversations: ConversationSummary[];
  preferences: Record<string, string>;
}

export const DEFAULT_MEMORY: UserMemory = {
  entries: [],
  conversations: [],
  preferences: {},
};
