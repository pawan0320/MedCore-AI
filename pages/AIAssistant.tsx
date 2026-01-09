import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Upload, Image as ImageIcon, Loader2, Bot, User, Pill, Stethoscope, MapPin, StopCircle } from 'lucide-react';
import { analyzeSymptoms, analyzeMedicalImage } from '../services/geminiService';
import { ChatMessage, Doctor } from '../types';
import { MOCK_DOCTORS } from '../services/mockData';
import { Link } from 'react-router-dom';

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface AIResponseData {
  analysis: string;
  confidence: string;
  otc_medications: string[];
  specialist_type: string;
  disclaimer: string;
}

const AIAssistant: React.FC = () => {
  // Initialize from sessionStorage or default
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Rehydrate Dates
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (e) {
      console.warn("Failed to load chat history", e);
    }
    
    return [{
      id: '1',
      role: 'model',
      text: 'Hello, I am your MediCore AI Assistant. Describe your symptoms using voice or text, and I will suggest medications and relevant specialists.',
      timestamp: new Date()
    }];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Save to sessionStorage on every update
    sessionStorage.setItem('ai_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Voice Input Logic
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedFile) || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    if (selectedFile) {
        userMsg.text = `[Attached Image: ${selectedFile.name}] ${inputText}`;
        userMsg.isAnalysis = true;
    }

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let responseText = '';
      if (selectedFile) {
        responseText = await analyzeMedicalImage(selectedFile, inputText);
        setSelectedFile(null);
      } else {
        responseText = await analyzeSymptoms(userMsg.text);
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText, // JSON string or plain text
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting to the service right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Helper to render AI content (JSON vs Plain Text)
  const renderContent = (msg: ChatMessage) => {
    if (msg.role === 'user') return <div className="whitespace-pre-wrap">{msg.text}</div>;

    // Try parsing as JSON for structured AI response
    try {
      const data: AIResponseData = JSON.parse(msg.text);
      
      // Find matching doctors based on specialist type
      const matchingDoctors = MOCK_DOCTORS.filter(doc => 
        doc.specialization.toLowerCase().includes(data.specialist_type.toLowerCase()) || 
        data.specialist_type.toLowerCase().includes(doc.specialization.toLowerCase())
      );

      return (
        <div className="space-y-4">
          <div>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Analysis:</span>
            <p>{data.analysis}</p>
          </div>

          {/* Medications */}
          {data.otc_medications && data.otc_medications.length > 0 && (
             <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 shadow-sm">
                <div className="flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-300 mb-2">
                   <Pill size={16} /> Suggested OTC Relief
                </div>
                <div className="flex flex-wrap gap-2">
                   {data.otc_medications.map((med, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800 shadow-sm">
                         {med}
                      </span>
                   ))}
                </div>
                <p className="text-[10px] text-blue-400 mt-2 italic">* {data.disclaimer}</p>
             </div>
          )}

          {/* Recommended Doctors */}
          <div>
             <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-400 mb-2">
                <Stethoscope size={16} /> Recommended Specialist: {data.specialist_type}
             </div>
             
             {matchingDoctors.length > 0 ? (
                <div className="grid gap-2">
                   {matchingDoctors.map(doc => (
                      <div key={doc.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30 shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <img src={doc.avatar} alt="doc" className="w-8 h-8 rounded-full" />
                            <div>
                               <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{doc.name}</p>
                               <p className="text-[10px] text-slate-500 dark:text-slate-400">{doc.hospital}</p>
                            </div>
                         </div>
                         <Link to="/booking" className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full hover:bg-emerald-700">
                            Book
                         </Link>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded">
                   No {data.specialist_type}s available in our network immediately.
                </div>
             )}
          </div>

          {/* Nearby Hospitals Link */}
          <div className="pt-2">
             <a 
               href={`https://www.google.com/maps/search/hospitals+near+me+${data.specialist_type}`}
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
             >
                <MapPin size={16} /> Find Nearby Hospitals & Clinics
             </a>
          </div>
        </div>
      );
    } catch (e) {
      // Fallback for image analysis or plain text errors
      return <div className="whitespace-pre-wrap">{msg.text}</div>;
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" /> Medical Assistant
          </h2>
          <p className="text-blue-100 text-xs">Powered by Gemini 3 Flash • Not a Human Doctor</p>
        </div>
        
        {/* Clear History Button */}
        <button 
            onClick={() => {
                if(confirm("Clear chat history?")) {
                    setMessages([{
                      id: Date.now().toString(),
                      role: 'model',
                      text: 'Hello, I am your MediCore AI Assistant. How can I help you today?',
                      timestamp: new Date()
                    }]);
                }
            }} 
            className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded text-blue-200 transition-colors"
        >
            Clear
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white dark:bg-slate-900">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
              }`}
            >
               <div className="flex items-center gap-2 mb-1 opacity-70 text-xs uppercase tracking-wider font-semibold">
                  {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                  {msg.role === 'user' ? 'You' : 'MediCore AI'}
               </div>
              <div className="text-sm leading-relaxed">
                {renderContent(msg)}
              </div>
              <div className={`text-xs mt-2 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-blue-500 h-4 w-4" />
                <span className="text-slate-500 dark:text-slate-400 text-sm">Analyzing symptoms & Finding specialists...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        {selectedFile && (
            <div className="mb-2 flex items-center gap-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 p-2 rounded-lg text-sm text-blue-700 dark:text-blue-400 w-fit">
                <ImageIcon size={16} />
                <span className="truncate max-w-xs">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="ml-2 hover:text-blue-900 dark:hover:text-blue-200">×</button>
            </div>
        )}
        
        <div className="flex items-end gap-2">
          <label className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors">
            <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileSelect} />
            <Upload size={20} />
          </label>
          
          <button 
            onClick={toggleRecording}
            className={`p-3 rounded-full cursor-pointer transition-all ${
              isRecording 
              ? 'bg-red-100 text-red-600 animate-pulse' 
              : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800'
            }`}
          >
            {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
          </button>

          <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <textarea
              className="w-full bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 max-h-32"
              placeholder={isRecording ? "Listening..." : "Describe symptoms or upload report..."}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
              }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={isLoading || (!inputText && !selectedFile)}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all hover:scale-105"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;