import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Trash2, 
  Sparkles, Tag, X, 
  BookOpen, Lightbulb, Briefcase, User as UserIcon,
  ChevronRight
} from "lucide-react";
import { useNotes, Note } from "@/hooks/use-notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "./UI/GlassCard";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIntelligence } from "@/hooks/use-intelligence";

export function NoteView() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const { actions } = useIntelligence();
  
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.content.toLowerCase().includes(search.toLowerCase()) ||
                          n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === "All" || n.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [notes, search, activeCategory]);

  const saveNote = () => {
    if (!editingNote) return;
    if (!editingNote.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (editingNote.id) {
      updateNote(editingNote.id, editingNote);
    } else {
      addNote(editingNote);
    }
    setEditingNote(null);
    setIsPreview(false);
    toast.success("Note saved successfully");
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    toast.success("Note deleted");
  };

  const generateSummary = () => {
    if (!editingNote || !editingNote.content.trim()) return;
    
    setIsSummarizing(true);
    setTimeout(() => {
      const summaryText = "This note covers " + editingNote.title + ". Key theme: Productivity and automation. Suggested next steps identified.";
      const suggestedTasks = [
        "Research " + editingNote.title,
        "Email follow-up based on notes",
        "Schedule review session"
      ];
      setEditingNote({ 
        ...editingNote, 
        summary: summaryText,
        suggestedTasks 
      });
      setIsSummarizing(false);
      toast.success("AI Summary generated");
    }, 1500);
  };

  const handleAddSuggestedTask = (taskText: string) => {
    actions.addTask(taskText);
    toast.success(`Task added: ${taskText}`);
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && editingNote) {
      const val = e.currentTarget.value.trim().toLowerCase();
      if (val && !editingNote.tags.includes(val)) {
        setEditingNote({ ...editingNote, tags: [...editingNote.tags, val] });
        e.currentTarget.value = "";
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (editingNote) {
      setEditingNote({
        ...editingNote,
        tags: editingNote.tags.filter(t => t !== tagToRemove)
      });
    }
  };

  const CATEGORIES = [
    { id: "Personal", icon: UserIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "Work", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "Ideas", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "Study", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  if (editingNote) {
    return (
      <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <header className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setEditingNote(null); setIsPreview(false); }} 
            className="rounded-xl hover:bg-primary/10"
          >
            Cancel
          </Button>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsPreview(!isPreview)} 
              className="rounded-xl px-4 border-primary/20 bg-primary/5"
            >
              {isPreview ? "Edit" : "Preview"}
            </Button>
            <Button size="sm" onClick={saveNote} className="rounded-xl px-6 bg-primary shadow-lg shadow-primary/20 text-white">
              Save
            </Button>
          </div>
        </header>

        <div className="space-y-4 flex-1 flex flex-col min-h-0 pb-20">
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 custom-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setEditingNote({ ...editingNote, category: cat.id })}
                className={"flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 " + (
                  editingNote.category === cat.id 
                    ? cat.bg + " " + cat.color + " ring-1 ring-current shadow-sm" 
                    : "bg-card/40 text-muted-foreground border border-border/40 hover:bg-card/60"
                )}
              >
                <cat.icon size={14} className="mr-1.5" />
                {cat.id}
              </button>
            ))}
          </div>

          <Input
            value={editingNote.title}
            onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
            placeholder="Note Title"
            className="text-2xl font-bold bg-transparent border-none focus-visible:ring-0 px-0 h-auto"
          />

          <div className="flex flex-wrap gap-2 items-center">
            <Tag size={14} className="text-muted-foreground mr-1" />
            {editingNote.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="rounded-full pl-2 pr-1 py-0.5 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                  <X size={12} />
                </button>
              </Badge>
            ))}
            <input
              onKeyDown={handleTagInput}
              placeholder="Add tag..."
              className="bg-transparent border-none focus:outline-none text-xs text-muted-foreground w-20"
            />
          </div>

          <div className="flex-1 bg-card/20 backdrop-blur-md rounded-2xl border border-border/40 overflow-hidden flex flex-col shadow-inner">
            {isPreview ? (
              <ScrollArea className="flex-1 p-6 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{editingNote.content}</ReactMarkdown>
              </ScrollArea>
            ) : (
              <Textarea
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                placeholder="Start typing your futuristic thoughts..."
                className="flex-1 bg-transparent border-none focus-visible:ring-0 resize-none p-6 text-sm leading-relaxed custom-scrollbar"
              />
            )}
          </div>

          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs font-semibold text-primary uppercase tracking-wider">
                <Sparkles size={14} className="mr-2" />
                AI Insights
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={generateSummary} 
                disabled={isSummarizing || !editingNote.content.trim()}
                className="h-7 px-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-[10px]"
              >
                {isSummarizing ? "..." : "Summarize"}
              </Button>
            </div>
            
            <AnimatePresence mode="wait">
              {editingNote.summary ? (
                <motion.div 
                  key="summary-content"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "{editingNote.summary}"
                  </p>
                  
                  {editingNote.suggestedTasks && editingNote.suggestedTasks.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-primary/10">
                      <p className="text-[10px] font-bold text-primary uppercase">Suggested Tasks</p>
                      <div className="flex flex-wrap gap-2">
                        {editingNote.suggestedTasks.map((st, i) => (
                          <button
                            key={i}
                            onClick={() => handleAddSuggestedTask(st)}
                            className="flex items-center bg-card/40 hover:bg-primary/10 border border-border/40 hover:border-primary/30 rounded-lg px-2 py-1 text-[10px] transition-all"
                          >
                            <Plus size={10} className="mr-1 text-primary" />
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.p 
                  key="no-summary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground/60 italic"
                >
                  No summary generated yet.
                </motion.p>
              )}
            </AnimatePresence>

            <div className="absolute top-0 right-0 p-8 bg-primary/5 blur-3xl rounded-full -z-10" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="pl-12 h-14 bg-card/40 backdrop-blur-xl border-border/60 rounded-2xl focus-visible:ring-primary/20 transition-all shadow-xl group-focus-within:border-primary/40"
          />
        </div>

        <ScrollArea className="w-full whitespace-nowrap pb-1">
          <div className="flex space-x-2">
            {["All", "Personal", "Work", "Ideas", "Study"].map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={"rounded-full px-5 text-xs h-9 transition-all " + (
                  activeCategory === cat 
                    ? "bg-primary shadow-lg shadow-primary/20 text-white border-transparent" 
                    : "bg-card/40 border-border/40 hover:bg-primary/10"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24">
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => {
              const category = CATEGORIES.find(c => c.id === note.category) || CATEGORIES[0];
              return (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard 
                    className="p-5 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all border-white/5" 
                    onClick={() => setEditingNote(note)}
                    hover={true}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={"flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider " + category.bg + " " + category.color}>
                        {note.category}
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">{note.title}</h3>
                    
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                      {note.content}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {note.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-primary/5 text-primary/70 px-2 py-0.5 rounded-md border border-primary/10">
                          {"#" + tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                      <div className="flex items-center space-x-2 text-[10px] text-muted-foreground">
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {note.summary && (
                        <div className="flex items-center text-[10px] text-primary font-medium">
                          <Sparkles size={10} className="mr-1" />
                          AI Summary Ready
                        </div>
                      )}
                    </div>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors rounded-full" />
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredNotes.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground/40">
              <p className="text-sm font-medium">No notes found.</p>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={() => setEditingNote({ 
          id: "", 
          title: "", 
          content: "", 
          category: "Personal", 
          tags: [], 
          updatedAt: Date.now() 
        })}
        className="fixed bottom-28 right-6 w-14 h-14 rounded-2xl bg-primary shadow-2xl shadow-primary/40 flex items-center justify-center z-40 text-white"
      >
        <Plus size={32} />
      </Button>
    </div>
  );
}
