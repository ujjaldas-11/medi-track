import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { toSpeechLang } from '../utils/speechLang';

interface UseVoiceInputOptions {
  continuous?: boolean;
  onResult: (transcript: string) => void;
}

export function useVoiceInput({ continuous = false, onResult }: UseVoiceInputOptions) {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const isSupported =
    typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = continuous;
    rec.interimResults = false;
    rec.lang = toSpeechLang(i18n.language);

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);

    rec.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      onResultRef.current(transcript);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error !== 'no-speech') {
        toast.error(`Speech Recognition error: ${event.error}`);
      }
    };

    recognitionRef.current = rec;

    return () => {
      rec.stop();
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuous]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = toSpeechLang(i18n.language);
    }
  }, [i18n.language]);

  const start = useCallback(() => {
    if (!recognitionRef.current) {
      toast.warning('Speech Recognition is not supported in this browser.');
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const toggle = useCallback(() => {
    isListening ? stop() : start();
  }, [isListening, start, stop]);

  return { isListening, isSupported, start, stop, toggle };
}