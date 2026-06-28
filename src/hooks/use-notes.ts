import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadUserData, saveUserData, logActivity } from '@/lib/user-storage';
import type { Note } from '@/types';

const NOTES_KEY = 'notes';
// Phase 3: migrate note persistence behind this hook to backend storage.

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    setNotes(loadUserData<Note[]>(user?.id ?? null, NOTES_KEY, []));
  }, [user?.id]);

  const persist = useCallback(
    (next: Note[]) => {
      setNotes(next);
      saveUserData(user?.id ?? null, NOTES_KEY, next);
    },
    [user?.id],
  );

  const addNote = useCallback(
    (title: string, content = '', category = 'General') => {
      const now = new Date().toISOString();
      const note: Note = {
        id: crypto.randomUUID(),
        title: title.trim() || 'Untitled',
        content,
        category,
        createdAt: now,
        updatedAt: now,
      };
      persist([note, ...notes]);
      logActivity(user?.id ?? null, { type: 'note', title: 'Note created', description: note.title });
      return note;
    },
    [notes, persist, user?.id],
  );

  const updateNote = useCallback(
    (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'category'>>) => {
      persist(
        notes.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n,
        ),
      );
    },
    [notes, persist],
  );

  const deleteNote = useCallback(
    (id: string) => {
      persist(notes.filter((n) => n.id !== id));
    },
    [notes, persist],
  );

  const searchNotes = useCallback(
    (query: string) => {
      const q = query.toLowerCase();
      return notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q),
      );
    },
    [notes],
  );

  return { notes, addNote, updateNote, deleteNote, searchNotes };
}
