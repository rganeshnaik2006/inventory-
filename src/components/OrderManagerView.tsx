import React, { useState } from 'react';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  X,
  Truck,
  Box,
  FileText,
  User,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { FulfillmentOrder, CustomerTier } from '../types';

export const OrderManagerView: React.FC = () => {
  const {
    orders,
    products,
    selectedOrder,
    setSelectedOrder,
    allocateOrderStock,
    autoAllocateAll,
    advanceOrderStage,
    resolveException,
    createNewOrder,
  } = useWarehouse();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Order Form State
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newTier, setNewTier] = useState<CustomerTier>('enterprise_vip');
  const [newShippingMethod, setNewShippingMethod] = useState<'Next-Day Air AM' | 'Priority Express' | 'Standard Freight'>('Next-Day Air AM');
  const [newCarrier, setNewCarrier] = useState<'FedEx Priority' | 'DHL Air Express' | 'UPS Next Day' | 'XPO Freight'>('FedEx Priority');
  const [newSlaMinutes, setNewSlaMinutes] = useState<number>(45);
  const [newSelectedSku, setNewSelectedSku] = useState<string>('SKU-LITH-900');
  const [newRequestedQty, setNewRequestedQty] = useState<number>(10);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      searchTerm === '' ||
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.items.some((i) => i.sku.toLowerCase().includes(searchTerm.toLowerCase()) || i.productName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    const matchesTier = tierFilter === 'all' || ord.customerTier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const getTierBadge = (tier: CustomerTier) => {
    switch (tier) {
      case 'enterprise_vip':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">VIP ENTERPRISE</span>;
      case 'prime_express':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">PRIME EXPRESS</span>;
      case 'standard_b2b':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">STANDARD B2B</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">RETAIL</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'prioritizing':
      case 'created':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60">ALLOCATING</span>;
      case 'allocated':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-700/60">ALLOCATED</span>;
      case 'wave_batched':
      case 'picking':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 animate-pulse">PICKING</span>;
      case 'packing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-700/60">PACKING</span>;
      case 'quality_check':
      case 'staged':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60">STAGED</span>;
      case 'dispatched':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">DISPATCHED</span>;
      case 'exception_held':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700/60">ON HOLD</span>;
      case 'split_fulfilled':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-700/60">SPLIT FULFILLED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName) return;

    createNewOrder({
      customerName: newCustomerName,
      customerTier: newTier,
      shippingMethod: newShippingMethod,
      carrier: newCarrier,
      slaMinutes: Number(newSlaMinutes),
      items: [{ sku: newSelectedSku, requestedQty: Number(newRequestedQty) }],
    });

    setNewCustomerName('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar & Action Hub */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order Number, Customer, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {['all', 'created', 'prioritizing', 'allocated', 'picking', 'packing', 'staged', 'dispatched'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer capitalize ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Action Buttons: Auto-Allocate All & Create Order */}
        <div className="flex items-center gap-2">
          <button
            onClick={autoAllocateAll}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            AI Auto-Allocate All
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Ingest New Order
          </button>
        </div>
      </div>

      {/* Main Order Table & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Orders Table (Left 8 Cols) */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <h2 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-400" />
              Active Fulfillment Queue ({filteredOrders.length})
            </h2>
            <span className="text-xs text-slate-400">Sorted by Multi-Factor Dynamic Priority</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Customer & Tier</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">SLA Timer</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  const hasShortage = order.exception?.type === 'stock_shortage';
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`hover:bg-slate-800/50 cursor-pointer transition ${
                        isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : ''
                      } ${hasShortage ? 'bg-amber-950/15' : ''}`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-100 flex items-center gap-1.5">
                        {order.orderNumber}
                        {order.exception && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-200 font-medium">{order.customerName}</div>
                        <div className="mt-0.5">{getTierBadge(order.customerTier)}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono font-bold text-xs ${
                              order.priorityScore > 90
                                ? 'text-rose-400'
                                : order.priorityScore > 75
                                ? 'text-amber-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {order.priorityScore}
                          </span>
                          <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                order.priorityScore > 90 ? 'bg-rose-500' : 'bg-cyan-500'
                              }`}
                              style={{ width: `${order.priorityScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span
                          className={`flex items-center gap-1 ${
                            order.slaDeadlineMinutes < 30
                              ? 'text-rose-400 font-bold animate-pulse'
                              : order.slaDeadlineMinutes < 60
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {order.slaDeadlineMinutes}m
                        </span>
                      </td>
                      <td className="py-3 px-3">{getStatusBadge(order.status)}</td>
                      <td className="py-3 px-3 text-right">
                        {order.status === 'prioritizing' || order.status === 'created' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (order.exception?.type === 'stock_shortage') {
                                allocateOrderStock(order.id, 'preempt_lower_priority');
                              } else {
                                allocateOrderStock(order.id, 'standard');
                              }
                            }}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer"
                          >
                            Allocate
                          </button>
                        ) : order.status !== 'dispatched' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              advanceOrderStage(order.id);
                            }}
                            className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                          >
                            Advance ➔
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-mono">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order Detailed Drawer (Right 4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          {selectedOrder ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-sm font-mono text-cyan-300">{selectedOrder.orderNumber}</h3>
                  <p className="text-slate-400 text-[11px]">{selectedOrder.customerName}</p>
                </div>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Exception Action Callout if Exists */}
              {selectedOrder.exception && (
                <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-500/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    {selectedOrder.exception.title}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{selectedOrder.exception.details}</p>

                  <div className="pt-2 space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Resolutions:</span>
                    {selectedOrder.exception.suggestedResolutions.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => resolveException(selectedOrder.id, res.id)}
                        className="w-full text-left p-2 rounded bg-slate-900/90 hover:bg-slate-800 border border-amber-700/50 text-[11px] text-slate-200 flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="truncate">{res.title}</span>
                        <span className="text-cyan-400 font-mono text-[10px] ml-1">Apply</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Items in Order */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">Line Items:</span>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-semibold text-slate-200">{item.sku}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[170px]">{item.productName}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">Location: {item.locationBin}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-slate-100">
                        {item.allocatedQty} / {item.requestedQty}
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping & Carrier Info */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Shipping Service:</span>
                  <span className="text-slate-200 font-medium">{selectedOrder.shippingMethod}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Assigned Carrier:</span>
                  <span className="text-cyan-300 font-medium">{selectedOrder.carrier}</span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div className="flex justify-between text-slate-400">
                    <span>Tracking Number:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedOrder.trackingNumber}</span>
                  </div>
                )}
              </div>

              {/* Audit Trail Timeline */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <FileText className="w-3 h-3 text-cyan-400" />
                  Lifecycle Audit Logs:
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedOrder.auditLogs.map((log, i) => (
                    <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[10px] space-y-0.5">
                      <div className="flex justify-between text-slate-400 font-mono">
                        <span className="text-cyan-400">{log.stage}</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="text-slate-300">{log.note}</p>
                      <div className="text-slate-500 text-[9px]">Logged by: {log.userOrAi}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage Advance Button */}
              {selectedOrder.status !== 'dispatched' && (
                <button
                  onClick={() => advanceOrderStage(selectedOrder.id)}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Advance Stage ➔</span>
                </button>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs space-y-2">
              <Boxes className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
              <p>Select any order from the queue to inspect line items, priority metrics, and audit history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Ingest New Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Ingest New Warehouse Order
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Customer / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MedTech Robotics Corp"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Customer Tier</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as CustomerTier)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="enterprise_vip">Enterprise VIP ($450/hr SLA)</option>
                    <option value="prime_express">Prime Express</option>
                    <option value="standard_b2b">Standard B2B</option>
                    <option value="retail">Retail Consumer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">SLA Deadline (Minutes)</label>
                  <input
                    type="number"
                    min={15}
                    max={480}
                    value={newSlaMinutes}
                    onChange={(e) => setNewSlaMinutes(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Shipping Method</label>
                  <select
                    value={newShippingMethod}
                    onChange={(e) => setNewShippingMethod(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Next-Day Air AM">Next-Day Air AM</option>
                    <option value="Priority Express">Priority Express</option>
                    <option value="Standard Freight">Standard Freight</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Carrier Route</label>
                  <select
                    value={newCarrier}
                    onChange={(e) => setNewCarrier(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="FedEx Priority">FedEx Priority</option>
                    <option value="DHL Air Express">DHL Air Express</option>
                    <option value="UPS Next Day">UPS Next Day</option>
                    <option value="XPO Freight">XPO Freight</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-semibold">SKU Demand & Live Stock Check</div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newSelectedSku}
                    onChange={(e) => setNewSelectedSku(e.target.value)}
                    className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.sku}>
                        {p.sku} (ATP: {p.availableToPromise})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newRequestedQty}
                    onChange={(e) => setNewRequestedQty(Number(e.target.value))}
                    className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold cursor-pointer shadow"
                >
                  Ingest & Prioritize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
