import { Sailing, FYData, FYSailingSplit } from "../types";

/**
 * Safely parses any YYYY-MM-DD date string or Date object into a local Date at midnight,
 * preventing UTC ISO conversion timezone offset bugs.
 */
export function parseDate(input: string | Date | undefined | null): Date {
  if (!input) return new Date();
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return new Date();
    return new Date(input.getFullYear(), input.getMonth(), input.getDate());
  }
  if (typeof input === "string") {
    const cleanStr = input.trim().split("T")[0];
    const parts = cleanStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  }
  return new Date();
}

/**
 * Formats a Date consistently using Indian date locale (e.g., "01 Apr 2025")
 */
export function formatDateStr(d: Date | string): string {
  const parsed = parseDate(d);
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getNriDays(fyYear: number): number {
  // Leap year: Feb has 29 days in (fyYear+1) -> 185-day threshold; else 184
  const feb = new Date(fyYear + 1, 1, 29);
  return feb.getMonth() === 1 ? 185 : 184;
}

export function fyLabel(apr: number): string {
  const end = apr + 1;
  return `${apr}-${String(end).slice(2)}`;
}

export function fyFromDate(d: Date | string): number {
  const parsed = parseDate(d);
  const y = parsed.getFullYear();
  const m = parsed.getMonth();
  return m >= 3 ? y : y - 1;
}

export function fyStart(apr: number): Date {
  return new Date(apr, 3, 1);
}

export function fyEnd(apr: number): Date {
  return new Date(apr + 1, 2, 31);
}

export function daysBetween(a: Date | string, b: Date | string): number {
  const dA = parseDate(a);
  const dB = parseDate(b);
  const utcA = Date.UTC(dA.getFullYear(), dA.getMonth(), dA.getDate());
  const utcB = Date.UTC(dB.getFullYear(), dB.getMonth(), dB.getDate());
  const diffTime = Math.abs(utcB - utcA);
  return Math.round(diffTime / 86400000) + 1;
}

export function clampToFY(
  dep: Date | string,
  arr: Date | string,
  fy: number,
): number {
  const d = parseDate(dep);
  const a = parseDate(arr);
  const fs = fyStart(fy);
  const fe = fyEnd(fy);
  const s = d < fs ? fs : d;
  const e = a > fe ? fe : a;
  if (e < s) return 0;
  return daysBetween(s, e);
}

export function computeSailingOutsideDays(
  dep: Date | string,
  arr: Date | string,
  portType: "indian" | "foreign",
): number {
  const d = parseDate(dep);
  const a = parseDate(arr);
  if (portType === "indian") {
    return daysBetween(d, a);
  } else {
    // Passport rule: departure day counted as outside, arrival day counted as inside India -> days - 1
    return Math.max(0, daysBetween(d, a) - 1);
  }
}

export function getSailingFYSplit(
  dep: Date | string,
  arr: Date | string,
  portType: "indian" | "foreign",
): { fy: string; fyYear: number; days: number }[] {
  const d = parseDate(dep);
  const a = parseDate(arr);
  const depFY = fyFromDate(d);
  const arrFY = fyFromDate(a);
  const result: { fy: string; fyYear: number; days: number }[] = [];

  if (depFY === arrFY) {
    const days = computeSailingOutsideDays(d, a, portType);
    if (days > 0) {
      result.push({ fy: fyLabel(depFY), fyYear: depFY, days });
    }
    return result;
  }

  for (let fy = depFY; fy <= arrFY; fy++) {
    const fs = fyStart(fy);
    const fe = fyEnd(fy);
    const segDep = d > fs ? d : fs;
    const segArr = a < fe ? a : fe;

    if (segArr < segDep) continue;

    let days = 0;
    if (fy < arrFY) {
      // For any intermediate or starting FY segment, count raw days in that FY
      days = daysBetween(segDep, segArr);
    } else {
      // For the final segment, apply the passport/CDC arrival/sign-off rule
      days = computeSailingOutsideDays(segDep, segArr, portType);
    }

    if (days > 0) {
      result.push({ fy: fyLabel(fy), fyYear: fy, days });
    }
  }

  return result;
}

export function computeAllFYData(sailings: Sailing[]): Record<string, FYData> {
  const fyMap: Record<string, FYData> = {};

  for (const s of sailings) {
    if (!s.dep || !s.arr) continue;
    const dep = parseDate(s.dep);
    const arr = parseDate(s.arr);
    if (arr < dep) continue;

    const splits = getSailingFYSplit(dep, arr, s.portType);

    for (const sp of splits) {
      if (!fyMap[sp.fy]) {
        fyMap[sp.fy] = {
          fy: sp.fy,
          fyYear: sp.fyYear,
          outsideDays: 0,
          sailings: [],
        };
      }
      fyMap[sp.fy].outsideDays += sp.days;

      fyMap[sp.fy].sailings.push({
        id: s.id,
        profileId: s.profileId,
        depDate: dep,
        arrDate: arr,
        daysInFY: sp.days,
        vessel: s.vessel,
        rank: s.rank,
        portType: s.portType,
        monthlySalary: s.monthlySalary,
      });
    }
  }

  return fyMap;
}

export function daysToMD(days: number): string {
  const m = Math.floor(days / 30);
  const d = days % 30;
  if (m === 0) return `${d}d`;
  if (d === 0) return `${m}m`;
  return `${m}m ${d}d`;
}

export function daysToFull(days: number): string {
  const months = Math.floor(days / 30);
  const rem = days % 30;
  const parts: string[] = [];
  if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (rem) parts.push(`${rem} day${rem > 1 ? "s" : ""}`);
  return parts.join(" ") || "0 days";
}

export interface TaxConfig {
  regime: "new" | "old";
  regimeLabel: string;
  stdDeduction: number;
  slabs: [number, number][];
  rebateLimit: number;
  rebateMax: number;
  extraDeductionLabel?: string;
}

export function getTaxConfig(fyYear: number, regime: "new" | "old"): TaxConfig {
  if (regime === "old") {
    const stdDed = fyYear >= 2019 ? 50000 : 40000;
    return {
      regime: "old",
      regimeLabel: "Old Tax Regime",
      stdDeduction: stdDed,
      slabs: [
        [250000, 0],
        [250000, 0.05],
        [500000, 0.2],
        [Infinity, 0.3],
      ],
      rebateLimit: 500000,
      rebateMax: 12500,
      extraDeductionLabel: "80C/80D etc.",
    };
  }

  // New Tax Regime
  if (fyYear >= 2025) {
    // Budget 2025 update (effective FY 2025-26): Std deduction is ₹75,000, slabs increased to ₹4,00,000 intervals
    return {
      regime: "new",
      regimeLabel: "New Regime · Budget 2025",
      stdDeduction: 75000,
      slabs: [
        [400000, 0], // Up to 4L: Nil
        [400000, 0.05], // 4L to 8L: 5%
        [400000, 0.1], // 8L to 12L: 10%
        [400000, 0.15], // 12L to 16L: 15%
        [400000, 0.2], // 16L to 20L: 20%
        [400000, 0.25], // 20L to 24L: 25%
        [Infinity, 0.3], // Above 24L: 30%
      ],
      rebateLimit: 1200000, // Section 87A rebate for income up to 12L under New Regime (from Budget 2025)
      rebateMax: 60000,
    };
  }

  if (fyYear === 2024) {
    // FY 2024-25 New Regime: Std deduction ₹75,000, slabs at 3L intervals
    return {
      regime: "new",
      regimeLabel: "New Regime · Budget 2024",
      stdDeduction: 75000,
      slabs: [
        [300000, 0],
        [300000, 0.05],
        [300000, 0.1],
        [300000, 0.15],
        [300000, 0.2],
        [Infinity, 0.3],
      ],
      rebateLimit: 700000,
      rebateMax: 25000,
    };
  }

  // FY 2023-24 and older
  return {
    regime: "new",
    regimeLabel: "New Regime · FY 23-24",
    stdDeduction: 50000,
    slabs: [
      [300000, 0],
      [300000, 0.05],
      [300000, 0.1],
      [300000, 0.15],
      [300000, 0.2],
      [Infinity, 0.3],
    ],
    rebateLimit: 700000,
    rebateMax: 25000,
  };
}

export interface TaxResult {
  gross: number;
  stdDeduction: number;
  taxable: number;
  taxBeforeCess: number;
  cess: number;
  total: number;
  netTakeHome: number;
  slabsBreakdown: { text: string; amount: number; rate: number; tax: number }[];
}

export function calcTax(
  income: number,
  fyYear: number,
  regime: "new" | "old" = "new",
  deductions: number = 0,
): TaxResult {
  const config = getTaxConfig(fyYear, regime);
  const stdDeduction = income > 0 ? config.stdDeduction : 0;
  const taxable = Math.max(0, income - stdDeduction - deductions);

  let tempTaxable = taxable;
  let taxBeforeCess = 0;
  const slabsBreakdown: TaxResult["slabsBreakdown"] = [];

  let cumulLimit = 0;
  for (let i = 0; i < config.slabs.length; i++) {
    const [limit, rate] = config.slabs[i];
    const range = limit;

    const slabAmount = tempTaxable > range ? range : tempTaxable;
    const slabTax = slabAmount * rate;

    const startText = cumulLimit.toLocaleString("en-IN");
    const endText = isFinite(limit)
      ? (cumulLimit + limit).toLocaleString("en-IN")
      : "above";
    slabsBreakdown.push({
      text: `₹${startText} to ₹${endText}`,
      amount: slabAmount,
      rate,
      tax: slabTax,
    });

    taxBeforeCess += slabTax;
    tempTaxable -= slabAmount;
    if (tempTaxable <= 0) break;
    cumulLimit += range;
  }

  // Section 87A rebate with marginal relief
  let rebateApplied = 0;
  let taxAfterRebate = taxBeforeCess;

  if (taxable <= config.rebateLimit) {
    rebateApplied = Math.min(taxBeforeCess, config.rebateMax);
    taxAfterRebate = Math.max(0, taxBeforeCess - rebateApplied);
  } else if (config.regime === "new" && fyYear >= 2025) {
    // Marginal relief for New Regime under Budget 2025:
    // Tax payable cannot exceed the amount by which income exceeds the rebate limit
    const incomeExcess = taxable - config.rebateLimit;
    if (taxBeforeCess > incomeExcess) {
      rebateApplied = taxBeforeCess - incomeExcess;
      taxAfterRebate = incomeExcess;
    }
  } else if (config.regime === "new" && fyYear === 2024) {
    // Pre-2025 marginal relief for income slightly above 7L
    const incomeExcess = taxable - 700000;
    if (taxBeforeCess > incomeExcess) {
      rebateApplied = taxBeforeCess - incomeExcess;
      taxAfterRebate = incomeExcess;
    }
  }

  const cess = Math.round(taxAfterRebate * 0.04);
  const total = Math.round(taxAfterRebate) + cess;
  const netTakeHome = income - total;

  return {
    gross: income,
    stdDeduction,
    taxable,
    taxBeforeCess: Math.round(taxBeforeCess),
    cess,
    total,
    netTakeHome,
    slabsBreakdown,
  };
}
