import React, { useState, useEffect } from "react";
import { Sailing, FYData } from "../types";
import { getNriDays, fyStart, fyEnd, formatDateStr } from "../utils/calc";
import { Shield, Anchor, Globe } from "lucide-react";

interface NriStatusProps {
  sailings: Sailing[];
  fyData: Record<string, FYData>;
}

export default function NriStatus({ sailings, fyData }: NriStatusProps) {
  const fyKeys = Object.keys(fyData).sort();

  // State for selected FY
  const [selectedFY, setSelectedFY] = useState("");

  // Setup initial selection
  useEffect(() => {
    if (fyKeys.length > 0 && !selectedFY) {
      // Find current or most recent FY
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentFYYear = currentMonth >= 3 ? currentYear : currentYear - 1;
      const currentFYLabel = `${currentFYYear}-${String(currentFYYear + 1).slice(2)}`;

      if (fyKeys.includes(currentFYLabel)) {
        setSelectedFY(currentFYLabel);
      } else {
        setSelectedFY(fyKeys[fyKeys.length - 1]);
      }
    }
  }, [fyData, fyKeys]);

  // Projection States
  const [projDays, setProjDays] = useState<number | "">("");
  const [projPort, setProjPort] = useState<"indian" | "foreign">("indian");

  if (fyKeys.length === 0 || !selectedFY) {
    return (
      <div id="page-nri" className="page active animate-fadeUp">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="page-header mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-app mb-2">
              NRI Status
            </h1>
            <p className="text-sm text-muted-app">
              Non-Resident Indian eligibility under the 184-day rule.
            </p>
          </div>
          <div className="card-surface border border-app rounded-2xl p-12 text-center text-muted-app shadow-sm flex flex-col items-center justify-center">
            <Shield className="w-12 h-12 text-muted-app mb-3 opacity-40 animate-pulse" />
            <h3 className="text-base font-semibold text-app">
              No sailing data available
            </h3>
            <p className="text-xs text-muted-app mt-1 max-w-sm mx-auto leading-relaxed">
              Log your voyages in the Sailing Log first to compute your live NRI
              status and tax thresholds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const d = fyData[selectedFY];
  if (!d) return null;

  const outside = d.outsideDays;
  const threshold = getNriDays(d.fyYear);
  const remaining = threshold - outside;
  const isNRI = outside >= threshold;
  const pct = Math.min((outside / threshold) * 100, 100);

  // SVG ring properties
  const radius = 90;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  // Handle FY navigation buttons
  const navigateFY = (direction: number) => {
    const currentIndex = fyKeys.indexOf(selectedFY);
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < fyKeys.length) {
      setSelectedFY(fyKeys[nextIndex]);
    }
  };

  // Compute deadline dates
  let deadlineHtml = null;
  if (!isNRI && remaining > 0) {
    const fe = fyEnd(d.fyYear);
    const lastDep = new Date(fe.getFullYear(), fe.getMonth(), fe.getDate());
    lastDep.setDate(lastDep.getDate() - remaining + 1);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (lastDep >= today) {
      const daysLeft = Math.ceil(
        (lastDep.getTime() - today.getTime()) / 86400000,
      );
      deadlineHtml = (
        <div className="flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 md:p-5 mt-4">
          <div className="text-2xl text-amber-400">📅</div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Last Date to Sail (CDC Sign-on)
            </div>
            <div className="text-sm md:text-base font-bold text-amber-400 font-mono">
              {formatDateStr(lastDep)} &bull; {daysLeft} days remaining
            </div>
          </div>
        </div>
      );
    } else {
      deadlineHtml = (
        <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 md:p-5 mt-4">
          <div className="text-2xl text-red-400">⛔</div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Deadline Passed
            </div>
            <div className="text-sm md:text-base font-bold text-red-400">
              NRI eligibility is no longer achievable for FY {selectedFY}
            </div>
          </div>
        </div>
      );
    }
  }

  // Projection Calculations
  const projDaysNum = Number(projDays) || 0;
  const effectiveProj =
    projPort === "foreign" ? Math.max(0, projDaysNum - 1) : projDaysNum;
  const projectedTotal = outside + effectiveProj;
  const projectedRemaining = threshold - projectedTotal;
  const isProjAchieved = projectedTotal >= threshold;

  return (
    <div id="page-nri" className="page active animate-fadeUp">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pb-4 md:pb-6">
        <div className="page-header mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-app mb-2">
            NRI Status
          </h1>
          <p className="text-sm text-muted-app measure-prose">
            Non-Resident Indian eligibility under the 184-day rule.
          </p>
        </div>

        {/* FY Selector Card */}
        <div className="card-surface border border-app rounded-2xl p-5 mb-6 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1 w-full max-w-[320px]">
            <label className="text-xs font-semibold text-muted-app uppercase tracking-wider">
              Select Financial Year
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateFY(-1)}
                disabled={fyKeys.indexOf(selectedFY) === 0}
                className="w-10 h-10 rounded-xl border border-app bg-recessed hover:bg-surface text-app disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-base cursor-pointer shadow-sm"
              >
                ‹
              </button>
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                className="flex-1 bg-surface border border-app rounded-xl px-4 py-2.5 text-sm font-semibold text-app outline-none focus:border-emerald-600 cursor-pointer shadow-sm"
              >
                {fyKeys.map((fy) => (
                  <option key={fy} value={fy}>
                    FY {fy}
                  </option>
                ))}
              </select>
              <button
                onClick={() => navigateFY(1)}
                disabled={fyKeys.indexOf(selectedFY) === fyKeys.length - 1}
                className="w-10 h-10 rounded-xl border border-app bg-recessed hover:bg-surface text-app disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-base cursor-pointer shadow-sm"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Circular Progress Ring Card */}
        <div className="card-surface border border-app rounded-3xl p-6 md:p-8 mb-6 lg:mb-8 shadow-sm text-center flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
          {/* Ring Side */}
          <div className="flex flex-col items-center">
            <div className="relative w-52 h-52 md:w-60 md:h-60 mx-auto mb-4">
              <svg
                viewBox="0 0 220 220"
                className="w-full h-full transform -rotate-90"
              >
                {/* Outer background track circle */}
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="none"
                  stroke="var(--app-border)"
                  strokeWidth={strokeWidth}
                />
                {/* Foreground progress circle */}
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <span className="text-4xl md:text-5xl lg:text-6xl font-bold font-mono tabular-nums text-app leading-none">
                  {outside}
                </span>
                <span className="text-xs lg:text-sm text-muted-app font-medium mt-1">
                  of {threshold} days
                </span>
              </div>
            </div>

            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-600 font-mono tabular-nums mb-4">
              {Math.round(pct)}%
            </div>
          </div>

          {/* Stats Side */}
          <div className="flex flex-col w-full max-w-lg lg:text-left border-t lg:border-t-0 lg:border-l border-app pt-6 lg:pt-0 lg:pl-12">
            <div className="flex justify-center lg:justify-start mb-6">
              {isNRI ? (
                <span className="inline-flex items-center gap-1.5 px-4 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                  ✓ NRI Achieved &bull; {outside - threshold} days surplus
                </span>
              ) : outside > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-4 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-bold bg-amber-100 text-amber-900 border border-amber-200 shadow-sm">
                  ⚠ {remaining} days short of target
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-sm">
                  ✕ Resident Indian Status
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-8 lg:gap-12 mb-6">
              <div>
                <div className="text-[10px] lg:text-xs text-muted-app font-bold uppercase tracking-wider mb-1">
                  Days Outside India
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold font-mono text-app">
                  {outside}
                </div>
                <div className="progress-bar w-full bg-recessed h-1.5 lg:h-2 rounded-full overflow-hidden mt-2 border border-app">
                  <div
                    className={`h-full rounded-full ${isNRI ? "bg-emerald-600" : "bg-rose-500"}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="text-[10px] lg:text-xs text-muted-app font-bold uppercase tracking-wider mb-1">
                  {isNRI ? "Surplus Days" : "Days Remaining"}
                </div>
                <div
                  className={`text-2xl md:text-3xl lg:text-4xl font-bold font-mono ${isNRI ? "text-emerald-700" : "text-amber-700"}`}
                >
                  {Math.abs(remaining)}
                </div>
                <div className="text-xs lg:text-sm text-muted-app mt-2 font-mono">
                  Threshold: {threshold} days
                </div>
              </div>
            </div>

            {deadlineHtml}
          </div>
        </div>

        {/* Sailing List for this FY */}
        <div className="card-surface border border-app rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
          <h3 className="text-xs font-bold tracking-widest text-muted-app uppercase flex items-center gap-2 mb-4">
            <span className="w-1.5 h-3 bg-emerald-600 rounded-sm"></span>{" "}
            Sailings in FY {selectedFY}
          </h3>
          <div className="table-responsive-container">
            <table className="w-full text-left border-collapse text-xs md:text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-app text-muted-app font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Sign On</th>
                  <th className="py-3 px-3">Sign Off</th>
                  <th className="py-3 px-3">Port</th>
                  <th className="py-3 px-3">Vessel</th>
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3 text-right">Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app text-app font-mono">
                {d.sailings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-app">
                      No sailings mapped to this financial year.
                    </td>
                  </tr>
                ) : (
                  d.sailings.map((s) => (
                    <tr key={s.id} className="hover:bg-recessed transition-all">
                      <td className="py-3 px-3 whitespace-nowrap">
                        {formatDateStr(s.depDate)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {formatDateStr(s.arrDate)}
                      </td>
                      <td className="py-3 px-3 font-sans whitespace-nowrap">
                        <span className="flex items-center gap-1 text-xs text-app">
                          {s.portType === "indian" ? (
                            <>
                              <Anchor className="w-3.5 h-3.5 text-muted-app" />
                              <span>CDC</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3.5 h-3.5 text-muted-app" />
                              <span>Passport</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans max-w-[120px] truncate">
                        {s.vessel || "—"}
                      </td>
                      <td className="py-3 px-3 font-sans truncate">
                        {s.rank || "—"}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="inline-block bg-recessed border border-app px-2 py-0.5 rounded text-[11px] font-bold text-emerald-700">
                          {s.daysInFY}d
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t border-app text-app">
                  <td colSpan={5} className="py-4 px-3 text-sm">
                    Total Days Outside India
                  </td>
                  <td className="py-4 px-3 text-right">
                    <span
                      className={`inline-block border px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${isNRI ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-900 border-amber-200"}`}
                    >
                      {outside}d
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* NRI Projection Calculator */}
        <div className="card-surface border border-app rounded-3xl p-6 mb-6 shadow-sm">
          <h3 className="text-xs font-bold tracking-widest text-muted-app uppercase flex items-center gap-2 mb-2">
            <span className="w-1.5 h-3 bg-emerald-600 rounded-sm"></span> NRI
            Projection Calculator
          </h3>
          <p className="text-xs text-muted-app mb-4 leading-relaxed">
            Planning your next contract? Estimate your projected status by
            adding hypothetical sailing days.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-app">
                Additional Contract Days
              </label>
              <input
                type="number"
                value={projDays}
                placeholder="e.g. 60"
                min="0"
                max="365"
                onChange={(e) => {
                  const val =
                    e.target.value === ""
                      ? ""
                      : Math.max(0, parseInt(e.target.value) || 0);
                  setProjDays(val);
                }}
                className="bg-recessed border border-app rounded-xl px-4 py-2.5 text-sm font-mono text-app outline-none focus:border-emerald-600 shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-app">
                Sign On / Sign Off Port
              </label>
              <select
                value={projPort}
                onChange={(e) =>
                  setProjPort(e.target.value as "indian" | "foreign")
                }
                className="bg-recessed border border-app rounded-xl px-4 py-2.5 text-sm text-app outline-none focus:border-emerald-600 cursor-pointer shadow-sm"
              >
                <option value="indian">Indian Port (CDC)</option>
                <option value="foreign">Foreign Port (Passport)</option>
              </select>
            </div>
          </div>

          {projDays !== "" && (
            <div className="bg-recessed border border-app rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeUp">
              <div>
                <div className="text-[32px] font-bold font-mono text-emerald-700 leading-none">
                  {projectedTotal}
                </div>
                <div className="text-xs text-muted-app mt-1 font-mono">
                  Projected total days outside India
                </div>
              </div>
              <span
                className={`text-xs font-bold border rounded-full px-3 py-1 self-start sm:self-center ${projectedTotal >= threshold ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-900 border-amber-200"}`}
              >
                {projectedTotal >= threshold
                  ? `✓ Projected NRI Achieved — +${projectedTotal - threshold}d surplus`
                  : `⚠ ${projectedRemaining} days short of target`}
              </span>
            </div>
          )}
        </div>

        {/* Disclaimer / Informational block */}
        <details className="card-surface border border-app rounded-2xl p-4 text-xs text-muted-app leading-relaxed cursor-pointer group">
          <summary className="font-bold text-app outline-none select-none list-none flex items-center gap-1.5 hover:text-emerald-700">
            <span className="text-emerald-600 text-sm">⚠</span> Important Rules
            &amp; Guidelines for Seafarers (Click to expand)
          </summary>
          <ol className="list-decimal list-inside space-y-2 mt-3 pl-1">
            <li>
              <strong>The 184-Day Rule:</strong> Under Section 6(1) of the
              Income Tax Act, a seafarer qualifies for NRI status if they are
              outside India for <strong>184 days or more</strong> (or 185 days
              during leap years) in a financial year.
            </li>
            <li>
              <strong>CDC Continuous Discharge Certificate (CDC) Dates:</strong>{" "}
              For voyages commencing from Indian ports where sign-on and
              sign-off are stamped in CDC, the CDC date of sign-on to the CDC
              date of sign-off is counted as period outside India. Both the
              sign-on and sign-off dates are counted as days{" "}
              <strong>outside</strong> India.
            </li>
            <li>
              <strong>Passport Stamps (Foreign Ports):</strong> For sign-on/off
              stamped in the passport in foreign countries, the physical
              passport stamps are checked. Under general residency rules, the
              day of departure from India and the day of arrival back in India
              are both counted as days <strong>in</strong> India (hence we
              deduct 1 day from physical travel days).
            </li>
            <li>
              <strong>The Financial Year:</strong> Financial years in India run
              from <strong>April 1st to March 31st</strong> of the following
              year.
            </li>
            <li>
              This calculator is for reference purposes and does not represent
              official tax or legal consultancy.
            </li>
          </ol>
        </details>
      </div>
    </div>
  );
}
