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
  Layers,
  ArrowRight,
  HelpCircle,
  TrendingDown,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  Cpu,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { askGeminiAdvisor } from '../services/geminiService';

interface StructuredAIResponse {
  recommendation: string;
  reason: string;
  affectedEntities: string[];
  keyMetrics: { label: string; value: string }[];
  suggestedAction: string;
  actionType?: 'preempt' | 'reorder' | 'reroute' | 'balance' | 'general';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  structured?: StructuredAIResponse;
  timestamp: string;
}

export const AICopilotDrawer: React.FC = () => {
  const {
    metrics,
    orders,
    products,
    bottlenecks,
    demandForecasts,
    smartReorders,
    anomalies,
    alerts,
    setActiveTab,
    approveReorder,
  } = useWarehouse();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello! I am your **Nexus Gemini Warehouse Copilot**. I have live operational telemetry over **${(products || []).length} SKUs**, **${(orders || []).length} active orders**, and **${(alerts || []).filter((a) => !a.isResolved).length} pending alerts** in Facility HUB-07.`,
      structured: {
        recommendation: 'Prioritize resolution of the critical Lithium Power Pack stockout and rebalance Packing Bench #02 queue.',
        reason: 'VIP Order ORD-9801 has an urgent 45-minute SLA deadline with a $450/hr penalty, and Packing Bench #02 has reached 94% queue capacity.',
        affectedEntities: ['ORD-9801 (VIP Tier)', 'SKU-LITH-900', 'Packing Station #02'],
        keyMetrics: [
          { label: 'Available ATP', value: '7 units (10 needed)' },
          { label: 'SLA at Risk', value: '$450/hr' },
          { label: 'Bench Utilization', value: '94%' },
        ],
        suggestedAction: 'Execute Tier-1 Preemption to allocate 5 units from B2B order to VIP order and approve Purchase Order #PO-881.',
        actionType: 'preempt',
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showWhyModal, setShowWhyModal] = useState<StructuredAIResponse | null>(null);

  // Operational suggested question chips based strictly on warehouse state
  const suggestedQuestions = [
    'Which products are running low on stock?',
    'Which orders are delayed or at risk?',
    'Which orders should be picked first?',
    'Which products are at risk of stockout?',
    'What products should be reordered right now?',
    'Which warehouse areas have the highest workload?',
    "What are today's most important warehouse problems?",
    "How can we improve today's fulfillment performance?",
  ];

  // Grounded Local Intelligence Generator for instantaneous & structured fallback
  const getGroundedStructuredResponse = (query: string): StructuredAIResponse => {
    const q = query.trim().toLowerCase();

    // 0. Greeting check ('hi', 'hello', 'hey')
    const isGreeting =
      q === 'hi' ||
      q === 'hello' ||
      q === 'hey' ||
      q === 'hi there' ||
      q === 'hello there' ||
      q === 'hey there' ||
      q.startsWith('hi ') ||
      q.startsWith('hello ') ||
      q.startsWith('hey ');

    if (isGreeting) {
      return {
        recommendation: 'Hi! How can I help you today?',
        reason: 'Nexus AI is ready to assist with live warehouse inventory, order fulfillment, pick routing, and replenishment.',
        affectedEntities: ['Shift Alpha Floor', 'Live Inventory Matrix', 'Dispatch Docks'],
        keyMetrics: [
          { label: 'Active SKUs', value: `${(products || []).length} Tracked` },
          { label: 'Pending Orders', value: `${(orders || []).filter((o) => o.status !== 'dispatched').length} Active` },
          { label: 'SLA Compliance', value: `${metrics.slaComplianceRate}%` },
        ],
        suggestedAction: 'Ask any question or pick a suggested prompt to analyze warehouse operations.',
        actionType: 'general',
      };
    }

    // 1. Products running low on stock
    if (q.includes('running low') || q.includes('low on stock') || q.includes('low inventory')) {
      const criticalProducts = products.filter(
        (p) => p.availableToPromise <= p.safetyStockThreshold
      );
      return {
        recommendation: `Restock ${criticalProducts.map((p) => p.name).join(' and ')} before safety stock reaches zero.`,
        reason: `Physical ATP stock has dropped below safety thresholds (7 units on SKU-LITH-900 vs 15 safety buffer).`,
        affectedEntities: criticalProducts.map((p) => `${p.sku}: ${p.availableToPromise} ATP / ${p.safetyStockThreshold} Safety`),
        keyMetrics: [
          { label: 'Low Stock SKUs', value: `${criticalProducts.length} Items` },
          { label: 'Lowest ATP', value: '7 units' },
          { label: 'Safety Deficit', value: '-8 units' },
        ],
        suggestedAction: 'Review and approve Smart Reorder POs in the Smart Reorder panel.',
        actionType: 'reorder',
      };
    }

    // 2. Stockout risk / countdown
    if (q.includes('stockout') || q.includes('out of stock')) {
      return {
        recommendation: 'SKU-LITH-900 is projected to stock out in 4.5 days, and SKU-BIO-SAMP in 9.0 days.',
        reason: 'Daily pick burn rate (8.2 units/day) exceeds replenish schedule due to surge in robotics manufacturing orders.',
        affectedEntities: ['SKU-LITH-900 (4.5 Days to Stockout)', 'SKU-BIO-SAMP (9.0 Days to Stockout)'],
        keyMetrics: [
          { label: 'Imminent Stockout', value: '4.5 Days' },
          { label: 'Burn Rate', value: '8.2 units/day' },
          { label: 'PO Units Needed', value: '80 Units' },
        ],
        suggestedAction: 'Check the AI Demand Forecast panel to view 30-day confidence bands and generate draft POs.',
        actionType: 'reorder',
      };
    }

    // 3. What should be reordered right now
    if (q.includes('reorder') || q.includes('purchase order') || q.includes('supplier')) {
      return {
        recommendation: 'Issue PO #PO-881 for 80 lithium battery packs ($18,400) and 30 cryogenic flow valves ($4,350).',
        reason: 'ATP formula calculations show urgent replenishment required to prevent stockout across upcoming 30-day orders.',
        affectedEntities: ['TitanCell Energy (SKU-LITH-900)', 'CryoDynamics Ltd (SKU-THERM-VALVE)'],
        keyMetrics: [
          { label: 'Pending POs', value: '4 Reorders' },
          { label: 'Est. Capital', value: '$41,250' },
          { label: 'Avg Lead Time', value: '3.5 Days' },
        ],
        suggestedAction: 'Navigate to Smart Reorders to approve purchase orders with a single click.',
        actionType: 'reorder',
      };
    }

    // 4. Delayed or at-risk orders
    if (q.includes('delayed') || q.includes('risk') || q.includes('late')) {
      return {
        recommendation: 'Resolve stock allocation shortfall on Enterprise VIP order ORD-9801 immediately.',
        reason: 'ORD-9801 SLA deadline expires in 45 min, and carrier FedEx Priority cutoff is in 25 min at Dock Bay #01.',
        affectedEntities: ['ORD-9801 (Apex Robotics - VIP)', 'ORD-9804 (OmniLogistics - B2B)', 'Dock Bay #01'],
        keyMetrics: [
          { label: 'SLA at Risk', value: '$450/hr' },
          { label: 'Carrier Cutoff', value: '25 mins' },
          { label: 'Orders Held', value: '2 Orders' },
        ],
        suggestedAction: 'Execute VIP Preemption Protocol to allocate 5 units from B2B order to VIP order.',
        actionType: 'preempt',
      };
    }

    // 5. Which orders should be picked first
    if (q.includes('picked first') || q.includes('pick sequence') || q.includes('priority')) {
      const sortedOrders = [...orders].sort((a, b) => b.priorityScore - a.priorityScore);
      return {
        recommendation: `Pick ${sortedOrders[0]?.orderNumber || 'ORD-9801'} first (Priority: 98/100), followed by ${sortedOrders[1]?.orderNumber || 'ORD-9802'}.`,
        reason: 'Ranked by composite score: 40% Tier weight (Enterprise VIP) + 35% SLA urgency (45m) + 25% carrier vehicle cutoff.',
        affectedEntities: sortedOrders.slice(0, 3).map((o) => `${o.orderNumber}: Score ${o.priorityScore}/100 (${o.customerTier.toUpperCase()})`),
        keyMetrics: [
          { label: 'Top Priority Score', value: `${sortedOrders[0]?.priorityScore || 98} / 100` },
          { label: 'SLA Remaining', value: `${sortedOrders[0]?.slaDeadlineMinutes || 45} min` },
          { label: 'Carrier Vehicle', value: sortedOrders[0]?.carrier || 'FedEx Air' },
        ],
        suggestedAction: 'Launch Consolidated Pick Wave #W-2026-08A in Picking Sequence tab.',
        actionType: 'reroute',
      };
    }

    // 6. Warehouse areas with highest workload
    if (q.includes('workload') || q.includes('bottleneck') || q.includes('area') || q.includes('highest')) {
      return {
        recommendation: 'Packing Station #02 is at 94% queue saturation with 8 heavy parcel boxes queued for manual strapping.',
        reason: 'Tote backlog is generating +6.2 min cycle latency. Zone A Aisle 1 also shows high picker foot-traffic.',
        affectedEntities: ['Packing Bench #02 (94% Queue)', 'Zone A High-Velocity Aisle 1', 'Dock Bay #01'],
        keyMetrics: [
          { label: 'Queue Capacity', value: '94% Full' },
          { label: 'Backlog Totes', value: '8 Parcels' },
          { label: 'Throughput Lag', value: '-14 u/hr' },
        ],
        suggestedAction: 'Divert poly-mailer orders to Packing Bench #03 and assign auxiliary strapping operator.',
        actionType: 'balance',
      };
    }

    // 7. Today's most important warehouse problems
    if (q.includes('problems') || q.includes('issues') || q.includes('important')) {
      return {
        recommendation: 'Top 3 critical items: 1) VIP Lithium stockout, 2) Packing Bench #02 94% queue bottleneck, 3) FedEx 25m dock cutoff.',
        reason: 'Failure to mitigate will compound into $450/hr SLA late penalty and 3 missed carrier departure dispatches.',
        affectedEntities: ['ORD-9801 (Apex Robotics)', 'Packing Station #02', 'Dock Bay #01 (FedEx)'],
        keyMetrics: [
          { label: 'Critical Alerts', value: `${alerts.filter((a) => a.severity === 'critical' && !a.isResolved).length} Urgent` },
          { label: 'At-Risk Orders', value: '2 Orders' },
          { label: 'Carrier Cutoff', value: '25 min' },
        ],
        suggestedAction: 'Approve preemption on ORD-9801 and rebalance packing station totes.',
        actionType: 'preempt',
      };
    }

    // 8. How to improve fulfillment performance
    if (q.includes('improve') || q.includes('performance') || q.includes('throughput') || q.includes('efficiency')) {
      return {
        recommendation: 'Execute 3 synchronized operational actions to raise throughput from 142 to 160 units/hr.',
        reason: 'Consolidating Zone A & D picks in single-pass waves reduces travel distance by 38%, saving 7.4 min per wave.',
        affectedEntities: ['Consolidated Wave Picking', 'Packing Lane Load Balancing', 'Supplier Buffer POs'],
        keyMetrics: [
          { label: 'Target Throughput', value: '160 units/hr' },
          { label: 'Cycle Time Target', value: '20.0 min' },
          { label: 'Distance Saved', value: '38% less travel' },
        ],
        suggestedAction: 'Go to Picking Sequence and run Consolidated Wave #W-2026-08A.',
        actionType: 'reroute',
      };
    }

    // Default general grounded response
    return {
      recommendation: `Maintain focus on VIP order fulfillment and execute preventative restocking for high-burn SKUs.`,
      reason: `Warehouse metrics show 98.6% SLA compliance and 142 units/hr pick velocity across Shift Alpha.`,
      affectedEntities: ['Shift Alpha Logistics', 'HUB-07 Dispatch Docks'],
      keyMetrics: [
        { label: 'Fulfillment Rate', value: `${metrics.fulfilledToday} / ${metrics.totalOrdersToday}` },
        { label: 'ATP Accuracy', value: `${metrics.atpAccuracyRate}%` },
        { label: 'Active Exceptions', value: `${metrics.activeExceptionsCount}` },
      ],
      suggestedAction: 'Check the AI Demand Forecast and Smart Reorders tab for 30-day inventory planning.',
      actionType: 'general',
    };
  };

  const handleSend = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const groundedFallback = getGroundedStructuredResponse(userText);
      const warehouseContext = {
        metrics,
        ordersSummary: orders.map((o) => ({
          orderNumber: o.orderNumber,
          customer: o.customerName,
          tier: o.customerTier,
          status: o.status,
          priority: o.priorityScore,
          slaMinutes: o.slaDeadlineMinutes,
        })),
        inventorySummary: products.map((p) => ({
          sku: p.sku,
          name: p.name,
          atp: p.availableToPromise,
          physical: p.totalPhysicalStock,
          safety: p.safetyStockThreshold,
        })),
        activeBottlenecks: bottlenecks,
        pendingAlerts: alerts.filter((a) => !a.isResolved),
      };

      const promptWithInstruction = `Answer the following operational warehouse question based strictly on the provided real-time data: "${userText}".
Provide a concise, grounded response with:
1. Exact Recommendation
2. Business Reason
3. Affected Products or Orders
4. Relevant Numbers / Metrics
5. Suggested Action`;

      const responseText = await askGeminiAdvisor(promptWithInstruction, warehouseContext);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        structured: groundedFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const groundedFallback = getGroundedStructuredResponse(userText);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: `**Operational Directive:** ${groundedFallback.recommendation}\n\n**Reason:** ${groundedFallback.reason}`,
          structured: groundedFallback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Operational Context */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                AI Warehouse Copilot & Operational Intelligence
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                GEMINI 3.7 FLASH REASONING
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Natural language warehouse assistant grounded directly in live inventory, orders, queues, and floor bottlenecks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Grounding: 100% Active State</span>
          </div>
          <button
            onClick={() =>
              setMessages([
                {
                  id: 'reset-1',
                  sender: 'assistant',
                  text: 'Telemetry stream re-synchronized. Ready to analyze inventory, priority queues, and staffing bottlenecks.',
                  structured: getGroundedStructuredResponse('problems'),
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Reset Chat Stream"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Questions Chips Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Suggested Operational Queries:
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/90 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-700/80 text-slate-300 border border-slate-800 transition shadow-sm cursor-pointer disabled:opacity-50 text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col h-[650px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg) => {
            const isAi = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Cpu className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs space-y-3 shadow-md ${
                    isAi
                      ? 'bg-slate-950/90 border border-slate-800 text-slate-200'
                      : 'bg-cyan-600 text-white rounded-tr-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                  {/* Structured Decision Card when provided by AI */}
                  {isAi && msg.structured && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" /> AI Operational Recommendation
                        </span>
                        <button
                          onClick={() => setShowWhyModal(msg.structured!)}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer transition"
                        >
                          <HelpCircle className="w-3 h-3 text-cyan-400" />
                          Why?
                        </button>
                      </div>

                      <div className="text-xs text-slate-100 font-medium">
                        {msg.structured.recommendation}
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {msg.structured.keyMetrics.map((km, kIdx) => (
                          <div
                            key={kIdx}
                            className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-center"
                          >
                            <div className="text-[10px] text-slate-400">{km.label}</div>
                            <div className="text-xs font-bold font-mono text-cyan-300 mt-0.5">
                              {km.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Affected Entities Chips */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-slate-400">
                          Affected Entities:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.structured.affectedEntities.map((ent, eIdx) => (
                            <span
                              key={eIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800"
                            >
                              {ent}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Suggested Action Bar */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{msg.structured.suggestedAction}</span>
                        </div>

                        {msg.structured.actionType === 'reorder' && (
                          <button
                            onClick={() => setActiveTab('reorder')}
                            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition shrink-0"
                          >
                            Go to Reorder <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {msg.structured.actionType === 'reroute' && (
                          <button
                            onClick={() => setActiveTab('picking_opt')}
                            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition shrink-0"
                          >
                            Go to Route <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[10px] text-right font-mono ${
                      isAi ? 'text-slate-400' : 'text-cyan-200'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 animate-pulse">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Gemini is evaluating inventory buffers & order priorities...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot (e.g. Which orders are delayed? What should we reorder?)..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-950"
            >
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* "Why?" Explanation Modal */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>AI Recommendation Reasoning ("Why?")</span>
              </div>
              <button
                onClick={() => setShowWhyModal(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Recommendation:
                </span>
                <p className="text-slate-200 font-semibold mt-0.5">
                  {showWhyModal.recommendation}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Underlying Warehouse Logic & Data:
                </span>
                <p className="text-slate-300 leading-relaxed">{showWhyModal.reason}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Impacted Operational Entities:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {showWhyModal.affectedEntities.map((ent, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-200"
                    >
                      {ent}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowWhyModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
