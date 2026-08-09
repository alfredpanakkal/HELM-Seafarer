import React, { useState } from "react";
import {
  Anchor,
  Download,
  Cloud,
  ChevronRight,
  ShieldAlert,
  Terminal,
  Sliders,
  UserCheck,
  Mail,
  Info,
  ShieldCheck,
  CheckCircle2,
  Database,
  Users,
  Edit2,
  User,
  Plus,
  CreditCard
} from "lucide-react";
import { Profile, DocumentItem } from "../types";
import DocumentVault from "./DocumentVault";

interface AboutProps {
  fontScale: number;
  onUpdateFontScale: (scale: number) => void;
  themePreset?: string;
  onUpdateThemePreset?: (theme: string) => void;
  fontFamily?: string;
  onUpdateFontFamily?: (font: string) => void;
  onExportBackup: () => void;
  onOpenCloudModal?: () => void;
  cloudAccount?: { email: string; name: string } | null;
  onConnectGoogle?: (email: string, name: string) => void;
  profiles?: Profile[];
  activeProfileId?: number;
  onSwitchProfile?: (id: number) => void;
  onAddProfile?: () => void;
  onEditProfile?: (id: number) => void;
  documents?: DocumentItem[];
  onAddDocument?: (doc: Omit<DocumentItem, "id" | "profileId">) => void;
  onDeleteDocument?: (id: number) => void;
  onUpdateDocument?: (doc: DocumentItem) => void;
}

export default function About({
  fontScale,
  onUpdateFontScale,
  themePreset = "slate-green",
  onUpdateThemePreset = () => {},
  fontFamily = "font-jakarta",
  onUpdateFontFamily = () => {},
  onExportBackup,
  onOpenCloudModal,
  cloudAccount,
  onConnectGoogle,
  profiles = [],
  activeProfileId = 1,
  onSwitchProfile,
  onAddProfile,
  onEditProfile,
  documents = [],
  onAddDocument = () => {},
  onDeleteDocument = () => {},
  onUpdateDocument = () => {},
}: AboutProps) {
  const [activeTab, setActiveTab] = useState<"info" | "documents" | "profiles" | "admin">("info");
  const [showDebugState, setShowDebugState] = useState(false);
  const [taxOverrideRule, setTaxOverrideRule] = useState<"standard" | "120day">(
    "standard",
  );
  const [adminNotification, setAdminNotification] = useState<string | null>(
    null,
  );

  const ADMIN_EMAIL = "yoursalfred@gmail.com";
  const isAdminLoggedIn =
    cloudAccount?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const getStorageSize = () => {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          total += (localStorage[key].length + key.length) * 2;
        }
      }
      return (total / 1024).toFixed(1) + " KB";
    } catch {
      return "12.4 KB";
    }
  };

  const getRawData = () => {
    try {
      const data = localStorage.getItem("seafarer_calc_data_v2");
      return data
        ? JSON.stringify(JSON.parse(data), null, 2)
        : "No data found in localStorage";
    } catch {
      return "Error reading localStorage payload";
    }
  };

  const triggerAdminAction = (msg: string) => {
    setAdminNotification(msg);
    setTimeout(() => setAdminNotification(null), 3000);
  };

  return (
    <div id="page-about" className="page active animate-fadeUp">
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        {/* Header & Section Navigation Tabs */}
        <div className="page-header mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
              About &amp; Settings
            </h1>
            <p className="text-sm text-slate-400 flex items-center gap-1.5 flex-wrap">
              Built with <Anchor className="w-4 h-4 text-emerald-500 inline" />{" "}
              for seafarers &bull; System Controls
            </p>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 self-start sm:self-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "info"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Info &amp; Settings</span>
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "documents"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Document Vault</span>
            </button>
            <button
              onClick={() => setActiveTab("profiles")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "profiles"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Profiles</span>
            </button>
            {isAdminLoggedIn && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "admin"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Administration</span>
              </button>
            )}
          </div>
        </div>

        {adminNotification && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeUp">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{adminNotification}</span>
          </div>
        )}

        {/* TAB 1: INFO & SETTINGS */}
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Data & Cloud Sync */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-sm"></span>{" "}
                Data &amp; Sync
              </h2>
              <div className="flex flex-col gap-3">
                <button
                  onClick={onOpenCloudModal}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 border border-slate-850 hover:border-emerald-500/50 rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Cloud
                      className={`w-5 h-5 ${cloudAccount ? "text-emerald-500" : "text-slate-400"}`}
                    />
                    <div className="text-left">
                      <div className="text-sm font-bold text-slate-200">
                        Google Cloud Sync
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {cloudAccount
                          ? `Connected as ${cloudAccount.email}`
                          : "Backup & sync across devices"}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-md text-[10px] font-bold ${cloudAccount ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"}`}
                  >
                    {cloudAccount ? "Connected" : "Connect"}
                  </div>
                </button>

                <button
                  onClick={onExportBackup}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5 text-slate-400" />
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-200">
                      Export Local JSON Backup
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Download encrypted offline JSON file
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Appearance & Design System Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-sm"></span>{" "}
                Design System &amp; Appearance
              </h2>

              {/* Theme Preset Choice */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Color Palette Preset
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 capitalize">
                    {themePreset.replace("-", " ")}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {[
                    { id: "slate-green", name: "Slate Green", color: "bg-[#238B45]" },
                    { id: "emerald", name: "Emerald", color: "bg-[#059669]" },
                    { id: "indigo", name: "Indigo", color: "bg-[#4F46E5]" },
                    { id: "warm-sand", name: "Warm Sand", color: "bg-[#15803D]" },
                    { id: "dark-night", name: "Dark Night", color: "bg-[#22C55E]" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onUpdateThemePreset(t.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        themePreset === t.id
                          ? "bg-slate-850 border-emerald-500 text-slate-100 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${t.color} shrink-0`} />
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography Font Pairing Choice */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Typeface Pairing
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {fontFamily === "font-jakarta"
                      ? "Plus Jakarta Sans"
                      : fontFamily === "font-inter"
                      ? "Inter"
                      : fontFamily === "font-system"
                      ? "System Sans"
                      : fontFamily === "font-playfair"
                      ? "Playfair Display"
                      : "JetBrains Mono"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {[
                    { id: "font-jakarta", label: "Jakarta", fontClass: "font-jakarta" },
                    { id: "font-inter", label: "Inter", fontClass: "font-inter" },
                    { id: "font-system", label: "System UI", fontClass: "font-system" },
                    { id: "font-playfair", label: "Playfair", fontClass: "font-playfair" },
                    { id: "font-mono-jb", label: "JB Mono", fontClass: "font-mono-jb" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onUpdateFontFamily(f.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer truncate ${f.fontClass} ${
                        fontFamily === f.id
                          ? "bg-slate-850 border-emerald-500 text-slate-100 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Scale */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-850 gap-3">
                <span className="text-sm font-semibold text-slate-300">
                  Text Scale
                </span>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => onUpdateFontScale(90)}
                    className={`px-3 py-1.5 flex items-center justify-center rounded-md text-xs font-bold cursor-pointer transition-all border-none ${fontScale <= 90 ? "bg-emerald-500 text-white shadow-md" : "bg-transparent text-slate-400 hover:text-slate-200"}`}
                  >
                    Small
                  </button>
                  <button
                    onClick={() => onUpdateFontScale(100)}
                    className={`px-3 py-1.5 flex items-center justify-center rounded-md text-xs font-bold cursor-pointer transition-all border-none ${fontScale > 90 && fontScale < 110 ? "bg-emerald-500 text-white shadow-md" : "bg-transparent text-slate-400 hover:text-slate-200"}`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => onUpdateFontScale(110)}
                    className={`px-3 py-1.5 flex items-center justify-center rounded-md text-xs font-bold cursor-pointer transition-all border-none ${fontScale >= 110 ? "bg-emerald-500 text-white shadow-md" : "bg-transparent text-slate-400 hover:text-slate-200"}`}
                  >
                    Large
                  </button>
                </div>
              </div>
            </div>

            {/* Architecture & Privacy */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg text-slate-400 text-xs">
              <h3 className="text-xs font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />{" "}
                Architecture &amp; Privacy First
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-slate-300">
                  React 19
                </span>
                <span className="text-[10px] bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-slate-300">
                  Vite 6
                </span>
                <span className="text-[10px] bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-slate-300">
                  TypeScript
                </span>
                <span className="text-[10px] bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-slate-300">
                  Tailwind CSS v4
                </span>
                <span className="text-[10px] bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-slate-300">
                  Chart.js
                </span>
                <span className="text-[10px] bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-slate-300">
                  localStorage API
                </span>
                <span className="text-[10px] bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-slate-300">
                  PWA Offline Capable
                </span>
              </div>
              <p className="mt-3 leading-relaxed text-slate-400 text-xs">
                This app operates 100% on standard client-side state. Your
                voyage data and calculations remain strictly stored in your
                browser. Backups can be exported anytime in standard JSON
                format.
              </p>
            </div>

            {/* Feedback & Contact */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200 mb-0.5">
                  Feedback &amp; Calculation Support
                </h4>
                <p className="text-xs text-slate-400 leading-normal max-w-sm">
                  Encountered a calculation mismatch or want to suggest a
                  feature? Drop an email.
                </p>
              </div>

              <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={onExportBackup}
                  className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Backup Data
                </button>
                <a
                  href="mailto:alphaprime7@protonmail.com"
                  className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-center select-none flex items-center justify-center gap-1.5 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Feedback
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB: DOCUMENT VAULT */}
        {activeTab === "documents" && (
          <DocumentVault
            documents={documents}
            activeProfileId={activeProfileId}
            onAddDocument={onAddDocument}
            onDeleteDocument={onDeleteDocument}
            onUpdateDocument={onUpdateDocument}
          />
        )}

        {/* TAB 2: PROFILES */}
        {activeTab === "profiles" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-sm"></span>
                  Manage Profiles
                </h2>
                <button
                  onClick={onAddProfile}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Profile
                </button>
              </div>

              <div className="space-y-3">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      p.id === activeProfileId
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-slate-950 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          p.id === activeProfileId
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          {p.name}
                          {p.id === activeProfileId && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {p.rank} • {p.vessel}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {p.id !== activeProfileId && onSwitchProfile && (
                        <button
                          onClick={() => onSwitchProfile(p.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Switch
                        </button>
                      )}
                      {onEditProfile && (
                        <button
                          onClick={() => onEditProfile(p.id)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADMINISTRATION */}
        {activeTab === "admin" && (
          <div className="space-y-6">
            {isAdminLoggedIn ? (
              <div className="space-y-6">
                {/* Admin Status Header */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                        <span>Admin Session Active</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                          {ADMIN_EMAIL}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        System diagnostics and inspection unlocked
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnostics & Overrides */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" /> System
                    Storage Diagnostics
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">
                        Storage Footprint
                      </div>
                      <div className="text-base font-bold text-slate-200 font-mono mt-0.5">
                        {getStorageSize()}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">
                        Tax Engine Mode
                      </div>
                      <div className="text-xs font-bold text-emerald-400 font-mono mt-1 capitalize">
                        {taxOverrideRule}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">
                        Cloud Connection
                      </div>
                      <div className="text-xs font-bold text-slate-300 truncate mt-1">
                        {cloudAccount?.email || "Not connected"}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setShowDebugState(!showDebugState)}
                      className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-amber-400" />{" "}
                          Toggle JSON Inspector
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Inspect raw localStorage payload in JSON format
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-500 transition-transform ${showDebugState ? "rotate-90" : ""}`}
                      />
                    </button>

                    <button
                      onClick={() => {
                        const next =
                          taxOverrideRule === "standard"
                            ? "120day"
                            : "standard";
                        setTaxOverrideRule(next);
                        triggerAdminAction(
                          `Tax Engine Rule set to ${next === "standard" ? "Standard 182-Day" : "120-Day High Income"}!`,
                        );
                      }}
                      className="p-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-emerald-400" />{" "}
                          Tax Rule Override Engine
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Current:{" "}
                          {taxOverrideRule === "standard"
                            ? "Standard 182 Days"
                            : "120 Days (High Indian Income > ₹15L)"}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>

                  {/* Debug Console Display */}
                  {showDebugState && (
                    <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-850">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-850">
                        <span className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5" /> localStorage Key:
                          seafarer_calc_data_v2
                        </span>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(getRawData())
                          }
                          className="text-[10px] text-slate-400 hover:text-white bg-slate-900 px-2.5 py-1 rounded border border-slate-800 cursor-pointer"
                        >
                          Copy Raw JSON
                        </button>
                      </div>
                      <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto max-h-60 p-3 bg-slate-900/80 rounded-lg">
                        {getRawData()}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* RESTRICTED PLACEHOLDER WHEN NOT LOGGED IN AS ALFRED */
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto my-6 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">
                    Access Restricted
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    The Administration tab contains system telemetry, raw debug
                    console inspectors, and rule override toggles. It is locked
                    exclusively to{" "}
                    <code className="text-emerald-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">
                      administrators
                    </code>
                    .
                  </p>
                </div>
                <div className="pt-2">
                  {onConnectGoogle ? (
                    <button
                      onClick={() =>
                        onConnectGoogle(ADMIN_EMAIL, "Alfred (Admin)")
                      }
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-98"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Authenticate as Administrator</span>
                    </button>
                  ) : (
                    <button
                      onClick={onOpenCloudModal}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                    >
                      <Cloud className="w-4 h-4 text-amber-400" />
                      <span>Open Google Authentication Dialog</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
