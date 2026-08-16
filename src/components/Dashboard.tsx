import { useSystemTheme } from '../hooks/useSystemTheme';
import { useState, useEffect, useRef } from "react";
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
import { Sailing, FYData, Profile } from "../types";
import ActiveContractTracker from "./ActiveContractTracker";
import {
  daysBetween,
  getNriDays,
  fyFromDate,
  fyLabel,
  fyEnd,
  parseDate,
  formatDateStr,
} from "../utils/calc";
import {
  Anchor,
  Shield,
  Clock,
  Calendar,
  BarChart3,
  Smartphone,
  ArrowRight,
  X,
  ShieldCheck,
} from "lucide-react";

interface DashboardProps {
  profile: Profile;
  sailings: Sailing[];
  fyData: Record<string, FYData>;
  onNavigate: (page: string) => void;
  onOpenVoyageModal: () => void;
  onOpenCloudModal?: () => void;
  cloudAccount?: { email: string; name: string } | null;
}

export default function Dashboard({
  profile,
  sailings,
  fyData,
  onNavigate,
  onOpenVoyageModal,
  onOpenCloudModal,
  cloudAccount,
}: DashboardProps) {
  const theme = useSystemTheme();
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const curFYYear = fyFromDate(today);
  const curFYKey = fyLabel(curFYYear);
  const curFYData = fyData[curFYKey];

  // Compute values
  const outsideDays = curFYData ? curFYData.outsideDays : 0;
  const nriThreshold = getNriDays(curFYYear);
  const pct = Math.min((outsideDays / nriThreshold) * 100, 100);
  const isNRIAchieved = outsideDays >= nriThreshold;

  let totalSeaDays = 0;
  sailings.forEach((s) => {
    if (s.dep && s.arr) {
      const dep = parseDate(s.dep);
      const arr = parseDate(s.arr);
      if (arr >= dep) {
        totalSeaDays += daysBetween(dep, arr);
      }
    }
  });

  // Calculate deadline
  let deadlineText = "—";
  let deadlineSub = "Log voyages to see";
  let isDeadlinePassed = false;

  if (curFYData) {
    const remaining = nriThreshold - outsideDays;
    if (remaining > 0) {
      const fe = fyEnd(curFYYear);
      const lastDep = new Date(fe.getFullYear(), fe.getMonth(), fe.getDate());
      lastDep.setDate(lastDep.getDate() - remaining + 1);
      const daysLeft = Math.ceil(
        (lastDep.getTime() - today.getTime()) / 86400000,
      );

      deadlineText = formatDateStr(lastDep);
      if (daysLeft >= 0) {
        deadlineSub = `${daysLeft} days remaining`;
      } else {
        deadlineSub = "Deadline passed";
        isDeadlinePassed = true;
      }
    } else {
      deadlineText = "Achieved!";
      deadlineSub = "NRI target met";
    }
  }

  const recentVoyages = [...sailings]
    .sort((a, b) => parseDate(b.dep).getTime() - parseDate(a.dep).getTime())
    .slice(0, 5);

  // Setup Chart.js
  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const fyKeys = Object.keys(fyData).sort();
    if (fyKeys.length === 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
      return;
    }

    const labels = fyKeys;
    const data = fyKeys.map((key) => fyData[key].outsideDays);
    const bgColors = fyKeys.map((key) => {
      const threshold = getNriDays(fyData[key].fyYear);
      return fyData[key].outsideDays >= threshold ? "#52C41A" : "#FF4D4F";
    });

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Days Outside India",
            data,
            backgroundColor: bgColors,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: Math.min(
              40,
              Math.floor(chartRef.current.parentElement?.clientWidth || 200) /
                (fyKeys.length * 2),
            ),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.parsed.y;
                const f = fyKeys[context.dataIndex];
                const threshold = getNriDays(fyData[f].fyYear);
                return `${val}d / ${threshold}d Target`;
              },
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
            max: Math.max(...data, 220),
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
      plugins: [
        {
          id: "thresholdLine184",
          afterDraw(chart) {
            const { ctx, chartArea, scales } = chart;
            if (!chartArea || !scales.y) return;
            const yVal = getNriDays(curFYYear);
            const yPixel = scales.y.getPixelForValue(yVal);
            ctx.save();
            ctx.strokeStyle = "#FAAD14";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(chartArea.left, yPixel);
            ctx.lineTo(chartArea.right, yPixel);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = theme === "dark" ? "#FAAD14" : "#B27B00";
            ctx.font = "10px Poppins";
            ctx.textAlign = "right";
            ctx.fillText(`${yVal}d Target`, chartArea.right, yPixel - 4);
            ctx.restore();
          },
        },
      ],
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [fyData, theme]);

  return (
    <div
      id="page-dashboard"
      className="page active animate-fadeUp w-full max-w-full overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 pb-4 md:pb-6 w-full">
        {/* Non-Intrusive Mobile-Friendly Cloud Sync Reminder Banner */}
        {!cloudAccount && !isBannerDismissed && (
          <div className="card-surface border border-app rounded-xl p-2.5 sm:p-3 mb-3 flex items-center justify-between gap-2 shadow-sm min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-recessed text-app border border-app flex items-center justify-center shrink-0">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] sm:text-xs font-bold text-app truncate">
                    Guest Mode
                  </span>
                  <span className="text-[9px] sm:text-[10px] bg-recessed text-muted-app px-1.5 py-0.2 rounded border border-app shrink-0">
                    100% Private
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-muted-app truncate mt-0.5">
                  Saved on device &bull; Connect Google to back up
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={onOpenCloudModal}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] sm:text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 border-none"
              >
                <span>Sync</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsBannerDismissed(true)}
                className="text-muted-app hover:text-app p-0.5 rounded-lg cursor-pointer border-none bg-transparent"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Welcome Block - Compact Banner */}
        <div className="relative overflow-hidden bg-emerald-900 border border-emerald-800 rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-8 mb-4 lg:mb-6 shadow-md text-white">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-4">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2 lg:gap-3 truncate">
                Welcome back, {cloudAccount?.name || profile.name || "Seafarer"}{" "}
                <Anchor className="w-5 h-5 lg:w-7 lg:h-7 text-emerald-300 shrink-0 inline" />
              </h2>
              <p className="text-xs lg:text-base text-emerald-100 max-w-2xl leading-relaxed mt-1 lg:mt-2 measure-prose">
                Track your NRI tax status and seatime across financial years.
                Stay on top of your {nriThreshold}-day target.
              </p>
            </div>
            <div className="text-[11px] lg:text-sm text-emerald-200 font-mono shrink-0 sm:text-right">
              {now.toLocaleDateString("en-IN", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>

          {/* Wave decorative animations */}
          <div className="absolute inset-x-0 bottom-0 h-6 lg:h-12 pointer-events-none opacity-20">
            <div className="absolute bottom-0 w-[200%] h-4 lg:h-8 bg-white/10 rounded-[40%] animate-[wave_10s_linear_infinite]"></div>
            <div className="absolute bottom-0 w-[200%] h-4 lg:h-8 bg-white/10 rounded-[35%] animate-[wave_12s_linear_infinite_reverse]"></div>
          </div>
        </div>

        {/* Bento Grid Stats - Tablet: 2 cols, Desktop: 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 mb-4 lg:mb-6">
          {/* Card 1: NRI Progress */}
          <div className="card-surface rounded-xl lg:rounded-2xl p-4 lg:p-5 flex flex-col justify-between shadow-sm min-w-0">
            <div className="flex justify-between items-center mb-3 gap-2 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[11px] lg:text-xs font-semibold uppercase tracking-wider text-muted-app leading-tight">
                  FY Progress
                </span>
              </div>
              <span className="text-xl lg:text-3xl font-extrabold font-mono tabular-nums text-app shrink-0">
                {outsideDays}/{nriThreshold}d
              </span>
            </div>
            <div>
              <div className="progress-bar w-full bg-recessed border border-app h-2 lg:h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isNRIAchieved ? "bg-emerald-600" : "bg-red-500"}`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Card 2: Total Seatime */}
          <div className="card-surface rounded-xl lg:rounded-2xl p-4 lg:p-5 flex flex-col justify-between shadow-sm min-w-0">
            <div className="flex justify-between items-center mb-3 gap-2 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[11px] lg:text-xs font-semibold uppercase tracking-wider text-muted-app leading-tight">
                  Total Days
                </span>
              </div>
              <span className="text-xl lg:text-3xl font-extrabold font-mono tabular-nums text-app shrink-0">
                {totalSeaDays.toLocaleString()}d
              </span>
            </div>
            <div className="text-[11px] text-muted-app font-mono tabular-nums truncate">
              Across all logged voyages
            </div>
          </div>

          {/* Card 3: Deadline Countdown */}
          <div className="card-surface rounded-xl lg:rounded-2xl p-4 lg:p-5 flex flex-col justify-between shadow-sm min-w-0 md:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-center mb-3 gap-2 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[11px] lg:text-xs font-semibold uppercase tracking-wider text-muted-app leading-tight">
                  Last Voyage
                </span>
              </div>
              <span className="text-xl lg:text-3xl font-extrabold text-app font-mono tabular-nums shrink-0">
                {deadlineText}
              </span>
            </div>
            <div
              className={`text-[11px] font-mono leading-tight ${isDeadlinePassed ? "text-red-600 font-semibold" : "text-muted-app"}`}
            >
              {deadlineSub}
            </div>
          </div>
        </div>

        {/* Active Contract & NRI Target Predictor Widget */}
        <ActiveContractTracker fyData={Object.values(fyData)} />

        {/* Quick Action Rail */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-6 mb-4 lg:mb-8">
          <button
            onClick={onOpenVoyageModal}
            className="flex items-center justify-center gap-1.5 lg:gap-2 px-3 py-2.5 lg:px-4 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-xs lg:text-base bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer truncate shadow-sm border-none transition-all"
          >
            <span className="text-lg lg:text-2xl leading-none">+</span> Log
            Voyage
          </button>
          <button
            onClick={() => onNavigate("nri")}
            className="px-3 py-2.5 lg:px-4 lg:py-4 rounded-xl lg:rounded-2xl font-semibold text-xs lg:text-base bg-surface hover:bg-recessed text-app border border-app cursor-pointer text-center truncate shadow-sm transition-all"
          >
            NRI Status
          </button>
          <button
            onClick={() => onNavigate("fy")}
            className="px-3 py-2.5 lg:px-4 lg:py-4 rounded-xl lg:rounded-2xl font-semibold text-xs lg:text-base bg-surface hover:bg-recessed text-app border border-app cursor-pointer text-center truncate shadow-sm transition-all"
          >
            FY Overview
          </button>
          <button
            onClick={() => onNavigate("sea")}
            className="px-3 py-2.5 lg:px-4 lg:py-4 rounded-xl lg:rounded-2xl font-semibold text-xs lg:text-base bg-surface hover:bg-recessed text-app border border-app cursor-pointer text-center truncate shadow-sm transition-all"
          >
            Analytics
          </button>
        </div>

        {/* Layout Sections: Recent Voyages & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Recent Voyages (Left / Bento) */}
          <div className="lg:col-span-5 card-surface rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3 lg:mb-5">
              <h3 className="text-xs lg:text-sm font-bold tracking-widest text-app uppercase flex items-center gap-2">
                <span className="w-1.5 h-3 lg:h-4 bg-emerald-600 rounded-sm"></span>{" "}
                Recent Voyages
              </h3>
              <button
                onClick={() => onNavigate("log")}
                className="text-xs lg:text-sm font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer border-none bg-transparent"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-app max-h-[200px] lg:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {recentVoyages.length === 0 ? (
                <div className="text-center py-8 lg:py-16 text-muted-app flex flex-col items-center justify-center">
                  <Anchor
                    className="w-8 h-8 lg:w-12 lg:h-12 text-muted-app opacity-40 mb-2"
                    strokeWidth={1.5}
                  />
                  <h4 className="text-xs lg:text-base font-semibold text-app">
                    No voyages yet
                  </h4>
                  <p className="text-[11px] lg:text-sm text-muted-app mt-1 max-w-[220px] mx-auto leading-relaxed">
                    Tap "Log Voyage" to add entry.
                  </p>
                </div>
              ) : (
                recentVoyages.map((s) => {
                  const dep = s.dep ? new Date(s.dep) : null;
                  const arr = s.arr ? new Date(s.arr) : null;
                  const days =
                    dep && arr && arr >= dep ? daysBetween(dep, arr) : 0;
                  const pillClass =
                    days >= 60
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : days >= 30
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-red-50 text-red-800 border-red-200";

                  return (
                    <div
                      key={s.id}
                      className="py-2.5 lg:py-3.5 flex justify-between items-center gap-3 hover:bg-recessed px-2 lg:px-3 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs lg:text-base text-app truncate">
                          {s.vessel || "Unnamed Vessel"}
                        </div>
                        <div className="text-[10px] lg:text-xs font-mono text-muted-app mt-0.5 lg:mt-1">
                          {dep?.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}{" "}
                          →{" "}
                          {arr?.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </div>
                      </div>
                      <span
                        className={`text-[11px] lg:text-sm font-semibold font-mono border rounded-full px-2.5 lg:px-3 py-0.5 lg:py-1 shrink-0 ${pillClass}`}
                      >
                        {days}d
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bar Chart (Right / Bento Wide) */}
          <div className="lg:col-span-7 card-surface rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-sm flex flex-col justify-between">
            <h3 className="text-xs lg:text-sm font-bold tracking-widest text-app uppercase flex items-center gap-2 mb-3 lg:mb-5">
              <span className="w-1.5 h-3 lg:h-4 bg-emerald-600 rounded-sm"></span>{" "}
              FY Summary
            </h3>
            <div className="relative w-full h-[200px] md:h-[260px] lg:h-[300px] flex-1">
              {Object.keys(fyData).length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-app text-center">
                  <BarChart3 className="w-7 h-7 text-muted-app opacity-40 mb-1" />
                  <p className="text-xs font-semibold text-app">No data available</p>
                  <p className="text-[10px] text-muted-app mt-0.5">
                    Add voyages to view charts
                  </p>
                </div>
              ) : (
                <canvas ref={chartRef} className="w-full h-full"></canvas>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
