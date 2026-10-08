import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { api } from '../services/api';

interface VoiceContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  speakText: (text: string, langOverride?: Language) => void;
  stopSpeaking: () => void;
  readPageAloud: () => void;
  executeVoiceAction: (command: string, navigateCallback?: (path: string) => void) => Promise<void>;
}

const VoiceAndAccessibilityContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceAndAccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem('civic_lang') as Language) || 'en'
  );
  const [isHighContrast, setIsHighContrast] = useState<boolean>(
    localStorage.getItem('civic_high_contrast') === 'true'
  );
  const [fontSize, setFontSizeState] = useState<'normal' | 'large' | 'xlarge'>('normal');

  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('civic_lang', lang);
  };

  const toggleHighContrast = () => {
    setIsHighContrast(prev => {
      const next = !prev;
      localStorage.setItem('civic_high_contrast', String(next));
      if (next) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
      return next;
    });
  };

  const setFontSize = (size: 'normal' | 'large' | 'xlarge') => {
    setFontSizeState(size);
    document.documentElement.style.fontSize = size === 'large' ? '18px' : size === 'xlarge' ? '20px' : '16px';
  };

  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    }

    // Pre-load available synthesis voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Helper: Web Speech Synthesis fallback
  const fallbackSpeechSynthesis = (cleanText: string, targetLang: Language) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();

      if (targetLang === 'ta') {
        utterance.lang = 'ta-IN';
        const tamilVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('ta') || 
          v.name.toLowerCase().includes('tamil') || 
          v.name.includes('தமிழ்') ||
          v.name.toLowerCase().includes('valluvar')
        );
        if (tamilVoice) utterance.voice = tamilVoice;
      } else {
        utterance.lang = 'en-IN';
        const indianEngVoice = voices.find(v => 
          v.lang === 'en-IN' || 
          v.name.toLowerCase().includes('india') || 
          v.name.toLowerCase().includes('natural')
        );
        if (indianEngVoice) utterance.voice = indianEngVoice;
      }

      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  // Natural Voice Synthesis (Dual Engine: Backend High-Fidelity Audio + Browser Synthesis)
  const speakText = (text: string, langOverride?: Language) => {
    stopSpeaking();

    // Clean markdown, symbols, links for crisp natural speech
    const cleanText = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*#_`•\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // Detect if text contains Tamil characters
    const hasTamilChars = /[\u0B80-\u0BFF]/.test(cleanText);
    const targetLang: Language = langOverride || (hasTamilChars ? 'ta' : language);

    // Use our high-fidelity natural TTS endpoint
    try {
      const audioUrl = `http://127.0.0.1:8000/api/tts?text=${encodeURIComponent(cleanText.slice(0, 480))}&lang=${targetLang}`;
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        audioPlayerRef.current = null;
      };
      audio.onerror = () => {
        // Fallback to browser Web Speech API if network or audio fails
        fallbackSpeechSynthesis(cleanText, targetLang);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          fallbackSpeechSynthesis(cleanText, targetLang);
        });
      }
    } catch {
      fallbackSpeechSynthesis(cleanText, targetLang);
    }
  };

  // Web Speech Recognition
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const msg = language === 'ta' 
        ? "உங்கள் உலாவியில் குரல் அங்கீகாரம் ஆதரிக்கப்படவில்லை." 
        : "Voice recognition is not supported in this browser. You can type in the assistant!";
      speakText(msg);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        executeVoiceAction(spoken);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn("Speech recognition error:", e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const readPageAloud = () => {
    const mainContent = document.querySelector('main') || document.body;
    const headings = Array.from(mainContent.querySelectorAll('h1, h2, h3, p'))
      .slice(0, 5)
      .map(el => el.textContent)
      .filter(Boolean)
      .join('. ');

    if (headings) {
      speakText(headings);
    } else {
      speakText("Welcome to CIVIC AI. Know what you are entitled to.");
    }
  };

  const executeVoiceAction = async (command: string, navigateCallback?: (path: string) => void) => {
    try {
      const res = await api.sendVoiceCommand(command, language);
      if (res.speech) {
        speakText(res.speech);
      }
      if (res.action === 'NAVIGATE' && res.route) {
        if (navigateCallback) {
          navigateCallback(res.route);
        } else {
          window.location.hash = res.route;
        }
      } else if (res.action === 'SET_LANG') {
        setLanguage(res.lang);
      } else if (res.action === 'READ_PAGE') {
        readPageAloud();
      }
    } catch (e) {
      speakText(language === 'ta' ? "மன்னிக்கவும், புரிந்து கொள்ள முடியவில்லை." : "Could not process command.");
    }
  };

  return (
    <VoiceAndAccessibilityContext.Provider value={{
      language,
      setLanguage,
      isHighContrast,
      toggleHighContrast,
      fontSize,
      setFontSize,
      isListening,
      isSpeaking,
      transcript,
      startListening,
      stopListening,
      speakText,
      stopSpeaking,
      readPageAloud,
      executeVoiceAction
    }}>
      {children}
    </VoiceAndAccessibilityContext.Provider>
  );
};

export const useVoiceAndAccessibility = () => {
  const context = useContext(VoiceAndAccessibilityContext);
  if (!context) throw new Error('useVoiceAndAccessibility must be used within VoiceAndAccessibilityProvider');
  return context;
};
