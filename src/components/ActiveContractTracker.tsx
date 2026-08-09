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
    <div className="card-surface rounded-2xl p-5 md:p-6 shadow-sm mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-5 bg-emerald-600 rounded-sm"></span>
            <h2 className="text-xl font-bold text-app flex items-center gap-2">
              <Ship className="w-5 h-5 text-emerald-700" />
              Active Contract &amp; NRI Target Predictor
            </h2>
          </div>
          <p className="text-xs text-muted-app">
            Track live contract progress and predict the exact date when your {targetNRIDays}-day NRI tax exemption milestone will be achieved.
          </p>
        </div>

        <div className="bg-recessed border border-app rounded-xl px-3 py-1.5 text-xs font-mono text-emerald-700 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-app" />
          <span>Current FY: {currentFYKey}</span>
        </div>
      </div>

      {/* Input Configuration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 bg-recessed p-4 rounded-xl border border-app">
        <div>
          <label className="block text-[11px] font-bold text-muted-app mb-1">Sign-On Date</label>
          <input
            type="date"
            value={signOnDate}
            onChange={(e) => setSignOnDate(e.target.value)}
            className="w-full bg-surface border border-app focus:border-emerald-600 rounded-lg px-2.5 py-1.5 text-xs text-app outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-muted-app mb-1">Contract Duration</label>
          <select
            value={contractMonths}
            onChange={(e) => setContractMonths(parseInt(e.target.value, 10))}
            className="w-full bg-surface border border-app focus:border-emerald-600 rounded-lg px-2.5 py-1.5 text-xs text-app outline-none"
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
          <label className="block text-[11px] font-bold text-muted-app mb-1">Target NRI Days in FY</label>
          <select
            value={targetNRIDays}
            onChange={(e) => setTargetNRIDays(parseInt(e.target.value, 10))}
            className="w-full bg-surface border border-app focus:border-emerald-600 rounded-lg px-2.5 py-1.5 text-xs text-app outline-none"
          >
            <option value={184}>184 Days (Standard Seafarer NRI Rule)</option>
            <option value={182}>182 Days (General NRI Rule)</option>
            <option value={120}>120 Days (High Income &gt; ₹15 Lakh Rule)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-muted-app mb-1">Vessel &amp; Rank</label>
          <div className="grid grid-cols-2 gap-1">
            <input
              type="text"
              placeholder="Vessel Name"
              value={vesselName}
              onChange={(e) => setVesselName(e.target.value)}
              className="bg-surface border border-app focus:border-emerald-600 rounded-lg px-2 py-1.5 text-[11px] text-app outline-none"
            />
            <input
              type="text"
              placeholder="Rank"
              value={rankName}
              onChange={(e) => setRankName(e.target.value)}
              className="bg-surface border border-app focus:border-emerald-600 rounded-lg px-2 py-1.5 text-[11px] text-app outline-none"
            />
          </div>
        </div>
      </div>

      {/* Contract Progress & NRI Prediction Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Progress Bar Card */}
        <div className="lg:col-span-2 bg-surface border border-app rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-app">Contract Progress</span>
              <span className="font-mono font-bold text-emerald-700">{progressPct}% Complete</span>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-recessed h-3.5 rounded-full overflow-hidden p-0.5 border border-app mb-3">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 text-center gap-2 text-xs pt-2 border-t border-app">
              <div>
                <span className="text-[10px] text-muted-app block">Sign-On Date</span>
                <span className="font-bold text-app">{formatDateStr(signOnDate)}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-app block">Days Served / Total</span>
                <span className="font-bold text-emerald-700">{daysServed} / {totalContractDays}d</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-app block">Est. Sign-Off Date</span>
                <span className="font-bold text-app">{formatDateStr(estimatedSignOffStr)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* NRI Milestone Predictor Card */}
        <div
          className={`border rounded-xl p-4 flex flex-col justify-between ${
            contractReachesNRI
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-app">
                NRI Tax Status Predictor
              </span>
              {contractReachesNRI ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              )}
            </div>

            <div className="text-xs text-app mb-2">
              Current FY Days: <span className="font-bold text-app">{existingFYOutsideDays}d</span> | Needed:{" "}
              <span className="font-bold text-emerald-700">{neededNRIDaysInFY}d</span>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-app mb-3">
              <div className="text-[10px] text-muted-app uppercase font-bold">Estimated NRI Milestone Date</div>
              <div className="text-base font-extrabold text-emerald-700 mt-0.5">{nriAchievedDateStr}</div>
            </div>

            {!contractReachesNRI && neededNRIDaysInFY > 0 && (
              <p className="text-[11px] text-amber-800 leading-tight">
                ⚠️ Warning: Your current {contractMonths}-month contract ends on {formatDateStr(estimatedSignOffStr)}, which is BEFORE reaching the {targetNRIDays}-day NRI milestone. An extension of {neededNRIDaysInFY - totalContractDays} days or a second contract is required in FY {currentFYKey}.
              </p>
            )}

            {contractReachesNRI && neededNRIDaysInFY > 0 && (
              <p className="text-[11px] text-emerald-800 leading-tight">
                ✅ Success: Completing this contract will safely grant you Non-Resident Indian (NRI) tax exemption status for FY {currentFYKey}!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
