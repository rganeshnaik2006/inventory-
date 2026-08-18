import React, { useState } from 'react';
import {
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingDown,
  Layers,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Footprints,
  Cpu,
  RefreshCw,
  Boxes,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { OptimizedPickStep } from '../types';

export const PickingOptimizationView: React.FC = () => {
  const { optimizedRoute, completePickStep } = useWarehouse();
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [activeStepModal, setActiveStepModal] = useState<OptimizedPickStep | null>(null);

  const steps = optimizedRoute?.steps || [];
  const ordersBatched = optimizedRoute?.ordersBatched || [];
  const completedCount = steps.filter((s) => s.status === 'picked').length;
  const progressPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            <Navigation className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                AI Pick Route & Sequence Optimization
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                S-SHAPE ALGORITHM + TSP HEURISTIC
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Consolidated multi-order batching with shortest-path navigation, minimizing floor deadhead transit.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 cursor-pointer transition self-start md:self-auto"
        >
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Why this route sequence?</span>
        </button>
      </div>

      {/* Comparison Metrics Strip (Standard vs AI Optimized) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Total Travel Distance</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {optimizedRoute.totalDistanceMeters}m
            </span>
            <span className="text-xs text-slate-500 line-through">
              {optimizedRoute.standardBaselineDistanceMeters}m
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-{optimizedRoute.distanceSavedPct}% Distance Reduction</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Estimated Wave Duration</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {optimizedRoute.estimatedTimeMinutes} min
            </span>
            <span className="text-xs text-slate-500 line-through">
              {optimizedRoute.standardBaselineTimeMinutes} min
            </span>
          </div>
          <div className="mt-1 text-[11px] text-cyan-400 font-semibold">
            Saved {optimizedRoute.standardBaselineTimeMinutes - optimizedRoute.estimatedTimeMinutes} minutes pick time
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Batched Order Wave</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {ordersBatched.length} Orders
            </span>
            <span className="text-xs text-purple-300 font-mono">
              {steps.length} Bin Picks
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 truncate">
            {ordersBatched.join(' • ')}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-slate-400 text-xs font-medium">Wave Execution Status</div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-300 font-mono">
              <span>{completedCount} of {steps.length} items</span>
              <span className="font-bold text-emerald-400">{progressPct}%</span>
            </div>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 mt-2 border border-slate-800 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Explanation Rationale Panel */}
      {showExplanation && (
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/60 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
          <div className="font-bold text-emerald-300 flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4" /> AI Sequence Rationale & Algorithm Insights:
          </div>
          <p className="leading-relaxed">
            {optimizedRoute?.aiSequenceRationale || 'Route calculated using traveling salesperson heuristic with S-Shape routing.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">Deadhead Elimination:</span>
              <div className="text-slate-200 font-bold mt-0.5">S-Shape serpentine single traversal</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">Cart Capacity:</span>
              <div className="text-slate-200 font-bold mt-0.5">Multi-tote tote divider partition</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">Drop-off Destination:</span>
              <div className="text-slate-200 font-bold mt-0.5">Packing Station #01 Fast-Lane</div>
            </div>
          </div>
        </div>
      )}

      {/* Ordered Step-by-Step Picking Pathway */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
            <Footprints className="w-4 h-4 text-emerald-400" />
            Optimized Pick Pathway Sequence (Order-Batched)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Tote ID: {optimizedRoute?.waveId || 'WAVE-OPT'}
          </span>
        </div>

        <div className="p-4 space-y-3">
          {steps.map((step) => {
            const isPicked = step.status === 'picked';
            const isInTransit = step.status === 'in_transit';

            return (
              <div
                key={step.stepNumber}
                className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPicked
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : isInTransit
                    ? 'bg-emerald-950/30 border-emerald-600/80 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  {/* Step Number Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 font-mono ${
                      isPicked
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : isInTransit
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {isPicked ? <Check className="w-4 h-4" /> : `#${step.stepNumber}`}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{step.binCode}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {step.zone} • {step.aisle} • {step.shelfLevel}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800">
                        For {step.orderNumber}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 mt-1 font-medium">
                      {step.productName} ({step.sku})
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3 font-mono">
                      <span>Quantity: <strong className="text-emerald-300">{step.quantityToPick} units</strong></span>
                      <span>Transit leg: {step.distanceFromPrevMeters}m</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {isPicked ? (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Pick Confirmed
                    </span>
                  ) : (
                    <button
                      onClick={() => completePickStep(step.stepNumber)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        isInTransit
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> Confirm Scan & Pick
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
