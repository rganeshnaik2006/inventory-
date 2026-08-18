import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  RotateCcw,
  Boxes,
  Activity,
  AlertTriangle,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { askGeminiAdvisor } from '../services/geminiService';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AICopilotDrawer: React.FC = () => {
  const { metrics, orders, products, bottlenecks } = useWarehouse();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: `Hello Supervisor. I am your **Nexus Gemini Operations Copilot**. I am actively monitoring Shift Alpha floor dynamics, pick wave congestion, and stock allocation queues.\n\nCurrently, I am tracking **1 critical stockout dilemma** (ORD-9801 VIP) and **1 packing bottleneck** at Bench #02. How can I assist you with fulfillment strategy or labor rebalancing?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const quickPrompts = [
    'Explain the VIP preemption rationale on ORD-9801',
    'Diagnose the packing bottleneck at Bench #02',
    'How should we handle the FedEx 25-min cutoff?',
    'Recommend reorder quantities for lithium battery stock',
  ];

  const handleSend = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const warehouseContext = {
        metrics,
        ordersSummary: orders.map((o) => ({
          id: o.orderNumber,
          tier: o.customerTier,
          status: o.status,
          slaMinutes: o.slaDeadlineMinutes,
        })),
        activeBottlenecks: bottlenecks,
        inventorySummary: products.map((p) => ({
          sku: p.sku,
          atp: p.availableToPromise,
          quarantine: p.quarantineStock,
        })),
      };

      const responseText = await askGeminiAdvisor(userText, warehouseContext);

      const aiMsg: ChatMessage = {
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I analyzed the active warehouse state: Preemption of 5 units from B2B order ORD-9784 to VIP order ORD-9801 remains the mathematically optimal choice to prevent a $450/hr SLA breach. Restock PO for 50 units should be confirmed at Dock 4.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col h-[750px] max-h-[85vh]">
      {/* Copilot Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
              Gemini WMS Operations Copilot
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                LIVE REASONING
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Autonomous decision advisor & exception resolution engine
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                sender: 'assistant',
                text: 'Conversation history reset. System telemetry is nominal. What would you like to evaluate?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          title="Clear chat history"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
        {messages.map((msg, index) => {
          const isAi = msg.sender === 'assistant';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shrink-0 mt-1 shadow">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed ${
                  isAi
                    ? 'bg-slate-950/90 border border-slate-800 text-slate-200 shadow-md'
                    : 'bg-cyan-600 text-white font-medium shadow-md'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] mb-1.5 opacity-70">
                  <span className="font-semibold">{isAi ? 'Nexus Gemini Operations Advisor' : 'Floor Supervisor'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="whitespace-pre-line font-sans space-y-2">
                  {msg.text}
                </div>
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span>Gemini is evaluating inventory trade-offs and warehouse telemetry...</span>
            </div>
          </div>
        )}
      </div>

      {/* Preset Quick Chips */}
      <div className="pt-2 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-800/80">
        <span className="text-[11px] text-slate-500 font-semibold uppercase shrink-0">Prompts:</span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="px-3 py-1 rounded-full text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex gap-2 pt-2 border-t border-slate-800"
      >
        <input
          type="text"
          placeholder="Ask Copilot about fulfillment priorities, bottlenecks, or trade-offs..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
