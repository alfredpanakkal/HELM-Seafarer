import React, { useRef } from "react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (jsonStr: string) => void;
}

export default function ImportModal({
  isOpen,
  onClose,
  onImport,
}: ImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportClick = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert("Please select a JSON file to restore backup.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        onImport(result);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex max-sm:items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Dialog container */}
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 max-sm:rounded-t-3xl max-sm:rounded-b-none sm:rounded-3xl shadow-2xl overflow-hidden z-10 animate-fadeUp flex flex-col">
        {/* Mobile Pull Indicator Bar */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto my-2.5 shrink-0"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 shrink-0">
          <h3
            className="text-base font-bold text-slate-100"
            id="import-modal-title"
          >
            Import Backup Data
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 border-none text-slate-400 hover:text-slate-100 flex items-center justify-center text-lg cursor-pointer active:scale-95"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Select a previously exported <strong>.json</strong> backup file to
            restore your seafarer profiles, rank details, and sailing voyages.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-slate-800 file:bg-slate-950 file:text-slate-300 file:font-semibold hover:file:bg-slate-900 cursor-pointer"
          />
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
            onClick={handleImportClick}
            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white cursor-pointer"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
