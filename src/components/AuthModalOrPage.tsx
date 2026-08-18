import React, { useState } from 'react';
import {
  Boxes,
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  HelpCircle,
  RefreshCw,
  Clock,
  IdCard,
  X,
} from 'lucide-react';
import { useWarehouse, AuthModalView } from '../context/WarehouseContext';
import { UserRole } from '../types';

interface AuthModalOrPageProps {
  mode?: 'full_page' | 'modal';
  onClose?: () => void;
}

export const AuthModalOrPage: React.FC<AuthModalOrPageProps> = ({ mode = 'modal', onClose }) => {
  const {
    login,
    signup,
    forgotPassword,
    authModalView,
    setAuthModalView,
    registeredUsers,
    currentUser,
    isTerminalLocked,
    unlockTerminal,
  } = useWarehouse();

  // Local active view inside the auth component
  const currentView: 'login' | 'signup' | 'forgot' =
    authModalView === 'signup'
      ? 'signup'
      : authModalView === 'forgot'
      ? 'forgot'
      : 'login';

  // Login form state
  const [loginEmailOrBadge, setLoginEmailOrBadge] = useState<string>('alex.mercer@nexuswms.io');
  const [loginPassword, setLoginPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [facility, setFacility] = useState<string>('HUB-07 Chicago Core Logistics');
  const [rememberTerminal, setRememberTerminal] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Signup form state
  const [signupName, setSignupName] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupBadge, setSignupBadge] = useState<string>(`OP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [signupRole, setSignupRole] = useState<UserRole>('shift_supervisor');
  const [signupFacility, setSignupFacility] = useState<string>('HUB-07 Chicago Core Logistics');
  const [signupShift, setSignupShift] = useState<
    'Shift Alpha (06:00 - 14:00)' | 'Shift Bravo (14:00 - 22:00)' | 'Shift Charlie (22:00 - 06:00)'
  >('Shift Alpha (06:00 - 14:00)');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState<string>('');
  const [signupError, setSignupError] = useState<string>('');

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [forgotMessage, setForgotMessage] = useState<string>('');
  const [forgotError, setForgotError] = useState<string>('');

  // Terminal unlock PIN state
  const [unlockPin, setUnlockPin] = useState<string>('');
  const [unlockError, setUnlockError] = useState<string>('');

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(loginEmailOrBadge, loginPassword);
      setIsLoading(false);
      if (!res.success) {
        setLoginError(res.error || 'Authentication failed. Please check credentials.');
      } else {
        if (onClose) onClose();
      }
    }, 350);
  };

  // Handle Quick Demo Login
  const handleDemoUserClick = (email: string) => {
    setLoginEmailOrBadge(email);
    setLoginPassword('••••••••');
    setLoginError('');
    setIsLoading(true);
    setTimeout(() => {
      login(email, 'password123');
      setIsLoading(false);
      if (onClose) onClose();
    }, 250);
  };

  // Handle Signup Submit
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!signupName.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupError('Please enter a valid work email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Security passcode must be at least 6 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passcode confirmation does not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = signup(
        {
          name: signupName,
          email: signupEmail,
          badgeId: signupBadge,
          role: signupRole,
          facility: signupFacility,
          shift: signupShift,
        },
        signupPassword
      );
      setIsLoading(false);
      if (!res.success) {
        setSignupError(res.error || 'Registration failed.');
      } else {
        if (onClose) onClose();
      }
    }, 400);
  };

  // Handle Forgot Password - Step 1: Send Token
  const handleSendRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim()) {
      setForgotError('Please provide your work email or employee badge ID.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotMessage(`One-time security authorization code sent to ${forgotEmail}`);
      setVerificationCode('948210'); // Simulated instant OTP
      setForgotStep(2);
    }, 400);
  };

  // Handle Forgot Password - Step 2: Verify Code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!verificationCode.trim() || verificationCode.length < 4) {
      setForgotError('Please enter a valid verification code.');
      return;
    }
    setForgotStep(3);
  };

  // Handle Forgot Password - Step 3: Set New Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = forgotPassword(forgotEmail, newPassword);
      setIsLoading(false);
      if (!res.success) {
        setForgotError(res.error || 'Password update failed.');
      } else {
        if (onClose) onClose();
      }
    }, 400);
  };

  // Handle Unlock Terminal
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError('');
    const ok = unlockTerminal(unlockPin);
    if (!ok) {
      setUnlockError('Incorrect PIN. Enter "1234" to unlock.');
    } else {
      setUnlockPin('');
      if (onClose) onClose();
    }
  };

  // If the terminal is locked, render the secure Terminal Lock Screen
  if (isTerminalLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100">Terminal Screen Locked</h2>
            <p className="text-xs text-slate-400">
              Active Operator:{' '}
              <span className="text-cyan-300 font-semibold">{currentUser?.name || 'Alex Mercer'}</span>{' '}
              ({currentUser?.badgeId || 'OP-8842'})
            </p>
            <p className="text-[11px] font-mono text-slate-500">
              {currentUser?.facility || 'HUB-07 Chicago Core Logistics'}
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">
                Enter Operator Security PIN (Default: 1234)
              </label>
              <input
                type="password"
                maxLength={8}
                value={unlockPin}
                onChange={(e) => setUnlockPin(e.target.value)}
                placeholder="••••"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 focus:outline-none focus:border-cyan-500 transition"
                autoFocus
              />
              {unlockError && <p className="text-xs text-rose-400 mt-1 text-left">{unlockError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-900/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Terminal</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => {
                unlockTerminal('1234');
                setAuthModalView('login');
              }}
              className="hover:text-cyan-400 transition cursor-pointer"
            >
              Switch Operator Profile
            </button>
            <button
              onClick={() => unlockTerminal('1234')}
              className="text-cyan-400 hover:underline font-mono text-[11px] cursor-pointer"
            >
              Auto-Unlock (1234)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const containerClasses =
    mode === 'full_page'
      ? 'min-h-[85vh] flex items-center justify-center py-8'
      : 'fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto';

  return (
    <div className={containerClasses}>
      <div
        className={`bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden transition-all duration-300 relative ${
          mode === 'modal' ? 'animate-in fade-in zoom-in-95 duration-200 my-8' : ''
        }`}
      >
        {/* Close Button (if modal) */}
        {mode === 'modal' && (
          <button
            onClick={() => {
              setAuthModalView('none');
              if (onClose) onClose();
            }}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer border border-slate-700/60"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/60 p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40 shrink-0">
              <Boxes className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white tracking-tight">NEXUS WMS</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  HUB-07 TERMINAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentView === 'login' && 'Operator Authentication & Access Clearance'}
                {currentView === 'signup' && 'Register New Warehouse Operator Profile'}
                {currentView === 'forgot' && 'Operator Security Passcode & Key Recovery'}
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs inside Auth Window */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => {
                setAuthModalView('login');
                setLoginError('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'login'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Operator Sign In</span>
            </button>

            <button
              onClick={() => {
                setAuthModalView('signup');
                setSignupError('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'signup'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>New Operator Sign Up</span>
            </button>

            <button
              onClick={() => {
                setAuthModalView('forgot');
                setForgotError('');
                setForgotStep(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'forgot'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Forgot Passcode</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: SIGN IN / LOGIN                                       */}
        {/* ------------------------------------------------------------- */}
        {currentView === 'login' && (
          <div className="p-6 space-y-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Work Email / Badge ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Work Email or Badge ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginEmailOrBadge}
                    onChange={(e) => setLoginEmailOrBadge(e.target.value)}
                    placeholder="e.g. alex.mercer@nexuswms.io or OP-8842"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              {/* Security Passcode */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Security Passcode / Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthModalView('forgot')}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                  >
                    Forgot passcode?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Logistics Hub Facility Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assigned Fulfillment Facility
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer appearance-none"
                  >
                    <option value="HUB-07 Chicago Core Logistics">HUB-07 Chicago Core Logistics (Active)</option>
                    <option value="HUB-12 Dallas South Distribution">HUB-12 Dallas South Distribution</option>
                    <option value="HUB-03 Frankfurt Euro Central">HUB-03 Frankfurt Euro Central</option>
                    <option value="HUB-09 Tokyo Gateway Logistics">HUB-09 Tokyo Gateway Logistics</option>
                  </select>
                </div>
              </div>

              {/* Remember Terminal Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberTerminal}
                    onChange={(e) => setRememberTerminal(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Remember this terminal device</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">TLS 1.3 256-Bit</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authenticate & Access WMS Portal</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Operator Profiles */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  1-Click Quick Demo Operator Profiles:
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Select Role</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {registeredUsers.slice(0, 4).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleDemoUserClick(user.email)}
                    className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 text-left transition flex items-center justify-between gap-2 group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-200 group-hover:text-cyan-300 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-cyan-400" />
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{user.roleTitle}</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900 text-cyan-400 border border-slate-800">
                      {user.badgeId}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
              New warehouse personnel?{' '}
              <button
                onClick={() => setAuthModalView('signup')}
                className="text-cyan-400 hover:underline font-semibold cursor-pointer"
              >
                Sign up / Request Access Profile
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: SIGN UP / OPERATOR REGISTRATION                       */}
        {/* ------------------------------------------------------------- */}
        {currentView === 'signup' && (
          <div className="p-6 space-y-5">
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {signupError && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{signupError}</span>
                </div>
              )}

              {/* Full Name & Badge ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Operator Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Jordan Lee"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Employee Badge ID
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={signupBadge}
                      onChange={(e) => setSignupBadge(e.target.value)}
                      placeholder="OP-XXXX"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Corporate Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="jordan.lee@nexuswms.io"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Operational Role & Clearance
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
                  >
                    <option value="shift_supervisor">Shift Supervisor (Tier-3)</option>
                    <option value="inventory_lead">Inventory Lead (Tier-2)</option>
                    <option value="picker_packer">Wave Picker & Packer (Tier-1)</option>
                    <option value="logistics_officer">Logistics & Dock Officer (Tier-2)</option>
                    <option value="system_admin">System Admin (Tier-4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assigned Shift Schedule
                  </label>
                  <select
                    value={signupShift}
                    onChange={(e) => setSignupShift(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
                  >
                    <option value="Shift Alpha (06:00 - 14:00)">Shift Alpha (06:00 - 14:00)</option>
                    <option value="Shift Bravo (14:00 - 22:00)">Shift Bravo (14:00 - 22:00)</option>
                    <option value="Shift Charlie (22:00 - 06:00)">Shift Charlie (22:00 - 06:00)</option>
                  </select>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Create Security Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Repeat passcode"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="text-[11px] text-slate-400 flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  required
                  defaultChecked
                  className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0 mt-0.5 cursor-pointer"
                />
                <span>
                  I acknowledge warehouse safety, Hazmat protocol compliance (Zone D), and audited inventory handling protocols.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Register Operator & Launch Terminal</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer Return */}
            <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
              Already have an authorized profile?{' '}
              <button
                onClick={() => setAuthModalView('login')}
                className="text-cyan-400 hover:underline font-semibold cursor-pointer"
              >
                Sign In here
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: FORGOT PASSWORD / ACCESS RECOVERY                     */}
        {/* ------------------------------------------------------------- */}
        {currentView === 'forgot' && (
          <div className="p-6 space-y-5">
            {/* Step Indicators */}
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800">
              <span className={`flex items-center gap-1.5 ${forgotStep >= 1 ? 'text-cyan-400 font-bold' : 'text-slate-600'}`}>
                <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">1</span>
                Identity
              </span>
              <span className="text-slate-600">→</span>
              <span className={`flex items-center gap-1.5 ${forgotStep >= 2 ? 'text-cyan-400 font-bold' : 'text-slate-600'}`}>
                <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">2</span>
                OTP Code
              </span>
              <span className="text-slate-600">→</span>
              <span className={`flex items-center gap-1.5 ${forgotStep === 3 ? 'text-cyan-400 font-bold' : 'text-slate-600'}`}>
                <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">3</span>
                New Key
              </span>
            </div>

            {forgotError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: Enter email or badge */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendRecoveryCode} className="space-y-4">
                <div className="text-xs text-slate-300">
                  Enter your registered corporate email or employee badge ID to receive a secure one-time authorization token.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registered Email / Badge ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. alex.mercer@nexuswms.io or OP-8842"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Recovery Authorization Token</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Verify OTP code */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                {forgotMessage && (
                  <div className="p-3 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
                    <span>{forgotMessage}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      6-Digit Security Token
                    </label>
                    <button
                      type="button"
                      onClick={() => setVerificationCode('948210')}
                      className="text-[11px] text-cyan-400 hover:underline font-mono"
                    >
                      Autofill Code (948210)
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="948210"
                    className="w-full text-center text-lg tracking-[0.3em] font-mono py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 cursor-pointer"
                  >
                    <span>Verify Security Token</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Enter New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="text-xs text-slate-300">
                  Security authorization confirmed. Create your new operator security passcode.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Security Passcode
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm New Passcode
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new passcode"
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Update Passcode & Authenticate</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Sign In Link */}
            <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
              Remembered your credentials?{' '}
              <button
                onClick={() => setAuthModalView('login')}
                className="text-cyan-400 hover:underline font-semibold cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
