import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Zap,
  Clock,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { WarehouseAlert, AlertSeverity, AlertCategory } from '../types';

export const AlertCenterView: React.FC = () => {
  const { alerts, markAlertRead, resolveAlert, setActiveTab } = useWarehouse();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showWhyModal, setShowWhyModal] = useState<WarehouseAlert | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'all') return true;
    return a.severity.toLowerCase() === severityFilter.toLowerCase();
  });

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
            Critical Alert
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

  const getCategoryBadge = (category: AlertCategory) => {
    switch (category) {
      case 'stockout_risk':
        return 'Stockout Risk';
      case 'delayed_fulfillment':
        return 'SLA Delay';
      case 'picking_bottleneck':
        return 'Floor Bottleneck';
      case 'demand_spike':
        return 'Demand Spike';
      case 'supplier_delay':
        return 'Supplier Delay';
      case 'low_inventory':
        return 'Low Inventory';
      case 'overstock':
        return 'Overstock';
      default:
        return 'Inventory Alert';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/20 ring-1 ring-rose-400/30">
            <Bell className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                AI Operational Alert Center & Live Anomaly Notifications
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                ACTIVE MONITORING
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live anomaly alerts with clear severities, affected entities, and one-click operational resolutions.
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

      {/* Main Alerts Feed */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-slate-100">Active Warehouse Alerts</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
              {alerts.filter((a) => !a.isResolved).length} Pending Action
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total {filteredAlerts.length} Alerts
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                alert.isResolved
                  ? 'bg-slate-950/40 opacity-60'
                  : !alert.isRead
                  ? 'bg-slate-900/90 border-l-4 border-rose-500'
                  : 'bg-slate-900/60'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getSeverityBadge(alert.severity)}
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-200 border border-slate-700">
                    {getCategoryBadge(alert.category)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {alert.timestamp}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-100">{alert.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.explanation}</p>
                </div>

                {/* Affected Entities Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Impacted:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                    {alert.affectedEntity}
                  </span>
                  {alert.metricImpact && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 text-rose-300 border border-rose-800">
                      {alert.metricImpact}
                    </span>
                  )}
                </div>

                {/* Actionable Directive Bar */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-cyan-400 flex items-center gap-1.5 font-medium">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Suggested Action: {alert.recommendedAction}</span>
                  </div>
                  <button
                    onClick={() => setShowWhyModal(alert)}
                    className="text-slate-400 hover:text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3 text-rose-400" /> Why?
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                {alert.isResolved ? (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Resolved
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950"
                    >
                      <Check className="w-3.5 h-3.5" /> Resolve Alert
                    </button>
                  </>
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
                <span>Alert Diagnostics & Operational Reasoning</span>
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
                  Target Alert:
                </span>
                <div className="font-bold text-slate-100 text-sm mt-0.5">
                  {showWhyModal.title}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  Telemetry Trigger Details:
                </span>
                <p className="text-slate-300 leading-relaxed">{showWhyModal.explanation}</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-cyan-300 font-mono">
                  Trigger source: WMS Floor Telemetry Engine
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowWhyModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
