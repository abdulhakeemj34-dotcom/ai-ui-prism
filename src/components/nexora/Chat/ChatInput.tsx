import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const initRecognition = () => {
    if (recognitionRef.current) return true;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setInputValue(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setIsInitializing(false);
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        setIsInitializing(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied');
        } else {
          toast.error(`Voice input error: ${event.error}`);
        }
      };

      recognitionRef.current = recognition;
      return true;
    }
    return false;
  };

  useEffect(() => {
    initRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const toggleRecording = () => {
    if (isInitializing) return;

    if (!initRecognition()) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        setIsRecording(false);
      }
    } else {
      try {
        setIsInitializing(true);
        setInputValue('');
        recognitionRef.current.start();
        setIsRecording(true);
        toast.info('Listening...', { duration: 1500 });
      } catch (e) {
        console.error('Recognition start error', e);
        setIsInitializing(false);
        setIsRecording(false);
        // If start fails, likely already started or state mismatch, try re-init next time
        recognitionRef.current = null;
        toast.error('Could not start microphone. Please try again.');
      }
    }
  };

  return (
    <div className="relative flex flex-col space-y-3">
      <div className="relative group">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={isRecording ? "Listening..." : "Ask Nexora anything..."}
          disabled={disabled}
          className={`pr-28 h-14 bg-card/40 backdrop-blur-xl border-border/40 rounded-2xl focus-visible:ring-primary/20 transition-all shadow-xl relative z-10 ${
            isRecording || isInitializing ? 'border-primary/50 ring-2 ring-primary/20 bg-primary/5' : ''
          }`}
        />
        
        <div className="absolute right-1.5 top-1.5 flex items-center space-x-1 z-20">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => { e.preventDefault(); toggleRecording(); }}
            className={`w-11 h-11 rounded-xl transition-all ${
              isRecording || isInitializing
                ? 'bg-primary text-primary-foreground animate-pulse scale-110 shadow-[0_0_15px_rgba(var(--primary),0.5)]' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
            }`}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
          
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled || isRecording}
            className="w-11 h-11 rounded-xl bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-center text-[10px] text-muted-foreground space-x-4">
        <span className="flex items-center"><Command size={10} className="mr-1" /> Enter to send</span>
        <span>Nexora can generate study plans & give advice</span>
      </div>
    </div>
  );
}
