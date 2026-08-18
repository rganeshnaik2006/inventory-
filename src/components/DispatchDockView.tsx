import React, { useState } from 'react';
import {
  Truck,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  Radio,
  FileText,
  Boxes,
  Send,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { DockBay } from '../types';

export const DispatchDockView: React.FC = () => {
  const { docks, orders, dispatchDock } = useWarehouse();
  const [selectedDockId, setSelectedDockId] = useState<string>(docks[0]?.id || '');
  const [showBolModal, setShowBolModal] = useState<boolean>(false);

  const activeDock = docks.find((d) => d.id === selectedDockId) || docks[0];
  const stagedOrders = orders.filter((o) => activeDock?.assignedOrderIds.includes(o.id));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Loading Docks & Carrier Dispatch Management
          </h2>
          <p className="text-xs text-slate-400">
            Monitor trailer capacity, carrier departure cutoffs, generate Bills of Lading (BOL), and dispatch outbound trailers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBolModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Generate Bill of Lading (BOL)
          </button>
        </div>
      </div>

      {/* Dock Bays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {docks.map((dock) => {
          const isSelected = dock.id === selectedDockId;
          const isDepartingSoon = dock.departureTimeMinutes > 0 && dock.departureTimeMinutes <= 30;

          return (
            <div
              key={dock.id}
              onClick={() => setSelectedDockId(dock.id)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-400/40 shadow-lg shadow-cyan-950'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm font-mono text-slate-100">
                    Dock Bay #{dock.dockNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      dock.status === 'dispatched'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : dock.status === 'inbound_receiving'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : isDepartingSoon
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}
                  >
                    {dock.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <div className="text-slate-200 font-semibold text-xs">{dock.carrier}</div>
                  <div className="text-[11px] text-slate-400">{dock.trailerType}</div>
                </div>

                {/* Departure Countdown */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Carrier Cutoff:</span>
                  <span
                    className={`font-mono font-bold flex items-center gap-1 ${
                      isDepartingSoon ? 'text-rose-400 font-bold' : 'text-slate-200'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {dock.status === 'dispatched' ? 'Departed' : `${dock.departureTimeMinutes}m remaining`}
                  </span>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Trailer Fill:</span>
                    <span className="font-mono text-slate-200">{dock.capacityPct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dock.capacityPct > 80 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${dock.capacityPct}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                {dock.status !== 'dispatched' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatchDock(dock.id);
                    }}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Trailer
                  </button>
                ) : (
                  <div className="text-center text-emerald-400 text-xs font-mono font-semibold">
                    ✓ Manifest Dispatched
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Dock Bay Detail Table & Staged Parcels */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-400" />
              Staged Orders in Bay #{activeDock?.dockNumber} ({activeDock?.carrier})
            </h3>
            <p className="text-xs text-slate-400">Manifest of all pallets & parcels ready for trailer loading</p>
          </div>
          <span className="font-mono text-xs text-cyan-300 font-bold">
            {stagedOrders.length} Parcels Staged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Service Level</th>
                <th className="py-2.5 px-3">Tracking Code</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Items & Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stagedOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono font-bold text-slate-100">{ord.orderNumber}</td>
                  <td className="py-3 px-3 text-slate-200">{ord.customerName}</td>
                  <td className="py-3 px-3 text-cyan-300 font-mono">{ord.shippingMethod}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{ord.trackingNumber || 'PENDING-TRK'}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.status === 'dispatched'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {ord.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {ord.items.reduce((acc, i) => acc + i.allocatedQty, 0)} units • {ord.totalWeightKg} kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill of Lading (BOL) Modal */}
      {showBolModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Standard Carrier Bill of Lading (BOL #BOL-2026-089)
              </h3>
              <button onClick={() => setShowBolModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            {/* Printable BOL Sheet */}
            <div className="p-4 rounded-lg bg-white text-slate-950 text-xs font-sans space-y-3 shadow-inner">
              <div className="flex justify-between items-start border-b-2 border-slate-950 pb-2">
                <div>
                  <h4 className="font-black text-lg">UNIFORM FREIGHT BILL OF LADING</h4>
                  <p className="text-[10px] font-mono">FACILITY: NEXUS WMS HUB-07</p>
                </div>
                <div className="text-right font-mono text-[10px]">
                  <p className="font-bold">DATE: {new Date().toLocaleDateString()}</p>
                  <p>CARRIER: {activeDock?.carrier}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] border-b border-slate-300 pb-2">
                <div>
                  <span className="font-bold block text-[9px] text-slate-500">SHIPPER:</span>
                  <p className="font-semibold">Nexus Automated Fulfillment Logistics</p>
                  <p>1000 Industrial Pkwy, Dock Bay #{activeDock?.dockNumber}</p>
                </div>
                <div>
                  <span className="font-bold block text-[9px] text-slate-500">CARRIER TRAILER ID:</span>
                  <p className="font-semibold">{activeDock?.carrier} #TR-9904</p>
                  <p>Seal #: SL-881944</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-[10px] text-slate-700">MANIFESTED SHIPMENT PACKAGES:</div>
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-slate-100 border-b border-slate-300">
                    <tr>
                      <th className="py-1 px-1">Order Ref</th>
                      <th className="py-1 px-1">Consignee</th>
                      <th className="py-1 px-1">Packages</th>
                      <th className="py-1 px-1 text-right">Weight (KG)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stagedOrders.map((o, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="py-1 px-1 font-mono font-bold">{o.orderNumber}</td>
                        <td className="py-1 px-1">{o.customerName}</td>
                        <td className="py-1 px-1">{(o.items || []).length} Box(es)</td>
                        <td className="py-1 px-1 text-right font-mono">{o.totalWeightKg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 border-t border-slate-300 text-[9px] text-slate-600 flex justify-between items-center">
                <span>Certified Hazardous Materials Declared: Lithium Batteries UN3480</span>
                <span className="font-mono">Driver Signature: [Electronic Sign: Verified]</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowBolModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  dispatchDock(activeDock.id);
                  setShowBolModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold cursor-pointer shadow"
              >
                Sign & Dispatch Trailer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
