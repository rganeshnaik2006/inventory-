import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Sliders,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { WhatIfScenarioResult } from '../types';

export const WhatIfSimulatorView: React.FC = () => {
  const { runWhatIfSimulation, setActiveTab } = useWarehouse();

  const [demandChangePct, setDemandChangePct] = useState<number>(25);
  const [newIncomingOrdersCount, setNewIncomingOrdersCount] = useState<number>(15);
  const [supplierDelayDays, setSupplierDelayDays] = useState<number>(3);
  const [deadlineBufferMinutes, setDeadlineBufferMinutes] = useState<number>(20);

  const [simulationResult, setSimulationResult] = useState<WhatIfScenarioResult>(() =>
    runWhatIfSimulation({
      demandChangePct: 25,
      newIncomingOrdersCount: 15,
      supplierDelayDays: 3,
      deadlineBufferMinutes: 20,
    })
  );

  const handleRunSimulation = () => {
    const res = runWhatIfSimulation({
      demandChangePct,
      newIncomingOrdersCount,
      supplierDelayDays,
      deadlineBufferMinutes,
    });
    setSimulationResult(res);
  };

  const handleReset = () => {
    setDemandChangePct(0);
    setNewIncomingOrdersCount(0);
    setSupplierDelayDays(0);
    setDeadlineBufferMinutes(0);
    const res = runWhatIfSimulation({
      demandChangePct: 0,
      newIncomingOrdersCount: 0,
      supplierDelayDays: 0,
      deadlineBufferMinutes: 0,
    });
    setSimulationResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/30">
            <FlaskConical className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                AI What-If Operational Scenario Simulator
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                PREDICTIVE CAPACITY MODELING
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate demand surges, supplier lead time delays, and sudden order spikes to forecast stockouts and SLA impacts.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 cursor-pointer transition self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Main Grid: Parameters on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Scenario Controls */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Scenario Control Parameters
            </h3>
            <span className="text-xs text-slate-400 font-mono">Dynamic Inputs</span>
          </div>

          <div className="space-y-5 text-xs">
            {/* Demand Spike Slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Projected Demand Surge / Drop:</span>
                <span className="text-indigo-400 font-mono font-bold">
                  {demandChangePct >= 0 ? `+${demandChangePct}%` : `${demandChangePct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="100"
                step="5"
                value={demandChangePct}
                onChange={(e) => setDemandChangePct(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-50% (Slump)</span>
                <span>Baseline (0%)</span>
                <span>+100% (Flash Surge)</span>
              </div>
            </div>

            {/* Influx of Immediate VIP Orders */}
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Immediate New Influx Orders:</span>
                <span className="text-cyan-400 font-mono font-bold">
                  +{newIncomingOrdersCount} Orders
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={newIncomingOrdersCount}
                onChange={(e) => setNewIncomingOrdersCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 Orders</span>
                <span>25 Orders</span>
                <span>50 Orders</span>
              </div>
            </div>

            {/* Supplier Transit Delay */}
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Supplier Sourcing / Inbound Delay:</span>
                <span className="text-amber-400 font-mono font-bold">
                  +{supplierDelayDays} Days Delay
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="1"
                value={supplierDelayDays}
                onChange={(e) => setSupplierDelayDays(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>On Time (0d)</span>
                <span>7 Days Delay</span>
                <span>14 Days Delay</span>
              </div>
            </div>

            {/* Deadline Buffer */}
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Carrier Cutoff Time Compression:</span>
                <span className="text-rose-400 font-mono font-bold">
                  -{deadlineBufferMinutes} Minutes
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={deadlineBufferMinutes}
                onChange={(e) => setDeadlineBufferMinutes(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Normal Cutoff</span>
                <span>-30 Min Buffer</span>
                <span>-60 Min Severe Cutoff</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Run Predictive Simulation</span>
          </button>
        </div>

        {/* Right Column: AI Simulation Results & Impacts */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Simulation Impact & Operations Forecast
                </h3>
                <span className="text-xs text-slate-400">{simulationResult.scenarioTitle}</span>
              </div>

              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono self-start sm:self-auto ${
                  simulationResult.projectedSlaImpactPct < 85
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                Projected SLA: {simulationResult.projectedSlaImpactPct}%
              </span>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[11px]">Affected SKUs</span>
                <div className="text-rose-400 text-lg font-bold mt-1">
                  {simulationResult.affectedProductsCount} Products
                </div>
                <span className="text-[10px] text-slate-500">Predicted Stockouts</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[11px]">Units Deficit</span>
                <div className="text-amber-400 text-lg font-bold mt-1">
                  +{simulationResult.additionalUnitsRequired} Units
                </div>
                <span className="text-[10px] text-slate-500">Immediate Need</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[11px]">Est. Capital Required</span>
                <div className="text-emerald-400 text-lg font-bold mt-1">
                  ${simulationResult.estimatedAdditionalCost.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500">Replenishment Cost</span>
              </div>
            </div>

            {/* Stockout Vulnerability List */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Projected Stockout SKUs Under Scenario:</span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {(simulationResult?.projectedStockoutProducts || []).length} Items
                </span>
              </div>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {(simulationResult?.projectedStockoutProducts || []).length > 0 ? (
                  (simulationResult?.projectedStockoutProducts || []).map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-100 font-mono">{p.sku}</span>
                        <span className="text-slate-400 ml-2">{p.productName}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-amber-400 font-semibold">
                          Stockout in Day {p.projectedStockoutDay}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          Need +{p.additionalQtyNeeded} u
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-lg bg-slate-950 text-center text-xs text-emerald-400 font-mono">
                    ✓ All inventory stocks remain adequate under this stress level.
                  </div>
                )}
              </div>
            </div>

            {/* AI Action Directives */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Recommended Operational Mitigations:
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {(simulationResult?.operationalRecommendations || []).map((rec, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">▪</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Simulation calculates deterministic burn-rate mathematics.
            </span>
            <button
              onClick={() => setActiveTab('reorder')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              Go to Smart Reorder POs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
