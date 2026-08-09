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
    <div className="card-surface rounded-2xl p-5 md:p-6 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-5 bg-emerald-600 rounded-sm"></span>
        <h2 className="text-xl font-bold text-app flex items-center gap-2">
          <Coins className="w-5 h-5 text-emerald-600" />
          Multi-Currency Remittance &amp; NRE/NRO Income Simulator
        </h2>
      </div>
      <p className="text-xs text-muted-app mb-6">
        Calculate foreign salary remitted into Non-Resident External (NRE) accounts and estimate NRO interest TDS tax withholding.
      </p>

      {/* Currency & Remittance Calculator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Input Column */}
        <div className="bg-recessed p-4 rounded-xl border border-app flex flex-col justify-between">
          <div>
            <label className="block text-xs font-bold text-app mb-2">Select Currency</label>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(["USD", "EUR", "GBP", "SGD", "AED"] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => handleCurrencyChange(curr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currency === curr
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-surface text-muted-app hover:text-app border border-app"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-app mb-1">
                  Monthly Wage ({currency})
                </label>
                <input
                  type="number"
                  value={monthlyWage}
                  onChange={(e) => setMonthlyWage(Number(e.target.value) || 0)}
                  className="w-full bg-surface border border-app focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-bold text-app outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-app mb-1">
                  Exchange Rate (1 {currency} = ₹ INR)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customRate}
                  onChange={(e) => setCustomRate(Number(e.target.value) || 0)}
                  className="w-full bg-surface border border-app focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 outline-none shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Remittance Conversion Output Card */}
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold text-emerald-800">NRE Remittance Earnings</span>
              <Building2 className="w-4 h-4 text-emerald-700" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-surface rounded-lg border border-emerald-100 shadow-sm">
                <span className="text-[10px] text-muted-app block">Monthly Equivalent (INR)</span>
                <span className="text-base font-extrabold text-app">
                  ₹{Math.round(monthlyINR).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-2.5 bg-surface rounded-lg border border-emerald-100 shadow-sm">
                <span className="text-[10px] text-muted-app block">Annual Foreign Income ({currency})</span>
                <span className="text-sm font-bold text-app">
                  {currency} {annualForeign.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 bg-emerald-100/80 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-900 font-bold block">Annual NRE Converted Equivalent</span>
                <span className="text-lg font-black text-emerald-800">
                  ₹{Math.round(annualINR).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-900 mt-3 pt-2 border-t border-emerald-200">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700" />
            <span>Remitted foreign salary to NRE account is 100% Tax-Free in India under Sec 10(4)(ii).</span>
          </div>
        </div>

        {/* NRO Account TDS Tax Calculator */}
        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-amber-900">NRO Interest &amp; TDS Calculator</span>
              <AlertCircle className="w-4 h-4 text-amber-700" />
            </div>
            <p className="text-[11px] text-muted-app mb-3">
              Unlike NRE, interest earned in NRO accounts (domestic Indian income) is taxable.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-app mb-1">
                Annual NRO Interest Income (₹ INR)
              </label>
              <input
                type="number"
                value={nroInterest}
                onChange={(e) => setNroInterest(Number(e.target.value) || 0)}
                className="w-full bg-surface border border-app focus:border-amber-600 rounded-xl px-3 py-1.5 text-xs font-bold text-app outline-none mb-3 shadow-sm"
              />
            </div>

            <div className="space-y-1.5 text-xs bg-surface p-2.5 rounded-lg border border-amber-200 font-mono shadow-sm">
              <div className="flex justify-between text-muted-app">
                <span>Standard TDS Rate:</span>
                <span className="text-amber-800 font-bold">31.2%</span>
              </div>
              <div className="flex justify-between text-muted-app">
                <span>Estimated Bank TDS:</span>
                <span className="text-rose-700 font-bold">₹{Math.round(estimatedNroTds).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-app font-bold pt-1 border-t border-amber-200">
                <span>Net Interest Post-TDS:</span>
                <span className="text-emerald-700">₹{Math.round(netNroInterest).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-muted-app mt-3 italic">
            Note: DTAA (Double Tax Avoidance Agreement) rate may reduce NRO TDS if applicable.
          </p>
        </div>
      </div>
    </div>
  );
}
