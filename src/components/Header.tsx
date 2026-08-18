import React, { useState, useEffect, useRef } from 'react';
import {
  Boxes,
  Activity,
  AlertTriangle,
  Volume2,
  VolumeX,
  Bot,
  RotateCcw,
  Sparkles,
  Layers,
  Clock,
  Radio,
  User,
  LogOut,
  Lock,
  KeyRound,
  Shield,
  ChevronDown,
  UserPlus,
  Check,
} from 'lucide-react';
import { useWarehouse, ActiveTab } from '../context/WarehouseContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    metrics,
    soundEnabled,
    setSoundEnabled,
    resetToDefault,
    runScenario,
    orders,
    currentUser,
    registeredUsers,
    logout,
    switchUser,
    lockTerminal,
    setAuthModalView,
  } = useWarehouse();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const criticalExceptionsCount = orders.filter(
    (o) => o.exception?.severity === 'critical' || o.status === 'exception_held'
  ).length;

  const navItems: { id: ActiveTab; label: string; icon: any; badge?: number }[] = [
    { id: 'command', label: 'Command Center', icon: Activity },
    { id: 'floorplan', label: 'Floor Plan & Heatmap', icon: Layers },
    { id: 'orders', label: 'Orders & Allocation', icon: Boxes, badge: orders.filter(o => o.status === 'prioritizing' || o.status === 'created').length },
    { id: 'simulator', label: 'Decision Simulator', icon: Sparkles },
    { id: 'inventory', label: 'Inventory & Stock', icon: Layers },
    { id: 'picker_packer', label: 'Pick & Pack Stations', icon: Boxes },
    { id: 'dispatch', label: 'Docks & Dispatch', icon: Radio },
    { id: 'copilot', label: 'AI Copilot', icon: Bot },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 py-3 select-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Logo & System Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Boxes className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base lg:text-lg text-slate-100 tracking-tight">
                NEXUS <span className="text-cyan-400 font-mono text-sm font-semibold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">WMS v4.2</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE WAREHOUSE
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Facility HUB-07 (Zones A-D) • Active Shift Alpha
            </p>
          </div>
        </div>

        {/* Real-time Status Ticker & Operational Quick Controls */}
        <div className="flex items-center gap-2.5">
          {/* Time & Shift Clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentTime || '08:00:00'} UTC</span>
          </div>

          {/* Quick Scenario Preset Button */}
          <button
            onClick={() => runScenario('scen-vip-shortage')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 transition shadow-sm cursor-pointer"
            title="Launch the VIP 10 vs 7 stockout decision scenario"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="hidden sm:inline">Stress Test:</span> VIP Stock Shortage
          </button>

          {/* Critical Exception Badge */}
          {criticalExceptionsCount > 0 && (
            <button
              onClick={() => setActiveTab('orders')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 transition animate-pulse cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{criticalExceptionsCount} Urgent Exception{criticalExceptionsCount > 1 ? 's' : ''}</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title={soundEnabled ? 'Disable scanner audio sounds' : 'Enable scanner audio sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Reset State Button */}
          <button
            onClick={resetToDefault}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Reset warehouse state to default baseline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Operator Profile / Auth Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {currentUser ? (
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-200 text-xs transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-200 leading-tight flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-1 rounded border border-cyan-800">
                      {currentUser.badgeId}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-none">{currentUser.roleTitle}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={() => setAuthModalView('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Operator Login</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
                {/* Active User Card */}
                {currentUser && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-slate-200 flex items-center justify-between">
                      <span>{currentUser.name}</span>
                      <span className="text-[10px] font-mono text-cyan-300 font-normal">
                        {currentUser.badgeId}
                      </span>
                    </div>
                    <div className="text-[11px] text-cyan-400">{currentUser.roleTitle}</div>
                    <div className="text-[10px] text-slate-400">{currentUser.email}</div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                      <span>{currentUser.facility}</span>
                      <span className="font-semibold text-emerald-400">Authenticated</span>
                    </div>
                  </div>
                )}

                {/* Switch Demo Operator Profile */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                    Switch Active Operator:
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {registeredUsers.map((user) => {
                      const isCurrent = currentUser?.id === user.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            switchUser(user.id);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full p-1.5 rounded-md text-left transition flex items-center justify-between cursor-pointer ${
                            isCurrent
                              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-semibold">{user.name}</span>
                            <span className="text-[10px] text-slate-500 ml-1.5">({user.roleTitle})</span>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Links */}
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <button
                    onClick={() => {
                      setAuthModalView('login');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition flex items-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Login with Different Account</span>
                  </button>

                  <button
                    onClick={() => {
                      setAuthModalView('signup');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Register New Operator (Sign Up)</span>
                  </button>

                  <button
                    onClick={() => {
                      setAuthModalView('forgot');
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Forgot Passcode / Key Recovery</span>
                  </button>

                  <button
                    onClick={() => {
                      lockTerminal();
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lock Terminal Screen</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg hover:bg-rose-950/60 text-rose-300 transition flex items-center gap-2 cursor-pointer border-t border-slate-800/80 pt-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out of Terminal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs (shown when authenticated) */}
      {currentUser ? (
        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-900 text-cyan-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-medium">Terminal Authorization Required</span>
            <span className="text-slate-500 hidden sm:inline">• Please sign in below to unlock warehouse operations.</span>
          </div>
          <div className="text-[11px] font-mono text-cyan-400/80 hidden sm:block">
            TLS 1.3 • AES-256 GCM
          </div>
        </div>
      )}
    </header>
  );
};
