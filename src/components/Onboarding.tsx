import React, { useState } from "react";
import {
  Anchor,
  Compass,
  Calendar,
  ArrowRight,
  User,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Profile } from "../types";

interface OnboardingProps {
  onComplete: (profileData: {
    name: string;
    rank: string;
    vessel: string;
    dob: string;
    userType: "seafarer" | "nri";
  }) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [vessel, setVessel] = useState("");
  const [dob, setDob] = useState("");
  const [userType, setUserType] = useState<"seafarer" | "nri">("seafarer");

  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!dob) {
      setError("Please select your Date of Birth.");
      return;
    }
    if (userType === "seafarer" && !rank.trim()) {
      setError("Please enter your current rank.");
      return;
    }

    setError("");
    onComplete({
      name: name.trim(),
      rank: userType === "seafarer" ? rank.trim() : "General NRI",
      vessel:
        userType === "seafarer" ? vessel.trim() || "MV Ocean Star" : "None",
      dob,
      userType,
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto">
        {/* Glow effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-4 border border-emerald-500/20">
            <Anchor className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
            Welcome to Seafarer HQ
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Set up your primary profile to start tracking voyages, seatime
            analytics, and NRI tax eligibility.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 text-center font-medium animate-[slideDown_0.3s_ease-out_forwards]">
              {error}
            </div>
          )}

          {/* User Classification Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Primary Status / Classification
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 border border-slate-850 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setUserType("seafarer");
                  setError("");
                }}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  userType === "seafarer"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <Compass className="w-4 h-4 mb-0.5" />
                <span>Seafarer / Crew</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserType("nri");
                  setError("");
                }}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  userType === "nri"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <User className="w-4 h-4 mb-0.5" />
                <span>General NRI / Expat</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed px-1">
              {userType === "seafarer"
                ? "Ideal for Merchant Navy, Cruise Ships, and offshore crew calculating CDC or Passport-based seatime."
                : "Ideal for land-based expats and general NRIs tracking global stays and Indian tax residency."}
            </p>
          </div>

          <hr className="border-slate-800" />

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Capt. Sandeep Sharma"
              className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-slate-600 w-full"
            />
          </div>

          {/* Row for DOB and Rank/Vessel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 w-full"
              />
            </div>

            {/* Rank / Designation (Only for Seafarer) */}
            {userType === "seafarer" ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  Current Rank
                </label>
                <input
                  type="text"
                  required={userType === "seafarer"}
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  placeholder="e.g. Chief Officer"
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-slate-600 w-full"
                />
              </div>
            ) : (
              <div className="flex flex-col justify-end p-3 bg-slate-950/40 border border-slate-850/60 rounded-xl text-xs text-slate-500 leading-normal">
                Tax residency limits are governed by the Income Tax Act rules
                for non-resident Indians (182 days criteria).
              </div>
            )}
          </div>

          {/* Current Vessel (Only for Seafarer) */}
          {userType === "seafarer" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Current Vessel Name{" "}
                <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={vessel}
                onChange={(e) => setVessel(e.target.value)}
                placeholder="e.g. MV Ocean Star"
                className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-slate-600 w-full"
              />
            </div>
          )}

          {/* Submit & Guest Actions */}
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Complete Setup</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                onComplete({
                  name: "Guest Seafarer",
                  rank:
                    userType === "seafarer" ? "Chief Officer" : "General NRI",
                  vessel: userType === "seafarer" ? "MV Ocean Star" : "None",
                  dob: "1992-01-01",
                  userType,
                });
              }}
              className="w-full bg-slate-950/80 hover:bg-slate-800/60 border border-slate-800 text-slate-300 hover:text-white font-medium py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <span>Explore as Guest First</span>
              <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                No details required
              </span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              100% Private & Offline &bull; Stored on your device local storage
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
