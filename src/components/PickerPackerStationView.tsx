import React, { useState } from 'react';
import {
  Boxes,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Barcode,
  Package,
  Printer,
  Scale,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  PackageX,
  Truck,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { warehouseSound } from '../utils/audioFeedback';

export const PickerPackerStationView: React.FC = () => {
  const {
    waves,
    packStations,
    orders,
    pickItemInWave,
    packOrderAtStation,
    reportDamage,
  } = useWarehouse();

  const [activeMode, setActiveMode] = useState<'picker' | 'packer'>('picker');
  const [selectedWaveId, setSelectedWaveId] = useState<string>(waves[0]?.id || '');
  const [selectedStationId, setSelectedStationId] = useState<string>(packStations[0]?.id || '');

  // Packing Bench State
  const [selectedBox, setSelectedBox] = useState<'Box-A (Small)' | 'Box-B (Medium)' | 'Box-C (Heavy/Large)' | 'Poly-Mailer'>('Box-B (Medium)');
  const [scaleWeight, setScaleWeight] = useState<number>(4.85);
  const [printedLabelOrder, setPrintedLabelOrder] = useState<any | null>(null);

  // Damage reporting modal
  const [damageModalData, setDamageModalData] = useState<{
    orderId: string;
    sku: string;
    binCode: string;
  } | null>(null);

  const activeWave = waves.find((w) => w.id === selectedWaveId) || waves[0];
  const activeStation = packStations.find((s) => s.id === selectedStationId) || packStations[0];
  const packingOrder = orders.find((o) => o.status === 'packing' || o.id === activeStation?.currentOrderId);

  const handlePackSubmit = () => {
    if (!packingOrder || !activeStation) return;
    packOrderAtStation(activeStation.id, packingOrder.id, selectedBox, scaleWeight);
    setPrintedLabelOrder(packingOrder);
  };

  const handleConfirmDamage = () => {
    if (!damageModalData) return;
    reportDamage(damageModalData.orderId, damageModalData.sku, damageModalData.binCode, 1);
    setDamageModalData(null);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Header */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMode('picker')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeMode === 'picker'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            Active Pick Wave & Route Simulator
          </button>
          <button
            onClick={() => setActiveMode('packer')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeMode === 'packer'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            Packing & QA Inspection Bench
          </button>
        </div>

        <div className="text-xs text-slate-400">
          {activeMode === 'picker' ? 'S-Shape Optimal Path Routing • RF Barcode Verification' : 'Volumetric Box Selection • Digital Scale Tare • Thermal Label'}
        </div>
      </div>

      {/* PICKER WAVE MODE */}
      {activeMode === 'picker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Wave Selection & Summary (Left 4 Cols) */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Pick Waves in Progress
            </h3>

            <div className="space-y-2">
              {waves.map((w) => {
                const isSelected = w.id === selectedWaveId;
                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWaveId(w.id)}
                    className={`p-3.5 rounded-lg border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-slate-100">
                      <span>{w.waveNumber}</span>
                      <span className="text-[10px] text-cyan-400 uppercase">{w.status}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">{w.zone}</p>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
                      <span>Picker: {w.pickerName}</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {w.pickedCount} / {w.pathNodes.length} Picked
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Path Optimization Metrics */}
            {activeWave && (
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span>Routing Optimization:</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> S-Shape Active
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Walk Distance:</span>
                  <span className="font-mono text-slate-200">{activeWave.totalDistanceMeters} meters</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Est. Completion Time:</span>
                  <span className="font-mono text-cyan-300">{activeWave.estimatedMinutes} minutes</span>
                </div>
              </div>
            )}
          </div>

          {/* Active Pick Sequence & Simulated Laser Scanner (Right 8 Cols) */}
          <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-cyan-400" />
                  Interactive Pick Sequence ({activeWave?.waveNumber})
                </h3>
                <p className="text-xs text-slate-400">Follow the path step-by-step. Scan items to confirm.</p>
              </div>
              <span className="font-mono text-xs text-emerald-400 font-bold">
                {activeWave?.pathNodes.filter((n) => n.picked).length} / {activeWave?.pathNodes.length} Items Picked
              </span>
            </div>

            <div className="space-y-3">
              {activeWave?.pathNodes.map((node, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border text-xs transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    node.picked
                      ? 'bg-slate-950/60 border-slate-800/80 opacity-70'
                      : 'bg-slate-950 border-cyan-500/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                        node.picked ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-cyan-600 text-white'
                      }`}
                    >
                      {node.picked ? '✓' : index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-cyan-300">{node.binCode}</span>
                        <span className="font-mono text-slate-400">({node.sku})</span>
                      </div>
                      <div className="text-slate-200 font-medium">{node.productName}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5 font-mono">
                        Target Quantity to Pick: <strong className="text-white">{node.quantity} units</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!node.picked ? (
                      <>
                        <button
                          onClick={() => pickItemInWave(activeWave.id, node.binCode)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow"
                        >
                          <Barcode className="w-3.5 h-3.5" />
                          Scan Barcode (Pick)
                        </button>
                        <button
                          onClick={() =>
                            setDamageModalData({
                              orderId: activeWave.orderIds[0] || 'ord-9801',
                              sku: node.sku,
                              binCode: node.binCode,
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition cursor-pointer"
                        >
                          Report Damage
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PACKER & QA BENCH MODE */}
      {activeMode === 'packer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Packing Configuration & Bench Controls (Left 7 Cols) */}
          <div className="lg:col-span-7 p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  Packing Station #01 (Operator: Marcus Vance)
                </h3>
                <p className="text-xs text-slate-400">Order verification, volumetric box selection, and weigh check</p>
              </div>
              {packingOrder ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  {packingOrder.orderNumber}
                </span>
              ) : (
                <span className="text-xs text-slate-500">No active parcel</span>
              )}
            </div>

            {packingOrder ? (
              <div className="space-y-4 text-xs">
                {/* Active Items to Pack */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                    Picked Line Items for Parcel:
                  </span>
                  {packingOrder.items.map((it, i) => (
                    <div key={i} className="flex justify-between items-center text-slate-200">
                      <div>
                        <span className="font-mono text-cyan-300 font-bold">{it.sku}</span> - {it.productName}
                      </div>
                      <span className="font-mono font-bold text-white">{it.allocatedQty} units</span>
                    </div>
                  ))}
                </div>

                {/* Box Dimension Recommender */}
                <div className="space-y-2">
                  <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    AI Volumetric Packaging Recommendation:
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'Box-A (Small)', dim: '15x15x15 cm', rec: false },
                      { id: 'Box-B (Medium)', dim: '30x25x20 cm', rec: true },
                      { id: 'Box-C (Heavy/Large)', dim: '50x40x35 cm', rec: false },
                      { id: 'Poly-Mailer', dim: 'Padded Envelope', rec: false },
                    ].map((box) => (
                      <button
                        key={box.id}
                        onClick={() => setSelectedBox(box.id as any)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                          selectedBox === box.id
                            ? 'bg-purple-950/60 border-purple-500 text-purple-200 ring-1 ring-purple-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-100">{box.id}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{box.dim}</div>
                        {box.rec && (
                          <span className="inline-block mt-1 text-[9px] font-bold text-purple-400">
                            ★ OPTIMAL FIT
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Digital Scale & Tare */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="font-semibold text-slate-200">Integrated Digital Bench Scale</div>
                      <div className="text-[11px] text-slate-400">Tare zeroed • Tolerance ±0.05 kg</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={0.1}
                      value={scaleWeight}
                      onChange={(e) => setScaleWeight(Number(e.target.value))}
                      className="w-20 p-1.5 rounded bg-slate-900 border border-slate-700 text-right font-mono font-bold text-emerald-400 text-sm focus:outline-none"
                    />
                    <span className="font-mono text-slate-400">kg</span>
                  </div>
                </div>

                {/* QA Checklist */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="font-semibold text-slate-300 text-[10px] uppercase">QA Parcel Protocol:</span>
                  <div className="flex items-center gap-2 text-slate-300 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ESD Anti-Static Shield Bag sealed
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Kraft Void-fill cushion placed
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> UN3480 Lithium Hazmat warning affixed
                  </div>
                </div>

                {/* Complete & Print Label Button */}
                <button
                  onClick={handlePackSubmit}
                  className="w-full py-3 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-950"
                >
                  <Printer className="w-4 h-4" />
                  Complete Pack & Print Thermal Shipping Label
                </button>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs space-y-2">
                <Package className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                <p>No orders currently staged for packing. Complete a pick wave to send items to this bench.</p>
              </div>
            )}
          </div>

          {/* Thermal Label Generator & Preview (Right 5 Cols) */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
                <Printer className="w-4 h-4 text-cyan-400" />
                Zebra Thermal Shipping Label (4x6")
              </h3>

              {/* Realistic Printable 4x6" Courier Label */}
              <div className="mt-4 p-5 rounded-lg bg-white text-slate-950 font-sans shadow-2xl border-2 border-dashed border-slate-400 space-y-3">
                <div className="flex justify-between items-start border-b-2 border-slate-950 pb-2">
                  <div>
                    <h4 className="font-black text-xl tracking-tighter">
                      {printedLabelOrder?.carrier || packingOrder?.carrier || 'FEDEX PRIORITY AM'}
                    </h4>
                    <p className="text-[9px] font-mono uppercase tracking-widest font-bold">AIR EXPRESS FREIGHT</p>
                  </div>
                  <div className="text-right font-mono text-[10px]">
                    <div className="font-bold text-xs">HUB-07</div>
                    <div>BAY #01</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] border-b border-slate-300 pb-2">
                  <div>
                    <span className="text-slate-500 font-bold block text-[8px]">SHIP FROM:</span>
                    <p className="font-bold">NEXUS WMS FULFILLMENT</p>
                    <p>Dock 1, Zone Alpha</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[8px]">SHIP TO:</span>
                    <p className="font-bold">{printedLabelOrder?.customerName || packingOrder?.customerName || 'AeroSpace Technologies'}</p>
                    <p>Building 4, Flight Line</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-300 pb-2">
                  <span>WEIGHT: {scaleWeight.toFixed(2)} KG</span>
                  <span>BOX: {selectedBox.slice(0, 5)}</span>
                  <span className="font-bold">SLA: NEXT-DAY</span>
                </div>

                {/* Simulated 2D Barcode */}
                <div className="py-2 text-center border-b-2 border-slate-950">
                  <div className="h-10 bg-[repeating-linear-gradient(90deg,#000_0px,#000_2px,#fff_2px,#fff_5px,#000_5px,#000_8px,#fff_8px,#fff_10px)] mx-auto w-4/5"></div>
                  <div className="font-mono text-[10px] font-bold mt-1 tracking-widest">
                    {printedLabelOrder?.trackingNumber || 'TRK-9842-8819-001'}
                  </div>
                </div>

                <div className="text-[8px] text-slate-500 text-center font-mono">
                  AUTHENTICATED BY NEXUS SMART WMS • CARRIER MANIFEST SIGNED
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Direct Print Status:</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zebra ZT411 Ready
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Damage Exception Modal */}
      {damageModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-rose-400 flex items-center gap-2">
                <PackageX className="w-4 h-4" />
                Report Damaged / Missing Item at Bin
              </h3>
              <button onClick={() => setDamageModalData(null)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                You are reporting damaged stock at Bin <strong className="text-cyan-300">{damageModalData.binCode}</strong> for SKU <strong className="text-white">{damageModalData.sku}</strong>.
              </p>
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/60 text-rose-200 space-y-1">
                <div className="font-bold">Automated Protocol Actions:</div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                  <li>Bin {damageModalData.binCode} will be flagged as Quarantined.</li>
                  <li>Physical unit isolated from ATP calculation.</li>
                  <li>Pick wave dynamically rerouted to secondary backup bin.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setDamageModalData(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDamage}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow"
                >
                  Confirm & Quaratine Lot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
