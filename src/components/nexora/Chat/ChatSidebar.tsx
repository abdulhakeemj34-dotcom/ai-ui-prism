import { MessageSquare, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatSession } from '@/types/chat';
import { Logo } from '../UI/Logo';
import { cn } from '@/lib/utils';

interface ChatSidebarPanelProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClose?: () => void;
  className?: string;
}

export function ChatSidebarPanel({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClose,
  className,
}: ChatSidebarPanelProps) {
  return (
    <div className={cn('flex h-full flex-col bg-muted/30', className)}>
      <div className="flex items-center justify-between border-b border-border/40 p-3">
        <Logo size={28} />
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg" aria-label="Close sidebar">
            <X size={18} />
          </Button>
        )}
      </div>

      <div className="p-3">
        <Button
          onClick={onNewChat}
          variant="outline"
          className="w-full justify-start gap-2 rounded-lg"
        >
          <Plus size={16} />
          New chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {sessions.map((session) => (
            <div key={session.id} className="group relative">
              <button
                onClick={() => onSelectSession(session.id)}
                className={cn(
                  'w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  activeSessionId === session.id
                    ? 'bg-background shadow-sm'
                    : 'hover:bg-background/60',
                )}
              >
                <div className="flex items-center gap-2 pr-6">
                  <MessageSquare size={14} className="shrink-0 text-muted-foreground" />
                  <span className="truncate">{session.title}</span>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                aria-label="Delete chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
