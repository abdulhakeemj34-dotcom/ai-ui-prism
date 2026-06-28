import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import { Message, DEMO_SUGGESTIONS } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MessageListProps {
  messages: Message[];
  isPending: boolean;
  onSuggestionClick?: (text: string) => void;
}

export function MessageList({ messages, isPending, onSuggestionClick }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPending]);

  const isEmpty = messages.length === 0 && !isPending;

  return (
    <div ref={containerRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot size={24} />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">How can I help you?</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Ask me anything — tasks, notes, goals, or general questions.
          </p>
          {onSuggestionClick && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {DEMO_SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              {message.role === 'assistant' && (
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.isPlaceholder
                      ? 'border border-dashed border-muted-foreground/30 bg-muted/40 text-muted-foreground'
                      : 'bg-muted',
                )}
              >
                {message.content}
              </div>

              {message.role === 'user' && (
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {isPending && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot size={16} />
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
