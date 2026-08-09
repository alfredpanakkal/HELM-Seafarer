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
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-app mb-2 lg:mb-3">
            Sailing Log
          </h1>
          <p className="text-sm lg:text-base text-muted-app measure-prose">
            Track your voyages. Enter sign-on and sign-off dates to calculate
            NRI days.
          </p>
        </div>

        {/* Bento Stats */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 lg:mb-8"
          id="log-stats"
        >
          <div className="card-surface rounded-xl p-4 flex flex-col items-start gap-1 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Ship className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-app font-mono tabular-nums mt-1">
              {totalVoyages}
            </div>
            <div className="text-[11px] text-muted-app font-semibold uppercase tracking-wider">
              Voyages Logged
            </div>
          </div>
          <div className="card-surface rounded-xl p-4 flex flex-col items-start gap-1 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Anchor className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="text-base font-bold text-app truncate max-w-full mt-1">
              {latestVessel}
            </div>
            <div className="text-[11px] text-muted-app font-semibold uppercase tracking-wider">
              Latest Vessel
            </div>
          </div>
          <div className="card-surface rounded-xl p-4 flex flex-col items-start gap-1 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-700" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-app font-mono tabular-nums mt-1">
              {currentFYDays}
            </div>
            <div className="text-[11px] text-muted-app font-semibold uppercase tracking-wider">
              Days this FY
            </div>
          </div>
          <div className="card-surface rounded-xl p-4 flex flex-col items-start gap-1 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-app font-mono tabular-nums mt-1">
              {longestDays > 0 ? `${longestDays}d` : "0"}
            </div>
            <div className="text-[11px] text-muted-app font-semibold uppercase tracking-wider">
              Longest Voyage
            </div>
          </div>
        </div>

        {/* Voyage Entries Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 bg-recessed p-3 rounded-2xl border border-app">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-muted-app absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vessel name or rank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-app focus:border-emerald-600 rounded-xl pl-9 pr-3 py-1.5 text-xs text-app outline-none"
              />
            </div>

            <select
              value={portFilter}
              onChange={(e) => setPortFilter(e.target.value)}
              className="bg-surface border border-app text-xs text-app rounded-xl px-3 py-1.5 outline-none focus:border-emerald-600"
            >
              <option value="all">All Port Types</option>
              <option value="indian">Indian CDC</option>
              <option value="foreign">Foreign Passport</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2 items-center shrink-0">
            <button
              onClick={() => setIsTranscriptOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer flex items-center gap-1.5 border-none shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" /> Sea Time Transcript
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-app text-app hover:bg-recessed cursor-pointer select-none flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Export ▾
              </button>
              {isExportOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsExportOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-1 w-48 bg-surface border border-app rounded-xl shadow-lg overflow-hidden z-20">
                    <button
                      onClick={() => {
                        onExportJSON();
                        setIsExportOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-app hover:bg-recessed border-none cursor-pointer flex items-center gap-2"
                    >
                      <FileJson className="w-3.5 h-3.5 text-muted-app" /> JSON
                      Backup
                    </button>
                    <button
                      onClick={() => {
                        onExportCSV();
                        setIsExportOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-app hover:bg-recessed border-none cursor-pointer flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-muted-app" />{" "}
                      CSV Spreadsheet
                    </button>
                    <button
                      onClick={() => {
                        onExportPDF();
                        setIsExportOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-app hover:bg-recessed border-none cursor-pointer flex items-center gap-2"
                    >
                      <Printer className="w-3.5 h-3.5 text-muted-app" /> Print /
                      PDF
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onImportPrompt}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-app text-app hover:bg-recessed cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <FolderOpen className="w-3.5 h-3.5" /> Import
            </button>
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-rose-50 border border-app hover:border-rose-200 text-muted-app hover:text-rose-700 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Voyage Cards List */}
        <div className="space-y-3 mb-8" id="voyage-list">
          {sortedSailings.length === 0 ? (
            <div className="bg-recessed border border-app rounded-2xl p-12 text-center text-muted-app flex flex-col items-center justify-center">
              <Anchor
                className="w-12 h-12 text-muted-app mb-3 opacity-40"
                strokeWidth={1.5}
              />
              <h3 className="text-base font-semibold text-app">
                No voyages logged yet
              </h3>
              <p className="text-xs text-muted-app mt-1 max-w-sm mx-auto leading-relaxed">
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
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : days >= 30
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-red-50 text-red-800 border-red-200";
              const barPct =
                longestDays > 0 ? (days / Math.max(longestDays, 90)) * 100 : 0;

              return (
                <div
                  key={s.id}
                  className="card-surface border-l-4 border-l-emerald-600 rounded-2xl p-5 hover:translate-y-[-1px] transition-all shadow-sm flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-app text-base leading-snug">
                          {s.vessel || "Unnamed Vessel"}
                        </span>
                        {s.rank && (
                          <span className="text-[10px] font-semibold bg-recessed border border-app text-muted-app rounded-full px-2 py-0.5">
                            {s.rank}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-muted-app flex items-center gap-1.5">
                        <span>{dep ? formatDateStr(dep) : "—"}</span>
                        <span className="text-muted-app">→</span>
                        <span>{arr ? formatDateStr(arr) : "—"}</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => onOpenVoyageModal(s.id)}
                        className="w-8 h-8 rounded-lg bg-surface border border-app text-muted-app hover:text-app hover:bg-recessed flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit Voyage"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteVoyage(s.id)}
                        className="w-8 h-8 rounded-lg bg-surface border border-app text-muted-app hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
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
                    <span className="text-[10px] font-semibold bg-recessed border border-app text-muted-app rounded-full px-2 py-0.5 flex items-center gap-1">
                      {s.portType === "indian" ? (
                        <>
                          <Anchor className="w-2.5 h-2.5 text-muted-app" /> CDC
                          (Indian Port)
                        </>
                      ) : (
                        <>
                          <Globe className="w-2.5 h-2.5 text-muted-app" />{" "}
                          Passport (Foreign Port)
                        </>
                      )}
                    </span>
                    {s.monthlySalary ? (
                      <span className="text-[10px] font-semibold bg-recessed border border-app text-muted-app rounded-full px-2 py-0.5">
                        ${s.monthlySalary.toLocaleString()}/mo
                        {s.usdRate ? ` · ₹${s.usdRate}` : ""}
                      </span>
                    ) : null}
                  </div>

                  {/* Horizontal visual indicator timeline bar */}
                  <div className="w-full bg-recessed border border-app h-1 rounded-full overflow-hidden">
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
        <div className="card-surface border border-app rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold tracking-widest text-muted-app uppercase flex items-center gap-2 mb-4">
            <span className="w-1.5 h-3 bg-emerald-600 rounded-sm"></span>{" "}
            Seafarer Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-app">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => onUpdateProfile("name", e.target.value)}
                placeholder="Your Name"
                className="bg-recessed border border-app rounded-xl px-4 py-2.5 text-sm text-app outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-app">
                Current Rank
              </label>
              <input
                type="text"
                value={profile.rank}
                onChange={(e) => onUpdateProfile("rank", e.target.value)}
                placeholder="e.g. 3rd Officer"
                className="bg-recessed border border-app rounded-xl px-4 py-2.5 text-sm text-app outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-app">
                Current Vessel
              </label>
              <input
                type="text"
                value={profile.vessel}
                onChange={(e) => onUpdateProfile("vessel", e.target.value)}
                placeholder="e.g. MV Ocean Star"
                className="bg-recessed border border-app rounded-xl px-4 py-2.5 text-sm text-app outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-app">
                Date of Birth
              </label>
              <input
                type="date"
                value={profile.dob || ""}
                onChange={(e) => onUpdateProfile("dob", e.target.value)}
                className="bg-recessed border border-app rounded-xl px-4 py-2.5 text-sm text-app outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-app">
                Primary Classification / Status
              </label>
              <div className="grid grid-cols-2 gap-2 bg-recessed p-1 border border-app rounded-xl">
                <button
                  type="button"
                  onClick={() => onUpdateProfile("userType", "seafarer")}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    profile.userType !== "nri"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-muted-app hover:text-app"
                  }`}
                >
                  Seafarer
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateProfile("userType", "nri")}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    profile.userType === "nri"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-muted-app hover:text-app"
                  }`}
                >
                  General NRI
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chai4Me Support Block */}
        <div className="text-center mt-12 pt-6 border-t border-app">
          <p className="text-[11px] font-semibold text-muted-app tracking-wider uppercase mb-3">
            Enjoying the app? Support the developer
          </p>
          <a
            href="https://chai4.me/alfred"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-col items-center justify-center bg-surface hover:bg-recessed border border-app hover:border-amber-500/50 rounded-2xl px-6 py-2.5 transition-all group active:scale-95 shadow-sm"
          >
            <img
              src="https://chai4.me/icons/wordmark.png"
              alt="Chai4Me"
              className="h-6 object-contain mb-1 chai4me-logo group-hover:scale-105 transition-transform"
            />
            <span className="text-xs font-semibold text-amber-700">
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
