import React, { useState } from "react";
import { Sailing, Profile } from "../types";
import { daysBetween, formatDateStr, clampToFY, fyFromDate } from "../utils/calc";
import { Printer, Download, X, Award, Ship, Calendar, CheckCircle2, FileText, Anchor } from "lucide-react";

interface SeaTimeTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  sailings: Sailing[];
}

export default function SeaTimeTranscriptModal({
  isOpen,
  onClose,
  profile,
  sailings,
}: SeaTimeTranscriptModalProps) {
  const [selectedFY, setSelectedFY] = useState<string>("all");
  const [issuedTo, setIssuedTo] = useState<string>(profile.name || "Seafarer");
  const [remarks, setRemarks] = useState<string>(
    "This Sea Time Statement is certified based on official Continuous Discharge Certificate (CDC) and Passport entries."
  );

  if (!isOpen) return null;

  // Gather available FYs from sailings
  const fySet = new Set<string>();
  sailings.forEach((s) => {
    if (s.dep) {
      const fyY = fyFromDate(new Date(s.dep));
      fySet.add(`${fyY}-${(fyY + 1).toString().slice(-2)}`);
    }
    if (s.arr) {
      const fyY = fyFromDate(new Date(s.arr));
      fySet.add(`${fyY}-${(fyY + 1).toString().slice(-2)}`);
    }
  });
  const availableFYs = Array.from(fySet).sort().reverse();

  // Filter sailings by FY if selected
  const filteredSailings = sailings.filter((s) => {
    if (selectedFY === "all") return true;
    const fyYear = parseInt(selectedFY.split("-")[0], 10);
    if (!s.dep || !s.arr) return false;
    const daysInFY = clampToFY(new Date(s.dep), new Date(s.arr), fyYear);
    return daysInFY > 0;
  });

  // Calculate total Days
  let totalSeaDays = 0;
  filteredSailings.forEach((s) => {
    if (s.dep && s.arr) {
      if (selectedFY === "all") {
        totalSeaDays += daysBetween(new Date(s.dep), new Date(s.arr));
      } else {
        const fyYear = parseInt(selectedFY.split("-")[0], 10);
        totalSeaDays += clampToFY(new Date(s.dep), new Date(s.arr), fyYear);
      }
    }
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">Official Sea Time Statement Transcript</h2>
              <p className="text-xs text-slate-400">Generate formatted sea service transcript for DG Shipping, MCA, or Company review</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-emerald-500"
            >
              <option value="all">All Voyages History</option>
              {availableFYs.map((fy) => (
                <option key={fy} value={fy}>
                  FY {fy}
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Transcript Certificate Container */}
        <div className="p-6 md:p-10 overflow-y-auto bg-slate-950 text-slate-100 print:bg-white print:text-black print:p-8">
          {/* Document Header */}
          <div className="border-b-2 border-emerald-500 pb-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:border-black">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Anchor className="w-7 h-7 text-emerald-400 print:text-black" />
                <span className="text-xl font-extrabold uppercase tracking-tight text-white print:text-black">
                  SEAFARER SEA TIME TRANSCRIPT
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 font-medium">
                Continuous Discharge Certificate (CDC) & Passport Verified Service Record
              </p>
            </div>

            <div className="text-right text-xs text-slate-400 print:text-slate-700 font-mono">
              <div>Issued Date: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
              <div>Scope: {selectedFY === "all" ? "Complete Sailing Career" : `Financial Year ${selectedFY}`}</div>
            </div>
          </div>

          {/* Seafarer Personal Particulars Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs print:bg-slate-100 print:border-slate-300 print:text-black">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">Seafarer Name</span>
              <span className="font-bold text-sm text-slate-100 print:text-black">{profile.name || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">Rank / Capacity</span>
              <span className="font-bold text-sm text-emerald-400 print:text-black">{profile.rank || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">Primary Vessel</span>
              <span className="font-semibold text-slate-200 print:text-black">{profile.vessel || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block">Total Qualifying Sea Days</span>
              <span className="font-black text-sm text-emerald-400 print:text-emerald-700">{totalSeaDays} Days</span>
            </div>
          </div>

          {/* Detailed Voyages Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 print:bg-slate-200 print:text-black print:border-slate-400">
                  <th className="p-2.5 font-bold">#</th>
                  <th className="p-2.5 font-bold">Vessel Name</th>
                  <th className="p-2.5 font-bold">Rank</th>
                  <th className="p-2.5 font-bold">Sign-On (Departure)</th>
                  <th className="p-2.5 font-bold">Sign-Off (Arrival)</th>
                  <th className="p-2.5 font-bold">Port Verification</th>
                  <th className="p-2.5 font-bold text-right">Sea Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 print:divide-slate-300">
                {filteredSailings.map((s, idx) => {
                  const days = s.dep && s.arr ? (selectedFY === "all" ? daysBetween(new Date(s.dep), new Date(s.arr)) : clampToFY(new Date(s.dep), new Date(s.arr), parseInt(selectedFY.split("-")[0], 10))) : 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-900/40 print:hover:bg-transparent">
                      <td className="p-2.5 text-slate-500 font-mono print:text-slate-700">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-100 print:text-black">{s.vessel || "—"}</td>
                      <td className="p-2.5 text-slate-300 print:text-black">{s.rank || "—"}</td>
                      <td className="p-2.5 text-slate-300 print:text-black">{s.dep ? formatDateStr(s.dep) : "—"}</td>
                      <td className="p-2.5 text-slate-300 print:text-black">{s.arr ? formatDateStr(s.arr) : "—"}</td>
                      <td className="p-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${s.portType === "indian" ? "bg-amber-500/10 text-amber-400 print:bg-transparent print:text-black" : "bg-emerald-500/10 text-emerald-400 print:bg-transparent print:text-black"}`}>
                          {s.portType === "indian" ? "Indian CDC" : "Foreign Passport"}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-right text-slate-100 print:text-black">{days} Days</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900/90 font-bold border-t-2 border-slate-700 print:bg-slate-100 print:border-black print:text-black">
                  <td colSpan={6} className="p-3 text-right uppercase text-slate-300 print:text-black">
                    Total Service Days ({selectedFY === "all" ? "Career" : `FY ${selectedFY}`}):
                  </td>
                  <td className="p-3 text-right text-sm text-emerald-400 print:text-black">{totalSeaDays} Days</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verification & Remarks */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 print:bg-transparent print:border-slate-300 print:text-slate-800">
            <span className="font-bold text-slate-300 print:text-black block mb-1">Certification & Declarations:</span>
            <p className="leading-relaxed">{remarks}</p>
          </div>

          {/* Signature Line for Print */}
          <div className="hidden print:flex justify-between items-end pt-12 mt-8 text-xs font-bold text-black border-t border-slate-300">
            <div>
              <p>Seafarer Signature: _______________________</p>
              <p className="text-[10px] text-slate-600 font-normal mt-1">Name: {profile.name}</p>
            </div>
            <div className="text-right">
              <p>Generated via Seafarer NRI &amp; Seatime Calculator</p>
              <p className="text-[10px] text-slate-600 font-normal mt-1">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
