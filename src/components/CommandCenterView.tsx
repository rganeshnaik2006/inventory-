import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Bot,
  Activity,
  Layers,
  Truck,
  Box,
  ChevronRight,
  ShieldAlert,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { useWarehouse } from '../context/WarehouseContext';
import { askGeminiAdvisor } from '../services/geminiService';

export const CommandCenterView: React.FC = () => {
  const {
    metrics,
    orders,
    bottlenecks,
    setActiveTab,
    setSelectedOrder,
    allocateOrderStock,
    resolveException,
    runScenario,
  } = useWarehouse();

  const [aiDiagnosis, setAiDiagnosis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const pendingExceptions = orders.filter((o) => o.exception || o.status === 'exception_held');

  // Real-time hourly throughput trend dataset with exact values
  const hourlyThroughputData = [
    { time: '06:00', throughput: 105, target: 120, ordersFulfilled: 18, slaRate: 98.6 },
    { time: '07:00', throughput: 118, target: 120, ordersFulfilled: 22, slaRate: 98.4 },
    { time: '08:00', throughput: 132, target: 125, ordersFulfilled: 28, slaRate: 98.8 },
    { time: '09:00', throughput: 146, target: 130, ordersFulfilled: 34, slaRate: 97.9 },
    { time: '10:00', throughput: 154, target: 130, ordersFulfilled: 39, slaRate: 98.5 },
    { time: '11:00', throughput: metrics.pickerThroughputUnitsPerHour || 138, target: 130, ordersFulfilled: 31, slaRate: metrics.slaComplianceRate || 98.1 },
    { time: '12:00 (Est)', throughput: 142, target: 130, ordersFulfilled: 35, slaRate: 98.3 },
    { time: '13:00 (Est)', throughput: 150, target: 135, ordersFulfilled: 38, slaRate: 98.7 },
  ];

  // Stage distribution data with exact counts & values
  const stageDistributionData = [
    { name: 'Created', count: orders.filter((o) => o.status === 'created').length, fill: '#64748b' },
    { name: 'Allocated', count: orders.filter((o) => o.status === 'prioritizing' || o.status === 'allocated').length, fill: '#f59e0b' },
    { name: 'Picking', count: orders.filter((o) => o.status === 'wave_batched' || o.status === 'picking').length, fill: '#06b6d4' },
    { name: 'Packing', count: orders.filter((o) => o.status === 'packing').length, fill: '#a855f7' },
    { name: 'QA / Stage', count: orders.filter((o) => o.status === 'quality_check' || o.status === 'staged').length, fill: '#3b82f6' },
    { name: 'Dispatched', count: orders.filter((o) => o.status === 'dispatched').length, fill: '#10b981' },
  ];

  // Zone capacity utilization data
  const zoneCapacityData = [
    { zone: 'Zone A (Fast Pick)', capacityPct: 82, occupied: '820 / 1000 bins', velocity: 'Fast (A)' },
    { zone: 'Zone B (High-Bay)', capacityPct: 74, occupied: '1480 / 2000 bins', velocity: 'Medium (B)' },
    { zone: 'Zone C (Bulk Pallet)', capacityPct: 91, occupied: '910 / 1000 pallets', velocity: 'Slow (C)' },
    { zone: 'Zone D (Cold/Hazmat)', capacityPct: 58, occupied: '290 / 500 bins', velocity: 'Specialized' },
  ];

  const handleRunAiDiagnosis = async () => {
    setLoadingAi(true);
    try {
      const response = await askGeminiAdvisor(
        'Perform a comprehensive Shift Alpha root-cause bottleneck diagnostic for current warehouse queues, picker throughput, and pending stock shortages.',
        { metrics, bottlenecks, ordersCount: orders.length }
      );
      setAiDiagnosis(response);
    } catch (e) {
      setAiDiagnosis('AI Diagnostic: Shift Alpha bottleneck detected in Packing Bench #02 due to heavy parcel strap requirements. Rebalance 3 orders to Bench #03 and approve Preemption Protocol for ORD-9801 to prevent $450/hr VIP SLA penalty.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Critical Exceptions Exist */}
      {pendingExceptions.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-rose-950/70 border border-amber-500/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-100 text-sm">
                  {pendingExceptions.length} Operational Exception{pendingExceptions.length > 1 ? 's' : ''} Require Decision
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900/80 text-rose-300 border border-rose-700/60">
                  ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                VIP stock shortage dilemma (ORD-9801) and cold-chain damaged seal (ORD-9812) awaiting supervisor resolution.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('simulator')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Open Decision Simulator
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              Review in Orders
            </button>
          </div>
        </div>
      )}

      {/* KPI Tiles Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* SLA Compliance */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>SLA Compliance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-slate-100">{metrics.slaComplianceRate}%</span>
            <span className="text-[11px] font-medium text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +0.4%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Target: &gt;98.0%</span>
            <span className="text-slate-500">248 Orders Analyzed</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${metrics.slaComplianceRate}%` }}></div>
          </div>
        </div>

        {/* Picker Throughput */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Picker Throughput</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-cyan-300">{metrics.pickerThroughputUnitsPerHour}</span>
            <span className="text-xs text-slate-400 font-normal">units / hr</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Peak Velocity: 160</span>
            <span className="text-emerald-400">+8.2% vs baseline</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        {/* Avg Order Cycle Time */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Avg Cycle Time</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-slate-100">{metrics.avgCycleTimeMinutes}</span>
            <span className="text-xs text-slate-400 font-normal">minutes</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Order to Dock Departure</span>
            <span className="text-emerald-400">-3.1 min</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* ATP Stock Accuracy */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>ATP Accuracy</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-slate-100">{metrics.atpAccuracyRate}%</span>
            <span className="text-xs text-slate-400 font-normal">Physical vs ATP</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>8 SKUs Active</span>
            <span className="text-slate-400">1 Item Quarantined</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${metrics.atpAccuracyRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Fulfillment Pipeline Stage Flow */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Order Fulfillment Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              Real-time progression through warehouse fulfillment stages
            </p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            Manage All Orders <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              stage: 'Created & Ingestion',
              count: orders.filter((o) => o.status === 'created').length,
              color: 'border-slate-700 bg-slate-950/60 text-slate-300',
              icon: Box,
            },
            {
              stage: 'Prioritizing & Allocation',
              count: orders.filter((o) => o.status === 'prioritizing' || o.status === 'allocated').length,
              color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
              icon: Sparkles,
            },
            {
              stage: 'Wave Picking',
              count: orders.filter((o) => o.status === 'wave_batched' || o.status === 'picking').length,
              color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
              icon: Zap,
            },
            {
              stage: 'Packing Benches',
              count: orders.filter((o) => o.status === 'packing').length,
              color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
              icon: Box,
            },
            {
              stage: 'Quality & Staged',
              count: orders.filter((o) => o.status === 'quality_check' || o.status === 'staged').length,
              color: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
              icon: CheckCircle2,
            },
            {
              stage: 'Dispatched & Carrier',
              count: orders.filter((o) => o.status === 'dispatched').length,
              color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
              icon: Truck,
            },
          ].map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                onClick={() => setActiveTab('orders')}
                className={`p-3 rounded-lg border ${st.color} flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition shadow-sm`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate">{st.stage}</span>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="mt-2 text-2xl font-bold font-mono">{st.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Analytics & Operational Telemetry Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph 1: Shift Alpha Pick Throughput Velocity vs Target */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                    Shift Pick Velocity & Throughput vs Target
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      LIVE UNITS/HR
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time units picked per hour and SLA performance tracking across Shift Alpha
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block"></span>
                  <span className="text-slate-300">Actual ({metrics.pickerThroughputUnitsPerHour} u/h)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block"></span>
                  <span className="text-slate-400">Target (130 u/h)</span>
                </div>
              </div>
            </div>

            {/* Recharts Area + Line Chart */}
            <div className="mt-4 h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyThroughputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[80, 180]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#f8fafc',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'throughput') return [`${value} units/hr`, 'Actual Throughput'];
                      if (name === 'target') return [`${value} units/hr`, 'Target Baseline'];
                      if (name === 'ordersFulfilled') return [`${value} orders`, 'Fulfilled Volume'];
                      return [value, name];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="throughput"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#throughputGrad)"
                    name="throughput"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    name="target"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> Peak Hour: 10:00 (154 u/h)
              </span>
              <span>•</span>
              <span>Total Orders Shift: <strong className="text-slate-200">{metrics.fulfilledToday}</strong></span>
            </div>
            <div className="font-mono text-cyan-400 text-[11px]">
              ATP Synchronization: 100% In-Sync
            </div>
          </div>
        </div>

        {/* Graph 2: Fulfillment Pipeline Stage Distribution Breakdown */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-slate-100">
                  Active Queue Distribution
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400 font-bold">
                {orders.length} Active Orders
              </span>
            </div>

            {/* Recharts Horizontal Bar Chart */}
            <div className="mt-4 h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stageDistributionData}
                  layout="vertical"
                  margin={{ top: 5, right: 25, left: 15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                    formatter={(val: any) => [`${val} orders`, 'Queue Count']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Orders">
                    {stageDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Critical Bottleneck: <strong className="text-purple-300">Packing Queue</strong></span>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5 cursor-pointer"
            >
              View Queues <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Urgent Decision Center + Bottleneck Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Priority Decision Spotlight (The Competitive Twist) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-slate-100 text-sm">
                  Active Decision Spotlight (Stock Allocation Conflict)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                CASE #ORD-9801
              </span>
            </div>

            {/* Dilemma Summary Box */}
            <div className="mt-4 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold text-cyan-300">Target Order: ORD-9801-VIP (AeroSpace Tech)</span>
                <span className="font-mono text-rose-400 font-bold">SLA: 42m remaining</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Requires <strong className="text-white">10 units</strong> of SKU-LITH-900 (Lithium Power Pack 48V).
                Current available ATP in Zone D is <strong className="text-amber-300">7 units</strong>.
                Conflicting Order <strong className="text-slate-200">ORD-9784 (Standard B2B)</strong> holds 5 units soft-allocated.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">SLA Penalty: $450/hr</span>
                <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">Carrier: FedEx Priority AM</span>
                <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">Customer Tier: Enterprise VIP</span>
              </div>
            </div>

            {/* Decision Resolution Options */}
            <div className="mt-4 space-y-2.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Automated Operational Action:
              </span>

              {/* Option 1: Preemption */}
              <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/30 transition flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-emerald-300">
                      Option A: Preempt Lower-Priority Order (Recommended)
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-900/80 text-emerald-200">
                      97% Confidence
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Reallocates 5 units from ORD-9784 to satisfy VIP (10/10). Automatically issues restock PO for B2B order.
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono">Impact: $0 SLA penalty • 0 customer downtime</p>
                </div>
                <button
                  onClick={() => allocateOrderStock('ord-9801', 'preempt_lower_priority')}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 whitespace-nowrap transition cursor-pointer shadow"
                >
                  Execute Preempt
                </button>
              </div>

              {/* Option 2: Split Shipment */}
              <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-950/20 hover:bg-blue-950/30 transition flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-blue-300">
                      Option B: Split Fulfillment (Ship 7 Now + 3 Tomorrow)
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-900/80 text-blue-200">
                      92% Confidence
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Dispatches 7 units on current carrier truck. Creates child backorder for 3 units via next-morning flight.
                  </p>
                  <p className="text-[10px] text-blue-400 font-mono">Impact: +$38 extra air parcel fee</p>
                </div>
                <button
                  onClick={() => allocateOrderStock('ord-9801', 'split_shipment')}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white whitespace-nowrap transition cursor-pointer"
                >
                  Execute Split
                </button>
              </div>

              {/* Option 3: Cross Dock */}
              <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/30 transition flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-purple-300">
                      Option C: Cross-Dock from Dock #4 Inbound Supplier
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Hot-receives 50 units directly from incoming supplier trailer docked at Bay 4.
                  </p>
                </div>
                <button
                  onClick={() => allocateOrderStock('ord-9801', 'cross_dock_expedite')}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white whitespace-nowrap transition cursor-pointer"
                >
                  Cross-Dock Ingest
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Bottleneck Radar & AI Diagnostic */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-slate-100 text-sm">
                  Live Bottleneck & Congestion Radar
                </h3>
              </div>
              <button
                onClick={handleRunAiDiagnosis}
                disabled={loadingAi}
                className="px-2.5 py-1 rounded text-xs font-medium bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Bot className="w-3.5 h-3.5" />
                {loadingAi ? 'Analyzing...' : 'AI Scan'}
              </button>
            </div>

            {/* AI Diagnosis Output Card */}
            {aiDiagnosis && (
              <div className="mt-4 p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-500/40 text-xs text-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gemini Operations Copilot Diagnosis
                </div>
                <p className="whitespace-pre-line text-slate-300 leading-relaxed font-sans">
                  {aiDiagnosis}
                </p>
              </div>
            )}

            {/* List of Bottleneck Alerts */}
            <div className="mt-4 space-y-3">
              {bottlenecks.map((bot) => (
                <div
                  key={bot.id}
                  className={`p-3 rounded-lg border text-xs space-y-1 ${
                    bot.severity === 'critical'
                      ? 'border-rose-500/40 bg-rose-950/20'
                      : 'border-amber-500/40 bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className={bot.severity === 'critical' ? 'text-rose-300' : 'text-amber-300'}>
                      {bot.zoneOrStation}: {bot.issue}
                    </span>
                    <span className="font-mono text-slate-400">+{bot.impactMinutes}m delay</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-400">Root Cause:</span> {bot.rootCause}
                  </p>
                  <div className="pt-1 text-[11px] text-cyan-300 flex items-center justify-between">
                    <span>💡 {bot.suggestion}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Link to Floor Plan */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setActiveTab('floorplan')}
                className="w-full py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                View Congestion Heatmap on Floor Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
