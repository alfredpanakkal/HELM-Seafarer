import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { CloudUser, UserSession } from "../types";
import {
  ShieldAlert,
  LogOut,
  CheckCircle2,
  User,
  Search,
  Wifi,
  WifiOff,
} from "lucide-react";

interface AdminDashboardProps {
  
}

export default function AdminDashboard({  }: AdminDashboardProps) {
  const [users, setUsers] = useState<CloudUser[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // Attempt to listen to users & sessions
    // If permission denied, catch it and set isAdmin = false
    let unsubscribeUsers = () => {};
    let unsubscribeSessions = () => {};

    try {
      unsubscribeUsers = onSnapshot(
        collection(db, "users"),
        (snap) => {
          setIsAdmin(true);
          const data = snap.docs.map((doc) => doc.data() as CloudUser);
          setUsers(data);
        },
        (err) => {
          setIsAdmin(false);
          console.error("Not an admin or permission denied", err);
        },
      );

      unsubscribeSessions = onSnapshot(
        query(collection(db, "sessions"), orderBy("loginTime", "desc")),
        (snap) => {
          const data = snap.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as UserSession,
          );
          setSessions(data);
        },
        (err) => {
          console.error("Sessions read denied", err);
        },
      );
    } catch (e) {
      setIsAdmin(false);
    }

    return () => {
      unsubscribeUsers();
      unsubscribeSessions();
    };
  }, []);

  const handleKickOut = async (sessionId: string) => {
    try {
      await updateDoc(doc(db, "sessions", sessionId), {
        status: "kicked",
      });
    } catch (e) {
      alert("Failed to kick out session");
    }
  };

  const handleSuspendUser = async (email: string, isSuspended: boolean) => {
    try {
      await updateDoc(doc(db, "users", email.toLowerCase()), {
        status: isSuspended ? "active" : "suspended",
      });
    } catch (e) {
      alert("Failed to suspend/unsuspend user");
    }
  };

  if (isAdmin === false) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-slate-500">
            You must be an administrator to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="p-8 text-center text-slate-500">Verifying access...</div>
    );
  }

  const filteredSessions = sessions.filter(
    (s) =>
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.ip && s.ip.includes(search)),
  );

  return (
    <div
      className={`p-4 md:p-8 ${"text-slate-800 dark:text-slate-200"}`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-sm text-slate-400">
            Manage user sessions and platform access
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none transition-colors ${
              "bg-white border-slate-200 focus:border-indigo-500 placeholder-slate-400 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:focus:border-indigo-500 dark:placeholder-slate-600 dark:text-slate-200"
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-bold text-lg">Active Sessions</h2>
          <div className="space-y-3">
            {filteredSessions.length === 0 ? (
              <p className="text-slate-500 text-sm">No sessions found.</p>
            ) : (
              filteredSessions.map((session) => {
                const user = users.find((u) => u.email === session.email);
                const isOnline =
                  session.status === "online" &&
                  new Date().getTime() -
                    new Date(session.lastActive).getTime() <
                    300000; // 5 mins
                const loginDate = new Date(session.loginTime);

                return (
                  <div
                    key={session.id}
                    className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center ${
                      "bg-white border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        {isOnline ? (
                          <Wifi className="w-4 h-4" />
                        ) : (
                          <WifiOff className="w-4 h-4 opacity-50" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">
                            {session.email}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              session.status === "kicked"
                                ? "bg-red-500/10 text-red-500"
                                : isOnline
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-slate-500/10 text-slate-500"
                            }`}
                          >
                            {session.status === "kicked"
                              ? "Kicked"
                              : isOnline
                                ? "Online"
                                : "Offline"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          <span>IP: {session.ip || "Unknown"}</span>
                          <span>
                            Joined: {loginDate.toLocaleDateString()}{" "}
                            {loginDate.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {session.status !== "kicked" && (
                        <button
                          onClick={() => handleKickOut(session.id)}
                          className="flex-1 md:flex-none text-xs font-bold px-4 py-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors cursor-pointer border-none"
                        >
                          Kick Out
                        </button>
                      )}
                      {user && (
                        <button
                          onClick={() =>
                            handleSuspendUser(
                              user.email,
                              user.status === "suspended",
                            )
                          }
                          className={`flex-1 md:flex-none text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer border-none ${
                            user.status === "suspended"
                              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                              : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          }`}
                        >
                          {user.status === "suspended"
                            ? "Unsuspend"
                            : "Suspend"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-6">Registered Users</h2>
          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-slate-500 text-sm">No users registered.</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.email}
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full bg-slate-800"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold truncate max-w-[120px]">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        user.status === "suspended"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}
                    >
                      {user.status === "suspended" ? "Suspended" : "Active"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
