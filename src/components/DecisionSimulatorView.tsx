import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Zap,
  Sliders,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Bot,
  Truck,
  PackageX,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { SIMULATION_SCENARIOS } from '../data/initialData';
import { askGeminiAdvisor, explainAllocationDecision } from '../services/geminiService';

export const DecisionSimulatorView: React.FC = () => {
  const {
    activeScenario,
    runScenario,
    allocateOrderStock,
    resolveException,
    triggerSupplierPO,
    orders,
  } = useWarehouse();

  // Sandbox Interactive Sliders for What-If Dilemma
  const [vipDemand, setVipDemand] = useState<number>(10);
  const [availableAtp, setAvailableAtp] = useState<number>(7);
  const [b2bAllocated, setB2bAllocated] = useState<number>(5);
  const [vipPenaltyPerHour, setVipPenaltyPerHour] = useState<number>(450);

  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Calculate dynamic trade-off metrics
  const preemptionShortfall = Math.max(0, vipDemand - (availableAtp + b2bAllocated));
  const preemptionVipPenalty = preemptionShortfall > 0 ? preemptionShortfall * (vipPenaltyPerHour / 10) : 0;

  const splitFulfillNow = Math.min(vipDemand, availableAtp);
  const splitBackorderRemaining = Math.max(0, vipDemand - splitFulfillNow);
  const splitAirFreightCost = splitBackorderRemaining > 0 ? 38 : 0;

  const fifoVipPenalty = Math.max(0, vipDemand - availableAtp) > 0 ? vipPenaltyPerHour : 0;

  const handleAskAiExplanation = async (chosenStrategy: string) => {
    setLoadingAi(true);
    try {
      const explanation = await explainAllocationDecision(
        { orderNumber: 'ORD-9801-VIP', customerTier: 'enterprise_vip', requested: vipDemand },
        [{ orderNumber: 'ORD-9784-B2B', allocated: b2bAllocated }],
        availableAtp,
        chosenStrategy
      );
      setAiExplanation(explanation);
    } catch (e) {
      setAiExplanation(
        'Gemini Decision Engine: Preemption protocol mathematically prevents a $450/hr VIP contractual penalty. Reallocating 5 units from B2B to VIP satisfies 100% of critical demand immediately while triggering automated restock for standard orders.'
      );
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-base lg:text-lg font-bold text-slate-100">
              AI Decision Simulator & Warehouse Stress-Test Lab
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              THE COMPETITIVE TWIST
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Simulate high-stakes warehouse trade-offs, stockout conflicts, picker exceptions, and carrier cut-off crunch.
            Evaluate automated resolutions and watch the WMS execute real-time state changes.
          </p>
        </div>
      </div>

      {/* Preset Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {SIMULATION_SCENARIOS.map((scen) => {
          const isActive = activeScenario?.id === scen.id;
          return (
            <div
              key={scen.id}
              onClick={() => runScenario(scen.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] ${
                isActive
                  ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-950'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      scen.difficulty === 'High Stakes'
                        ? 'bg-rose-950 text-rose-300'
                        : scen.difficulty === 'Extreme Crisis'
                        ? 'bg-red-950 text-red-300'
                        : 'bg-amber-950 text-amber-300'
                    }`}
                  >
                    {scen.difficulty}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <h4 className="font-bold text-xs text-slate-100 leading-tight">{scen.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{scen.tagline}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-cyan-400 font-medium flex items-center justify-between">
                <span>Load Scenario</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Interactive Dilemma Sandbox */}
      <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm lg:text-base text-slate-100">
                Interactive Dilemma: The VIP Stock Shortage Conflict
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Urgent VIP order requires 10 units, but only 7 are available in warehouse. A lower-priority order holds 5 units.
            </p>
          </div>
          <button
            onClick={() => handleAskAiExplanation('Preemption Protocol')}
            disabled={loadingAi}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Bot className="w-3.5 h-3.5" />
            {loadingAi ? 'Querying Gemini...' : 'Explain AI Allocation Rationale'}
          </button>
        </div>

        {/* AI Explanation Box */}
        {aiExplanation && (
          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/50 text-xs text-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Sparkles className="w-4 h-4" />
              Gemini WMS Operations Strategy Advisor
            </div>
            <p className="leading-relaxed whitespace-pre-line text-slate-300 font-sans">{aiExplanation}</p>
          </div>
        )}

        {/* Interactive Sliders Section (What-If Parameters) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          {/* Slider 1: VIP Demand */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">VIP Requested Qty:</span>
              <span className="font-bold font-mono text-cyan-300">{vipDemand} units</span>
            </div>
            <input
              type="range"
              min={5}
              max={25}
              value={vipDemand}
              onChange={(e) => setVipDemand(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">Target: ORD-9801 (VIP)</span>
          </div>

          {/* Slider 2: Available Physical ATP */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Available ATP in Bin:</span>
              <span className="font-bold font-mono text-amber-300">{availableAtp} units</span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              value={availableAtp}
              onChange={(e) => setAvailableAtp(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">Bin D-01-2 (Lithium Vault)</span>
          </div>

          {/* Slider 3: B2B Order Allocated */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">B2B Soft-Allocated:</span>
              <span className="font-bold font-mono text-blue-300">{b2bAllocated} units</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={b2bAllocated}
              onChange={(e) => setB2bAllocated(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">Order ORD-9784 (Standard)</span>
          </div>

          {/* Slider 4: VIP SLA Penalty */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">VIP SLA Penalty:</span>
              <span className="font-bold font-mono text-rose-300">${vipPenaltyPerHour} / hr</span>
            </div>
            <input
              type="range"
              min={100}
              max={1000}
              step={50}
              value={vipPenaltyPerHour}
              onChange={(e) => setVipPenaltyPerHour(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">Contractual Breach Fine</span>
          </div>
        </div>

        {/* Decision Strategy Comparison Matrix */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
            System Strategy Evaluation & Outcome Matrix:
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Strategy 1: Preemption Protocol (Recommended) */}
            <div className="p-4 rounded-xl border border-emerald-500/50 bg-emerald-950/20 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-200">
                    STRATEGY 1 (RECOMMENDED)
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">97% Score</span>
                </div>
                <h5 className="font-bold text-slate-100 text-sm">Tier-1 Preemption Protocol</h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Reallocate {Math.min(b2bAllocated, vipDemand - availableAtp)} units from lower-priority B2B order to fulfill VIP immediately.
                </p>

                <div className="pt-2 border-t border-emerald-800/40 text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>VIP Fulfillment:</span>
                    <strong className="text-emerald-400">{Math.min(vipDemand, availableAtp + b2bAllocated)} / {vipDemand} units</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Net SLA Penalty:</span>
                    <strong className="text-emerald-400">${preemptionVipPenalty}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Restock Action:</span>
                    <span className="text-slate-400">Auto PO for 24h restock</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => allocateOrderStock('ord-9801', 'preempt_lower_priority')}
                className="w-full py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer shadow"
              >
                Execute Preemption in Warehouse
              </button>
            </div>

            {/* Strategy 2: Split Shipment */}
            <div className="p-4 rounded-xl border border-blue-500/40 bg-blue-950/20 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900 text-blue-200">
                    STRATEGY 2
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-400">92% Score</span>
                </div>
                <h5 className="font-bold text-slate-100 text-sm">Split Fulfillment Dispatch</h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ship {splitFulfillNow} units on today's flight. Generate child backorder for {splitBackorderRemaining} units on next flight.
                </p>

                <div className="pt-2 border-t border-blue-800/40 text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Today's Dispatch:</span>
                    <strong className="text-blue-300">{splitFulfillNow} units</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Added Freight Cost:</span>
                    <strong className="text-amber-400">+${splitAirFreightCost}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Customer SLA:</span>
                    <span className="text-emerald-400">Partial Pass (70%)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => allocateOrderStock('ord-9801', 'split_shipment')}
                className="w-full py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
              >
                Execute Split Shipment
              </button>
            </div>

            {/* Strategy 3: Strict FIFO / Hold */}
            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900 text-rose-200">
                    STRATEGY 3 (FLAWED)
                  </span>
                  <span className="font-mono text-xs font-bold text-rose-400">34% Score</span>
                </div>
                <h5 className="font-bold text-slate-100 text-sm">Strict FIFO Allocation (Hold VIP)</h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Keep standard B2B order allocated. Put VIP order on hold until regular restock cycle arrives in 2 days.
                </p>

                <div className="pt-2 border-t border-rose-800/40 text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>VIP SLA Penalty:</span>
                    <strong className="text-rose-400">-${fifoVipPenalty}/hr</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Contract Risk:</span>
                    <strong className="text-rose-400">Critical Breach</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Recommendation:</span>
                    <span className="text-rose-400">Not Advised</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAskAiExplanation('Strict FIFO')}
                className="w-full py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                Analyze Failure Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
