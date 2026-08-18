import React, { useState } from 'react';
import {
  Layers,
  Search,
  AlertTriangle,
  PackageCheck,
  PackageX,
  Plus,
  RefreshCw,
  Barcode,
  Truck,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Product } from '../types';
import { warehouseSound } from '../utils/audioFeedback';

export const InventoryView: React.FC = () => {
  const { products, triggerSupplierPO } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showPoModal, setShowPoModal] = useState<boolean>(false);
  const [selectedProductForPo, setSelectedProductForPo] = useState<Product | null>(null);
  const [poQuantity, setPoQuantity] = useState<number>(50);

  // Barcode audit test simulator
  const [scanInput, setScanInput] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<Product | null>(null);

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      searchTerm === '' ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.primaryBin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || prod.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;
    const match = products.find(
      (p) =>
        p.barcode.toLowerCase() === scanInput.toLowerCase() ||
        p.sku.toLowerCase() === scanInput.toLowerCase()
    );
    if (match) {
      warehouseSound.playScanBeep();
      setScannedResult(match);
    } else {
      warehouseSound.playAlert();
      setScannedResult(null);
    }
  };

  const handleOpenPoModal = (prod: Product) => {
    setSelectedProductForPo(prod);
    setPoQuantity(prod.safetyStockThreshold * 2);
    setShowPoModal(true);
  };

  const handleConfirmPo = () => {
    if (!selectedProductForPo) return;
    triggerSupplierPO(selectedProductForPo.sku, poQuantity);
    setShowPoModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar & Barcode Scanner Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Search & Filter */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search SKU, Product Title, or Primary Bin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {['all', 'Optics & Robotics', 'Power & Batteries', 'Micro-Electronics', 'Biotech / Cold-Chain'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Right Barcode Quick Scanner Box */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <form onSubmit={handleBarcodeScan} className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Scan / Type Barcode..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer shadow"
            >
              Scan
            </button>
          </form>

          {scannedResult && (
            <div className="mt-2 p-2 rounded bg-cyan-950/40 border border-cyan-500/40 text-[11px] flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-cyan-300">{scannedResult.sku}</span>
                <p className="text-slate-300 truncate max-w-[180px]">{scannedResult.name}</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-emerald-400 font-bold">{scannedResult.availableToPromise} ATP</span>
                <div className="text-[10px] text-slate-400">{scannedResult.primaryBin}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div>
            <h2 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Master Inventory & Available-to-Promise (ATP) Registry
            </h2>
            <p className="text-xs text-slate-400">
              Formula: Available-to-Promise (ATP) = Total Physical Stock - Allocated - Quarantine
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">{filteredProducts.length} Active SKUs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">SKU & Velocity</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Primary Bin</th>
                <th className="py-2.5 px-3 text-right">Physical</th>
                <th className="py-2.5 px-3 text-right">Allocated</th>
                <th className="py-2.5 px-3 text-right">Quarantined</th>
                <th className="py-2.5 px-3 text-right">ATP Stock</th>
                <th className="py-2.5 px-3 text-center">Health</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((prod) => {
                const isBelowSafety = prod.availableToPromise <= prod.safetyStockThreshold;
                const hasQuarantine = prod.quarantineStock > 0;

                return (
                  <tr
                    key={prod.id}
                    className={`hover:bg-slate-800/40 transition ${
                      isBelowSafety ? 'bg-amber-950/20' : hasQuarantine ? 'bg-rose-950/15' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-100 flex items-center gap-2">
                      <span className="text-cyan-300">{prod.sku}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          prod.velocityRank === 'A'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : prod.velocityRank === 'B'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Rank {prod.velocityRank}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-medium">{prod.name}</div>
                      <div className="text-[11px] text-slate-400">{prod.category}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-400">{prod.primaryBin}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-100">
                      {prod.totalPhysicalStock}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-400">
                      {prod.allocatedStock}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-400 font-bold">
                      {prod.quarantineStock}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-sm font-bold text-emerald-400">
                      {prod.availableToPromise}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isBelowSafety ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          LOW STOCK
                        </span>
                      ) : hasQuarantine ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          QA HOLD
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          NOMINAL
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleOpenPoModal(prod)}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer"
                      >
                        Restock PO
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier PO Modal */}
      {showPoModal && selectedProductForPo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                Issue Supplier Restock Purchase Order
              </h3>
              <button
                onClick={() => setShowPoModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px]">Selected SKU</span>
                <div className="font-mono font-bold text-cyan-300">{selectedProductForPo.sku}</div>
                <div className="text-slate-200">{selectedProductForPo.name}</div>
                <div className="text-slate-400 text-[11px] pt-1">
                  Current ATP: {selectedProductForPo.availableToPromise} • Safety Stock Threshold: {selectedProductForPo.safetyStockThreshold}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Restock Order Quantity</label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={poQuantity}
                  onChange={(e) => setPoQuantity(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Supplier:</span>
                  <span className="font-medium text-white">Tier-1 Contract Manufacturer</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Lead Time:</span>
                  <span className="text-cyan-400">24-48 Hours (Air Expedited)</span>
                </div>
                <div className="flex justify-between">
                  <span>Destination Inbound Dock:</span>
                  <span className="text-slate-200">Dock Bay #4</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setShowPoModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPo}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow"
                >
                  Generate & Confirm PO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
