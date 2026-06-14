import React, { useState, useRef, useEffect, useCallback } from 'react';
import { History, Sparkles, CheckCircle2, Target, BookOpen, Brain, Shield, ShieldOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageList, Message } from './Chat/MessageList';
import { ChatInput } from './Chat/ChatInput';
import { ChatHistory, ChatSession } from './Chat/ChatHistory';
import { usePersistence } from '@/hooks/use-persistence';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from './ThemeToggle';
import { toast } from 'sonner';
import { useIntelligence } from '@/hooks/use-intelligence';

export function ChatView() {
  const [sessions, setSessions] = usePersistence<ChatSession[]>('nexora_chat_sessions', []);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { systemSnapshot, actions, permissions } = useIntelligence();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize first session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      const initialId = '1';
      const initialSession: ChatSession = {
        id: initialId,
        title: 'Welcome to Nexora',
        lastMessage: "Hello! I'm Nexora, your AI personal assistant.",
        timestamp: new Date().toISOString(),
      };
      const initialMessage: Message = {
        id: 'm1',
        role: 'assistant',
        content: "Hello! I'm Nexora, your AI personal assistant. I'm connected to your tasks, goals, and notes to help you stay productive. How can I assist you today? 😊",
        timestamp: new Date().toISOString(),
        isNew: true
      };
      
      setSessions([initialSession]);
      setActiveSessionId(initialId);
      localStorage.setItem(`nexora_messages_${initialId}`, JSON.stringify([initialMessage]));
      setCurrentMessages([initialMessage]);
    } else if (!activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId, setSessions]);

  // Load messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      const savedMessages = localStorage.getItem(`nexora_messages_${activeSessionId}`);
      if (savedMessages) {
        setCurrentMessages(JSON.parse(savedMessages));
      } else {
        setCurrentMessages([]);
      }
    }
  }, [activeSessionId]);

  // Save messages whenever they change
  useEffect(() => {
    if (activeSessionId && currentMessages.length > 0) {
      localStorage.setItem(`nexora_messages_${activeSessionId}`, JSON.stringify(currentMessages));
      
      const updatedSessions = sessions.map(s => 
        s.id === activeSessionId 
          ? { ...s, lastMessage: currentMessages[currentMessages.length - 1].content, timestamp: new Date().toISOString() }
          : s
      );
      
      const activeSession = sessions.find(s => s.id === activeSessionId);
      if (activeSession && activeSession.lastMessage !== currentMessages[currentMessages.length - 1].content) {
        setSessions(updatedSessions);
      }
    }
  }, [currentMessages, activeSessionId, sessions, setSessions]);

  const handleNewChat = useCallback(() => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      lastMessage: '',
      timestamp: new Date().toISOString(),
    };
    
    const welcomeMsg: Message = {
      id: 'wm' + newId,
      role: 'assistant',
      content: "New session started. How can I help you right now?",
      timestamp: new Date().toISOString(),
      isNew: true
    };

    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setCurrentMessages([welcomeMsg]);
    localStorage.setItem(`nexora_messages_${newId}`, JSON.stringify([welcomeMsg]));
  }, [sessions, setSessions]);

  const handleDeleteSession = (id: string) => {
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    localStorage.removeItem(`nexora_messages_${id}`);
    if (activeSessionId === id) {
      if (filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
      } else {
        handleNewChat();
      }
    }
    toast.success('Chat deleted');
  };

  const generateAIResponse = (userText: string) => {
    const text = userText.toLowerCase();
    let response = "";
    let type: 'text' | 'study-plan' | 'coaching' = 'text';

    // 1. Task Intelligence
    if (text.includes("task") || text.includes("todo") || text.includes("focus")) {
      if (!permissions.tasks) {
        response = "I don't have permission to view your tasks right now. You can enable access in your Profile settings.";
      } else {
        const pending = systemSnapshot.tasks.filter(t => !t.completed);
        
        if (text.includes("priority") || text.includes("organize")) {
          const sorted = [...pending].sort((a, b) => (b.urgent || b.important ? 1 : 0) - (a.urgent || a.important ? 1 : 0));
          if (sorted.length > 0) {
            response = `I've organized your pending tasks by priority:

` + sorted.map(t => `${t.urgent || t.important ? '🔥' : '▫️'} ${t.text}`).join('\n') +
              `

I recommend tackling "${sorted[0].text}" first.`;
          } else {
            response = "You don't have any pending tasks to organize! Ready to add some?";
          }
        } else if (text.includes("focus") || text.includes("today")) {
          const urgent = pending.find(t => t.urgent || t.important);
          response = urgent 
            ? `Based on your list, you should focus on "${urgent.text}"—it's high priority.` 
            : pending.length > 0 
              ? `You have ${pending.length} pending tasks. I suggest starting with "${pending[0].text}".`
              : "All clear for today! No pending tasks found.";
        } else if (text.includes("breakdown") || text.includes("steps")) {
          const task = pending[0];
          response = task 
            ? `Let's break down "${task.text}" into smaller steps:
1. Preparation & Research
2. Core Implementation
3. Verification & Testing

Shall I add these as sub-tasks?`
            : "Which task would you like me to break down?";
        } else if (text.includes("add") || text.includes("create")) {
          const taskMatch = userText.match(/(?:add|create) task (.*)/i);
          if (taskMatch) {
            const taskText = taskMatch[1].trim();
            actions.addTask(taskText);
            response = `Added "${taskText}" to your tasks.`;
          } else {
            response = "What task would you like me to add?";
          }
        } else {
          response = `You have ${pending.length} pending tasks. Would you like me to help you prioritize them?`;
        }
      }
    }
    // 2. Goal Intelligence
    else if (text.includes("goal") || text.includes("progress")) {
      if (!permissions.goals) {
        response = "I'm not authorized to access your goals. Check AI permissions in Profile.";
      } else {
        const active = systemSnapshot.goals.filter(g => (g.current / g.target) < 1);
        if (active.length > 0) {
          const goal = active[0];
          const progress = Math.round((goal.current / goal.target) * 100);
          response = `You've reached ${progress}% of your "${goal.title}" goal. ` +
            (progress > 70 ? "You're almost there! Keep pushing." : "Steady progress is key. What's the next small milestone?");
        } else {
          response = "All your current goals are complete! Ready to set a new vision?";
        }
      }
    }
    // 3. Expense Intelligence
    else if (text.includes("spend") || text.includes("expense") || text.includes("money") || text.includes("save")) {
      if (!permissions.expenses || !systemSnapshot.expenses) {
        response = "I can't see your financial data. Grant access in your AI settings if you'd like me to analyze it.";
      } else {
        const { totalExpenses, totalIncome } = systemSnapshot.expenses;
        if (text.includes("how much") || text.includes("summary") || text.includes("most")) {
          response = `You've spent $${totalExpenses.toFixed(2)} vs an income of $${totalIncome.toFixed(2)}. ` +
            (totalExpenses > totalIncome ? "You're currently over budget." : "You're doing great staying within your means!");
        } else if (text.includes("save")) {
          response = "I notice most of your spending is in one or two categories. To save more, consider setting a lower threshold for non-essential expenses or tracking small recurring costs.";
        } else {
          response = "I can analyze your spending patterns or help track your budget. What's your financial goal this month?";
        }
      }
    }
    // 4. Note Intelligence
    else if (text.includes("note") || text.includes("summarize") || text.includes("key point")) {
      if (!permissions.notes) {
        response = "I don't have access to your notes. Enable Note Intelligence in your Profile to proceed.";
      } else {
        if (text.includes("summarize") || text.includes("key point")) {
          const recent = systemSnapshot.notes[0];
          if (recent) {
            response = `Summary of "${recent.title}":
` + 
              (recent.summary || recent.content.slice(0, 150) + "...") +
              `

Key points:
- Extracted main theme
- Identified action items

Would you like me to create tasks from this?`;
          } else {
            response = "I couldn't find any notes to analyze.";
          }
        } else {
          response = `I see you have ${systemSnapshot.notes.length} notes. I can summarize them or extract tasks whenever you need.`;
        }
      }
    }
    // 5. Natural Conversation Fallbacks
    else if (text.match(/^(hi|hello|hey|yo|greetings)/i)) {
      response = "Hello! Nexora system online. I'm connected and ready to help. How are you today?";
    } else if (text.includes("how are you")) {
      response = "I'm functioning at 100% capacity and ready to assist you. How is your day going?";
    } else if (text.includes("thank you") || text.includes("thanks")) {
      response = "You're very welcome! I'm here to make your workflow smoother.";
    }
    else {
      response = "I'm here to help. I can manage your tasks, track goals, or analyze your spending. What would you like to focus on?";
    }

    return { response, type };
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    if (currentMessages.length <= 1) {
      const updatedSessions = sessions.map(s => 
        s.id === activeSessionId ? { ...s, title: content.slice(0, 30) + (content.length > 30 ? '...' : '') } : s
      );
      setSessions(updatedSessions);
    }

    setCurrentMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const { response, type } = generateAIResponse(content);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        type,
        isNew: true
      };
      
      setCurrentMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800);
  };

  const quickCommands = [
    { label: "Today's Focus", icon: Brain, cmd: 'What should I focus on today?' },
    { label: 'Summarize Note', icon: BookOpen, cmd: 'Summarize my recent note' },
    { label: 'Organize Tasks', icon: CheckCircle2, cmd: 'Organize my tasks by priority' },
    { label: 'Goal Progress', icon: Target, cmd: 'How am I progressing on my goals?' },
  ];

  const allPermissionsOff = !permissions.notes && !permissions.tasks && !permissions.goals && !permissions.expenses;

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-background/30 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Sparkles size={20} className="text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Nexora AI</h2>
            <div className="flex items-center text-[10px] text-primary font-medium uppercase tracking-widest">
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${allPermissionsOff ? 'bg-amber-500' : 'bg-green-500'}`} />
              {allPermissionsOff ? 'Privacy Mode' : 'Intelligence Active'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="w-10 h-10 rounded-xl bg-card/40 border border-border/40 hover:bg-card/60 flex items-center justify-center transition-colors"
          >
            <History size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <MessageList 
          messages={currentMessages} 
          isTyping={isTyping} 
          scrollRef={scrollRef} 
        />
      </div>

      <div className="p-4 space-y-4 bg-background/50 backdrop-blur-md border-t border-border/20 pb-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-2 pb-2">
            {quickCommands.map((cmd) => (
              <Button
                key={cmd.label}
                variant="outline"
                size="sm"
                className="rounded-full bg-card/30 backdrop-blur-md border-border/40 hover:bg-primary/10 hover:border-primary/40 transition-all text-[11px] h-8"
                onClick={() => handleSendMessage(cmd.cmd)}
              >
                <cmd.icon size={12} className="mr-1.5 text-primary" />
                {cmd.label}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>

      <ChatHistory 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
}
