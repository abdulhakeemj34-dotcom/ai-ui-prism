import { useState, useEffect, useCallback, useRef } from 'react';
import { usePersistence } from './use-persistence';
import { ChatSession, Message } from '@/types/chat';

const AI_PLACEHOLDER = 'Thinking...';
const SESSIONS_KEY = 'nexora_sessions';
const DEMO_RESPONSE_DELAY_MS = 1200;

function messagesKey(sessionId: string) {
  return `nexora_messages_${sessionId}`;
}

function isValidMessage(value: unknown): value is Message {
  if (!value || typeof value !== 'object') return false;
  const msg = value as Message;
  return (
    typeof msg.id === 'string' &&
    (msg.role === 'user' || msg.role === 'assistant') &&
    typeof msg.content === 'string' &&
    typeof msg.timestamp === 'string'
  );
}

function isValidSession(value: unknown): value is ChatSession {
  if (!value || typeof value !== "object") return false;

  const session = value as ChatSession;

  return (
    typeof session.id === "string" &&
    typeof session.title === "string" &&
    typeof session.lastMessage === "string" &&
    typeof session.timestamp === "string"
  );
}

function loadMessages(sessionId: string): Message[] {
  const saved = localStorage.getItem(messagesKey(sessionId));
  if (!saved) return [];
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidMessage);
  } catch {
    return [];
  }
}

function saveMessages(sessionId: string, messages: Message[]) {
  localStorage.setItem(messagesKey(sessionId), JSON.stringify(messages));
}

function createSession(): ChatSession {
  return {
    id: Date.now().toString(),
    title: 'New chat',
    lastMessage: '',
    timestamp: new Date().toISOString(),
  };
}

export function useChat() {
  const [sessions, setSessions] = usePersistence<ChatSession[]>(SESSIONS_KEY, []);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  const activeSessionIdRef = useRef(activeSessionId);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPending = pendingSessionId === activeSessionId;

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    return () => {
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const validSessions = sessions.filter(isValidSession);
    if (validSessions.length !== sessions.length) {
      setSessions(validSessions);
      return;
    }

    if (validSessions.length === 0) {
      const session = createSession();
      setSessions([session]);
      setActiveSessionId(session.id);
      setMessages([]);
      return;
    }

    if (!activeSessionId || !validSessions.some((s) => s.id === activeSessionId)) {
      setActiveSessionId(validSessions[0].id);
    }
  }, [sessions, activeSessionId, setSessions]);

  useEffect(() => {
    if (!activeSessionId) return;
    setMessages(loadMessages(activeSessionId));
  }, [activeSessionId]);

  const updateSessionMeta = useCallback(
    (sessionId: string, lastMessage: string, title?: string) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                lastMessage,
                timestamp: new Date().toISOString(),
                ...(title ? { title } : {}),
              }
            : s,
        ),
      );
    },
    [setSessions],
  );

  const createChat = useCallback(() => {
    const session = createSession();
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setMessages([]);
    return session.id;
  }, [setSessions]);

  const selectChat = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
        pendingTimerRef.current = null;
      }
      if (pendingSessionId === id) {
        setPendingSessionId(null);
      }

      localStorage.removeItem(messagesKey(id));

      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (filtered.length > 0) {
          if (activeSessionIdRef.current === id) {
            setActiveSessionId(filtered[0].id);
          }
          return filtered;
        }

        const session = createSession();
        setActiveSessionId(session.id);
        setMessages([]);
        return [session];
      });
    },
    [pendingSessionId, setSessions],
  );

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      const sessionId = activeSessionIdRef.current;
      if (!trimmed || !sessionId || pendingSessionId === sessionId) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      const stored = loadMessages(sessionId);
      const withUser = [...stored, userMessage];
      saveMessages(sessionId, withUser);

      if (activeSessionIdRef.current === sessionId) {
        setMessages(withUser);
      }

      const isFirstUserMessage = stored.filter((m) => m.role === 'user').length === 0;
      updateSessionMeta(
        sessionId,
        trimmed,
        isFirstUserMessage
          ? trimmed.slice(0, 40) + (trimmed.length > 40 ? '…' : '')
          : undefined,
      );

      setPendingSessionId(sessionId);

      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
      }

      pendingTimerRef.current = setTimeout(() => {
  pendingTimerRef.current = null;

  const assistantMessage: Message = {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    content: AI_PLACEHOLDER,
    timestamp: new Date().toISOString(),
    isPlaceholder: true,
  };

  const currentStored = loadMessages(sessionId);
  const updated = [...currentStored, assistantMessage];
  saveMessages(sessionId, updated);
  updateSessionMeta(sessionId, AI_PLACEHOLDER);

  setPendingSessionId((current) => (current === sessionId ? null : current));

  if (activeSessionIdRef.current === sessionId) {
    setMessages(updated);
  }
}, DEMO_RESPONSE_DELAY_MS);
    },
    [pendingSessionId, updateSessionMeta],
  );

  return {
    sessions: sessions.filter(isValidSession),
    activeSessionId,
    messages,
    isPending,
    createChat,
    selectChat,
    deleteChat,
    sendMessage,
  };
}
