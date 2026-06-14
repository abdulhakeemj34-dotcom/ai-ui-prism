import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, Calendar, BookOpen, Target, Clock } from 'lucide-react';
import { TypeWriter } from './TypeWriter';

export interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  type?: 'text' | 'study-plan' | 'coaching';
  isNew?: boolean;
}

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({ messages, isTyping, scrollRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-6 pt-4 pb-4 h-full">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'assistant' 
                  ? 'bg-primary/20 text-primary border border-primary/30 overflow-hidden shadow-[0_0_15px_rgba(var(--primary),0.3)]' 
                  : 'bg-secondary text-secondary-foreground border border-border/50'
              } ${msg.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                {msg.role === 'assistant' ? (
                  <img 
                    src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/32e80782-daf5-41b6-9c41-b7939af5f959/nexora-avatar-dcb2c909-1781400407432.webp" 
                    alt="Nexora" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={16} />
                )}
              </div>
              
              <div className={`group relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10'
                  : 'bg-card/50 backdrop-blur-md border border-border/40 rounded-tl-none shadow-sm'
              }`}>
                {msg.role === 'assistant' && msg.isNew ? (
                  <TypeWriter text={msg.content} speed={10} />
                ) : (
                  <div className="whitespace-pre-wrap">
                    {msg.content}
                    {msg.type === 'study-plan' && (
                      <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
                        <div className="flex items-center text-primary font-semibold text-xs uppercase tracking-wider">
                          <Calendar size={14} className="mr-2" />
                          Generated Study Plan
                        </div>
                        <div className="text-xs text-muted-foreground italic">
                          This plan is optimized based on your upcoming exam and available hours.
                        </div>
                      </div>
                    )}
                    {msg.type === 'coaching' && (
                      <div className="mt-4 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-2">
                        <div className="flex items-center text-amber-500 font-semibold text-xs uppercase tracking-wider">
                          <Target size={14} className="mr-2" />
                          Productivity Insight
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className={`absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground whitespace-nowrap ${
                  msg.role === 'user' ? 'right-0' : 'left-0'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2 px-4 py-3 bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl rounded-tl-none ml-11">
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={scrollRef} />
    </div>
  );
}
