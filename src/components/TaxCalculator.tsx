import React, { useState } from "react";
import { Sailing, FYData } from "../types";
import { calcTax, getNriDays, getTaxConfig } from "../utils/calc";
import MultiCurrencyRemittance from "./MultiCurrencyRemittance";

interface TaxCalculatorProps {
  sailings: Sailing[];
  fyData: Record<string, FYData>;
  usdInrRate: number;
}

export default function TaxCalculator({
  sailings,
  fyData,
  usdInrRate,
}: TaxCalculatorProps) {
  // Manual Calculator States
  const [selectedFYYear, setSelectedFYYear] = useState<number>(2025);
  const [regime, setRegime] = useState<"new" | "old">("new");
  const [isNriManual, setIsNriManual] = useState<boolean>(false);
  const [currency, setCurrency] = useState<"inr" | "usd">("inr");
  const [manualInrAmount, setManualInrAmount] = useState<number | "">("");
  const [manualUsdAmount, setManualUsdAmount] = useState<number | "">("");
  const [manualUsdRate, setManualUsdRate] = useState<number>(usdInrRate);
  const [manual80CDeduction, setManual80CDeduction] = useState<number | "">(
    150000,
  );

  const inrFmt = (v: number) => "₹" + Math.round(v).toLocaleString("en-IN");
  const usdFmt = (v: number) => "$" + Math.round(v).toLocaleString("en-IN");

  const validVoyages = sailings.filter(
    (s) => s.dep && s.arr && new Date(s.arr) >= new Date(s.dep),
  );
  const hasVoyageEarnings = validVoyages.some(
    (s) => s.monthlySalary && s.monthlySalary > 0,
  );

  // Automatically compute voyage-based earnings and tax estimates per FY
  const fyKeys = Object.keys(fyData).sort().reverse();

  let totalVoyageGrossINR = 0;
  let totalVoyageTaxINR = 0;
  let totalVoyageNetINR = 0;

  const voyageCards = fyKeys
    .map((fy) => {
      const d = fyData[fy];
      const threshold = getNriDays(d.fyYear);
      const isNRI = d.outsideDays >= threshold;

      let fyGrossUSD = 0;
      let fyGrossINR = 0;

      d.sailings.forEach((ref) => {
        const s = sailings.find((x) => x.id === ref.id);
        if (!s || !s.monthlySalary) return;
        const rateToUse = s.usdRate || usdInrRate;
        const earn = (s.monthlySalary / 30) * ref.daysInFY;
        fyGrossUSD += earn;
        fyGrossINR += earn * rateToUse;
      });

      if (fyGrossUSD === 0) return null;

      // Under New Regime (Section 115BAC), Chapter VI-A deductions (80C/80D) are not available.
      // Standard deduction is automatically handled inside calcTax.
      const deductions = 0;
      const taxResult = calcTax(fyGrossINR, d.fyYear, "new", deductions);
      const taxDue = isNRI ? 0 : taxResult.total;
      const netIncome = fyGrossINR - taxDue;

      totalVoyageGrossINR += fyGrossINR;
      totalVoyageTaxINR += taxDue;
      totalVoyageNetINR += netIncome;

      return {
        fy,
        isNRI,
        outside: d.outsideDays,
        threshold,
        grossUSD: fyGrossUSD,
        grossINR: fyGrossINR,
        tax: taxDue,
        net: netIncome,
        result: taxResult,
      };
    })
    .filter(Boolean);

  // Manual Calculations
  let currentGrossINR = 0;
  if (currency === "usd") {
    const usdVal = Number(manualUsdAmount) || 0;
    currentGrossINR = usdVal * (manualUsdRate || usdInrRate || 84);
  } else {
    currentGrossINR = Number(manualInrAmount) || 0;
  }

  const manualDeductions =
    regime === "old" && !isNriManual ? Number(manual80CDeduction) || 0 : 0;
  const manualTaxResult = calcTax(
    currentGrossINR,
    selectedFYYear,
    regime,
    manualDeductions,
  );
  const manualTaxDue = isNriManual ? 0 : manualTaxResult.total;
  const manualNetTakeHome = currentGrossINR - manualTaxDue;
  const selectCls =
    "bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 outline-none focus:border-emerald-500 cursor-pointer";
  const inputCls =
    "bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono tabular-nums text-slate-200 outline-none focus:border-emerald-500";
  const labelCls = "text-xs font-semibold text-slate-400";
  const rowCls = "flex justify-between py-1 border-b border-slate-850";
  const valLabelCls = "text-slate-500";

  return (
    <div id="page-tax" className="page active animate-fadeUp">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        <div className="page-header mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Tax Calculator
          </h1>
          <p className="text-sm text-slate-400 measure-prose">
            FY-wise tax estimates &bull; New Tax Regime &bull; Slabs matching
            Budget 2025 guidelines
          </p>
        </div>

        {/* Multi-Currency Remittance & NRE/NRO Calculator */}
        <MultiCurrencyRemittance usdInrRate={usdInrRate} />

        {/* Voyage Earnings Tax Assessment (Auto) */}
        {hasVoyageEarnings && voyageCards.length > 0 && (
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 mb-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <span className="w-1.5 h-3 bg-emerald-500 rounded-sm"></span>{" "}
                Sailing Tax Analysis
              </h3>
              <span className="text-[10px] text-slate-500 font-mono font-bold">
                Rate: ₹{usdInrRate}/USD
              </span>
            </div>

            <div className="space-y-4">
              {voyageCards.map((card) => {
                if (!card) return null;
                const effRate =
                  card.grossINR > 0 ? (card.tax / card.grossINR) * 100 : 0;

                // Left border accent line
                let indicatorColor = "border-l-4 border-l-blue-500"; // default Resident NIL tax
                if (card.isNRI) {
                  indicatorColor = "border-l-4 border-l-emerald-500";
                } else if (card.tax > 0) {
                  indicatorColor = "border-l-4 border-l-rose-500";
                }

                return (
                  <div
                    key={card.fy}
                    className={`bg-slate-950 border border-slate-850 p-6 rounded-2xl flex flex-col gap-5 ${indicatorColor} shadow-md`}
                  >
                    {/* Header Row */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-bold text-lg text-slate-100">
                          FY {card.fy}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {getTaxConfig(parseInt(card.fy), "new").regimeLabel}{" "}
                          &bull; USD/INR ₹{usdInrRate.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className={`text-[10px] font-bold border rounded-full px-2.5 py-0.5 ${
                            card.isNRI
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {card.isNRI ? "✓ NRI" : "Resident"}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-400 rounded-full px-2.5 py-0.5 font-mono">
                          {card.outside}d outside
                        </span>
                      </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="space-y-2.5 border-t border-slate-900 pt-4 text-xs">
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 font-medium">
                          Gross Income
                        </span>
                        <span className="font-semibold text-slate-200 font-mono">
                          {usdFmt(card.grossUSD)} = {inrFmt(card.grossINR)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400 font-medium">
                          Standard Deduction
                        </span>
                        <span className="font-semibold text-emerald-400 font-mono">
                          - {inrFmt(card.result.stdDeduction)}
                        </span>
                      </div>

                      {!card.isNRI && (
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-400 font-medium">
                            80C / 80D Deductions
                          </span>
                          <span className="font-semibold text-emerald-400 font-mono">
                            - {inrFmt(150000)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-1.5 border-t border-slate-900/40">
                        <span className="text-slate-300 font-semibold">
                          Taxable Income
                        </span>
                        <span className="font-bold text-slate-100 font-mono">
                          {inrFmt(card.result.taxable)}
                        </span>
                      </div>
                    </div>

                    {/* Slabs breakdown (Only for Resident) */}
                    {!card.isNRI && (
                      <div className="bg-slate-900/40 border border-slate-900/60 p-4 rounded-xl text-xs space-y-3">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Slab Breakdown
                        </div>
                        <div className="space-y-1.5 font-mono text-[11px]">
                          <div className="flex justify-between text-slate-500 font-semibold border-b border-slate-900/40 pb-1 mb-1">
                            <span>Slab</span>
                            <span>Rate</span>
                            <span className="text-right">Tax</span>
                          </div>
                          {card.result.slabsBreakdown.map((s, i) => (
                            <div
                              key={i}
                              className="flex justify-between text-slate-400"
                            >
                              <span className="w-1/2 text-left">{s.text}</span>
                              <span className="w-1/4 text-center">
                                {(s.rate * 100).toFixed(0)}%
                              </span>
                              <span className="w-1/4 text-right">
                                {s.tax > 0 ? inrFmt(s.tax) : "₹0"}
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between text-slate-300 font-semibold border-t border-slate-900/40 pt-2 mt-1">
                            <span>Tax before rebate</span>
                            <span></span>
                            <span>{inrFmt(card.result.taxBeforeCess)}</span>
                          </div>

                          {/* Rebate Row */}
                          <div className="flex justify-between text-slate-500 text-[10px] leading-relaxed pt-1.5 border-t border-slate-900/20">
                            {card.result.taxable <=
                            getTaxConfig(parseInt(card.fy), "new")
                              .rebateLimit ? (
                              <span className="text-emerald-400 font-sans">
                                87A rebate: Applied &mdash; full tax relief up
                                to rebate limit
                              </span>
                            ) : (
                              <span className="font-sans">
                                87A rebate: Not applicable &mdash; taxable
                                income exceeds ₹
                                {getTaxConfig(parseInt(card.fy), "new")
                                  .rebateLimit >= 1000000
                                  ? "12L"
                                  : "7L"}{" "}
                                limit
                              </span>
                            )}
                          </div>

                          {card.result.cess > 0 && (
                            <div className="flex justify-between text-slate-400 border-t border-slate-900/40 pt-2">
                              <span>Health &amp; Ed. Cess (4%)</span>
                              <span></span>
                              <span>{inrFmt(card.result.cess)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Informational Warning / Info Box */}
                    {card.isNRI ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl text-xs leading-relaxed text-emerald-400">
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                          <span>✓</span> Zero Tax &mdash; NRI Status
                        </div>
                        <div className="text-slate-400 text-[11px] font-medium mb-1">
                          Ship employment income is fully exempt under{" "}
                          <strong>Sec 10(6)(viii)</strong> of the Income Tax Act
                          for non-resident seafarers.
                        </div>
                        <div className="text-emerald-500/90 font-semibold font-mono text-[10px]">
                          This FY: {card.outside} days outside India &ge;{" "}
                          {card.threshold} days required &rarr; NRI ✓
                        </div>
                      </div>
                    ) : card.tax > 0 ? (
                      <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl text-xs leading-relaxed text-rose-400">
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                          <span>⚠</span> Tax Applicable &mdash; Resident Status
                        </div>
                        <div className="text-slate-400 text-[11px] font-medium mb-1">
                          As a resident, foreign salary earned during this FY is
                          taxable in India.
                        </div>
                        <div className="text-rose-400/90 font-semibold text-[10px]">
                          NRI status requires &ge; {card.threshold} days outside
                          India &mdash; not achieved this FY. Taxable income{" "}
                          {inrFmt(card.result.taxable)} exceeds 87A rebate limit
                          &mdash; no rebate available.
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl text-xs leading-relaxed text-blue-400">
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                          <span>✓</span> NIL Tax &mdash; Resident Status
                        </div>
                        <div className="text-slate-400 text-[11px] font-medium mb-1">
                          You are a resident for tax purposes this FY, but your
                          taxable income after standard and Section 80C
                          deductions is within tax-free slab limits.
                        </div>
                        <div className="text-blue-400/90 font-semibold text-[10px]">
                          This FY: {card.outside} days outside India &lt;{" "}
                          {card.threshold} days required.
                        </div>
                      </div>
                    )}

                    {/* Bottom Banner */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-900 border border-slate-850 rounded-xl p-4 text-center shadow-inner">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                          Gross (INR)
                        </div>
                        <div className="font-extrabold font-mono text-slate-200 text-sm">
                          {inrFmt(card.grossINR)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                          Tax
                        </div>
                        <div
                          className={`font-extrabold font-mono text-sm ${card.tax > 0 ? "text-red-400" : "text-emerald-400"}`}
                        >
                          {card.tax > 0 ? inrFmt(card.tax) : "NIL"}
                        </div>
                        {card.tax > 0 && (
                          <div className="text-[9px] text-slate-500 font-medium font-sans mt-0.5">
                            Eff. {effRate.toFixed(1)}%
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                          Net
                        </div>
                        <div className="font-extrabold font-mono text-emerald-400 text-sm">
                          {inrFmt(card.net)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Auto Total Footer */}
            {voyageCards.length > 1 && (
              <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-4 mt-4 text-xs font-semibold">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    CUMULATIVE GROSS
                  </div>
                  <div className="font-bold font-mono text-slate-100 text-sm mt-0.5">
                    {inrFmt(totalVoyageGrossINR)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    TOTAL TAX
                  </div>
                  <div className="font-bold font-mono text-red-400 text-sm mt-0.5">
                    {inrFmt(totalVoyageTaxINR)}
                  </div>
                  {totalVoyageTaxINR > 0 && (
                    <span className="text-[10px] text-slate-500 font-normal">
                      Eff:{" "}
                      {(
                        (totalVoyageTaxINR / totalVoyageGrossINR) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    TOTAL NET INCOME
                  </div>
                  <div className="font-bold font-mono text-emerald-400 text-sm mt-0.5">
                    {inrFmt(totalVoyageNetINR)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Tax Calculator Form */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-md">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2 mb-2">
            <span className="w-1.5 h-3 bg-emerald-500 rounded-sm"></span> 🧮
            Manual Tax Calculator
          </h3>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            New Tax Regime &bull; Input custom annual figures to estimate taxes
            instantly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Financial Year</label>
              <select
                value={selectedFYYear}
                onChange={(e) => setSelectedFYYear(Number(e.target.value))}
                className={selectCls}
              >
                <option value={2026}>FY 2026–27</option>
                <option value={2025}>FY 2025–26</option>
                <option value={2024}>FY 2024–25</option>
                <option value={2023}>FY 2023–24</option>
                <option value={2022}>FY 2022–23</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Tax Regime</label>
              <select
                value={regime}
                onChange={(e) => setRegime(e.target.value as "new" | "old")}
                className={selectCls}
              >
                <option value="new">New Tax Regime (Section 115BAC)</option>
                <option value="old">Old Tax Regime (With 80C/80D)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className={labelCls}>Income Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "inr" | "usd")}
                className={selectCls}
              >
                <option value="inr">INR (₹)</option>
                <option value="usd">USD ($)</option>
              </select>
            </div>

            {currency === "inr" ? (
              <div className="flex flex-col gap-1.5 sm:col-span-2 animate-fadeUp">
                <label className={labelCls}>Annual Gross Income (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 12,00,000"
                  value={manualInrAmount}
                  onChange={(e) => {
                    const val =
                      e.target.value === ""
                        ? ""
                        : Math.max(0, parseInt(e.target.value) || 0);
                    setManualInrAmount(val);
                  }}
                  className={inputCls}
                />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5 animate-fadeUp">
                  <label className={labelCls}>Annual Gross Income ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15,000"
                    value={manualUsdAmount}
                    onChange={(e) => {
                      const val =
                        e.target.value === ""
                          ? ""
                          : Math.max(0, parseInt(e.target.value) || 0);
                      setManualUsdAmount(val);
                    }}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1.5 animate-fadeUp">
                  <label className={labelCls}>USD → INR Exchange Rate</label>
                  <input
                    type="number"
                    value={manualUsdRate}
                    step="0.1"
                    min="1"
                    onChange={(e) =>
                      setManualUsdRate(
                        Math.max(1, parseFloat(e.target.value) || 1),
                      )
                    }
                    className={inputCls}
                  />
                </div>
              </>
            )}

            {regime === "old" && !isNriManual && (
              <div className="flex flex-col gap-1.5 sm:col-span-2 animate-fadeUp">
                <label className={labelCls}>
                  Section 80C / 80D Deductions (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1,50,000"
                  value={manual80CDeduction}
                  onChange={(e) => {
                    const val =
                      e.target.value === ""
                        ? ""
                        : Math.max(0, parseInt(e.target.value) || 0);
                    setManual80CDeduction(val);
                  }}
                  className={inputCls}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className={labelCls}>Tax Status this Financial Year</label>
              <select
                value={isNriManual ? "yes" : "no"}
                onChange={(e) => setIsNriManual(e.target.value === "yes")}
                className={selectCls}
              >
                <option value="no">Resident Indian (Subject to Slabs)</option>
                <option value="yes">
                  Non-Resident Indian (Zero Tax on foreign ship salary)
                </option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          {currentGrossINR > 0 && (
            <div className="border-t border-slate-850 pt-5 mt-5 animate-fadeUp">
              {isNriManual ? (
                <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl text-xs md:text-sm font-mono leading-relaxed text-emerald-400 mb-4 flex items-center gap-3">
                  <span className="text-xl">✓</span>
                  <div>
                    <strong>NRI Status: Zero Tax on foreign salary.</strong>
                    <div className="text-xs text-slate-500 mt-1 font-sans">
                      All ship salary received outside India is completely
                      exempt under Section 10(6)(viii).
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ledger */}
                  <div className="space-y-2 text-xs md:text-sm">
                    <div className={rowCls}>
                      <span className={valLabelCls}>Gross Income</span>
                      <span className="font-bold font-mono text-slate-300">
                        {inrFmt(currentGrossINR)}
                      </span>
                    </div>
                    <div className={rowCls}>
                      <span className={valLabelCls}>Standard Deduction</span>
                      <span className="font-bold font-mono text-emerald-400">
                        − {inrFmt(manualTaxResult.stdDeduction)}
                      </span>
                    </div>
                    {!isNriManual && (
                      <div className={rowCls}>
                        <span className={valLabelCls}>
                          80C / 80D Deductions
                        </span>
                        <span className="font-bold font-mono text-emerald-400">
                          − {inrFmt(150000)}
                        </span>
                      </div>
                    )}
                    <div className={rowCls}>
                      <span className="text-slate-500 font-semibold">
                        Taxable Income
                      </span>
                      <span className="font-bold font-mono text-slate-100">
                        {inrFmt(manualTaxResult.taxable)}
                      </span>
                    </div>
                    <div className={rowCls}>
                      <span className={valLabelCls}>Tax Before Cess</span>
                      <span className="font-bold font-mono text-slate-300">
                        {inrFmt(manualTaxResult.taxBeforeCess)}
                      </span>
                    </div>
                    {manualTaxResult.cess > 0 && (
                      <div className={rowCls}>
                        <span className={valLabelCls}>
                          Health &amp; Ed. Cess (4%)
                        </span>
                        <span className="font-bold font-mono text-slate-400">
                          {inrFmt(manualTaxResult.cess)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-slate-800 text-sm font-bold">
                      <span className="text-slate-200">
                        Total Estimated Tax
                      </span>
                      <span className="font-mono text-red-500">
                        {inrFmt(manualTaxDue)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 text-sm font-bold text-emerald-400">
                      <span>Net Take-Home</span>
                      <span className="font-mono">
                        {inrFmt(manualNetTakeHome)}
                      </span>
                    </div>
                  </div>

                  {/* Slabs list */}
                  <div className="text-xs bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                        {getTaxConfig(selectedFYYear, "new").regimeLabel}
                      </div>
                      <div className="space-y-1">
                        {manualTaxResult.slabsBreakdown.map((s, i) => (
                          <div
                            key={i}
                            className="flex justify-between text-slate-400 font-mono"
                          >
                            <span>
                              {s.text} ({(s.rate * 100).toFixed(0)}%)
                            </span>
                            <span>{s.tax > 0 ? inrFmt(s.tax) : "₹0"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 leading-normal border-t border-slate-900 pt-3 mt-4">
                      Rebate Limit: ₹
                      {getTaxConfig(
                        selectedFYYear,
                        "new",
                      ).rebateLimit.toLocaleString("en-IN")}{" "}
                      &bull; Includes Section 87A rebate and marginal relief
                      calculations.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
