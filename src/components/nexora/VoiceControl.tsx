import { Mic, MicOff, Volume2, VolumeX, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVoice } from '@/hooks/use-voice';
import { cn } from '@/lib/utils';

interface VoiceControlProps {
  onTranscript: (text: string) => Promise<string | void>;
  disabled?: boolean;
}

export function VoiceControl({ onTranscript, disabled }: VoiceControlProps) {
  const voice = useVoice(async (text) => {
    voice.setStatus('processing');
    const response = await onTranscript(text);
    if (response) {
      voice.speak(response);
    } else {
      voice.setStatus('idle');
    }
  });

  if (!voice.isSupported) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={voice.status === 'listening' ? 'default' : 'outline'}
        size="icon"
        className={cn('rounded-full', voice.status === 'listening' && 'animate-pulse')}
        onClick={voice.status === 'listening' ? voice.stopListening : voice.startListening}
        disabled={disabled || voice.status === 'processing'}
        aria-label={voice.status === 'listening' ? 'Stop listening' : 'Start voice input'}
      >
        {voice.status === 'listening' ? <MicOff size={16} /> : <Mic size={16} />}
      </Button>

      <Button
        variant={voice.wakeWordEnabled ? 'default' : 'outline'}
        size="icon"
        className="rounded-full"
        onClick={voice.wakeWordEnabled ? voice.stopListening : voice.enableWakeWord}
        disabled={disabled}
        aria-label="Toggle wake word"
      >
        <Radio size={16} />
      </Button>

      {voice.status === 'speaking' && (
        <Button variant="ghost" size="icon" className="rounded-full" onClick={voice.stopSpeaking}>
          <VolumeX size={16} />
        </Button>
      )}

      {voice.status === 'listening' && (
        <Badge variant="secondary" className="animate-pulse">
          Listening…
        </Badge>
      )}

      {voice.wakeWordEnabled && (
        <Badge variant="outline" className="text-[10px]">
          Say &quot;Nexora&quot;
        </Badge>
      )}

      {voice.status === 'processing' && (
        <Badge variant="secondary">
          <Volume2 size={12} className="mr-1 inline" />
          Processing…
        </Badge>
      )}
    </div>
  );
}
