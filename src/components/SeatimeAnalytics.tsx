import { useEffect, useRef } from "react";
import {
  Chart,
  BarController,
  DoughnutController,
  LineController,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  BarController,
  DoughnutController,
  LineController,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);
import { Sailing, FYData } from "../types";
import { daysBetween, daysToFull, parseDate } from "../utils/calc";
import { Ship, Calendar, Anchor } from "lucide-react";

import { useSystemTheme } from "../hooks/useSystemTheme";

interface SeatimeAnalyticsProps {
  sailings: Sailing[];
  fyData: Record<string, FYData>;
  usdInrRate: number;
  onUpdateUsdInrRate: (rate: number) => void;
}

export default function SeatimeAnalytics({
  sailings,
  fyData,
  usdInrRate,
  onUpdateUsdInrRate,
}: SeatimeAnalyticsProps) {
  const theme = useSystemTheme();
  const vesselChartRef = useRef<HTMLCanvasElement | null>(null);
  const rankChartRef = useRef<HTMLCanvasElement | null>(null);
  const trendChartRef = useRef<HTMLCanvasElement | null>(null);

  const vesselChartInstance = useRef<Chart | null>(null);
  const rankChartInstance = useRef<Chart | null>(null);
  const trendChartInstance = useRef<Chart | null>(null);

  const valid = sailings.filter(
    (s) => s.dep && s.arr && parseDate(s.arr) >= parseDate(s.dep),
  );

  if (valid.length === 0) {
    return (
      <div id="page-sea" className="page active animate-fadeUp">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="page-header mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
              Seatime Analytics
            </h1>
            <p className="text-sm text-slate-400 font-sans">
              Comprehensive analysis of your time at sea.
            </p>
          </div>
          <div className="bg-slate-900/30 border border-slate-800/40 rounded-2xl p-12 text-center text-slate-500 shadow-inner">
            <div className="text-4xl mb-3 opacity-40">⏱</div>
            <h3 className="text-base font-semibold text-slate-400">
              No sailing data available
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Log your voyages in the Sailing Log first to review interactive
              breakdowns, contract trends, and rank divisions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Compute overall stats
  let grandTotalDays = 0;
  valid.forEach((s) => {
    grandTotalDays += daysBetween(parseDate(s.dep), parseDate(s.arr));
  });

  const totalMonths = Math.floor(grandTotalDays / 30);
  const remDays = grandTotalDays % 30;

  // Group by vessel
  const vesselMap: Record<
    string,
    { days: number; count: number; ranks: Record<string, number> }
  > = {};
  valid.forEach((s) => {
    const vName = s.vessel || "Unnamed Vessel";
    if (!vesselMap[vName]) {
      vesselMap[vName] = { days: 0, count: 0, ranks: {} };
    }
    const days = daysBetween(parseDate(s.dep), parseDate(s.arr));
    vesselMap[vName].days += days;
    vesselMap[vName].count++;

    const rank = s.rank || "Unspecified Rank";
    vesselMap[vName].ranks[rank] = (vesselMap[vName].ranks[rank] || 0) + days;
  });

  // Group by rank
  const rankMap: Record<string, number> = {};
  valid.forEach((s) => {
    const rank = s.rank || "Unspecified Rank";
    const days = daysBetween(parseDate(s.dep), parseDate(s.arr));
    rankMap[rank] = (rankMap[rank] || 0) + days;
  });

  // Trend mapping per FY
  const fyKeys = Object.keys(fyData).sort();
  let cumulativeDays = 0;
  const trendData = fyKeys.map((fy) => {
    const d = fyData[fy];
    const fyDays = d.sailings.reduce((sum, s) => sum + s.daysInFY, 0);
    cumulativeDays += fyDays;
    return { fy, days: fyDays, cumulative: cumulativeDays };
  });

  // Render Charts
  useEffect(() => {
    // 1. Vessel Chart (Doughnut)
    if (vesselChartRef.current) {
      const ctx = vesselChartRef.current.getContext("2d");
      if (ctx) {
        const sortedVessels = Object.entries(vesselMap)
          .sort((a, b) => b[1].days - a[1].days)
          .slice(0, 8);
        const labels = sortedVessels.map(([name]) =>
          name.length > 15 ? name.slice(0, 15) + "..." : name,
        );
        const data = sortedVessels.map(([, v]) => v.days);
        const bgColors = [
          "#FF4D4F",
          "#52C41A",
          "#FAAD14",
          "#722ED1",
          "#13C2C2",
          "#EB2F96",
          "#F5222D",
          "#FA8C16",
        ];

        if (vesselChartInstance.current) vesselChartInstance.current.destroy();
        vesselChartInstance.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels,
            datasets: [
              {
                data,
                backgroundColor: bgColors,
                borderWidth: 0,
                hoverOffset: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  color: theme === "dark" ? "#8B95A5" : "#475569",
                  font: { family: "Poppins", size: 10 },
                  boxWidth: 8,
                  padding: 10,
                  usePointStyle: true,
                },
              },
            },
          },
        });
      }
    }

    // 2. Rank Chart (Horizontal Bar)
    if (rankChartRef.current) {
      const ctx = rankChartRef.current.getContext("2d");
      if (ctx) {
        const sortedRanks = Object.entries(rankMap).sort((a, b) => b[1] - a[1]);
        const labels = sortedRanks.map(([name]) => name);
        const data = sortedRanks.map(([, d]) => d);

        if (rankChartInstance.current) rankChartInstance.current.destroy();
        rankChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "Days on board",
                data,
                backgroundColor: "#FF4D4F",
                borderRadius: 6,
                borderSkipped: false,
                barThickness: 16,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: {
                  color:
                    "rgba(15, 23, 42, 0.08) dark:rgba(42, dark:54, dark:85, dark:0.3)",
                },
                ticks: {
                  color: theme === "dark" ? "#5A6578" : "#64748B",
                  font: { family: "Poppins", size: 10 },
                },
              },
              y: {
                grid: { display: false },
                ticks: {
                  color: theme === "dark" ? "#8B95A5" : "#475569",
                  font: { family: "Poppins", size: 11 },
                },
              },
            },
          },
        });
      }
    }

    // 3. Trend Chart (Combination Bar & Line)
    if (trendChartRef.current) {
      const ctx = trendChartRef.current.getContext("2d");
      if (ctx) {
        const labels = trendData.map((r) => `FY ${r.fy}`);
        const dataDays = trendData.map((r) => r.days);
        const dataCumul = trendData.map((r) => r.cumulative);

        if (trendChartInstance.current) trendChartInstance.current.destroy();
        trendChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "Days in FY",
                data: dataDays,
                backgroundColor: "#FF4D4F",
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 32,
                order: 1,
              },
              {
                label: "Cumulative Career Days",
                data: dataCumul,
                type: "line",
                borderColor: "#FAAD14",
                backgroundColor: "rgba(250, 173, 20, 0.1)",
                borderWidth: 2.5,
                borderDash: [6, 4],
                tension: 0.4,
                fill: false,
                pointRadius: 4.5,
                pointBackgroundColor: "#FAAD14",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                order: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "top",
                labels: {
                  color: theme === "dark" ? "#8B95A5" : "#475569",
                  font: { family: "Poppins", size: 11 },
                  usePointStyle: true,
                  boxWidth: 8,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  color: theme === "dark" ? "#8B95A5" : "#475569",
                  font: { family: "Poppins", size: 11 },
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color:
                    "rgba(15, 23, 42, 0.08) dark:rgba(42, dark:54, dark:85, dark:0.3)",
                },
                ticks: {
                  color: theme === "dark" ? "#5A6578" : "#64748B",
                  font: { family: "Poppins", size: 10 },
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (vesselChartInstance.current) vesselChartInstance.current.destroy();
      if (rankChartInstance.current) rankChartInstance.current.destroy();
      if (trendChartInstance.current) trendChartInstance.current.destroy();
    };
  }, [sailings, fyData, theme]);

  return (
    <div id="page-sea" className="page active animate-fadeUp">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        <div className="page-header mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Seatime Analytics
          </h1>
          <p className="text-sm text-slate-400 measure-prose">
            Comprehensive analysis of your time at sea.
          </p>
        </div>

        {/* Bento Stat Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 text-center shadow-lg flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2">
              <Ship className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-emerald-500 font-mono tabular-nums leading-none">
              {grandTotalDays.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2.5">
              Total Sea Days
            </div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 text-center shadow-lg flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-emerald-500 font-mono tabular-nums leading-none">
              {totalMonths}m
            </div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2.5">
              {remDays > 0 ? `+ ${remDays} days` : "Net Duration"}
            </div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 text-center shadow-lg flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2">
              <Anchor className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-emerald-400 font-mono leading-none">
              {valid.length}
            </div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2.5">
              Voyages Logged
            </div>
          </div>
        </div>

        {/* Vessel & Rank Chart Breakdown (Bento Panel Group) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Vessel Doughnut */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2 mb-4">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-sm"></span>{" "}
              Vessel Division
            </h3>
            <div className="relative w-full h-[240px] flex-1">
              <canvas ref={vesselChartRef}></canvas>
            </div>
          </div>

          {/* Rank Bar */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2 mb-4">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-sm"></span> Rank
              Distribution
            </h3>
            <div className="relative w-full h-[240px] flex-1">
              <canvas ref={rankChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Contract Trend Chart */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg mb-6 flex flex-col justify-between">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2 mb-4">
            <span className="w-1.5 h-3 bg-emerald-500 rounded-sm"></span> Career
            Seatime Trend
          </h3>
          <div className="relative w-full h-[260px] md:h-[280px]">
            <canvas ref={trendChartRef}></canvas>
          </div>
        </div>

        {/* Vessel Table Overview */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 mb-6 shadow-md">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2 mb-4">
            <span className="w-1.5 h-3 bg-emerald-500 rounded-sm"></span> Vessel
            Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Vessel</th>
                  <th className="py-3 px-3">Primary Rank</th>
                  <th className="py-3 px-3">Entries</th>
                  <th className="py-3 px-3 text-right">Seatime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300 font-mono">
                {Object.entries(vesselMap)
                  .sort((a, b) => b[1].days - a[1].days)
                  .map(([vName, vData]) => {
                    const topRank =
                      Object.entries(vData.ranks).sort(
                        (x, y) => y[1] - x[1],
                      )[0]?.[0] || "—";
                    return (
                      <tr key={vName} className="hover:bg-slate-800/10">
                        <td className="py-3 px-3 font-semibold text-slate-200 font-sans">
                          {vName}
                        </td>
                        <td className="py-3 px-3 font-sans">{topRank}</td>
                        <td className="py-3 px-3">{vData.count}</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <span className="inline-block bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded text-[11px] font-bold text-red-400 mr-2">
                            {vData.days}d
                          </span>
                          <span className="text-xs font-sans text-slate-500">
                            ({daysToFull(vData.days)})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Currency setting Block */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200 mb-1">
                Global Currency Rate
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                Used across the tax and salary screens to estimate total
                converted INR. Set this to your current bank exchange rate.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto max-w-[200px]">
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                1 USD =
              </span>
              <input
                type="number"
                value={usdInrRate}
                step="0.1"
                min="1"
                max="200"
                onChange={(e) =>
                  onUpdateUsdInrRate(
                    Math.max(1, parseFloat(e.target.value) || 1),
                  )
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-200 outline-none focus:border-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-400 font-mono">
                INR
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
