import { useState, useEffect } from 'react';
import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/use-chat';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatSidebarPanel } from './Chat/ChatSidebar';
import { MessageList } from './Chat/MessageList';
import { ChatInput } from './Chat/ChatInput';
import { VoiceControl } from './VoiceControl';
import { toast } from 'sonner';

export function ChatView() {
  const {
    sessions,
    activeSessionId,
    messages,
    isPending,
    streamingContent,
    createChat,
    selectChat,
    deleteChat,
    sendMessage,
  } = useChat();

  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
  );

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleDeleteSession = (id: string) => {
    deleteChat(id);
    toast.success('Chat deleted');
  };

  const handleNewChat = () => {
    createChat();
    if (isMobile) setSidebarOpen(false);
  };

  const handleSelectSession = (id: string) => {
    selectChat(id);
    if (isMobile) setSidebarOpen(false);
  };

  const displayMessages = streamingContent
    ? [
        ...messages,
        {
          id: 'streaming',
          role: 'assistant' as const,
          content: streamingContent,
          timestamp: new Date().toISOString(),
        },
      ]
    : messages;

  const sidebarProps = {
    sessions,
    activeSessionId,
    onSelectSession: handleSelectSession,
    onNewChat: handleNewChat,
    onDeleteSession: handleDeleteSession,
  };

  return (
    <div className="flex h-[100dvh] bg-background text-foreground md:h-full">
      {!isMobile && sidebarOpen && (
        <aside className="hidden w-64 shrink-0 border-r border-border/60 md:block">
          <ChatSidebarPanel {...sidebarProps} />
        </aside>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((open) => !open)}
            className="rounded-lg"
            aria-label="Toggle sidebar"
          >
            <PanelLeft size={18} />
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold">Nexora AI</h1>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                Live
              </Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground">Powered by Hugging Face</p>
          </div>

          <VoiceControl onTranscript={sendMessage} disabled={isPending} />
        </header>

        {isMobile && sidebarOpen && (
          <>
            <div
              className="fixed inset-0 top-14 z-40 bg-black/40 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
            <aside className="fixed left-0 top-14 z-50 h-[calc(100dvh-3.5rem)] w-64 border-r border-border/60 bg-background shadow-xl md:hidden">
              <ChatSidebarPanel {...sidebarProps} onClose={() => setSidebarOpen(false)} />
            </aside>
          </>
        )}

        <MessageList
          messages={displayMessages}
          isPending={isPending && !streamingContent}
          onSuggestionClick={sendMessage}
        />
        <ChatInput onSendMessage={sendMessage} disabled={isPending} />
      </div>
    </div>
  );
}
