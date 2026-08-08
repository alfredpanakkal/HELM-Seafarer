import React, { useState } from "react";
import { FYData } from "../types";
import { daysBetween, fyFromDate, clampToFY, formatDateStr } from "../utils/calc";
import { Ship, Clock, Calendar, CheckCircle2, AlertTriangle, Compass, Play, RotateCcw } from "lucide-react";

interface ActiveContractTrackerProps {
  fyData: FYData[];
  onAddContractVoyage?: (dep: string, arr: string, vessel: string, rank: string) => void;
}

export default function ActiveContractTracker({ fyData, onAddContractVoyage }: ActiveContractTrackerProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const currentFYYear = fyFromDate(new Date());
  const currentFYKey = `${currentFYYear}-${(currentFYYear + 1).toString().slice(-2)}`;

  // Inputs
  const [signOnDate, setSignOnDate] = useState<string>(todayStr);
  const [contractMonths, setContractMonths] = useState<number>(4);
  const [vesselName, setVesselName] = useState<string>("MV Ocean Carrier");
  const [rankName, setRankName] = useState<string>("Second Officer");
  const [targetNRIDays, setTargetNRIDays] = useState<number>(184); // 184 days for NRI status

  // Find existing completed days outside India in current FY
  const curFYObj = fyData.find((f) => f.fyYear === currentFYYear);
  const existingFYOutsideDays = curFYObj ? curFYObj.outsideDays : 0;

  // Calculate estimated sign-off date
  const signOn = new Date(signOnDate || todayStr);
  const estimatedSignOff = new Date(signOn);
  estimatedSignOff.setMonth(estimatedSignOff.getMonth() + contractMonths);
  const estimatedSignOffStr = estimatedSignOff.toISOString().split("T")[0];

  // Total Contract Duration Days
  const totalContractDays = daysBetween(signOn, estimatedSignOff);

  // Today progress
  const now = new Date();
  let daysServed = 0;
  let daysRemainingContract = totalContractDays;

  if (now >= signOn) {
    if (now <= estimatedSignOff) {
      daysServed = daysBetween(signOn, now);
      daysRemainingContract = totalContractDays - daysServed;
    } else {
      daysServed = totalContractDays;
      daysRemainingContract = 0;
    }
  }

  // Days needed in current FY to reach target NRI status
  const neededNRIDaysInFY = Math.max(0, targetNRIDays - existingFYOutsideDays);

  // Calculate exact date in current FY when NRI status is achieved
  let nriAchievedDateStr = "—";
  let daysToNRI = 0;
  let contractReachesNRI = false;

  if (neededNRIDaysInFY <= 0) {
    nriAchievedDateStr = "Already Achieved NRI Status!";
    contractReachesNRI = true;
  } else {
    // Project forward from signOn date
    const targetDate = new Date(signOn);
    targetDate.setDate(targetDate.getDate() + neededNRIDaysInFY);
    nriAchievedDateStr = formatDateStr(targetDate.toISOString().split("T")[0]);
    daysToNRI = neededNRIDaysInFY;

    // Check if signOff is on or after targetDate
    if (estimatedSignOff >= targetDate) {
      contractReachesNRI = true;
    }
  }

  const progressPct = Math.min(100, Math.max(0, Math.round((daysServed / (totalContractDays || 1)) * 100)));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-5 bg-emerald-500 rounded-sm"></span>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Ship className="w-5 h-5 text-emerald-400" />
              Active Contract &amp; NRI Target Predictor
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Track live contract progress and predict the exact date when your {targetNRIDays}-day NRI tax exemption milestone will be achieved.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-emerald-400 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Current FY: {currentFYKey}</span>
        </div>
      </div>

      {/* Input Configuration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Sign-On Date</label>
          <input
            type="date"
            value={signOnDate}
            onChange={(e) => setSignOnDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Contract Duration</label>
          <select
            value={contractMonths}
            onChange={(e) => setContractMonths(parseInt(e.target.value, 10))}
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none"
          >
            <option value={2}>2 Months</option>
            <option value={3}>3 Months</option>
            <option value={4}>4 Months (+/- 1m)</option>
            <option value={5}>5 Months</option>
            <option value={6}>6 Months</option>
            <option value={8}>8 Months</option>
            <option value={9}>9 Months</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Target NRI Days in FY</label>
          <select
            value={targetNRIDays}
            onChange={(e) => setTargetNRIDays(parseInt(e.target.value, 10))}
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none"
          >
            <option value={184}>184 Days (Standard Seafarer NRI Rule)</option>
            <option value={182}>182 Days (General NRI Rule)</option>
            <option value={120}>120 Days (High Income &gt; ₹15 Lakh Rule)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Vessel &amp; Rank</label>
          <div className="grid grid-cols-2 gap-1">
            <input
              type="text"
              placeholder="Vessel Name"
              value={vesselName}
              onChange={(e) => setVesselName(e.target.value)}
              className="bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-2 py-1.5 text-[11px] text-slate-100 outline-none"
            />
            <input
              type="text"
              placeholder="Rank"
              value={rankName}
              onChange={(e) => setRankName(e.target.value)}
              className="bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-2 py-1.5 text-[11px] text-slate-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Contract Progress & NRI Prediction Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Progress Bar Card */}
        <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-200">Contract Progress</span>
              <span className="font-mono font-bold text-emerald-400">{progressPct}% Complete</span>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50 mb-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 text-center gap-2 text-xs pt-2 border-t border-slate-900">
              <div>
                <span className="text-[10px] text-slate-500 block">Sign-On Date</span>
                <span className="font-bold text-slate-200">{formatDateStr(signOnDate)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Days Served / Total</span>
                <span className="font-bold text-emerald-400">{daysServed} / {totalContractDays}d</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Est. Sign-Off Date</span>
                <span className="font-bold text-slate-200">{formatDateStr(estimatedSignOffStr)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* NRI Milestone Predictor Card */}
        <div
          className={`border rounded-xl p-4 flex flex-col justify-between ${
            contractReachesNRI
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-100"
              : "bg-amber-950/20 border-amber-500/30 text-amber-100"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                NRI Tax Status Predictor
              </span>
              {contractReachesNRI ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
            </div>

            <div className="text-xs text-slate-300 mb-2">
              Current FY Days: <span className="font-bold text-white">{existingFYOutsideDays}d</span> | Needed:{" "}
              <span className="font-bold text-emerald-400">{neededNRIDaysInFY}d</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 mb-3">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Estimated NRI Milestone Date</div>
              <div className="text-base font-extrabold text-emerald-400 mt-0.5">{nriAchievedDateStr}</div>
            </div>

            {!contractReachesNRI && neededNRIDaysInFY > 0 && (
              <p className="text-[11px] text-amber-300/90 leading-tight">
                ⚠️ Warning: Your current {contractMonths}-month contract ends on {formatDateStr(estimatedSignOffStr)}, which is BEFORE reaching the {targetNRIDays}-day NRI milestone. An extension of {neededNRIDaysInFY - totalContractDays} days or a second contract is required in FY {currentFYKey}.
              </p>
            )}

            {contractReachesNRI && neededNRIDaysInFY > 0 && (
              <p className="text-[11px] text-emerald-300/90 leading-tight">
                ✅ Success: Completing this contract will safely grant you Non-Resident Indian (NRI) tax exemption status for FY {currentFYKey}!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
