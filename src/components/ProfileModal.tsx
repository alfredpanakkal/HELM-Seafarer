import React, { useState, useEffect } from "react";
import { Profile } from "../types";
import { User, Anchor, Shield, X, Save } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: Omit<Profile, "id">) => void;
  onDelete: (id: number) => void;
  editingProfile: Profile | null;
  profilesCount: number;
}

export default function ProfileModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingProfile,
  profilesCount,
}: ProfileModalProps) {
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [vessel, setVessel] = useState("");

  useEffect(() => {
    if (editingProfile) {
      setName(editingProfile.name);
      setRank(editingProfile.rank || "");
      setVessel(editingProfile.vessel || "");
    }
  }, [editingProfile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    onSave(editingProfile.id, { name, rank, vessel });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Edit Profile</h2>
              <p className="text-xs text-slate-400">Update personal details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600 font-medium"
                placeholder="E.g., Rahul Sharma"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1">
                Current Rank
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600 font-medium"
                  placeholder="E.g., Chief Officer"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1">
                Current Vessel
              </label>
              <div className="relative">
                <Anchor className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={vessel}
                  onChange={(e) => setVessel(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600 font-medium"
                  placeholder="E.g., MV Ocean Star"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] border-none cursor-pointer flex justify-center items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
            {profilesCount > 1 && editingProfile && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this profile? This action cannot be undone.",
                    )
                  ) {
                    onDelete(editingProfile.id);
                  }
                }}
                className="w-full py-3.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-all border-none cursor-pointer flex justify-center items-center gap-2"
              >
                <span>Delete Profile</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
