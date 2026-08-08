import React, { useState } from "react";
import { Coins, Globe, ArrowRight, ShieldCheck, HelpCircle, Building2, AlertCircle } from "lucide-react";

interface MultiCurrencyRemittanceProps {
  usdInrRate: number;
}

export default function MultiCurrencyRemittance({ usdInrRate }: MultiCurrencyRemittanceProps) {
  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP" | "SGD" | "AED">("USD");
  const [monthlyWage, setMonthlyWage] = useState<number>(5000);
  const [customRate, setCustomRate] = useState<number>(usdInrRate || 84);
  const [nroInterest, setNroInterest] = useState<number>(50000); // INR interest in NRO account

  // Preset default conversion rates
  const ratesMap: Record<string, number> = {
    USD: usdInrRate || 84.5,
    EUR: 91.8,
    GBP: 108.2,
    SGD: 62.4,
    AED: 23.0,
  };

  const handleCurrencyChange = (c: "USD" | "EUR" | "GBP" | "SGD" | "AED") => {
    setCurrency(c);
    setCustomRate(ratesMap[c]);
  };

  const monthlyINR = monthlyWage * customRate;
  const annualForeign = monthlyWage * 12;
  const annualINR = monthlyINR * 12;

  // NRO Interest TDS calculation (Standard NRO TDS rate for NRI is 30% + 4% cess = 31.2%)
  const nroTdsRate = 0.312;
  const estimatedNroTds = nroInterest * nroTdsRate;
  const netNroInterest = nroInterest - estimatedNroTds;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl mb-8">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-5 bg-emerald-500 rounded-sm"></span>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Coins className="w-5 h-5 text-emerald-400" />
          Multi-Currency Remittance &amp; NRE/NRO Income Simulator
        </h2>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Calculate foreign salary remitted into Non-Resident External (NRE) accounts and estimate NRO interest TDS tax withholding.
      </p>

      {/* Currency & Remittance Calculator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Input Column */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Select Currency</label>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(["USD", "EUR", "GBP", "SGD", "AED"] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => handleCurrencyChange(curr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currency === curr
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Monthly Wage ({currency})
                </label>
                <input
                  type="number"
                  value={monthlyWage}
                  onChange={(e) => setMonthlyWage(Number(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Exchange Rate (1 {currency} = ₹ INR)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customRate}
                  onChange={(e) => setCustomRate(Number(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Remittance Conversion Output Card */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold text-emerald-400">NRE Remittance Earnings</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Monthly Equivalent (INR)</span>
                <span className="text-base font-extrabold text-slate-100">
                  ₹{Math.round(monthlyINR).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Annual Foreign Income ({currency})</span>
                <span className="text-sm font-bold text-slate-200">
                  {currency} {annualForeign.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 bg-emerald-950/30 rounded-lg border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 font-bold block">Annual NRE Converted Equivalent</span>
                <span className="text-lg font-black text-emerald-400">
                  ₹{Math.round(annualINR).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/90 mt-3 pt-2 border-t border-slate-900">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Remitted foreign salary to NRE account is 100% Tax-Free in India under Sec 10(4)(ii).</span>
          </div>
        </div>

        {/* NRO Account TDS Tax Calculator */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-amber-400">NRO Interest &amp; TDS Calculator</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Unlike NRE, interest earned in NRO accounts (domestic Indian income) is taxable.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Annual NRO Interest Income (₹ INR)
              </label>
              <input
                type="number"
                value={nroInterest}
                onChange={(e) => setNroInterest(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-100 outline-none mb-3"
              />
            </div>

            <div className="space-y-1.5 text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Standard TDS Rate:</span>
                <span className="text-amber-400 font-bold">31.2%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Bank TDS:</span>
                <span className="text-rose-400 font-bold">₹{Math.round(estimatedNroTds).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-200 font-bold pt-1 border-t border-slate-800">
                <span>Net Interest Post-TDS:</span>
                <span className="text-emerald-400">₹{Math.round(netNroInterest).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mt-3 italic">
            Note: DTAA (Double Tax Avoidance Agreement) rate may reduce NRO TDS if applicable.
          </p>
        </div>
      </div>
    </div>
  );
}
