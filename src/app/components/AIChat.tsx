import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  RefreshCw,
  Search,
  FileText,
  Calculator
} from 'lucide-react';
import { motion } from 'framer-motion';
import { sendAIChatMessage } from '../api';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  toolUsed?: {
    name: string;
    status: 'loading' | 'success' | 'error';
    result?: string;
  };
};

const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    role: 'ai',
    content: 'Assalomu alaykum. Men sizning AI biznes assistentiman. Bugun nimada yordam bera olaman?',
  }
];

export function AIChat({ tenantId, onClose }: { tenantId: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendAIChatMessage(tenantId, userMsg.content, {});
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.reply,
        toolUsed: response.toolUsed
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
       setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Uzr, server bilan bog\'lanishda xatolik yuz berdi.',
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col"
    >
      {/* Header */}
      <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Concierge AI</h3>
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               <p className="text-xs text-slate-500">Online • Shadow CFO</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={scrollRef}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'ai' 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'bg-slate-200 text-slate-600'
            }`}>
              {msg.role === 'ai' ? <Sparkles size={16} /> : <User size={16} />}
            </div>
            
            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
              }`}>
                {msg.content}
              </div>

              {/* Tool Execution Indicator */}
              {msg.toolUsed && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md">
                  {msg.toolUsed.name.includes('CFO') ? <Calculator size={12} /> : <Search size={12} />}
                  <span className="font-mono">{msg.toolUsed.name}</span>
                  <CheckIcon className="text-emerald-500" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        {messages.length < 3 && (
          <div className="flex gap-2 overflow-x-auto mb-3 pb-1 scrollbar-hide">
            <SuggestionButton label="📊 Monthly Report" onClick={() => setInput('Generate monthly report')} />
            <SuggestionButton label="💰 Cashflow Check" onClick={() => setInput('Check cashflow status')} />
            <SuggestionButton label="📝 HR Policy" onClick={() => setInput('Draft new HR policy')} />
          </div>
        )}
        
        <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors">
            <FileText size={20} />
          </button>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Concierge AI..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2.5 max-h-32 resize-none text-slate-800 placeholder:text-slate-400"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          AI can make mistakes. Please verify sensitive financial data.
        </p>
      </div>
    </motion.div>
  );
}

function SuggestionButton({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600 whitespace-nowrap transition-colors"
    >
      {label}
    </button>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
