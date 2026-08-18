import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Activity,
  Check,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { InventoryAnomaly, AnomalySeverity } from '../types';

export const AnomalyDetectionView: React.FC = () => {
  const { anomalies, resolveAnomaly } = useWarehouse();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showWhyModal, setShowWhyModal] = useState<InventoryAnomaly | null>(null);

  const filteredAnomalies = anomalies.filter((a) => {
    if (severityFilter === 'all') return true;
    return a.severity.toLowerCase() === severityFilter.toLowerCase();
  });

  const getSeverityBadge = (severity: AnomalySeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
            Critical Discrepancy
          </span>
        );
      case 'warning':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
            Warning
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
            Info
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sudden_inventory_decrease':
        return 'Sudden Stock Drop';
      case 'unusual_demand_spike':
        return 'Unusual Demand Spike';
      case 'repeated_inventory_mismatch':
        return 'Damage / Seal Mismatch';
      case 'overstock_accumulation':
        return 'Overstock Accumulation';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-500/20 ring-1 ring-rose-400/30">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                AI Inventory Anomaly & Stock Discrepancy Detection
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                HEURISTIC PATTERN RECOGNITION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous monitoring for bin count deviations, unexpected depletion rates, repeated item damage, and misplaced bins.
            </p>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {['all', 'critical', 'warning', 'info'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSeverityFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                severityFilter === lvl
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Active Anomalies</div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">
            {anomalies.filter((a) => !a.isResolved).length} Detected
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Across warehouse sectors</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Critical Stock Hazards</div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {anomalies.filter((a) => a.severity === 'critical' && !a.isResolved).length} Items
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Requires immediate cycle audit</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Demand Volatility</div>
          <div className="mt-2 text-2xl font-bold font-mono text-purple-400">+280% Peak</div>
          <div className="mt-1 text-[11px] text-slate-500">Localized to LiDAR mod lines</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Resolved Anomalies</div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {anomalies.filter((a) => a.isResolved).length} Audited
          </div>
          <div className="mt-1 text-[11px] text-emerald-400">Reconciled to ERP</div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            Detected Discrepancies & AI Investigative Findings
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {filteredAnomalies.length} Items Listed
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredAnomalies.map((anom) => (
            <div
              key={anom.id}
              className={`p-5 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                anom.isResolved
                  ? 'bg-slate-950/40 opacity-60'
                  : 'bg-slate-900/60 hover:bg-slate-800/30'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getSeverityBadge(anom.severity)}
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-200 border border-slate-700">
                    {getTypeLabel(anom.patternType)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    SKU: <strong className="text-cyan-300">{anom.sku}</strong>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Detected: {anom.detectedAt}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-100">{anom.productName}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {anom.detectedPattern}
                  </p>
                </div>

                {/* Explanation & Variance Details */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400 font-mono">
                    <strong className="text-slate-200">Metric Impact:</strong> {anom.metricChange}
                  </div>
                  <div className="text-slate-300">
                    <strong className="text-slate-400">Root Cause Hypothesis:</strong>{' '}
                    {anom.possibleExplanation}
                  </div>
                </div>

                {/* AI Resolution Directive */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Directive: {anom.recommendedAction}</span>
                  </div>
                  <button
                    onClick={() => setShowWhyModal(anom)}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" /> Why?
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                {anom.isResolved ? (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Reconciled & Audited
                  </span>
                ) : (
                  <button
                    onClick={() => resolveAnomaly(anom.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950"
                  >
                    <Check className="w-3.5 h-3.5" /> Resolve & Update ERP
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* "Why?" Explanation Modal */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>Anomaly Detection Reasoning ("Why?")</span>
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
                  Target Discrepancy:
                </span>
                <div className="font-bold text-slate-100 text-sm mt-0.5">
                  {showWhyModal.sku} - {showWhyModal.productName}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  Pattern Recognition Diagnostics:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {showWhyModal.possibleExplanation}
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                  Confidence Score: 96% based on scanner telemetry logs and warehouse pick timestamps.
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowWhyModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
