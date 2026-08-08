import React, { useState } from "react";
import { Sailing, Profile } from "../types";
import {
  daysBetween,
  fyFromDate,
  clampToFY,
  parseDate,
  formatDateStr,
} from "../utils/calc";
import {
  Ship,
  Anchor,
  Calendar,
  Award,
  Download,
  FileJson,
  FileSpreadsheet,
  Printer,
  FolderOpen,
  Trash2,
  Globe,
  Edit2,
  Search,
  Filter,
  FileText
} from "lucide-react";
import SeaTimeTranscriptModal from "./SeaTimeTranscriptModal";

interface SailingLogProps {
  profile: Profile;
  sailings: Sailing[];
  onUpdateProfile: (field: keyof Profile, value: string) => void;
  onOpenVoyageModal: (id?: number) => void;
  onDeleteVoyage: (id: number) => void;
  onClearAll: () => void;
  onImportPrompt: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export default function SailingLog({
  profile,
  sailings,
  onUpdateProfile,
  onOpenVoyageModal,
  onDeleteVoyage,
  onClearAll,
  onImportPrompt,
  onExportJSON,
  onExportCSV,
  onExportPDF,
}: SailingLogProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [portFilter, setPortFilter] = useState<string>("all");
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  const now = new Date();
  const curFYYear = fyFromDate(now);

  const valid = sailings.filter(
    (s) => s.dep && s.arr && new Date(s.arr) >= new Date(s.dep),
  );

  // Compute Stats
  const totalVoyages = sailings.length;

  const latestSailing = [...sailings].sort(
    (a, b) => new Date(b.dep || 0).getTime() - new Date(a.dep || 0).getTime(),
  )[0];
  const latestVessel = latestSailing?.vessel || "—";

  let currentFYDays = 0;
  valid.forEach((s) => {
    currentFYDays += clampToFY(new Date(s.dep), new Date(s.arr), curFYYear);
  });

  let longestDays = 0;
  valid.forEach((s) => {
    const d = daysBetween(new Date(s.dep), new Date(s.arr));
    if (d > longestDays) longestDays = d;
  });

  const sortedSailings = [...sailings]
    .filter((s) => {
      const matchSearch =
        s.vessel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rank.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPort = portFilter === "all" || s.portType === portFilter;
      return matchSearch && matchPort;
    })
    .sort(
      (a, b) => new Date(b.dep || 0).getTime() - new Date(a.dep || 0).getTime(),
    );

  return (
    <div id="page-log" className="page active animate-fadeUp">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        <div className="page-header mb-6 lg:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 lg:mb-3">
            Sailing Log
          </h1>
          <p className="text-sm lg:text-base text-slate-400 measure-prose">
            Track your voyages. Enter sign-on and sign-off dates to calculate
            NRI days.
          </p>
        </div>

        {/* Bento Stats */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 lg:mb-8"
          id="log-stats"
        >
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col items-start gap-1 shadow-md">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Ship className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-white font-mono tabular-nums mt-1">
              {totalVoyages}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              Voyages Logged
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col items-start gap-1 shadow-md">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Anchor className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-white truncate max-w-full mt-1">
              {latestVessel}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              Latest Vessel
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col items-start gap-1 shadow-md">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-white font-mono tabular-nums mt-1">
              {currentFYDays}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              Days this FY
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col items-start gap-1 shadow-md">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-white font-mono tabular-nums mt-1">
              {longestDays > 0 ? `${longestDays}d` : "0"}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              Longest Voyage
            </div>
          </div>
        </div>

        {/* Voyage Entries Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vessel name or rank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none"
              />
            </div>

            <select
              value={portFilter}
              onChange={(e) => setPortFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-1.5 outline-none focus:border-emerald-500"
            >
              <option value="all">All Port Types</option>
              <option value="indian">Indian CDC</option>
              <option value="foreign">Foreign Passport</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2 items-center shrink-0">
            <button
              onClick={() => setIsTranscriptOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> Sea Time Transcript
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer select-none flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export ▾
              </button>
              {isExportOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsExportOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-20">
                    <button
                      onClick={() => {
                        onExportJSON();
                        setIsExportOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white border-none cursor-pointer flex items-center gap-2"
                    >
                      <FileJson className="w-3.5 h-3.5 text-slate-400" /> JSON
                      Backup
                    </button>
                    <button
                      onClick={() => {
                        onExportCSV();
                        setIsExportOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white border-none cursor-pointer flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />{" "}
                      CSV Spreadsheet
                    </button>
                    <button
                      onClick={() => {
                        onExportPDF();
                        setIsExportOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white border-none cursor-pointer flex items-center gap-2"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-400" /> Print /
                      PDF
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onImportPrompt}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer flex items-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5" /> Import
            </button>
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/50 hover:bg-red-950/20 border border-slate-800 hover:border-red-900/30 text-slate-400 hover:text-red-400 cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Voyage Cards List */}
        <div className="space-y-3 mb-8" id="voyage-list">
          {sortedSailings.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800/40 rounded-2xl p-12 text-center text-slate-500 shadow-inner flex flex-col items-center justify-center">
              <Anchor
                className="w-12 h-12 text-slate-500 mb-3 opacity-30"
                strokeWidth={1.5}
              />
              <h3 className="text-base font-semibold text-slate-400">
                No voyages logged yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Click the "+" button at the bottom right corner or "Log Voyage"
                on the dashboard to log your sign-on/sign-off entries.
              </p>
            </div>
          ) : (
            sortedSailings.map((s, idx) => {
              const dep = s.dep ? parseDate(s.dep) : null;
              const arr = s.arr ? parseDate(s.arr) : null;
              const days = dep && arr && arr >= dep ? daysBetween(dep, arr) : 0;
              const pillClass =
                days >= 60
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : days >= 30
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20";
              const barPct =
                longestDays > 0 ? (days / Math.max(longestDays, 90)) * 100 : 0;

              return (
                <div
                  key={s.id}
                  className="bg-slate-900/60 backdrop-blur-md border border-slate-800 border-l-4 border-l-emerald-500 rounded-2xl p-5 hover:translate-y-[-1px] hover:border-slate-700 transition-all shadow-md flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-slate-200 text-base leading-snug">
                          {s.vessel || "Unnamed Vessel"}
                        </span>
                        {s.rank && (
                          <span className="text-[10px] font-semibold bg-slate-800 border border-slate-700/60 text-slate-400 rounded-full px-2 py-0.5">
                            {s.rank}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                        <span>{dep ? formatDateStr(dep) : "—"}</span>
                        <span className="text-slate-600">→</span>
                        <span>{arr ? formatDateStr(arr) : "—"}</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => onOpenVoyageModal(s.id)}
                        className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit Voyage"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteVoyage(s.id)}
                        className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete Voyage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span
                      className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${pillClass}`}
                    >
                      {days} Days total
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-800/40 border border-slate-800 text-slate-400 rounded-full px-2 py-0.5 flex items-center gap-1">
                      {s.portType === "indian" ? (
                        <>
                          <Anchor className="w-2.5 h-2.5 text-slate-500" /> CDC
                          (Indian Port)
                        </>
                      ) : (
                        <>
                          <Globe className="w-2.5 h-2.5 text-slate-500" />{" "}
                          Passport (Foreign Port)
                        </>
                      )}
                    </span>
                    {s.monthlySalary ? (
                      <span className="text-[10px] font-semibold bg-slate-800/40 border border-slate-800 text-slate-400 rounded-full px-2 py-0.5">
                        ${s.monthlySalary.toLocaleString()}/mo
                        {s.usdRate ? ` · ₹${s.usdRate}` : ""}
                      </span>
                    ) : null}
                  </div>

                  {/* Horizontal visual indicator timeline bar */}
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Seafarer Profile (Sticky/Permanent Bento panel) */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2 mb-4">
            <span className="w-1.5 h-3 bg-emerald-500 rounded-sm"></span>{" "}
            Seafarer Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => onUpdateProfile("name", e.target.value)}
                placeholder="Your Name"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Current Rank
              </label>
              <input
                type="text"
                value={profile.rank}
                onChange={(e) => onUpdateProfile("rank", e.target.value)}
                placeholder="e.g. 3rd Officer"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Current Vessel
              </label>
              <input
                type="text"
                value={profile.vessel}
                onChange={(e) => onUpdateProfile("vessel", e.target.value)}
                placeholder="e.g. MV Ocean Star"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Date of Birth
              </label>
              <input
                type="date"
                value={profile.dob || ""}
                onChange={(e) => onUpdateProfile("dob", e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400">
                Primary Classification / Status
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => onUpdateProfile("userType", "seafarer")}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    profile.userType !== "nri"
                      ? "bg-emerald-500 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Seafarer
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateProfile("userType", "nri")}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    profile.userType === "nri"
                      ? "bg-emerald-500 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  General NRI
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chai4Me Support Block */}
        <div className="text-center mt-12 pt-6 border-t border-slate-800/40">
          <p className="text-[11px] font-semibold text-slate-300 tracking-wider uppercase mb-3">
            Enjoying the app? Support the developer
          </p>
          <a
            href="https://chai4.me/alfred"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-col items-center justify-center bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-2xl px-6 py-2.5 transition-all group active:scale-95 shadow-md shadow-amber-500/5"
          >
            <img
              src="https://chai4.me/icons/wordmark.png"
              alt="Chai4Me"
              className="h-6 object-contain mb-1 chai4me-logo group-hover:scale-105 transition-transform"
            />
            <span className="text-xs font-semibold text-amber-400">
              @alfred
            </span>
          </a>
        </div>
        {/* Sea Time Transcript Modal */}
        <SeaTimeTranscriptModal
          isOpen={isTranscriptOpen}
          onClose={() => setIsTranscriptOpen(false)}
          profile={profile}
          sailings={sailings}
        />
      </div>
    </div>
  );
}
