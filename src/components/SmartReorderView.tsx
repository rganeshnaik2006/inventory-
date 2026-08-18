import React, { useState } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  HelpCircle,
  Truck,
  Building,
  DollarSign,
  PackageCheck,
  Check,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { SmartReorderItem, ReorderPriority } from '../types';

export const SmartReorderView: React.FC = () => {
  const { smartReorders, approveReorder, dismissReorder, setActiveTab } = useWarehouse();
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedItemForReview, setSelectedItemForReview] = useState<SmartReorderItem | null>(null);
  const [confirmApproveItem, setConfirmApproveItem] = useState<SmartReorderItem | null>(null);
  const [showWhyModal, setShowWhyModal] = useState<SmartReorderItem | null>(null);

  const filteredReorders = smartReorders.filter((item) => {
    if (priorityFilter === 'all') return true;
    return item.priority.toLowerCase() === priorityFilter.toLowerCase();
  });

  const getPriorityBadge = (priority: ReorderPriority) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
            High Priority
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: SmartReorderItem['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> PO Sent
          </span>
        );
      case 'dismissed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-500 border border-slate-800">
            Dismissed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800 animate-pulse">
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30">
            <RefreshCw className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                Smart Automated Reorder & Supplier PO Execution
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                ATP & DEMAND OPTIMIZED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculates net requirements (Current Stock - Reserved + Incoming vs 30d Forecast) with clear actionable directives.
            </p>
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {['all', 'critical', 'high', 'medium', 'low'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setPriorityFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                priorityFilter === lvl
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reorders Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <span>Reorder Purchase Recommendations</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
              {filteredReorders.length} Items
            </span>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Total Capital Pending Approval:{' '}
            <strong className="text-emerald-400">
              $
              {filteredReorders
                .filter((r) => r.status === 'pending_review')
                .reduce((acc, cur) => acc + cur.estimatedCost, 0)
                .toLocaleString()}
            </strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-4">Current / Reserved</th>
                <th className="py-3 px-4">30d Demand (Est)</th>
                <th className="py-3 px-4">Reorder Qty & Cost</th>
                <th className="py-3 px-4 min-w-[280px]">Recommended Action</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredReorders.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-800/40 transition ${
                    item.status === 'approved' ? 'bg-emerald-950/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {getPriorityBadge(item.priority)}
                      {getStatusBadge(item.status)}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100">{item.sku}</div>
                    <div className="text-slate-400 text-[11px] truncate max-w-xs">{item.productName}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Supplier: {item.supplier} ({item.leadTimeDays}d lead)
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <div className="text-slate-200 font-semibold">{item.currentStock} in stock</div>
                    <div className="text-[11px] text-amber-400">{item.reservedStock} reserved</div>
                    <div className="text-[10px] text-slate-500">
                      ATP: {item.currentStock - item.reservedStock} units
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <div className="text-purple-300 font-bold">{item.predictedDemand30d} units</div>
                    <div className="text-[10px] text-slate-500">Reorder Pt: {item.reorderPoint} u</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <div className="text-emerald-400 font-bold text-sm">
                      +{item.recommendedReorderQty} units
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ${item.estimatedCost.toLocaleString()} (${item.unitPrice}/u)
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <p className="text-slate-200 text-[11px] leading-relaxed">
                        {item.recommendedAction}
                      </p>
                      <button
                        onClick={() => setShowWhyModal(item)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" /> Why this quantity?
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {item.status === 'pending_review' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedItemForReview(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition cursor-pointer flex items-center gap-1"
                          title="Review calculation details"
                        >
                          <Eye className="w-3 h-3" /> Review
                        </button>
                        <button
                          onClick={() => setConfirmApproveItem(item)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3 h-3" /> Approve PO
                        </button>
                        <button
                          onClick={() => dismissReorder(item.id)}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 transition cursor-pointer"
                          title="Dismiss Recommendation"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.reviewedAt ? `Approved ${item.reviewedAt}` : 'Dismissed'}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog for PO Approval */}
      {confirmApproveItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400 pb-3 border-b border-slate-800">
              <PackageCheck className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-100">
                Confirm Supplier Purchase Order Transmission
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                You are authorizing an automated Purchase Order to{' '}
                <strong className="text-slate-100">{confirmApproveItem.supplier}</strong> for:
              </p>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">SKU:</span>
                  <span className="text-slate-100 font-bold">{confirmApproveItem.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity:</span>
                  <span className="text-emerald-400 font-bold">
                    +{confirmApproveItem.recommendedReorderQty} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Capital:</span>
                  <span className="text-slate-100 font-bold">
                    ${confirmApproveItem.estimatedCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Lead Time:</span>
                  <span className="text-slate-300">{confirmApproveItem.leadTimeDays} days</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setConfirmApproveItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  approveReorder(confirmApproveItem.id);
                  setConfirmApproveItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-md shadow-emerald-950"
              >
                <Check className="w-3.5 h-3.5" /> Transmit PO Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Why?" Explanation Modal */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>AI Reorder Math & Rationale ("Why?")</span>
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
                  Target Product:
                </span>
                <div className="font-bold text-slate-100 text-sm mt-0.5">
                  {showWhyModal.sku} - {showWhyModal.productName}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Deterministic Stock Math:
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                  <div>Physical Stock: {showWhyModal.currentStock} u</div>
                  <div>Reserved Stock: {showWhyModal.reservedStock} u</div>
                  <div>Available ATP: {showWhyModal.currentStock - showWhyModal.reservedStock} u</div>
                  <div>30-Day Demand: {showWhyModal.predictedDemand30d} u</div>
                </div>
                <p className="text-slate-300 text-[11px] pt-1 border-t border-slate-800/80 leading-relaxed">
                  {showWhyModal.reasoning}
                </p>
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
