import React, { Component, useState, useEffect, lazy, Suspense } from "react";
import {
  Anchor,
  Calendar,
  TrendingUp,
  Coins,
  Compass,
  Edit2,
  Info,
  User,
  BookOpen,
  Cloud,
  ChevronRight,
} from "lucide-react";

import { Sailing, Profile, DocumentItem } from "./types";
import { computeAllFYData } from "./utils/calc";
import { db } from "./lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// Core components loaded upfront
import Dashboard from "./components/Dashboard";
import SailingLog from "./components/SailingLog";
import NriStatus from "./components/NriStatus";
import Onboarding from "./components/Onboarding";
import CloudAuthModal from "./components/CloudAuthModal";

// Lazy-loaded heavy components
const FyOverview = lazy(() => import("./components/FyOverview"));
const SeatimeAnalytics = lazy(() => import("./components/SeatimeAnalytics"));
const TaxCalculator = lazy(() => import("./components/TaxCalculator"));
const About = lazy(() => import("./components/About"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const VoyageModal = lazy(() => import("./components/VoyageModal"));
const ImportModal = lazy(() => import("./components/ImportModal"));
const ProfileModal = lazy(() => import("./components/ProfileModal"));

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", shortLabel: "Home", icon: Compass },
  { id: "log", label: "Sailing Log", shortLabel: "Log", icon: BookOpen },
  { id: "nri", label: "NRI Status", shortLabel: "NRI", icon: Anchor },
  { id: "fy", label: "FY Overview", shortLabel: "FY", icon: Calendar },
  {
    id: "sea",
    label: "Seatime Analytics",
    shortLabel: "Sea",
    icon: TrendingUp,
  },
  { id: "tax", label: "Tax Calculator", shortLabel: "Tax", icon: Coins },
  { id: "about", label: "About & Settings", shortLabel: "About", icon: Info },
  { id: "admin", label: "Admin Dashboard", shortLabel: "Admin", icon: Cloud },
] as const;

type PageId = (typeof NAV_ITEMS)[number]["id"];

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ComponentErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.error("View rendering error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center text-slate-400">
          <p className="text-sm font-semibold text-emerald-400 mb-2">
            Failed to load view module
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl cursor-pointer"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ViewLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center text-slate-400">
    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
    <span className="text-xs font-medium text-slate-400">
      Loading module...
    </span>
  </div>
);

const STORAGE_KEY = "seafarer_calc_data_v2";
const FONT_SCALE_KEY = "seafarer_font_scale";
const EXCH_RATE_KEY = "seafarer_usd_inr_rate";
const THEME_PRESET_KEY = "seafarer_theme_preset";
const FONT_FAMILY_KEY = "seafarer_font_family";

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "log" | "nri" | "fy" | "sea" | "tax" | "about" | "admin"
  >("dashboard");

  // App Settings
  const [fontScale, setFontScale] = useState<number>(() => {
    const saved = localStorage.getItem(FONT_SCALE_KEY);
    return saved ? parseInt(saved, 10) : 100;
  });
  const [usdInrRate, setUsdInrRate] = useState<number>(() => {
    const saved = localStorage.getItem(EXCH_RATE_KEY);
    return saved ? parseFloat(saved) : 84;
  });
  const [themePreset, setThemePreset] = useState<string>(() => {
    return localStorage.getItem(THEME_PRESET_KEY) || "slate-green";
  });
  const [fontFamily, setFontFamily] = useState<string>(() => {
    return localStorage.getItem(FONT_FAMILY_KEY) || "font-jakarta";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themePreset);
  }, [themePreset]);

  // Seafarer profiles & sailings state
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: 1,
      name: "Guest Seafarer",
      rank: "Chief Officer",
      vessel: "MV Ocean Star",
    },
  ]);
  const [activeProfileId, setActiveProfileId] = useState<number>(1);
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [sailingIdCounter, setSailingIdCounter] = useState<number>(0);

  // Maritime Document Vault State
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem("seafarer_vault_documents");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 1,
        profileId: 1,
        name: "Indian Passport",
        docType: "passport",
        docNumber: "Z9876543",
        issueDate: "2021-05-10",
        expiryDate: "2031-05-09",
        issuingAuthority: "RPO Mumbai",
        notes: "Primary Passport"
      },
      {
        id: 2,
        profileId: 1,
        name: "Continuous Discharge Certificate (CDC)",
        docType: "cdc",
        docNumber: "MUM 142857",
        issueDate: "2020-01-15",
        expiryDate: "2030-01-14",
        issuingAuthority: "MMD Mumbai",
        notes: "Indian CDC Book"
      }
    ];
  });

  // Sync documents to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem("seafarer_vault_documents", JSON.stringify(documents));
    } catch (e) {
      console.warn("Error saving documents to localStorage", e);
    }
  }, [documents]);

  const handleAddDocument = (newDoc: Omit<DocumentItem, "id" | "profileId">) => {
    const item: DocumentItem = {
      ...newDoc,
      id: Date.now(),
      profileId: activeProfileId,
    };
    setDocuments((prev) => [item, ...prev]);
  };

  const handleDeleteDocument = (id: number) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateDocument = (updatedDoc: DocumentItem) => {
    setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
  };

  const handleUpdateUsdInrRate = (rate: number) => {
    setUsdInrRate(rate);
    localStorage.setItem(EXCH_RATE_KEY, rate.toString());
  };

  const handleSetFontScale = (scale: number) => {
    setFontScale(scale);
    localStorage.setItem(FONT_SCALE_KEY, scale.toString());
  };

  const handleUpdateThemePreset = (theme: string) => {
    setThemePreset(theme);
    localStorage.setItem(THEME_PRESET_KEY, theme);
    showToast(`Theme updated: ${theme.replace("-", " ")}`);
  };

  const handleUpdateFontFamily = (font: string) => {
    setFontFamily(font);
    localStorage.setItem(FONT_FAMILY_KEY, font);
    showToast("Typography updated");
  };

  const handleConnectGoogle = (email: string, name: string) => {
    const account = { email, name, lastSynced: new Date().toISOString() };
    setCloudAccount(account);
    localStorage.setItem("seafarer_cloud_account", JSON.stringify(account));
    showToast(`Cloud connected: ${email}`);
  };

  const handleDisconnectGoogle = () => {
    setCloudAccount(null);
    localStorage.removeItem("seafarer_cloud_account");
    showToast("Disconnected Google Account", "warning");
  };

  const handleTriggerManualSync = () => {
    if (cloudAccount) {
      const account = { ...cloudAccount, lastSynced: new Date().toISOString() };
      setCloudAccount(account);
      localStorage.setItem("seafarer_cloud_account", JSON.stringify(account));
      showToast("Cloud sync completed");
    }
  };

  // Google Cloud Account Sync State
  const [cloudAccount, setCloudAccount] = useState<{
    email: string;
    name: string;
    avatarUrl?: string;
    lastSynced: string;
  } | null>(() => {
    const saved = localStorage.getItem("seafarer_cloud_account");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Profile switcher dropdown state
  // removed

  // Onboarding State (Optional manual profile setup modal)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Modals
  const [isVoyageModalOpen, setIsVoyageModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingSailingId, setEditingSailingId] = useState<number | null>(null);

  // 1. Initial Load - Load Settings, Profiles, and Active State
  useEffect(() => {
    // Session tracking and Kickout / Suspension enforcement
    let unsubSession = () => {};
    let unsubUser = () => {};
    let keepAliveInterval: any;

    const enforceSession = () => {
      const sessionId = localStorage.getItem("seafarer_session_id");
      const account = localStorage.getItem("seafarer_cloud_account");
      if (sessionId && account) {
        let parsedAcc;
        try {
          parsedAcc = JSON.parse(account);
        } catch (e) {}

        if (parsedAcc && parsedAcc.email) {
          unsubSession = onSnapshot(doc(db, "sessions", sessionId), (snap) => {
            if (snap.exists()) {
              if (snap.data().status === "kicked") {
                showToast(
                  "Your session was kicked by an administrator.",
                  "warning",
                );
                handleDisconnectGoogle();
              }
            }
          });

          unsubUser = onSnapshot(
            doc(db, "users", parsedAcc.email.toLowerCase()),
            (snap) => {
              if (snap.exists()) {
                if (snap.data().status === "suspended") {
                  showToast("Your account is currently suspended.", "warning");
                  handleDisconnectGoogle();
                }
              }
            },
          );

          keepAliveInterval = setInterval(() => {
            updateDoc(doc(db, "sessions", sessionId), {
              lastActive: new Date().toISOString(),
            }).catch(() => {});
          }, 60000); // 1 minute keep-alive
        }
      }
    };

    enforceSession();
    document.body.style.zoom = `${fontScale}%`;

    // Load active state from unified storage
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        if (parsed.profiles) setProfiles(parsed.profiles);
        if (parsed.activeProfileId) setActiveProfileId(parsed.activeProfileId);

        // Load voyages corresponding to active profile
        const activeProfile = parsed.profiles?.find(
          (p: Profile) => p.id === parsed.activeProfileId,
        );
        if (activeProfile) {
          setSailings(activeProfile.sailings || []);
          setSailingIdCounter(activeProfile.sailingIdCounter || 0);
        }
      } catch (e) {
        console.error("Failed to parse active state from Storage", e);
      }
    }

    return () => {
      if (typeof unsubSession === "function") unsubSession();
      if (typeof unsubUser === "function") unsubUser();
      if (keepAliveInterval) clearInterval(keepAliveInterval);
    };
  }, []);

  // 2. Synchronize Unified Data to LocalStorage
  const syncToStorage = (
    updatedProfiles: Profile[],
    activeId: number,
    currentSailings: Sailing[],
    currentCounter: number,
  ) => {
    const serializedProfiles = updatedProfiles.map((p) => {
      if (p.id === activeId) {
        return {
          ...p,
          sailings: currentSailings,
          sailingIdCounter: currentCounter,
        };
      }
      return p;
    });

    const rootState = {
      profiles: serializedProfiles,
      activeProfileId: activeId,
      lastUpdated: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rootState));
    } catch (e) {
      showToast("⚠️ Storage limit exceeded. Clear old logs.", "warning");
      console.warn("QuotaLimitExceeded during sync", e);
    }
  };

  // Profile Selector updates
  const handleUpdateProfile = (field: keyof Profile, value: string) => {
    const updated = profiles.map((p) => {
      if (p.id === activeProfileId) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setProfiles(updated);
    syncToStorage(updated, activeProfileId, sailings, sailingIdCounter);
  };

  const handleSaveProfile = (id: number, data: Omit<Profile, "id">) => {
    const updated = profiles.map((p) => {
      if (p.id === id) {
        return { ...p, ...data };
      }
      return p;
    });
    setProfiles(updated);
    syncToStorage(updated, activeProfileId, sailings, sailingIdCounter);
    setIsProfileModalOpen(false);
    showToast("Profile updated successfully");
  };

  const handleDeleteProfile = (id: number) => {
    if (profiles.length <= 1) {
      showToast("Cannot delete the last remaining profile.", "warning");
      return;
    }
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);

    let newActiveId = activeProfileId;
    let newSailings = sailings;
    let newCounter = sailingIdCounter;

    if (activeProfileId === id) {
      newActiveId = updated[0].id;
      const matchedProfile = updated[0];
      newSailings = (matchedProfile as any).sailings || [];
      newCounter = (matchedProfile as any).sailingIdCounter || 0;
      setSailings(newSailings);
      setSailingIdCounter(newCounter);
      setActiveProfileId(newActiveId);
    }

    syncToStorage(updated, newActiveId, newSailings, newCounter);
    setIsProfileModalOpen(false);
    showToast("Profile deleted successfully");
  };

  const handleCompleteOnboarding = (data: {
    name: string;
    rank: string;
    vessel: string;
    dob: string;
    userType: "seafarer" | "nri";
  }) => {
    const updated = profiles.map((p) => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          name: data.name,
          rank: data.rank,
          vessel: data.vessel,
          dob: data.dob,
          userType: data.userType,
        };
      }
      return p;
    });
    setProfiles(updated);
    syncToStorage(updated, activeProfileId, sailings, sailingIdCounter);
    localStorage.setItem("seafarer_onboarded", "true");
    setIsOnboardingOpen(false);
    showToast("Profile configured successfully! Welcome aboard.");
  };

  const handleSwitchProfile = (id: number) => {
    setActiveProfileId(id);

    // Fetch corresponding profile's records
    const matchedProfile = profiles.find((p) => p.id === id);
    if (matchedProfile) {
      const activeSailings = (matchedProfile as any).sailings || [];
      const activeCounter = (matchedProfile as any).sailingIdCounter || 0;
      setSailings(activeSailings);
      setSailingIdCounter(activeCounter);
      syncToStorage(profiles, id, activeSailings, activeCounter);
      showToast(`Switched to profile: ${matchedProfile.name}`);
    }
  };

  const handleAddNewProfile = () => {
    const nextId = Math.max(...profiles.map((p) => p.id), 0) + 1;
    const newProf: Profile = {
      id: nextId,
      name: `Seafarer ${nextId}`,
      rank: "Officer",
      vessel: "Unnamed Vessel",
    };
    const updated = [...profiles, newProf];
    setProfiles(updated);

    // Switch to new profile immediately
    setActiveProfileId(nextId);
    setSailings([]);
    setSailingIdCounter(0);
    syncToStorage(updated, nextId, [], 0);
    showToast(`Switched to profile: ${newProf.name}`);
  };

  // Voyage CRUD actions
  const handleSaveVoyage = (data: {
    dep: string;
    arr: string;
    vessel: string;
    rank: string;
    portType: "indian" | "foreign";
    monthlySalary?: number;
    usdRate?: number;
  }) => {
    let nextSailings = [...sailings];
    let nextCounter = sailingIdCounter;

    if (editingSailingId) {
      nextSailings = sailings.map((s) => {
        if (s.id === editingSailingId) {
          return {
            ...s,
            ...data,
          };
        }
        return s;
      });
      showToast("Voyage updated successfully");
    } else {
      nextCounter = sailingIdCounter + 1;
      const newVoyage: Sailing = {
        id: nextCounter,
        profileId: activeProfileId,
        ...data,
      };
      nextSailings.push(newVoyage);
      setSailingIdCounter(nextCounter);
      showToast("Voyage logged successfully");
    }

    setSailings(nextSailings);
    syncToStorage(profiles, activeProfileId, nextSailings, nextCounter);
    setIsVoyageModalOpen(false);
    setEditingSailingId(null);
  };

  const handleDeleteVoyage = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this voyage entry?"))
      return;
    const nextSailings = sailings.filter((s) => s.id !== id);
    setSailings(nextSailings);
    syncToStorage(profiles, activeProfileId, nextSailings, sailingIdCounter);
    showToast("Voyage deleted", "warning");
  };

  const handleClearAllVoyages = () => {
    if (!window.confirm("Delete all sailing entries? This cannot be undone."))
      return;
    setSailings([]);
    setSailingIdCounter(0);
    syncToStorage(profiles, activeProfileId, [], 0);
    showToast("All voyage logs wiped", "warning");
  };

  // Data Imports / Restorations
  const handleImportBackup = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.profiles && Array.isArray(parsed.profiles)) {
        setProfiles(parsed.profiles);
        if (parsed.activeProfileId) {
          setActiveProfileId(parsed.activeProfileId);
          const activeProf = parsed.profiles.find(
            (p: Profile) => p.id === parsed.activeProfileId,
          );
          if (activeProf) {
            setSailings(activeProf.sailings || []);
            setSailingIdCounter(activeProf.sailingIdCounter || 0);
          }
        }
        localStorage.setItem(STORAGE_KEY, jsonStr);
        showToast("Backup restored successfully");
      } else if (parsed.sailings && Array.isArray(parsed.sailings)) {
        // Fallback for flat-file JSON restore
        setSailings(parsed.sailings);
        setSailingIdCounter(parsed.sailingIdCounter || 0);
        syncToStorage(
          profiles,
          activeProfileId,
          parsed.sailings,
          parsed.sailingIdCounter || 0,
        );
        showToast("Backup restored successfully");
      } else {
        alert("Format error: Backup does not match valid JSON specifications.");
      }
    } catch (e) {
      alert("Failed to parse backup string: " + e);
    }
  };

  // Calculations sync
  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const computedFYData = computeAllFYData(sailings);

  // Backup file export
  const handleExportJSON = () => {
    const rawData = localStorage.getItem(STORAGE_KEY);
    const dataStr =
      rawData ||
      JSON.stringify(
        { profiles, activeProfileId, lastUpdated: new Date().toISOString() },
        null,
        2,
      );
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seafarer-calc-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("📋 JSON backup downloaded successfully");
  };

  const handleExportCSV = () => {
    if (sailings.length === 0) {
      showToast("No voyages logged to export", "warning");
      return;
    }
    const headers = [
      "Vessel",
      "Rank",
      "Sign On / Departure",
      "Sign Off / Arrival",
      "Port Type",
      "Monthly Salary (USD)",
      "USD Rate",
    ];
    const rows = sailings.map((s) => [
      s.vessel || "",
      s.rank || "",
      s.dep || "",
      s.arr || "",
      s.portType === "indian" ? "Indian Port (CDC)" : "Foreign Port (Passport)",
      s.monthlySalary || "",
      s.usdRate || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seafarer-voyages-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("📊 CSV spreadsheet downloaded successfully");
  };

  return (
    <div
      className={`flex min-h-screen ${fontFamily} select-none antialiased transition-colors bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}
    >
      {/* Toast notifications */}
      <div
        id="toast-container"
        className="fixed top-4 right-4 z-[999] pointer-events-none"
      ></div>

      {/* ═══════════════════════════════════════════
           SIDEBAR (Tablet & Desktop)
           ═══════════════════════════════════════════ */}
      <aside
        className={`hidden md:flex flex-col md:w-20 lg:w-64 py-6 fixed inset-y-0 left-0 z-50 border-r transition-all duration-300 ${
          "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
        }`}
      >
        <div
          className={`flex items-center md:justify-center lg:justify-start gap-3 px-0 lg:px-6 pb-6 border-b mb-6 ${"border-slate-200 dark:border-slate-800"}`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Anchor className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span
            className={`font-bold tracking-tight leading-none text-base hidden lg:block ${"text-slate-900 dark:text-slate-100"}`}
          >
            Seafarer Calc
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 lg:px-4 space-y-1.5 overflow-x-hidden">
          {NAV_ITEMS.filter(
            (item) =>
              item.id !== "admin" ||
              cloudAccount?.email?.toLowerCase() === "yoursalfred@gmail.com",
          ).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as any)}
                className={`w-full flex items-center md:justify-center lg:justify-start gap-3 px-3 lg:px-4 py-2.5 rounded-xl font-medium text-xs tracking-wide transition-all border-none text-left cursor-pointer ${
                  isActive
                    ? "bg-emerald-50 text-emerald-600 lg:border-l-4 lg:border-l-emerald-500 lg:pl-3.5 font-bold dark:bg-emerald-500/10 dark:text-emerald-400 dark:lg:border-l-4 dark:lg:border-l-emerald-500 dark:lg:pl-3.5 dark:font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${isActive ? ("text-emerald-600 dark:text-emerald-400") : "text-slate-400 dark:text-slate-500"}`}
                />
                <span className="hidden lg:block truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Cloud Sync Status Button */}
          <button
            onClick={() => setIsCloudModalOpen(true)}
            className={`w-full flex items-center md:justify-center lg:justify-between px-3 lg:px-4 py-2.5 rounded-xl font-medium text-xs tracking-wide transition-all border mt-2 cursor-pointer ${
              "border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-950/60 dark:hover:bg-slate-800 dark:text-slate-300"
            }`}
            title={cloudAccount ? "Cloud Synced" : "Guest Mode"}
          >
            <div className="flex items-center gap-2.5">
              <Cloud
                className={`w-5 h-5 shrink-0 ${cloudAccount ? "text-emerald-500" : "text-amber-500"}`}
              />
              <span className="hidden lg:block truncate">
                {cloudAccount ? "Cloud Synced" : "Guest Mode"}
              </span>
            </div>
            <span
              className={`hidden lg:block text-[10px] px-1.5 py-0.5 rounded border ${
                "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-500 dark:bg-slate-900 dark:border-slate-800"
              }`}
            >
              {cloudAccount ? "Google" : "Local"}
            </span>
          </button>
        </nav>

        {/* Sidebar Footer - Profile Info (Links to About/Settings) */}
        <div
          className={`px-2 lg:px-4 border-t pt-5 mt-auto relative ${"border-slate-200 dark:border-slate-800"}`}
        >
          <button
            onClick={() => setCurrentPage("about")}
            className={`w-full flex items-center md:justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2 border rounded-xl transition-all cursor-pointer text-left font-sans select-none ${
              "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-100"
            }`}
            title={activeProfile.name || "Seafarer"}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${"bg-slate-200 dark:bg-slate-800"}`}
            >
              <User
                className={`w-4 h-4 ${"text-slate-600 dark:text-slate-400"}`}
              />
            </div>
            <div className="hidden lg:block min-w-0 flex-1">
              <div
                className={`text-xs font-bold truncate ${"text-slate-900 dark:text-slate-100"}`}
              >
                {activeProfile.name || "Seafarer"}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {activeProfile.rank || "Officer"}
              </div>
            </div>
            <span className="hidden lg:block text-slate-400 text-xs shrink-0">
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
           MAIN SECTION VIEWPORT
           ═══════════════════════════════════════════ */}
      <main className="flex-grow md:pl-20 lg:pl-64 min-h-screen relative flex flex-col justify-between pb-32 md:pb-0 w-full max-w-full overflow-x-hidden transition-all duration-300">
        {/* Mobile Sticky Top Navigation Header */}
        <header
          className={`md:hidden sticky top-0 z-40 backdrop-blur-md px-4 py-2.5 flex items-center justify-between shadow-sm transition-colors border-b ${
            "bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50 dark:bg-slate-900/90 dark:border-slate-800/80 dark:text-slate-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Anchor className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span
                className={`font-bold text-xs tracking-tight block leading-tight ${"text-slate-900 dark:text-white"}`}
              >
                Seafarer Calc
              </span>
              <span
                className={`text-[10px] block leading-tight ${"text-slate-500 dark:text-slate-400"}`}
              >
                NRI &amp; Seatime
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCloudModalOpen(true)}
              className={`btn-neu px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                cloudAccount
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800/80 dark:text-emerald-300"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:bg-slate-800/90 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <Cloud
                className={`w-3.5 h-3.5 ${cloudAccount ? "text-emerald-500" : "text-amber-500"}`}
              />
              <span className="truncate max-w-[110px]">
                {cloudAccount ? "Cloud Synced" : "Guest Mode"}
              </span>
            </button>
          </div>
        </header>

        {/* Render Active View */}
        <div className="flex-grow">
          {currentPage === "dashboard" && (
            <Dashboard
              cloudAccount={cloudAccount}
              profile={activeProfile}
              sailings={sailings}
              fyData={computedFYData}
              onNavigate={setCurrentPage as any}
              onOpenVoyageModal={() => {
                setEditingSailingId(null);
                setIsVoyageModalOpen(true);
              }}
              onOpenCloudModal={() => setIsCloudModalOpen(true)}
              
            />
          )}

          {currentPage === "log" && (
            <SailingLog
              profile={activeProfile}
              sailings={sailings}
              onUpdateProfile={handleUpdateProfile}
              onOpenVoyageModal={(id) => {
                setEditingSailingId(id || null);
                setIsVoyageModalOpen(true);
              }}
              onDeleteVoyage={handleDeleteVoyage}
              onClearAll={handleClearAllVoyages}
              onImportPrompt={() => setIsImportModalOpen(true)}
              onExportJSON={handleExportJSON}
              onExportCSV={handleExportCSV}
              onExportPDF={() => window.print()}
            />
          )}

          {currentPage === "nri" && (
            <NriStatus sailings={sailings} fyData={computedFYData} />
          )}

          <ComponentErrorBoundary>
            <Suspense fallback={<ViewLoader />}>
              {currentPage === "fy" && (
                <FyOverview
                  fyData={computedFYData}
                  sailings={sailings}
                  usdInrRate={usdInrRate}
                />
              )}

              {currentPage === "sea" && (
                <SeatimeAnalytics
                  sailings={sailings}
                  fyData={computedFYData}
                  usdInrRate={usdInrRate}
                  onUpdateUsdInrRate={handleUpdateUsdInrRate}
                  
                />
              )}

              {currentPage === "tax" && (
                <TaxCalculator
                  sailings={sailings}
                  fyData={computedFYData}
                  usdInrRate={usdInrRate}
                />
              )}

              {currentPage === "admin" &&
                cloudAccount?.email?.toLowerCase() ===
                  "yoursalfred@gmail.com" && <AdminDashboard  />}

              {currentPage === "about" && (
                <About
                  fontScale={fontScale}
                  onUpdateFontScale={handleSetFontScale}
                  themePreset={themePreset}
                  onUpdateThemePreset={handleUpdateThemePreset}
                  fontFamily={fontFamily}
                  onUpdateFontFamily={handleUpdateFontFamily}
                  onExportBackup={handleExportJSON}
                  onOpenCloudModal={() => setIsCloudModalOpen(true)}
                  cloudAccount={cloudAccount}
                  onConnectGoogle={handleConnectGoogle}
                  profiles={profiles}
                  activeProfileId={activeProfileId}
                  onSwitchProfile={handleSwitchProfile}
                  onAddProfile={handleAddNewProfile}
                  documents={documents}
                  onAddDocument={handleAddDocument}
                  onDeleteDocument={handleDeleteDocument}
                  onUpdateDocument={handleUpdateDocument}
                  onEditProfile={(id) => {
                    if (id !== activeProfileId) {
                      handleSwitchProfile(id);
                    }
                    setIsProfileModalOpen(true);
                  }}
                />
              )}
            </Suspense>
          </ComponentErrorBoundary>
        </div>

        {/* ═══════════════════════════════════════════
             BOTTOM NAVIGATION BAR (Mobile Ports)
             ═══════════════════════════════════════════ */}
        <nav
          className={`md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 z-50 flex items-center justify-around px-1 pb-safe border-t transition-colors ${
            "bg-white border-slate-200 text-slate-600 shadow-xl shadow-slate-300/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:shadow-2xl"
          }`}
        >
          {NAV_ITEMS.filter(
            (item) =>
              item.id !== "admin" ||
              cloudAccount?.email?.toLowerCase() === "yoursalfred@gmail.com",
          ).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as any)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full border-none bg-transparent cursor-pointer transition-all ${
                  isActive
                    ? "text-emerald-500 font-bold"
                    : "text-slate-500 hover:text-slate-800 font-medium dark:text-slate-400 dark:hover:text-slate-200 dark:font-medium"
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 min-[375px]:w-5 min-[375px]:h-5 ${isActive ? "stroke-emerald-500 filter drop-shadow-[0_0_2px_rgba(16,185,129,0.3)]" : "stroke-slate-500 dark:stroke-slate-400"}`}
                  strokeWidth={2.2}
                />
                <span className="text-[9px] min-[375px]:text-[10px] tracking-tight truncate max-w-full px-0.5">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Floating Action Button (FAB) */}
        {(currentPage === "dashboard" || currentPage === "log") && (
          <button
            onClick={() => {
              setEditingSailingId(null);
              setIsVoyageModalOpen(true);
            }}
            className="md:hidden fixed bottom-20 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-2xl btn-neu-fab active:scale-90 transition-all z-40 border-none cursor-pointer"
            title="Log Voyage"
          >
            +
          </button>
        )}
      </main>

      {/* ═══════════════════════════════════════════
           MODAL PORTS (DIALOG WRAPPERS)
           ═══════════════════════════════════════════ */}
      <Suspense fallback={null}>
        {isVoyageModalOpen && (
          <VoyageModal
            isOpen={isVoyageModalOpen}
            onClose={() => {
              setIsVoyageModalOpen(false);
              setEditingSailingId(null);
            }}
            onSave={handleSaveVoyage}
            editingSailing={
              editingSailingId
                ? sailings.find((s) => s.id === editingSailingId) || null
                : null
            }
            defaultVessel={activeProfile.vessel}
            defaultRank={activeProfile.rank}
          />
        )}

        {isProfileModalOpen && (
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onSave={handleSaveProfile}
            onDelete={handleDeleteProfile}
            editingProfile={
              profiles.find((p) => p.id === activeProfileId) || null
            }
            profilesCount={profiles.length}
          />
        )}

        {isImportModalOpen && (
          <ImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleImportBackup}
          />
        )}
      </Suspense>

      {isCloudModalOpen && (
        <CloudAuthModal
          isOpen={isCloudModalOpen}
          onClose={() => setIsCloudModalOpen(false)}
          cloudAccount={cloudAccount}
          onConnectGoogle={handleConnectGoogle}
          onDisconnectGoogle={handleDisconnectGoogle}
          onTriggerManualSync={handleTriggerManualSync}
          onExportJSON={handleExportJSON}
          totalVoyagesCount={sailings.length}
        />
      )}

      {isOnboardingOpen && <Onboarding onComplete={handleCompleteOnboarding} />}
    </div>
  );
}

// Global toast alert helper
function showToast(message: string, type: "success" | "warning" = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toastEl = document.createElement("div");
  toastEl.className = `flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-semibold shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto mb-2 ${
    type === "success"
      ? "bg-emerald-950/90 border-emerald-800 text-emerald-400"
      : "bg-red-950/90 border-red-900 text-red-400"
  }`;
  const iconSpan = document.createElement("span");
  iconSpan.textContent = type === "success" ? "✓" : "⚠";

  const msgSpan = document.createElement("span");
  msgSpan.textContent = message;

  toastEl.appendChild(iconSpan);
  toastEl.appendChild(msgSpan);

  container.appendChild(toastEl);

  // Trigger entering transition
  setTimeout(() => {
    toastEl.classList.remove("translate-y-2", "opacity-0");
  }, 10);

  // Trigger leaving transition
  setTimeout(() => {
    toastEl.classList.add("translate-y-[-10px]", "opacity-0");
    setTimeout(() => toastEl.remove(), 300);
  }, 3000);
}
