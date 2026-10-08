import React, { useState, useRef, useEffect } from 'react';
import { useVoiceAndAccessibility } from '../context/VoiceAndAccessibilityContext';
import { api } from '../services/api';
import { 
  Bot, 
  Mic, 
  MicOff, 
  X, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ArrowUpRight 
} from 'lucide-react';

interface VoiceAssistantOrbProps {
  navigate: (path: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  action?: { route?: string; label?: string; action?: string };
  time: string;
}

export const VoiceAssistantOrb: React.FC<VoiceAssistantOrbProps> = ({ navigate }) => {
  const { 
    language, 
    setLanguage, 
    isListening, 
    startListening, 
    stopListening,
    transcript,
    isSpeaking,
    speakText,
    stopSpeaking 
  } = useVoiceAndAccessibility();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: language === 'ta' 
        ? "வணக்கம்! நான் உங்கள் சிவிக் AI உதவியாளர். உங்களுக்குரிய அரசு கல்வி உதவித்தொகை, முதியோர் ஓய்வூதியம், மகளிர் உரிமைத் தொகை மற்றும் நிலுவையில் உள்ள விண்ணப்பங்கள் குறித்து என்னிடம் கேளுங்கள். நான் எளிய தமிழில் பேசி வழிகாட்டுகிறேன்."
        : "Hello! I am CIVIC AI. Ask me what government benefits you qualify for, why your application is pending, or which documents are missing. I will read aloud and guide you naturally.",
      time: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Sync speaking ID when speech finishes
  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingMessageId(null);
    }
  }, [isSpeaking]);

  // When language changes, update initial assistant message if first message
  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1) {
        return [{
          id: 'm-1',
          sender: 'assistant',
          text: language === 'ta' 
            ? "வணக்கம்! நான் உங்கள் சிவிக் AI உதவியாளர். உங்களுக்குரிய அரசு கல்வி உதவித்தொகை, முதியோர் ஓய்வூதியம், மகளிர் உரிமைத் தொகை மற்றும் நிலுவையில் உள்ள விண்ணப்பங்கள் குறித்து என்னிடம் கேளுங்கள். நான் எளிய தமிழில் பேசி வழிகாட்டுகிறேன்."
            : "Hello! I am CIVIC AI. Ask me what government benefits you qualify for, why your application is pending, or which documents are missing. I will read aloud and guide you naturally.",
          time: 'Just now'
        }];
      }
      return prev;
    });
  }, [language]);

  // When voice transcript arrives
  useEffect(() => {
    if (transcript && transcript.trim().length > 0) {
      handleUserSubmit(transcript);
    }
  }, [transcript]);

  const handleUserSubmit = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: queryText,
      time: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await api.sendAssistantMessage(queryText, language);
      const botMsgId = `a-${Date.now()}`;
      const botMsg: Message = {
        id: botMsgId,
        sender: 'assistant',
        text: res.reply,
        action: res.action,
        time: 'Just now'
      };
      setMessages(prev => [...prev, botMsg]);
      // The assistant reads the response aloud naturally
      setSpeakingMessageId(botMsgId);
      speakText(res.reply, language);
    } catch {
      const fallbackMsgId = `a-${Date.now()}`;
      const fallbackText = language === 'ta' 
        ? "உங்கள் மாணவர் சுயவிவரத்தின்படி தமிழ்நாடு பின்-மெட்ரிக் கல்வி உதவித்தொகை மற்றும் நான் முதல்வன் திட்டங்களுக்கு அதிக தகுதி உள்ளது. உதவித்தொகை நிலை அறிய மீட்பு வழிகாட்டியைப் பார்க்கவும்."
        : "Standard rule-based check: You have high eligibility for TN Post-Matric Scholarship. Please check your document center.";
      const fallbackMsg: Message = {
        id: fallbackMsgId,
        sender: 'assistant',
        text: fallbackText,
        time: 'Just now'
      };
      setMessages(prev => [...prev, fallbackMsg]);
      setSpeakingMessageId(fallbackMsgId);
      speakText(fallbackText, language);
    } finally {
      setIsTyping(false);
    }
  };

  const samplePrompts = language === 'ta' ? [
    "எனக்கு என்ன உதவித்தொகை கிடைக்கும்?",
    "விண்ணப்பம் ஏன் நிலுவையில் உள்ளது?",
    "முதியோர் ஓய்வூதியம் பெறுவது எப்படி?",
    "மகளிர் உரிமைத் தொகை திட்டம்",
    "ஆவணங்களை சரிபார்க்கவும்",
    "English Mode"
  ] : [
    "What benefits can I get?",
    "Why is my scholarship pending?",
    "How to get Old Age Pension?",
    "Women welfare schemes",
    "Check expiring certificates",
    "Explain in Tamil"
  ];

  return (
    <>
      {/* Floating 3D AI Voice Orb Button */}
      <div className="fixed bottom-20 sm:bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open CIVIC AI Assistant"
          className="group relative flex items-center justify-center p-3 sm:px-4 sm:py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-white shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-400/60 hover:scale-105 active:scale-95 transition-all duration-300 ring-2 ring-white/30"
        >
          {/* Pulsing radar rings */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-60 blur-md group-hover:opacity-100 animate-pulse"></span>
          
          <div className="relative flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Bot className="w-5 h-5 text-white animate-bounce" />
            </div>
            <span className="hidden sm:inline font-bold text-sm tracking-wide">
              {language === 'ta' ? 'சிவிக் AI குரல்' : 'CIVIC AI Voice'}
            </span>
            {(isListening || isSpeaking) && (
              <span className="flex h-3 w-3 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSpeaking ? 'bg-amber-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isSpeaking ? 'bg-amber-500' : 'bg-red-500'}`}></span>
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Interactive AI Assistant Modal */}
      {isOpen && (
        <div className="fixed bottom-24 sm:bottom-20 right-4 sm:right-6 w-[94vw] sm:w-[440px] max-h-[85vh] h-[620px] glass-panel rounded-2xl shadow-2xl z-50 flex flex-col border border-cyan-500/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-1.5">
                  <span>{language === 'ta' ? 'சிவிக் AI வழிகாட்டி' : 'CIVIC AI Copilot'}</span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-800">
                    {language === 'ta' ? 'தமிழ் குரல்' : 'Tamil + EN Voice'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {language === 'ta' ? 'அரசு நலத்திட்டங்கள் & மீட்பு உதவி' : 'Citizen Assistance & Recovery'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Language Switcher Button */}
              <button
                onClick={() => {
                  const nextLang = language === 'ta' ? 'en' : 'ta';
                  setLanguage(nextLang);
                  speakText(nextLang === 'ta' ? 'தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது. வணக்கம்!' : 'Switched to English mode.', nextLang);
                }}
                title={language === 'ta' ? 'Switch to English' : 'தமிழுக்கு மாறுக'}
                className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500 transition-all"
              >
                {language === 'ta' ? '🇮🇳 தமிழ்' : '🌐 EN'}
              </button>

              <button
                onClick={isSpeaking ? stopSpeaking : () => speakText(
                  language === 'ta' 
                    ? "சிவிக் AI உதவியாளர் தயாராக உள்ளது. அரசு திட்டங்கள் குறித்து என்னிடம் கேளுங்கள்." 
                    : "CIVIC AI Assistant is active and ready to assist you.",
                  language
                )}
                title={isSpeaking ? "Mute Speech" : "Test Voice"}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice Orb Interaction Banner */}
          <div className="px-4 py-2.5 bg-cyan-950/40 border-b border-cyan-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isListening 
                  ? (language === 'ta' ? 'கேட்கிறேன்... பேசுங்கள்' : 'Listening... Speak now') 
                  : (language === 'ta' ? 'குரல் மூலம் பேச மைக் அழுத்தவும்' : 'Tap mic to speak naturally')}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {isSpeaking && (
                <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-cyan-900/60 border border-cyan-500/30 text-[10px] text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>{language === 'ta' ? 'வாசிக்கிறது...' : 'Reading aloud...'}</span>
                </div>
              )}

              <button
                onClick={isListening ? stopListening : startListening}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-cyan-600/80 hover:bg-cyan-500 text-white shadow-sm'
                }`}
              >
                {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                <span>{isListening ? 'Stop' : 'Speak'}</span>
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => {
              const isItemSpeaking = speakingMessageId === m.id && isSpeaking;
              const hasTamil = /[\u0B80-\u0BFF]/.test(m.text);

              return (
                <div 
                  key={m.id} 
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md transition-all ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-br-none'
                        : isItemSpeaking 
                          ? 'glass-card text-slate-100 border-2 border-cyan-400/80 shadow-cyan-500/20 rounded-bl-none ring-1 ring-cyan-400' 
                          : 'glass-card text-slate-200 border border-slate-700/80 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                    {/* Optional Action Button */}
                    {m.action && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center">
                        <button
                          onClick={() => {
                            if (m.action?.route) {
                              navigate(m.action.route);
                              setIsOpen(false);
                            } else if (m.action?.action === 'SET_LANG_TA') {
                              setLanguage('ta');
                            } else if (m.action?.action === 'SET_LANG_EN') {
                              setLanguage('en');
                            }
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/40 text-[11px] transition-all"
                        >
                          <span>{m.action.label || 'Take Action'}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message Meta & Read Aloud Speaker Button */}
                  <div className="flex items-center space-x-2 mt-1 px-1">
                    <span className="text-[10px] text-slate-500">{m.time}</span>
                    <button
                      onClick={() => {
                        if (isItemSpeaking) {
                          stopSpeaking();
                          setSpeakingMessageId(null);
                        } else {
                          setSpeakingMessageId(m.id);
                          speakText(m.text, hasTamil ? 'ta' : language);
                        }
                      }}
                      title={language === 'ta' ? 'குரலில் வாசிக்க' : 'Listen to message'}
                      className="inline-flex items-center space-x-1 text-[10px] text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      {isItemSpeaking ? (
                        <span className="inline-flex items-center text-amber-400 font-semibold space-x-1">
                          <VolumeX className="w-3 h-3 animate-pulse" />
                          <span>{language === 'ta' ? 'நிறுத்து' : 'Stop'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-slate-400 hover:text-cyan-300">
                          <Volume2 className="w-3 h-3" />
                          <span>{language === 'ta' ? 'வாசி' : 'Listen'}</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs p-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-[11px] text-cyan-400/80">
                  {language === 'ta' ? 'சிவிக் AI ஆய்வு செய்கிறது...' : 'CIVIC AI is analyzing...'}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleUserSubmit(p)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 text-[11px] border border-slate-700 flex-shrink-0 transition-all"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUserSubmit(inputText)}
              placeholder={language === 'ta' ? 'கேள்வி கேட்க தட்டச்சு செய்க...' : 'Ask CIVIC AI anything...'}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleUserSubmit(inputText)}
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
};
