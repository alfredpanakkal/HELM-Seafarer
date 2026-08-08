import React, { useState } from "react";
import {
  ShieldCheck,
  Cloud,
  Smartphone,
  Lock,
  CheckCircle2,
  Download,
  X,
  RefreshCw,
  LogOut,
  Info,
  ChevronRight,
  Database,
  ArrowRight,
} from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

interface CloudAccount {
  email: string;
  name: string;
  avatarUrl?: string;
  lastSynced: string;
}

interface CloudAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloudAccount: CloudAccount | null;
  onConnectGoogle: (email: string, name: string) => void;
  onDisconnectGoogle: () => void;
  onTriggerManualSync: () => void;
  onExportJSON: () => void;
  totalVoyagesCount: number;
}

export default function CloudAuthModal({
  isOpen,
  onClose,
  cloudAccount,
  onConnectGoogle,
  onDisconnectGoogle,
  onTriggerManualSync,
  onExportJSON,
  totalVoyagesCount,
}: CloudAuthModalProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showSimulatedInput, setShowSimulatedInput] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFirebaseAuth = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        onConnectGoogle(
          user.email,
          user.displayName || user.email.split("@")[0],
        );
      }
    } catch (err: any) {
      console.warn("Firebase popup sign in error or blocked:", err);
      setAuthError("Google sign-in popup opened or fallback enabled below.");
      setShowSimulatedInput(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSimulateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail || !googleEmail.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    const nameFromEmail = googleEmail.split("@")[0].replace(/[._]/g, " ");
    const formattedName =
      nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    onConnectGoogle(googleEmail, formattedName);
    setShowSimulatedInput(false);
  };

  const handleQuickConnect = () => {
    handleFirebaseAuth();
  };

  const handleManualSyncClick = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onTriggerManualSync();
      setIsSyncing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex max-sm:items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 max-sm:rounded-t-3xl max-sm:rounded-b-none sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] max-sm:w-full">
        {/* Mobile Pull Indicator Bar */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto my-2.5 shrink-0"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Data Storage &amp; Cloud Sync
              </h2>
              <p className="text-[11px] text-slate-400">
                100% Privacy-First &bull; Device Only or Cloud Backup
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border-none active:scale-95 shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200 text-xs">
          {/* Current Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
              cloudAccount
                ? "bg-emerald-950/20 border-emerald-800/60 text-emerald-300"
                : "bg-slate-950 border-slate-800 text-slate-300"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                cloudAccount
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {cloudAccount ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <Smartphone className="w-5 h-5 text-amber-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-100">
                  {cloudAccount
                    ? "Google Cloud Sync Active"
                    : "Guest Mode (Device-Only)"}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    cloudAccount
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {cloudAccount ? "Cloud Backed Up" : "100% Private & Local"}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {cloudAccount
                  ? `Logged in as ${cloudAccount.email}. Your ${totalVoyagesCount} voyage logs are synced across devices.`
                  : `Your ${totalVoyagesCount} voyage entries exist strictly inside this browser on your device.`}
              </p>

              {cloudAccount && (
                <div className="mt-3 pt-2.5 border-t border-emerald-800/30 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Last Synced:{" "}
                    <span className="text-slate-200 font-medium">
                      {cloudAccount.lastSynced}
                    </span>
                  </span>
                  <button
                    onClick={handleManualSyncClick}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer border-none bg-transparent"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Three Key Principles Explanations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase">
              How Data Works Here
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-xs">
                    1. Login is 100% Optional
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    You can log CDC ports, passport dates, calculate tax
                    regimes, and track sea time without ever creating an
                    account.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-xs">
                    2. Device-Only Default Privacy
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    All voyage data is stored directly in your browser's local
                    storage. No trackers, no ad networks, no external servers
                    monitoring your logs.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-xs">
                    3. Google Authentication (Cloud Sync)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Connect your Google Account to back up logs safely. Protects
                    your data if you clear browser cache or want to switch
                    seamlessly between mobile & laptop.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Connect / Actions Area */}
          {!cloudAccount ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-xs text-slate-200 flex items-center justify-between">
                <span>Connect Google Account for Backup</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                  Optional
                </span>
              </h4>

              {!showSimulatedInput ? (
                <div className="space-y-2">
                  <button
                    onClick={handleQuickConnect}
                    className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer text-xs active:scale-98"
                  >
                    {/* Google G Logo SVG */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  <button
                    onClick={() => setShowSimulatedInput(true)}
                    className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 py-1 cursor-pointer border-none bg-transparent"
                  >
                    Enter custom Google email instead &rarr;
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSimulateLogin} className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Your Google Email:
                    </label>
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="e.g. captain.smith@gmail.com"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl transition-all cursor-pointer text-xs"
                    >
                      Connect Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSimulatedInput(false)}
                      className="px-3 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs cursor-pointer border-none"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">
                  {cloudAccount.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {cloudAccount.email}
                </div>
              </div>
              <button
                onClick={onDisconnectGoogle}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/30 transition-all text-xs font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          )}

          {/* Backup Fallback */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              Want offline file backup without account?
            </span>
            <button
              onClick={onExportJSON}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3 text-emerald-400" />
              <span>Export .JSON</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Always reversible &bull; You control your data</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer border-none"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
