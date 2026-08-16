import React, { useState } from "react";
import { Sailing, FYData } from "../types";
import {
  getNriDays,
  daysToMD,
  calcTax,
  fyEnd,
  formatDateStr,
} from "../utils/calc";
import {
  BarChart3,
  Anchor,
  Globe,
  Calendar,
  AlertOctagon,
  FileText,
} from "lucide-react";

interface FyOverviewProps {
  fyData: Record<string, FYData>;
  sailings: Sailing[];
  usdInrRate: number;
}

export default function FyOverview({
  fyData,
  sailings,
  usdInrRate,
}: FyOverviewProps) {
  const fyKeys = Object.keys(fyData).sort().reverse(); // Newest FY first
  const [expandedFYs, setExpandedFYs] = useState<Record<string, boolean>>({});

  const toggleExpand = (fy: string) => {
    setExpandedFYs((prev) => ({ ...prev, [fy]: !prev[fy] }));
  };

  if (fyKeys.length === 0) {
    return (
      <div id="page-fy" className="page active animate-fadeUp">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="page-header mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-app mb-2">
              FY Overview
            </h1>
            <p className="text-sm text-muted-app">
              Non-Resident Indian compliance across all financial years.
            </p>
          </div>
          <div className="card-surface border border-app rounded-2xl p-12 text-center text-muted-app shadow-sm flex flex-col items-center justify-center">
            <BarChart3 className="w-12 h-12 text-muted-app mb-3 opacity-40 animate-pulse" />
            <h3 className="text-base font-semibold text-app">
              No data available
            </h3>
            <p className="text-xs text-muted-app mt-1 max-w-sm mx-auto leading-relaxed">
              Log your voyages in the Sailing Log first to break down your
              entries by financial years.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="page-fy" className="page active animate-fadeUp">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pb-4 md:pb-6">
        <div className="page-header mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-app mb-2">
            Financial Year Overview
          </h1>
          <p className="text-sm text-muted-app measure-prose">
            Track and review your NRI compliance history and earnings
            year-by-year.
          </p>
        </div>

        <div className="space-y-4">
          {fyKeys.map((fy, idx) => {
            const d = fyData[fy];
            const isExpanded = expandedFYs[fy] ?? idx === 0; // Expand first one by default
            const outside = d.outsideDays;
            const threshold = getNriDays(d.fyYear);
            const isNRI = outside >= threshold;
            const remaining = threshold - outside;
            const pct = Math.min((outside / threshold) * 100, 100);

            // Salary calculations for this FY
            let totalUSD = 0;
            let totalINR = 0;
            const fySalarySailingIds = d.sailings.filter((ref) => {
              const s = sailings.find((x) => x.id === ref.id);
              return s && s.monthlySalary && s.monthlySalary > 0;
            });

            fySalarySailingIds.forEach((ref) => {
              const s = sailings.find((x) => x.id === ref.id);
              if (!s || !s.monthlySalary) return;
              const rateToUse = s.usdRate || usdInrRate;
              const earn = (s.monthlySalary / 30) * ref.daysInFY;
              totalUSD += earn;
              totalINR += earn * rateToUse;
            });

            // Under New Tax Regime (Section 115BAC), Chapter VI-A deductions are not applicable
            const deductions = 0;
            const taxCalcResult = calcTax(
              totalINR,
              d.fyYear,
              "new",
              deductions,
            );
            const estimatedTax = isNRI ? 0 : taxCalcResult.total;
            const netIncome = totalINR - estimatedTax;

            return (
              <div
                key={fy}
                className="card-surface border border-app rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
              >
                {/* Collapsible Header */}
                <div
                  onClick={() => toggleExpand(fy)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3 cursor-pointer hover:bg-recessed select-none transition-colors"
                >
                  <div>
                    <h3 className="text-base font-bold text-app">
                      FY {fy}
                    </h3>
                    <p className="text-xs text-muted-app font-mono mt-0.5">
                      Apr {d.fyYear} – Mar {d.fyYear + 1} &bull;{" "}
                      {d.sailings.length} voyage
                      {d.sailings.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-bold bg-recessed border border-app text-app rounded-full px-2.5 py-0.5 font-mono">
                      {outside}d / {daysToMD(outside)}
                    </span>
                    {isNRI ? (
                      <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full px-2.5 py-0.5">
                        ✓ NRI
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 rounded-full px-2.5 py-0.5">
                        Resident
                      </span>
                    )}
                    <svg
                      className={`w-4 h-4 text-muted-app transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Collapsible Body */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isExpanded
                      ? "max-h-[2500px] border-t border-app p-5"
                      : "max-h-0"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span
                      className={`text-4xl font-bold font-mono leading-none ${isNRI ? "text-emerald-700" : "text-amber-700"}`}
                    >
                      {outside}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-muted-app">
                        Days Outside India
                      </div>
                      <div
                        className={`text-xs font-semibold mt-0.5 ${isNRI ? "text-emerald-700" : "text-amber-700"}`}
                      >
                        {isNRI
                          ? `+${outside - threshold} days surplus`
                          : `${remaining} days short`}
                      </div>
                    </div>
                  </div>

                  <div className="progress-bar w-full bg-recessed h-1.5 rounded-full overflow-hidden mb-6 border border-app">
                    <div
                      className={`h-full rounded-full ${isNRI ? "bg-emerald-600" : "bg-rose-500"}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  {/* Voyage breakdown table */}
                  <div className="table-responsive-container mb-6">
                    <table className="w-full text-left border-collapse text-xs min-w-[480px]">
                      <thead>
                        <tr className="border-b border-app text-muted-app font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-2">Sign On</th>
                          <th className="py-2.5 px-2">Sign Off</th>
                          <th className="py-2.5 px-2">Port</th>
                          <th className="py-2.5 px-2">Vessel</th>
                          <th className="py-2.5 px-2">Rank</th>
                          <th className="py-2.5 px-2 text-right">Days</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-app text-app font-mono">
                        {d.sailings.map((s) => (
                          <tr key={s.id} className="hover:bg-recessed transition-colors">
                            <td className="py-2.5 px-2 whitespace-nowrap">
                              {formatDateStr(s.depDate)}
                            </td>
                            <td className="py-2.5 px-2 whitespace-nowrap">
                              {formatDateStr(s.arrDate)}
                            </td>
                            <td className="py-2.5 px-2 font-sans whitespace-nowrap">
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
                            <td className="py-2.5 px-2 font-sans truncate max-w-[100px]">
                              {s.vessel || "—"}
                            </td>
                            <td className="py-2.5 px-2 font-sans truncate">
                              {s.rank || "—"}
                            </td>
                            <td className="py-2.5 px-2 text-right whitespace-nowrap">
                              <span className="font-bold text-app bg-recessed border border-app px-2 py-0.5 rounded">
                                {s.daysInFY}d
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Deadline Notification */}
                  {!isNRI &&
                    remaining > 0 &&
                    (() => {
                      const fe = fyEnd(d.fyYear);
                      const lastDep = new Date(
                        fe.getFullYear(),
                        fe.getMonth(),
                        fe.getDate(),
                      );
                      lastDep.setDate(lastDep.getDate() - remaining + 1);
                      const now = new Date();
                      const today = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate(),
                      );
                      const daysLeft = Math.ceil(
                        (lastDep.getTime() - today.getTime()) / 86400000,
                      );

                      return lastDep >= today ? (
                        <div className="flex items-center gap-3 bg-recessed border border-app p-4 rounded-xl text-xs text-app mb-6 font-mono">
                          <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <div>
                            <div className="font-bold text-muted-app uppercase tracking-wide text-[10px]">
                              Last Date to Sail
                            </div>
                            <div className="text-amber-800 font-bold mt-0.5">
                              {formatDateStr(lastDep)} &bull; {daysLeft} days
                              remaining
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-recessed border border-app p-4 rounded-xl text-xs text-app mb-6 font-mono">
                          <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0" />
                          <div>
                            <div className="font-bold text-muted-app uppercase tracking-wide text-[10px]">
                              Deadline Passed
                            </div>
                            <div className="text-rose-700 font-bold mt-0.5">
                              NRI eligibility is not achievable this year
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  {/* Salary block inside collapsible card */}
                  {totalUSD > 0 && (
                    <div className="border-t border-app pt-5 mt-5">
                      <div className="text-[10px] font-bold text-muted-app uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-muted-app" />
                        Financial &amp; Tax Report
                      </div>
                      <div className="bg-recessed rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-app">
                        <div>
                          <div className="text-xs text-muted-app font-semibold mb-1">
                            {isNRI
                              ? "Estimated Earnings (NRI Status)"
                              : "Estimated Resident Tax (Resident Status)"}
                          </div>
                          <div className="text-base md:text-lg font-bold font-mono text-app flex items-center gap-2 flex-wrap">
                            <span className="text-emerald-700">
                              ${Math.round(totalUSD).toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-muted-app font-normal">
                              ≈ ₹{Math.round(totalINR).toLocaleString("en-IN")}{" "}
                              Gross
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-app font-semibold mt-1">
                            {isNRI
                              ? "Exempt from Indian Income Tax under Section 10(6)(viii)"
                              : `New Regime tax estimate with ₹75,000 standard deduction`}
                          </div>
                        </div>

                        {!isNRI && (
                          <div className="flex gap-4 border-t border-app md:border-t-0 pt-3 md:pt-0">
                            <div>
                              <div className="text-[10px] text-muted-app font-bold uppercase tracking-wider mb-0.5">
                                Tax Due
                              </div>
                              <div className="text-sm font-bold font-mono text-rose-700">
                                ₹{estimatedTax.toLocaleString("en-IN")}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-muted-app font-bold uppercase tracking-wider mb-0.5">
                                Net Take-Home
                              </div>
                              <div className="text-sm font-bold font-mono text-emerald-800">
                                ₹{netIncome.toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
