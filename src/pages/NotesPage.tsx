import { useState } from 'react';
import { Plus, Trash2, Search, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNotes } from '@/hooks/use-notes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORIES = ['General', 'Work', 'Personal', 'Ideas', 'Study'];

export function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, searchNotes } = useNotes();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'General' });

  const filtered = search ? searchNotes(search) : notes;
  const activeNote = notes.find((n) => n.id === editing);

  const openNew = () => {
    setForm({ title: '', content: '', category: 'General' });
    setEditing('new');
    setPreview(false);
  };

  const openEdit = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      setForm({ title: note.title, content: note.content, category: note.category });
      setEditing(id);
      setPreview(false);
    }
  };

  const handleSave = () => {
    if (editing === 'new') {
      addNote(form.title, form.content, form.category);
    } else if (editing) {
      updateNote(editing, form);
    }
    setEditing(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-sm text-muted-foreground">Rich notes with markdown support</p>
        </div>
        <Button onClick={openNew} className="premium-gradient">
          <Plus size={16} className="mr-1" /> New Note
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((note) => (
          <Card key={note.id} className="glass-effect cursor-pointer transition-shadow hover:shadow-md" onClick={() => openEdit(note.id)}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="truncate text-base">{note.title}</CardTitle>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {note.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground">{note.content || 'Empty note'}</p>
              <div className="mt-3 flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">No notes found.</p>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing === 'new' ? 'New Note' : activeNote?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant={preview ? 'ghost' : 'secondary'} size="sm" onClick={() => setPreview(false)}>
                <Edit3 size={14} className="mr-1" /> Edit
              </Button>
              <Button variant={preview ? 'secondary' : 'ghost'} size="sm" onClick={() => setPreview(true)}>
                <Eye size={14} className="mr-1" /> Preview
              </Button>
            </div>
            {preview ? (
              <div className="prose prose-sm dark:prose-invert min-h-[200px] rounded-lg border p-4">
                <ReactMarkdown>{form.content || '*Empty*'}</ReactMarkdown>
              </div>
            ) : (
              <Textarea
                placeholder="Write in markdown…"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="min-h-[200px] font-mono text-sm"
              />
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
