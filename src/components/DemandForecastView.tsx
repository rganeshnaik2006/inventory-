import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Layers,
  Calendar,
  Sparkles,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  HelpCircle,
  Clock,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useWarehouse } from '../context/WarehouseContext';
import { ProductDemandForecast } from '../types';

export const DemandForecastView: React.FC = () => {
  const { demandForecasts, setActiveTab } = useWarehouse();
  const [selectedSku, setSelectedSku] = useState<string>(demandForecasts[0]?.sku || 'SKU-LITH-900');
  const [forecastPeriod, setForecastPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const selectedProductForecast =
    demandForecasts.find((f) => f.sku === selectedSku) || demandForecasts[0];

  const getActiveDatapoints = () => {
    if (!selectedProductForecast) return [];
    if (forecastPeriod === '7d') return selectedProductForecast.datapoints7d;
    if (forecastPeriod === '90d') return selectedProductForecast.datapoints90d;
    return selectedProductForecast.datapoints30d;
  };

  const getRiskBadge = (risk: ProductDemandForecast['stockoutRisk']) => {
    switch (risk) {
      case 'Critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
            Critical Risk
          </span>
        );
      case 'High':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
            High Risk
          </span>
        );
      case 'Moderate':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800">
            Moderate
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            Low Risk
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/30">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                AI Demand Forecasting & Consumption Projection
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950 text-purple-300 border border-purple-800">
                TIME-SERIES ML ESTIMATES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-horizon sales order modeling with historical trends, confidence bands, and stockout probability.
            </p>
          </div>
        </div>

        {/* Forecast Period Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setForecastPeriod(period)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                forecastPeriod === period
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {period === '7d' ? 'Next 7 Days' : period === '30d' ? 'Next 30 Days' : 'Next 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Selected SKU Stock</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {selectedProductForecast?.currentStock} units
            </span>
            <span className="text-xs text-amber-400 font-medium">In Physical Bins</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Current Physical ATP available
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">
            Projected {forecastPeriod.toUpperCase()} Demand
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {forecastPeriod === '7d'
                ? selectedProductForecast?.forecast7d
                : forecastPeriod === '90d'
                ? selectedProductForecast?.forecast90d
                : selectedProductForecast?.forecast30d}{' '}
              units
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +24% Trend
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            AI Model Confidence: {selectedProductForecast?.confidenceScore}%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-slate-400 text-xs font-medium">Stockout Vulnerability</div>
          <div className="mt-2 flex items-center gap-2">
            {getRiskBadge(selectedProductForecast?.stockoutRisk || 'Low')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Burn rate vs Supplier lead-time gap
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-slate-400 text-xs font-medium">Recommended Reorder</div>
            <div className="mt-1 text-2xl font-bold font-mono text-purple-300">
              +{selectedProductForecast?.recommendedReorderQty} units
            </div>
          </div>
          <button
            onClick={() => setActiveTab('reorder')}
            className="mt-2 w-full py-1.5 rounded-lg text-xs font-semibold bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 transition cursor-pointer"
          >
            Open Smart Reorder PO →
          </button>
        </div>
      </div>

      {/* Chart & Deep-Dive Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: The Forecast Visualizer Graph */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                Historical Demand vs. AI Predicted Consumption
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                  {selectedProductForecast?.name}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Solid line represents historical orders; dotted cyan curve and purple confidence band indicate AI estimates.
              </p>
            </div>

            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer self-start"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>Why this forecast?</span>
            </button>
          </div>

          {/* Explanation Banner */}
          {showExplanation && (
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/60 text-xs text-slate-300 space-y-1 animate-in fade-in duration-150">
              <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Model Forecasting Reasoning:
              </div>
              <p className="leading-relaxed text-[11px]">
                The model detects a sustained acceleration in robotics manufacturing orders from Enterprise VIP customers over the past 3 weeks. Combined with recurring Tuesday batching patterns, 30-day projected demand reaches {selectedProductForecast?.forecast30d} units. Reordering {selectedProductForecast?.recommendedReorderQty} units prevents a stockout with {selectedProductForecast?.confidenceScore}% statistical confidence.
              </p>
            </div>
          )}

          {/* Recharts Area + Line Multi-Horizon Curve */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getActiveDatapoints()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="actualArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any, name: any) => {
                    if (name === 'historicalDemand') return [`${val} units`, 'Historical Actual Demand'];
                    if (name === 'predictedDemand') return [`${val} units (Est)`, 'AI Predicted Demand'];
                    if (name === 'upperConfidence') return [`${val} units`, 'Upper 95% Confidence'];
                    if (name === 'lowerConfidence') return [`${val} units`, 'Lower 95% Confidence'];
                    return [val, name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="upperConfidence"
                  stroke="#a855f7"
                  strokeDasharray="2 2"
                  fill="url(#forecastBand)"
                  name="upperConfidence"
                />
                <Line
                  type="monotone"
                  dataKey="historicalDemand"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#38bdf8' }}
                  name="historicalDemand"
                />
                <Line
                  type="monotone"
                  dataKey="predictedDemand"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#a855f7' }}
                  name="predictedDemand"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block"></span>
                <span>Historical Orders</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-400 inline-block"></span>
                <span>AI Predicted Horizon (Dotted)</span>
              </span>
            </div>
            <span className="text-[11px] font-mono text-purple-400">
              *Clearly labeled as AI estimates based on order history
            </span>
          </div>
        </div>

        {/* Right Col: SKU Selector & Risk Matrix Table */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-400" />
                Product Forecast List
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {demandForecasts.length} SKUs Modeled
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {demandForecasts.map((f) => {
                const isSelected = f.sku === selectedSku;
                return (
                  <button
                    key={f.sku}
                    onClick={() => setSelectedSku(f.sku)}
                    className={`w-full p-3 rounded-xl text-left border transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-600/80 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-100">{f.sku}</span>
                      {getRiskBadge(f.stockoutRisk)}
                    </div>
                    <div className="text-xs text-slate-300 line-clamp-1">{f.productName}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                      <span>Stock: {f.currentStock} u</span>
                      <span className="text-purple-300 font-semibold">
                        30d: {f.forecast30d} u (Rec: +{f.recommendedReorderQty})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Forecast refresh: Daily 06:00 UTC</span>
            <button
              onClick={() => setActiveTab('reorder')}
              className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
            >
              Review Reorders →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
