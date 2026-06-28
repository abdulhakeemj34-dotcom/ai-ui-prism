import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

const WAKE_WORD = 'nexora';

export function useVoice(onTranscript: (text: string) => void) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [isSupported, setIsSupported] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  const [lastHeard, setLastHeard] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const wakeModeRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(Boolean(SpeechRecognition));
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    setStatus('speaking');
    utterance.onend = () => setStatus('idle');
    utterance.onerror = () => setStatus('idle');
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setStatus('idle');
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    wakeModeRef.current = false;
    setWakeWordEnabled(false);
    if (status === 'listening') setStatus('idle');
  }, [status]);

  const startListening = useCallback(
    (wakeMode = false) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error('Speech recognition is not supported in this browser.');
        return;
      }

      recognitionRef.current?.abort();
      const recognition = new SpeechRecognition();
      recognition.continuous = wakeMode;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;
      wakeModeRef.current = wakeMode;

      recognition.onstart = () => {
        setStatus('listening');
        if (wakeMode) setWakeWordEnabled(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setLastHeard(transcript);

        if (wakeMode) {
          if (transcript.toLowerCase().includes(WAKE_WORD)) {
            recognition.stop();
            wakeModeRef.current = false;
            setWakeWordEnabled(false);
            toast.success('Nexora is listening…');
            startListening(false);
          }
          return;
        }

        if (event.results[event.results.length - 1].isFinal) {
          recognition.stop();
          setStatus('processing');
          onTranscript(transcript.trim());
        }
      };

      recognition.onerror = (event) => {
        if (event.error !== 'aborted') {
          toast.error(`Voice error: ${event.error}`);
          setStatus('error');
        }
      };

      recognition.onend = () => {
        if (wakeModeRef.current) {
          try {
            recognition.start();
          } catch {
            setStatus('idle');
          }
        } else if (status !== 'processing' && status !== 'speaking') {
          setStatus('idle');
        }
      };

      try {
        recognition.start();
      } catch {
        toast.error('Could not access microphone. Check permissions.');
      }
    },
    [onTranscript, status],
  );

  const enableWakeWord = useCallback(() => {
    startListening(true);
  }, [startListening]);

  return {
    status,
    isSupported,
    wakeWordEnabled,
    lastHeard,
    startListening: () => startListening(false),
    stopListening,
    enableWakeWord,
    speak,
    stopSpeaking,
    setStatus,
  };
}
