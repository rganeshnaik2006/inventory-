import React, { useState } from 'react';
import {
  Layers,
  Search,
  AlertTriangle,
  Zap,
  Box,
  Thermometer,
  ShieldAlert,
  Flame,
  Truck,
  RotateCcw,
  CheckCircle2,
  PackageX,
  PlusCircle,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { WarehouseBin } from '../types';

export const FloorPlanView: React.FC = () => {
  const { bins, products, selectedBin, setSelectedBin, triggerSupplierPO } = useWarehouse();
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [heatmapMode, setHeatmapMode] = useState<'status' | 'frequency' | 'capacity'>('status');

  const filteredBins = bins.filter((b) => {
    const matchesZone = zoneFilter === 'all' || b.zone === zoneFilter;
    const matchesSearch =
      searchTerm === '' ||
      b.binCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const getBinColor = (bin: WarehouseBin) => {
    if (heatmapMode === 'status') {
      if (bin.status === 'quarantined') return 'bg-rose-900/80 border-rose-500 text-rose-200 shadow-rose-900/50 shadow-md';
      if (bin.status === 'congested') return 'bg-amber-900/80 border-amber-500 text-amber-200 shadow-amber-900/50 shadow-md';
      if (bin.status === 'low_stock') return 'bg-orange-900/80 border-orange-500 text-orange-200';
      if (bin.status === 'maintenance') return 'bg-slate-800 border-slate-600 text-slate-400';
      return 'bg-cyan-950/60 border-cyan-800/80 text-cyan-200 hover:border-cyan-400';
    }

    if (heatmapMode === 'frequency') {
      if (bin.pickFrequencyToday > 100) return 'bg-red-600/80 border-red-400 text-white font-bold animate-pulse';
      if (bin.pickFrequencyToday > 50) return 'bg-amber-600/70 border-amber-400 text-amber-100';
      if (bin.pickFrequencyToday > 20) return 'bg-cyan-700/60 border-cyan-400 text-cyan-100';
      return 'bg-slate-900/60 border-slate-800 text-slate-400';
    }

    // Capacity mode
    const pct = bin.capacityMax > 0 ? (bin.currentCapacity / bin.capacityMax) * 100 : 0;
    if (pct > 90) return 'bg-purple-900/80 border-purple-500 text-purple-200';
    if (pct > 50) return 'bg-blue-900/70 border-blue-500 text-blue-200';
    return 'bg-slate-900/70 border-slate-700 text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Filters, Search, Heatmap Mode */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Bin Code (e.g. A-01-1), SKU, or Product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {['all', 'Zone A', 'Zone B', 'Zone C', 'Zone D'].map((z) => (
            <button
              key={z}
              onClick={() => setZoneFilter(z)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                zoneFilter === z
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {z === 'all' ? 'All Facility Zones' : z}
            </button>
          ))}
        </div>

        {/* Heatmap Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 px-2 font-medium">Layer:</span>
          <button
            onClick={() => setHeatmapMode('status')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
              heatmapMode === 'status' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Operational Status
          </button>
          <button
            onClick={() => setHeatmapMode('frequency')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
              heatmapMode === 'frequency' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔥 Velocity Heatmap
          </button>
          <button
            onClick={() => setHeatmapMode('capacity')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
              heatmapMode === 'capacity' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Capacity %
          </button>
        </div>
      </div>

      {/* Main Visual Floor Plan & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual 2D Facility Map (Left 8 Cols) */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg relative min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div>
              <h2 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Facility Architectural Blueprint (Grid Alpha-7)
              </h2>
              <p className="text-xs text-slate-400">Click any rack or bin node to inspect live stock, velocity, and batch history</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded bg-cyan-900 border border-cyan-500"></span> Nominal
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded bg-amber-900 border border-amber-500"></span> Congested
              </span>
              <span className="flex items-center gap-1 text-orange-400">
                <span className="w-2.5 h-2.5 rounded bg-orange-900 border border-orange-500"></span> Low Stock
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-900 border border-rose-500"></span> Quarantined
              </span>
            </div>
          </div>

          {/* Isometric / Schematic Floor Grid */}
          <div className="relative w-full h-[460px] bg-slate-950/90 rounded-lg border border-slate-800/80 p-4 overflow-hidden">
            {/* Zone Region Overlays */}
            <div className="absolute top-2 left-2 w-[44%] h-[46%] rounded-lg border border-cyan-800/40 bg-cyan-950/10 p-2 pointer-events-none">
              <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" /> Zone A: High-Velocity Pick Face
              </span>
            </div>

            <div className="absolute top-2 right-2 w-[48%] h-[46%] rounded-lg border border-blue-800/40 bg-blue-950/10 p-2 pointer-events-none">
              <span className="text-[10px] font-bold text-blue-400/80 uppercase tracking-wider flex items-center gap-1">
                <Box className="w-3 h-3 text-blue-400" /> Zone B: General Multi-Tier Racks
              </span>
            </div>

            <div className="absolute bottom-2 left-2 w-[44%] h-[46%] rounded-lg border border-purple-800/40 bg-purple-950/10 p-2 pointer-events-none">
              <span className="text-[10px] font-bold text-purple-400/80 uppercase tracking-wider flex items-center gap-1">
                <Truck className="w-3 h-3 text-purple-400" /> Zone C: Bulk Heavy Pallet Storage
              </span>
            </div>

            <div className="absolute bottom-2 right-2 w-[48%] h-[46%] rounded-lg border border-rose-800/40 bg-rose-950/10 p-2 pointer-events-none">
              <span className="text-[10px] font-bold text-rose-400/80 uppercase tracking-wider flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-rose-400" /> Zone D: Cold-Chain & Hazmat Vault
              </span>
            </div>

            {/* Interactive Bin Node Markers */}
            {filteredBins.map((bin) => {
              const isSelected = selectedBin?.id === bin.id;
              return (
                <div
                  key={bin.id}
                  onClick={() => setSelectedBin(bin)}
                  style={{ left: `${bin.x}%`, top: `${bin.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-lg border text-xs cursor-pointer transition-all duration-200 transform hover:scale-110 z-10 ${getBinColor(
                    bin
                  )} ${isSelected ? 'ring-2 ring-cyan-400 scale-110 shadow-lg shadow-cyan-500/40' : ''}`}
                >
                  <div className="flex items-center gap-1 font-mono font-bold">
                    <span>{bin.binCode}</span>
                    {bin.status === 'quarantined' && <PackageX className="w-3 h-3 text-rose-400" />}
                    {bin.status === 'congested' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                  </div>
                  <div className="text-[10px] truncate max-w-[90px] opacity-90">{bin.sku}</div>
                  <div className="text-[10px] font-mono mt-0.5">
                    Qty: <strong className="text-white">{bin.quantity}</strong>
                  </div>
                </div>
              );
            })}

            {/* Floor Staging & Packing Lanes */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-3">
              <span>Packing Benches #1-3</span>
              <span>•</span>
              <span>QA Station Q-01</span>
              <span>•</span>
              <span className="text-cyan-400">Loading Docks 1-4</span>
            </div>
          </div>
        </div>

        {/* Bin Details & Inventory Inspector Drawer (Right 4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <Box className="w-4 h-4 text-cyan-400" />
              Bin Inspector & Stock State
            </h3>
            {selectedBin && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {selectedBin.binCode}
              </span>
            )}
          </div>

          {selectedBin ? (
            <div className="mt-4 space-y-4 text-xs">
              {/* Product Header */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Assigned SKU</div>
                <div className="font-bold text-slate-100 text-sm font-mono text-cyan-300">{selectedBin.sku}</div>
                <div className="text-slate-300 text-xs">{selectedBin.productName}</div>
                <div className="text-slate-500 text-[11px] pt-1">Zone: {selectedBin.zone} • Aisle {selectedBin.aisle} • Rack {selectedBin.rack} • Shelf {selectedBin.shelf}</div>
              </div>

              {/* Stock Capacity & Physical Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Physical In-Bin</span>
                  <div className="text-lg font-bold font-mono text-slate-100">{selectedBin.quantity} units</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Pick Frequency Today</span>
                  <div className="text-lg font-bold font-mono text-amber-300">{selectedBin.pickFrequencyToday} picks</div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Operational Health:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedBin.status === 'quarantined'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : selectedBin.status === 'congested'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : selectedBin.status === 'low_stock'
                        ? 'bg-orange-950 text-orange-300 border border-orange-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {selectedBin.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Bin Capacity Utilization:</span>
                  <span className="font-mono text-slate-200">
                    {selectedBin.currentCapacity} / {selectedBin.capacityMax} ({Math.round((selectedBin.currentCapacity / (selectedBin.capacityMax || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (selectedBin.currentCapacity / (selectedBin.capacityMax || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => triggerSupplierPO(selectedBin.sku, 50)}
                  className="w-full py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Issue Restock PO (+50 units)
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs space-y-2">
              <Box className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
              <p>Click any bin coordinate on the warehouse blueprint to inspect inventory details and batch records.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
