import React from 'react';
import { WarehouseProvider, useWarehouse } from './src/context/WarehouseContext';
import { Header } from './src/components/Header';
import { CommandCenterView } from './src/components/CommandCenterView';
import { FloorPlanView } from './src/components/FloorPlanView';
import { OrderManagerView } from './src/components/OrderManagerView';
import { DecisionSimulatorView } from './src/components/DecisionSimulatorView';
import { InventoryView } from './src/components/InventoryView';
import { PickerPackerStationView } from './src/components/PickerPackerStationView';
import { DispatchDockView } from './src/components/DispatchDockView';
import { AICopilotDrawer } from './src/components/AICopilotDrawer';
import { AuthModalOrPage } from './src/components/AuthModalOrPage';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

const WarehouseMainApp: React.FC = () => {
  const {
    activeTab,
    systemNotification,
    clearNotification,
    currentUser,
    authModalView,
    setAuthModalView,
    isTerminalLocked,
  } = useWarehouse();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header & Navigation */}
      <Header />

      {/* Auth Modal (Login / Sign Up / Forgot Password) */}
      {(!currentUser || authModalView !== 'none' || isTerminalLocked) && (
        <AuthModalOrPage
          mode={!currentUser ? 'full_page' : 'modal'}
          onClose={() => setAuthModalView('none')}
        />
      )}

      {/* Global Real-time Notification Toast */}
      {systemNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`p-4 rounded-xl border shadow-2xl flex items-center gap-3 text-xs max-w-md ${
              systemNotification.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/60 text-emerald-200'
                : systemNotification.type === 'error' || systemNotification.type === 'warning'
                ? 'bg-slate-900/95 border-amber-500/60 text-amber-200'
                : 'bg-slate-900/95 border-cyan-500/60 text-cyan-200'
            }`}
          >
            {systemNotification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : systemNotification.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-cyan-400 shrink-0" />
            )}
            <div className="flex-1 font-medium">{systemNotification.text}</div>
            <button
              onClick={clearNotification}
              className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body (shown when authenticated) */}
      {currentUser && (
        <main className="flex-1 px-4 lg:px-6 py-6 max-w-7xl w-full mx-auto">
          {activeTab === 'command' && <CommandCenterView />}
          {activeTab === 'floorplan' && <FloorPlanView />}
          {activeTab === 'orders' && <OrderManagerView />}
          {activeTab === 'simulator' && <DecisionSimulatorView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'picker_packer' && <PickerPackerStationView />}
          {activeTab === 'dispatch' && <DispatchDockView />}
          {activeTab === 'copilot' && <AICopilotDrawer />}
        </main>
      )}

      {/* Footer System Status Bar */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-3 text-[11px] text-slate-500 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Telemetry Stream Online
          </span>
          <span>•</span>
          <span>Hub-07 Fulfillment Engine</span>
          <span>•</span>
          <span className="font-mono text-cyan-400/80">Gemini 2.5 Flash Autonomous Co-Pilot</span>
        </div>
        <div className="font-mono text-slate-400">
          Latency: 14ms • Pick Accuracy: 99.8% • Real-time ATP Verified
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <WarehouseProvider>
      <WarehouseMainApp />
    </WarehouseProvider>
  );
}
