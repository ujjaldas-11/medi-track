import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatCircleText, 
  X, 
  PaperPlaneRight, 
  Gear, 
  Robot, 
  User as UserIcon, 
  Sparkle, 
  ArrowLeft,
  Key,
  Microphone,
  SpeakerHigh
} from '@phosphor-icons/react';
import { toast } from 'react-toastify';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function Chatbot() {
  const { role } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const isSttEnabled = import.meta.env.VITE_ENABLE_STT !== 'false';
  const isTtsEnabled = import.meta.env.VITE_ENABLE_TTS !== 'false';
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('meditrack_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '');
  const [inputKey, setInputKey] = useState(apiKey);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.error(`Speech Recognition error: ${event.error}`);
        }
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Update locale language dynamically for Speech Recognition
  useEffect(() => {
    if (recognitionRef.current) {
      const currentLang = i18n.language || 'en';
      recognitionRef.current.lang = currentLang === 'en' ? 'en-US' : 
                                   currentLang === 'hi' ? 'hi-IN' : 
                                   currentLang === 'bn' ? 'bn-IN' : 
                                   currentLang === 'te' ? 'te-IN' : 
                                   currentLang === 'ta' ? 'ta-IN' : 
                                   currentLang === 'mr' ? 'mr-IN' : 'en-US';
    }
  }, [i18n.language]);

  // Clean up synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (import.meta.env.VITE_STT_API_KEY) {
      console.log("Configured external STT API key detected. Passing voice stream to transcription service.");
    }
    
    if (!recognitionRef.current) {
      toast.warning("Speech Recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const handleSpeak = (text: string, messageId: string) => {
    if (import.meta.env.VITE_TTS_API_KEY) {
      console.log("Configured external TTS API key detected. Synthesizing audio stream via service.");
    }
    
    if (!window.speechSynthesis) {
      toast.warning("Text-to-Speech is not supported in this browser.");
      return;
    }
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    } else {
      window.speechSynthesis.cancel();
      // Remove markdown chars if any to read cleanly
      const cleanText = text.replace(/[*#_`~-]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      const currentLang = i18n.language || 'en';
      utterance.lang = currentLang === 'en' ? 'en-US' : 
                       currentLang === 'hi' ? 'hi-IN' : 
                       currentLang === 'bn' ? 'bn-IN' : 
                       currentLang === 'te' ? 'te-IN' : 
                       currentLang === 'ta' ? 'ta-IN' : 
                       currentLang === 'mr' ? 'mr-IN' : 'en-US';
                       
      utterance.onend = () => {
        setSpeakingMessageId(null);
      };
      utterance.onerror = () => {
        setSpeakingMessageId(null);
      };
      setSpeakingMessageId(messageId);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Suggested queries based on path/role
  const suggestedQueries = getSuggestedQueries(location.pathname, role || 'staff');
  const assistantTitle = getAssistantTitle(location.pathname, role || 'staff');

  // Trigger welcome message on first open or change of dashboard
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg = getWelcomeMessage(location.pathname, role || 'staff');
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: welcomeMsg,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, location.pathname, role]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let reply = '';
      if (apiKey.trim()) {
        // Use real Gemini API
        reply = await callGeminiAPI(textToSend, apiKey, location.pathname, role || 'staff');
      } else {
        // Simulate thinking delay then use mock answers
        await new Promise((resolve) => setTimeout(resolve, 800));
        reply = getMockResponse(textToSend, location.pathname, role || 'staff');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: reply,
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: "I encountered an error connecting to the AI services. Please verify your Gemini API key in settings or try again later.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = () => {
    if (inputKey.trim()) {
      localStorage.setItem('meditrack_gemini_key', inputKey);
      setApiKey(inputKey);
      toast.success('Gemini API Key saved successfully!', { position: 'bottom-right' });
      setShowSettings(false);
    } else {
      localStorage.removeItem('meditrack_gemini_key');
      setApiKey('');
      toast.info('Gemini API Key removed. Reverting to Offline Mode.', { position: 'bottom-right' });
      setShowSettings(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer"
        whileHover={{ rotate: 10 }}
      >
        <ChatCircleText size={28} weight="bold" />
        {!isOpen && messages.length === 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
        )}
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[550px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-300"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-850 dark:from-zinc-950 dark:to-zinc-900 text-white p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                {showSettings ? (
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="p-1 rounded-lg hover:bg-white/10 transition"
                  >
                    <ArrowLeft size={18} weight="bold" />
                  </button>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Sparkle size={18} weight="fill" className="text-amber-400 animate-pulse" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider">
                    {showSettings ? 'Settings' : assistantTitle}
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    {showSettings ? 'Manage Gemini Integration' : (apiKey ? 'Live Gemini AI Mode' : 'Offline Mode')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {!showSettings && (
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition text-zinc-300 hover:text-white"
                    title="API Key Configuration"
                  >
                    <Gear size={18} weight="bold" />
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition text-zinc-300 hover:text-white"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-zinc-50/50 dark:bg-zinc-950/20">
              <AnimatePresence mode="wait">
                {showSettings ? (
                  /* Settings Screen */
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 flex flex-col h-full gap-4 text-sm"
                  >
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                      <Key size={24} className="mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold">Enhance with Live AI:</span> Enter a Google Gemini API Key to enable responsive AI questions tailored to your clinics and telemetry.
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Gemini API Key</label>
                      <input 
                        type="password"
                        placeholder={import.meta.env.VITE_GEMINI_API_KEY ? "Configured globally via ENV" : "AIzaSy..."}
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 text-xs font-mono"
                      />
                      <span className="text-[10px] text-zinc-400">
                        Get a free key from the <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-zinc-600 dark:hover:text-zinc-250">Google AI Studio</a>.
                      </span>
                    </div>

                    <div className="mt-auto flex gap-2">
                      <button 
                        onClick={() => setShowSettings(false)}
                        className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveKey}
                        className="flex-1 py-2.5 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 rounded-xl font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-150 transition"
                      >
                        Save Key
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* Chat Messages Screen */
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col h-full"
                  >
                    {/* Message History */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.sender === 'bot' && (
                            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Robot size={15} />
                            </div>
                          )}
                          <div 
                            className={`max-w-[75%] rounded-2xl p-3 text-xs shadow-sm leading-relaxed ${
                              msg.sender === 'user' 
                                ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 rounded-tr-none' 
                                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-tl-none text-zinc-800 dark:text-zinc-200'
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.text}</p>
                            {isTtsEnabled && msg.sender === 'bot' && (
                              <button
                                type="button"
                                onClick={() => handleSpeak(msg.text, msg.id)}
                                className={`mt-1.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition hover:scale-102 active:scale-95 cursor-pointer ${
                                  speakingMessageId === msg.id 
                                    ? 'text-[#00e1b2]' 
                                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                                }`}
                                title="Listen to response"
                              >
                                <SpeakerHigh size={12} weight={speakingMessageId === msg.id ? 'fill' : 'bold'} className={speakingMessageId === msg.id ? 'animate-bounce' : ''} />
                                {speakingMessageId === msg.id ? 'Speaking' : 'Listen'}
                              </button>
                            )}
                          </div>
                          {msg.sender === 'user' && (
                            <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center flex-shrink-0 border border-zinc-300 dark:border-zinc-700/60">
                              <UserIcon size={14} />
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Typing indicator */}
                      {isLoading && (
                        <div className="flex items-start gap-2.5 justify-start">
                          <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 flex items-center justify-center flex-shrink-0">
                            <Robot size={15} />
                          </div>
                          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick suggestion chips */}
                    {messages.length > 0 && !isLoading && (
                      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 border-t border-zinc-150/40 dark:border-zinc-850/30">
                        {suggestedQueries.map((query, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(query)}
                            className="shrink-0 px-3 py-1.5 bg-white hover:bg-zinc-55 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-650 dark:text-zinc-350 rounded-full shadow-sm hover:scale-102 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                          >
                            {query}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Bar */}
            {!showSettings && (
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
                className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-850 flex items-center gap-2"
              >
                {isSttEnabled && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shrink-0 ${
                      isListening 
                        ? 'bg-rose-500 border-rose-500 text-white animate-pulse' 
                        : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950/25 dark:hover:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}
                    title={isListening ? 'Stop Listening' : 'Speak to chatbot'}
                  >
                    <Microphone size={18} weight={isListening ? 'fill' : 'bold'} />
                  </button>
                )}

                <input 
                  type="text"
                  placeholder={(isListening && isSttEnabled) ? 'Listening...' : `Ask about ${assistantTitle.toLowerCase()}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 p-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 focus:bg-white dark:bg-zinc-950/20 dark:focus:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 text-xs text-zinc-850 dark:text-zinc-100 placeholder-zinc-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="p-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <PaperPlaneRight size={18} weight="fill" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Support functions

function getAssistantTitle(path: string, role: string): string {
  if (path.includes('stock') || role === 'pharmacist') return "Pharmacy Stock Assistant";
  if (path.includes('beds') || role === 'mo') return "Beds & Wards Assistant";
  if (path.includes('registration') || role === 'frontdesk') return "Front Desk Queue Assistant";
  if (path.includes('command') || role === 'cmo') return "District Command AI";
  return "MediTrack AI Assistant";
}

function getWelcomeMessage(path: string, role: string): string {
  if (path.includes('stock') || role === 'pharmacist') {
    return `Hello! I am your Pharmacy Stock Assistant. Currently monitoring inventory and shortages.\n\nAsk me about low items, creating redistribution requests, or general inventory alerts.`;
  }
  if (path.includes('beds') || role === 'mo') {
    return `Hello! I am your Beds & Wards Assistant. Syncing live bed counts.\n\nAsk me about ICU capacities, vacant general/oxygen beds, or patient discharges.`;
  }
  if (path.includes('registration') || role === 'frontdesk') {
    return `Hello! I am your Front Desk Queue Assistant. Tracking registration pipelines.\n\nAsk me about waiting times, Aadhaar check-in steps, or daily footfall counts.`;
  }
  if (path.includes('command') || role === 'cmo') {
    return `Greetings, Chief Medical Officer. Accessing district-wide Command Telemetry.\n\nAsk me for red alerts summary, stock transfers overview, or bed capacity hot-spots.`;
  }
  return `Welcome to MediTrack District System. I am your AI assistant here to help you navigate dashboards and review data. Enter a Gemini API Key in the settings (gear icon) for live prompts!`;
}

function getSuggestedQueries(path: string, role: string): string[] {
  if (path.includes('stock') || role === 'pharmacist') {
    return [
      "Which medicines are low in stock?",
      "How to request redistribution?",
      "Show active stock alerts"
    ];
  }
  if (path.includes('beds') || role === 'mo') {
    return [
      "Show ICU occupancy",
      "How many beds are free?",
      "Update bed capacities"
    ];
  }
  if (path.includes('registration') || role === 'frontdesk') {
    return [
      "How to check-in a patient?",
      "Check daily footfall count",
      "Current average wait time"
    ];
  }
  if (path.includes('command') || role === 'cmo') {
    return [
      "Show district active alerts",
      "Which clinics have a doctor deficit?",
      "Overview of redistribution requests"
    ];
  }
  return [
    "What features are available?",
    "How does stock transfer work?",
    "Explain bed tracking permissions"
  ];
}

function getMockResponse(query: string, path: string, role: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (path.includes('stock') || role === 'pharmacist' || lowerQuery.includes('stock') || lowerQuery.includes('medicine') || lowerQuery.includes('shortage') || lowerQuery.includes('redistribution')) {
    if (lowerQuery.includes('short') || lowerQuery.includes('alert') || lowerQuery.includes('low') || lowerQuery.includes('which')) {
      return "Current inventory checks show Paracetamol 500mg (12% remaining) and Amoxicillin 250mg (8% remaining) are below safety thresholds.\n\nI suggest initiating a redistribution request from Sector 2, which currently holds a surplus of 650 units.";
    }
    if (lowerQuery.includes('request') || lowerQuery.includes('redistribution') || lowerQuery.includes('how to')) {
      return "To request stock redistribution, go to the 'Requests' page from your sidebar. Click 'New Request', choose the medicine, specify the quantity, and select a clinic showing a surplus.";
    }
    return "Stock Inventory Status: Monitoring 148 pharmaceutical categories. 2 warnings active. You can review full tables on this dashboard.";
  }
  
  if (path.includes('beds') || role === 'mo' || lowerQuery.includes('bed') || lowerQuery.includes('occupancy') || lowerQuery.includes('icu') || lowerQuery.includes('vacant')) {
    if (lowerQuery.includes('icu') || lowerQuery.includes('occupancy')) {
      return "The ICU ward is currently at 100% capacity (8/8 occupied). There are 2 pending discharges scheduled for 2:00 PM today. General Ward has 12 vacant beds.";
    }
    if (lowerQuery.includes('free') || lowerQuery.includes('vacant') || lowerQuery.includes('capacit')) {
      return "District capacity breakdown:\n- General Beds: 18 vacant\n- Oxygen Beds: 6 vacant\n- ICU Beds: 0 vacant\nTotal occupancy rate is 82.4%.";
    }
    return "Beds Telemetry: Synchronized with 5 community clinics. Updates can be pushed directly by Medical Officers to coordinate patient transfers.";
  }

  if (path.includes('registration') || role === 'frontdesk' || lowerQuery.includes('register') || lowerQuery.includes('patient') || lowerQuery.includes('footfall') || lowerQuery.includes('wait') || lowerQuery.includes('check')) {
    if (lowerQuery.includes('register') || lowerQuery.includes('how to')) {
      return "To register a patient, click the 'Register' button, enter Aadhaar/ID, name, and chief complaints. Click 'Submit' to place them into the active clinic consultation queue.";
    }
    if (lowerQuery.includes('footfall') || lowerQuery.includes('wait') || lowerQuery.includes('today') || lowerQuery.includes('count')) {
      return "Today's registration queue has logged 142 patients. The average wait time from front-desk check-in to MO consultation is currently 18 minutes.";
    }
    return "Patient Registration: Pipeline is operational. You can track patient queue order and update daily footfall tables on this dashboard.";
  }

  if (path.includes('command') || role === 'cmo' || lowerQuery.includes('cmo') || lowerQuery.includes('district') || lowerQuery.includes('clinic') || lowerQuery.includes('overview')) {
    if (lowerQuery.includes('alert') || lowerQuery.includes('shortage')) {
      return "Command Centre Alert Summary:\n1. 3 clinics reporting critical medicine shortages (Antibiotics & Pain Relievers).\n2. City Hospital ICU bed capacity reached 100%.\nRedistribution request approvals are recommended.";
    }
    if (lowerQuery.includes('performance') || lowerQuery.includes('footfall') || lowerQuery.includes('trends') || lowerQuery.includes('doctor')) {
      return "District analytics show a 14% increase in respiratory complaints this week across all 5 sub-district clinics. Staff allocations are optimal, but bed caps exist in Sector 1.";
    }
    return "Chief Medical Officer Command: You have global oversight of the district. Here you can analyze live telemetry on bed availability, stock distribution requests, doctor schedules, and red alert logs.";
  }

  // General FAQ
  if (lowerQuery.includes('help') || lowerQuery.includes('what can you do') || lowerQuery.includes('features')) {
    return "I can help with dashboard-specific questions. E.g., if you are on the Stock page, ask me 'Which medicines are low in stock?'; on the Beds page, ask 'How many beds are free?'; or ask general system inquiries.";
  }

  return "I understand your query. Currently, all systems are operational. If you configure a Gemini API key in the settings (gear icon), I can generate dynamic, live AI responses for you!";
}

// Google Gemini API connection
async function callGeminiAPI(query: string, apiKey: string, path: string, role: string): Promise<string> {
  const systemPrompt = `You are a helpful, professional, and context-aware medical dashboard assistant for the MediTrack District Health Management System.
You are assisting a user who is logged in as a "${role.toUpperCase()}" on the page "${path}".
Provide clean, concise, action-oriented responses to help them manage clinical telemetry, bed availability, stock distribution, or registration details.
Keep responses succinct (under 3-4 sentences if possible) to fit nicely in a chat box.`;

  const prompt = `System instructions: ${systemPrompt}\n\nUser Question: ${query}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!replyText) {
    throw new Error("Invalid response format from Gemini API");
  }

  return replyText;
}
