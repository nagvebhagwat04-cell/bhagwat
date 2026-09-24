import React, { useEffect, useState, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Lightbulb,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const SUGGESTED_PROMPTS = [
  'How can I improve my savings rate?',
  'Where am I overspending based on my transactions?',
  'Can I reach my goals with my current monthly surplus?',
  'Explain SIP in simple words and how it builds wealth.',
  'What happens if I increase my loan EMI payment?',
];

export const AiAdviserPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [financialSnapshot, setFinancialSnapshot] = useState<any>(null);
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    try {
      setLoadingHistory(true);
      setError(null);
      const [historyRes, dashRes] = await Promise.all([
        api.ai.getHistory(),
        api.dashboard.get(),
      ]);

      if (historyRes.success && historyRes.data) {
        setMessages(historyRes.data);
      }
      if (dashRes.success && dashRes.data) {
        setFinancialSnapshot(dashRes.data.metrics);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || sending) return;

    setInputText('');
    setError(null);

    const userMsg: ChatMessage = { role: 'user', message: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await api.ai.sendMessage(text);
      if (res.success && res.data) {
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          message: res.data.reply,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      setError(err.message || 'The AI assistant was unable to respond. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your conversation history?')) return;
    try {
      await api.ai.clearHistory();
      setMessages([]);
    } catch (err: any) {
      alert(err.message || 'Failed to clear history');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[850px] min-h-[580px] glass-card overflow-hidden animate-fade-in">
      {/* Top Advisory Header */}
      <div className="px-5 py-3.5 border-b border-white/8 flex items-center justify-between bg-white/3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 animate-pulse-glow">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Gemini Financial Planning Assistant
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
                Educational
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Context-aware guidance based on your deterministic numbers</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {financialSnapshot && (
            <button
              onClick={() => setShowSnapshot(!showSnapshot)}
              className="text-xs text-slate-400 hover:text-white font-medium px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1"
            >
              <span>Context</span>
              {showSnapshot ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Clear Chat History"
            id="clear-chat-btn"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Snapshot */}
      {showSnapshot && financialSnapshot && (
        <div className="bg-white/3 text-white px-5 py-3 text-xs border-b border-white/8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-emerald-400 text-[11px] uppercase tracking-wider">
              Live Financial Context Injected into AI:
            </span>
            <span className="text-[10px] text-slate-500">Strictly Private • No Passwords</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            {[
              { label: 'Monthly Income', value: `$${financialSnapshot.monthlyIncome?.toLocaleString()}` },
              { label: 'Monthly Expenses', value: `$${financialSnapshot.monthlyExpenses?.toLocaleString()}` },
              { label: 'Monthly Surplus', value: `$${financialSnapshot.monthlySavings?.toLocaleString()}`, accent: true },
              { label: 'Savings Rate', value: `${financialSnapshot.savingsRate}%` },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 border border-white/8 p-2 rounded-lg">
                <span className="text-slate-400">{item.label}:</span>
                <p className={`font-bold mt-0.5 ${item.accent ? 'text-emerald-400' : 'text-white'}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {loadingHistory ? (
          <LoadingSpinner message="Retrieving conversation history..." />
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-xl animate-float">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Ask Your Financial Adviser</h4>
              <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
                I can review your spending, evaluate whether you'll reach your targets, explain SIPs, EMIs, or suggest responsible budgeting improvements based on your data.
              </p>
            </div>

            <div className="w-full max-w-md">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                Suggested Questions:
              </span>
              <div className="flex flex-col gap-2 text-left">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 hover:border-emerald-500/30 rounded-xl px-4 py-2.5 transition-all flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <Send className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg._id || index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-sm font-medium'
                      : 'bg-white/6 border border-white/8 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {msg.message}
                  </div>
                  {msg.createdAt && (
                    <div className={`text-[10px] mt-2 ${isUser ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {sending && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white/6 border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3 text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '400ms' }} />
              <span className="ml-2 font-medium">Analyzing financial context...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions when chatting */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-white/8 bg-white/3 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="font-semibold flex-shrink-0">Quick:</span>
          {SUGGESTED_PROMPTS.slice(0, 3).map((p) => (
            <button
              key={p}
              onClick={() => handleSendMessage(p)}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-emerald-500/20 rounded-lg whitespace-nowrap transition-colors hover:text-white"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 sm:p-4 border-t border-white/8 bg-white/3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="ai-chat-input"
            type="text"
            placeholder="Ask about budgeting, emergency funds, debt reduction, or goals..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            className="input-field flex-1"
          />
          <button
            id="ai-send-btn"
            type="submit"
            disabled={!inputText.trim() || sending}
            className="btn-primary py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-500 text-center mt-2">
          Responses generated for educational purposes based on deterministic financial formulas.
        </p>
      </div>
    </div>
  );
};
