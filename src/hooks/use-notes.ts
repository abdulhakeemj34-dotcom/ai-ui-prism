import { usePersistence } from './use-persistence';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  summary?: string;
  suggestedTasks?: string[];
  updatedAt: number;
}

export function useNotes() {
  const [notes, setNotes] = usePersistence<Note[]>("nexora-notes", [
    { 
      id: "1", 
      title: "Welcome to Nexora Notes", 
      content: "This is your futuristic note taking module. Start by creating a new note using the plus button below.", 
      category: "Personal",
      tags: ["welcome", "nexora"],
      summary: "Welcome note for the new system.",
      updatedAt: Date.now() 
    },
  ]);

  const addNote = (note: Omit<Note, 'id' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
  };
}
