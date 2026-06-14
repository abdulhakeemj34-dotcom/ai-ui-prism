import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Clock, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '../UI/GlassCard';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export function ChatHistory({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession
}: ChatHistoryProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-background/95 backdrop-blur-2xl border-r border-border/40 z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center">
                <MessageSquare size={20} className="mr-2 text-primary" />
                Chat History
              </h3>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X size={20} />
              </Button>
            </div>

            <div className="p-4">
              <Button 
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                className="w-full justify-start h-12 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all"
              >
                <Plus size={18} className="mr-2" />
                New Chat
              </Button>
            </div>

            <ScrollArea className="flex-1 px-4">
              <div className="space-y-2 pb-8">
                {sessions.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    No recent chats
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="group relative">
                      <button
                        onClick={() => {
                          onSelectSession(session.id);
                          onClose();
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          activeSessionId === session.id
                            ? 'bg-primary/10 border-primary/30'
                            : 'bg-card/40 border-border/40 hover:bg-card/60 hover:border-border/60'
                        }`}
                      >
                        <div className="font-medium text-sm truncate pr-6">{session.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center">
                          <Clock size={10} className="mr-1" />
                          {new Date(session.timestamp).toLocaleDateString()}
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
