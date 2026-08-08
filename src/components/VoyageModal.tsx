import React, { useState, useEffect } from "react";
import { Sailing } from "../types";
import { parseDate } from "../utils/calc";
import { Anchor, Globe } from "lucide-react";

interface VoyageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    dep: string;
    arr: string;
    vessel: string;
    rank: string;
    portType: "indian" | "foreign";
    monthlySalary?: number;
  }) => void;
  editingSailing: Sailing | null;
  defaultVessel: string;
  defaultRank: string;
}

export default function VoyageModal({
  isOpen,
  onClose,
  onSave,
  editingSailing,
  defaultVessel,
  defaultRank,
}: VoyageModalProps) {
  const [dep, setDep] = useState("");
  const [arr, setArr] = useState("");
  const [vessel, setVessel] = useState("");
  const [rank, setRank] = useState("");
  const [portType, setPortType] = useState<"indian" | "foreign">("indian");
  const [monthlySalary, setMonthlySalary] = useState<number | "">("");

  const [depError, setDepError] = useState("");
  const [arrError, setArrError] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<number | null>(null);

  // Sync state with editing data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingSailing) {
        setDep(editingSailing.dep);
        setArr(editingSailing.arr);
        setVessel(editingSailing.vessel || "");
        setRank(editingSailing.rank || "");
        setPortType(editingSailing.portType);
        setMonthlySalary(editingSailing.monthlySalary || "");
      } else {
        setDep("");
        setArr("");
        setVessel(defaultVessel);
        setRank(defaultRank);
        setMonthlySalary("");

        setPortType("indian");
      }
      setDepError("");
      setArrError("");
      setActiveTemplate(null);
    }
  }, [isOpen, editingSailing, defaultVessel, defaultRank]);

  const applyTemplate = (days: number) => {
    let baseDep = dep;
    const pad = (n: number) => String(n).padStart(2, "0");
    if (!baseDep) {
      const today = new Date();
      baseDep = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      setDep(baseDep);
    }
    const depDate = parseDate(baseDep);
    const arrDate = new Date(
      depDate.getFullYear(),
      depDate.getMonth(),
      depDate.getDate() + days - 1,
    );
    const arrStr = `${arrDate.getFullYear()}-${pad(arrDate.getMonth() + 1)}-${pad(arrDate.getDate())}`;
    setArr(arrStr);
    setActiveTemplate(days);
  };

  const handleSave = () => {
    let valid = true;
    if (!dep) {
      setDepError("Departure date is required");
      valid = false;
    } else {
      setDepError("");
    }

    if (!arr) {
      setArrError("Arrival date is required");
      valid = false;
    } else if (dep && arr && new Date(arr) < new Date(dep)) {
      setArrError("Arrival must be on or after departure");
      valid = false;
    } else {
      setArrError("");
    }

    if (!valid) return;

    onSave({
      dep,
      arr,
      vessel,
      rank,
      portType,
      monthlySalary: monthlySalary === "" ? undefined : monthlySalary,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex max-sm:items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Dialog container - Bottom sheet on mobile, modal on desktop */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 max-sm:rounded-t-3xl max-sm:rounded-b-none sm:rounded-3xl shadow-2xl overflow-hidden z-10 animate-fadeUp max-sm:max-h-[92vh] flex flex-col">
        {/* Mobile Pull Indicator Bar */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto my-2.5 shrink-0"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-5 border-b border-slate-800 shrink-0">
          <h3
            className="text-base sm:text-lg font-bold text-slate-100"
            id="modal-title"
          >
            {editingSailing ? "Edit Voyage" : "Log New Voyage"}
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 border-none text-slate-400 hover:text-slate-100 flex items-center justify-center text-xl cursor-pointer active:scale-95"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
          {/* Quick-add templates */}
          <div className="flex flex-wrap gap-2">
            {[90, 180, 270, 365].map((days) => {
              const label =
                days === 365 ? "1 year" : `${Math.floor(days / 30)} months`;
              const isSelected = activeTemplate === days;
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => applyTemplate(days)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Port Type Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Port Type
            </label>
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-1">
              <button
                type="button"
                onClick={() => setPortType("indian")}
                className={`flex-1 text-xs font-bold py-2 rounded-lg border-none cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                  portType === "indian"
                    ? "bg-emerald-500 text-white"
                    : "bg-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Anchor className="w-3.5 h-3.5" /> Indian Port (CDC)
              </button>
              <button
                type="button"
                onClick={() => setPortType("foreign")}
                className={`flex-1 text-xs font-bold border-none cursor-pointer py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  portType === "foreign"
                    ? "bg-emerald-500 text-white"
                    : "bg-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Foreign Port (Passport)
              </button>
            </div>
          </div>

          {/* Dates grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Sign On / Departure *
              </label>
              <input
                type="date"
                value={dep}
                onChange={(e) => {
                  setDep(e.target.value);
                  setDepError("");
                }}
                className={`bg-slate-950 border rounded-xl px-4 py-2.5 text-sm font-mono text-slate-200 outline-none focus:border-emerald-500 ${
                  depError
                    ? "border-red-500 ring-1 ring-red-500/10"
                    : "border-slate-800"
                }`}
              />
              {depError && (
                <span className="text-[11px] text-red-500 font-medium font-sans">
                  {depError}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Sign Off / Arrival *
              </label>
              <input
                type="date"
                value={arr}
                onChange={(e) => {
                  setArr(e.target.value);
                  setArrError("");
                }}
                className={`bg-slate-950 border rounded-xl px-4 py-2.5 text-sm font-mono text-slate-200 outline-none focus:border-emerald-500 ${
                  arrError
                    ? "border-red-500 ring-1 ring-red-500/10"
                    : "border-slate-800"
                }`}
              />
              {arrError && (
                <span className="text-[11px] text-red-400 font-medium">
                  {arrError}
                </span>
              )}
            </div>
          </div>

          {/* Vessel & Rank Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Vessel Name
              </label>
              <input
                type="text"
                value={vessel}
                placeholder="e.g. MV Ocean Star"
                onChange={(e) => setVessel(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Rank on Board
              </label>
              <input
                type="text"
                value={rank}
                placeholder="e.g. 3rd Officer"
                onChange={(e) => setRank(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Salary Block */}
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-xs font-semibold text-slate-400 flex justify-between items-center">
              <span>Monthly Gross Salary (USD/month)</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Optional
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={monthlySalary}
                placeholder="e.g. 4000  (Basic + Fixed OT)"
                min="0"
                onChange={(e) => {
                  const val =
                    e.target.value === ""
                      ? ""
                      : Math.max(0, parseFloat(e.target.value) || 0);
                  setMonthlySalary(val);
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-200 outline-none focus:border-emerald-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Salary + conversion rate will be used to automatically project
              earnings and calculate estimated Indian Income Tax slabs.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-2.5 p-5 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white cursor-pointer"
          >
            Save Voyage
          </button>
        </div>
      </div>
    </div>
  );
}
