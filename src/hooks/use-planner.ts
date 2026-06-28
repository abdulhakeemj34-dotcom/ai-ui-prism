import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadUserData, saveUserData } from '@/lib/user-storage';
import type { StudySubject, StudySession } from '@/types';

const SUBJECTS_KEY = 'study_subjects';
const SESSIONS_KEY = 'study_sessions';

const DEFAULT_SUBJECTS: StudySubject[] = [
  { id: '1', name: 'Mathematics', color: '#3b82f6', hoursPerWeek: 5 },
  { id: '2', name: 'Science', color: '#10b981', hoursPerWeek: 4 },
  { id: '3', name: 'History', color: '#f59e0b', hoursPerWeek: 3 },
];

export function usePlanner() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<StudySubject[]>(DEFAULT_SUBJECTS);
  const [sessions, setSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    setSubjects(loadUserData(user?.id ?? null, SUBJECTS_KEY, DEFAULT_SUBJECTS));
    setSessions(loadUserData<StudySession[]>(user?.id ?? null, SESSIONS_KEY, []));
  }, [user?.id]);

  const saveSubjects = useCallback(
    (next: StudySubject[]) => {
      setSubjects(next);
      saveUserData(user?.id ?? null, SUBJECTS_KEY, next);
    },
    [user?.id],
  );

  const saveSessions = useCallback(
    (next: StudySession[]) => {
      setSessions(next);
      saveUserData(user?.id ?? null, SESSIONS_KEY, next);
    },
    [user?.id],
  );

  const addSubject = useCallback(
    (name: string, color: string, hoursPerWeek = 3) => {
      const subject: StudySubject = {
        id: crypto.randomUUID(),
        name,
        color,
        hoursPerWeek,
      };
      saveSubjects([...subjects, subject]);
      return subject;
    },
    [subjects, saveSubjects],
  );

  const addSession = useCallback(
    (data: Omit<StudySession, 'id'>) => {
      const session: StudySession = { ...data, id: crypto.randomUUID() };
      saveSessions([...sessions, session]);
      return session;
    },
    [sessions, saveSessions],
  );

  const updateSession = useCallback(
    (id: string, updates: Partial<Omit<StudySession, 'id'>>) => {
      saveSessions(sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    },
    [sessions, saveSessions],
  );

  const deleteSession = useCallback(
    (id: string) => {
      saveSessions(sessions.filter((s) => s.id !== id));
    },
    [sessions, saveSessions],
  );

  const reorderSessions = useCallback(
    (orderedIds: string[]) => {
      const map = new Map(sessions.map((s) => [s.id, s]));
      saveSessions(orderedIds.map((id) => map.get(id)).filter(Boolean) as StudySession[]);
    },
    [sessions, saveSessions],
  );

  return {
    subjects,
    sessions,
    addSubject,
    addSession,
    updateSession,
    deleteSession,
    reorderSessions,
  };
}
