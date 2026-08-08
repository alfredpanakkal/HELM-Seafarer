import React, { useState } from "react";
import { DocumentItem } from "../types";
import {
  FileText,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Award,
  Search,
  CheckCircle2,
  X,
  CreditCard,
  Edit2
} from "lucide-react";

interface DocumentVaultProps {
  documents: DocumentItem[];
  activeProfileId: number;
  onAddDocument: (doc: Omit<DocumentItem, "id" | "profileId">) => void;
  onDeleteDocument: (id: number) => void;
  onUpdateDocument?: (doc: DocumentItem) => void;
}

export default function DocumentVault({
  documents,
  activeProfileId,
  onAddDocument,
  onDeleteDocument,
  onUpdateDocument,
}: DocumentVaultProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Form state
  const [name, setName] = useState("");
  const [docType, setDocType] = useState<DocumentItem["docType"]>("passport");
  const [docNumber, setDocNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [issuingAuthority, setIssuingAuthority] = useState("");
  const [notes, setNotes] = useState("");

  const activeDocs = documents.filter((d) => d.profileId === activeProfileId);

  const getExpiryStatus = (expiryDateStr: string) => {
    if (!expiryDateStr) return { status: "active", label: "Active", days: 999 };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDateStr);
    exp.setHours(0, 0, 0, 0);

    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "expired", label: "Expired", days: diffDays };
    } else if (diffDays <= 90) {
      return { status: "expiring", label: `Expires in ${diffDays}d`, days: diffDays };
    } else {
      return { status: "active", label: "Valid", days: diffDays };
    }
  };

  const openAddModal = () => {
    setEditingDoc(null);
    setName("");
    setDocType("passport");
    setDocNumber("");
    setIssueDate("");
    setExpiryDate("");
    setIssuingAuthority("");
    setNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setName(doc.name);
    setDocType(doc.docType);
    setDocNumber(doc.docNumber);
    setIssueDate(doc.issueDate || "");
    setExpiryDate(doc.expiryDate);
    setIssuingAuthority(doc.issuingAuthority || "");
    setNotes(doc.notes || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !expiryDate) return;

    if (editingDoc && onUpdateDocument) {
      onUpdateDocument({
        ...editingDoc,
        name: name.trim(),
        docType,
        docNumber: docNumber.trim(),
        issueDate: issueDate || undefined,
        expiryDate,
        issuingAuthority: issuingAuthority.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddDocument({
        name: name.trim(),
        docType,
        docNumber: docNumber.trim(),
        issueDate: issueDate || undefined,
        expiryDate,
        issuingAuthority: issuingAuthority.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const filteredDocs = activeDocs.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.issuingAuthority && doc.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || doc.docType === typeFilter;
    return matchesSearch && matchesType;
  });

  const expiredCount = activeDocs.filter((d) => getExpiryStatus(d.expiryDate).status === "expired").length;
  const expiringCount = activeDocs.filter((d) => getExpiryStatus(d.expiryDate).status === "expiring").length;
  const activeCount = activeDocs.filter((d) => getExpiryStatus(d.expiryDate).status === "active").length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-5 bg-emerald-500 rounded-sm"></span>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              CDC & Passport Document Vault
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Track Continuous Discharge Certificates, Passports, STCW & Visas with automatic expiry tracking.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Valid Docs</div>
            <div className="text-base font-bold text-slate-100">{activeCount}</div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-amber-400/90 font-medium">Expiring &lt;90d</div>
            <div className="text-base font-bold text-amber-300">{expiringCount}</div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-rose-500/20 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-rose-400/90 font-medium">Expired</div>
            <div className="text-base font-bold text-rose-300">{expiredCount}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search document name, number, authority..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500 transition-all"
        >
          <option value="all">All Document Types</option>
          <option value="passport">Passport</option>
          <option value="cdc">CDC (Seaman's Book)</option>
          <option value="stcw">STCW Certificates</option>
          <option value="visa">Visas (US C1/D, Schengen)</option>
          <option value="medical">Medical Fitness (ENG1/ILO)</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No documents found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Store your Passport, CDC, STCW courses, US C1/D Visa, and Medical certificates to monitor validity dates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredDocs.map((doc) => {
            const statusInfo = getExpiryStatus(doc.expiryDate);
            return (
              <div
                key={doc.id}
                className={`bg-slate-950 border p-4 rounded-xl flex flex-col justify-between transition-all relative ${
                  statusInfo.status === "expired"
                    ? "border-rose-500/30 bg-rose-950/10"
                    : statusInfo.status === "expiring"
                    ? "border-amber-500/30 bg-amber-950/10"
                    : "border-slate-800/90 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                          {doc.docType}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100">{doc.name}</h3>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        No: <span className="text-slate-200">{doc.docNumber || "N/A"}</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        statusInfo.status === "expired"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : statusInfo.status === "expiring"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      }`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-900">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Issue Date</span>
                      <span>{doc.issueDate || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Expiry Date</span>
                      <span className="font-semibold text-slate-200">{doc.expiryDate}</span>
                    </div>
                  </div>

                  {doc.issuingAuthority && (
                    <div className="text-xs text-slate-500 mt-2">
                      Authority: <span className="text-slate-400">{doc.issuingAuthority}</span>
                    </div>
                  )}

                  {doc.notes && (
                    <p className="text-xs text-slate-400 bg-slate-900/60 p-2 rounded-lg mt-2 italic">
                      "{doc.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-slate-900">
                  <button
                    onClick={() => openEditModal(doc)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all cursor-pointer"
                    title="Edit Document"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                {editingDoc ? "Edit Document" : "Add New Maritime Document"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indian Passport, Indian CDC, US C1/D Visa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocumentItem["docType"])}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                  >
                    <option value="passport">Passport</option>
                    <option value="cdc">CDC (Seaman's Book)</option>
                    <option value="stcw">STCW Certificate</option>
                    <option value="visa">Visa</option>
                    <option value="medical">Medical (ENG1/ILO)</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Document / Registration No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Z1234567 / MUM18273"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Issuing Authority
                </label>
                <input
                  type="text"
                  placeholder="e.g. MMD Mumbai / Embassy of USA / MCA UK"
                  value={issuingAuthority}
                  onChange={(e) => setIssuingAuthority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details, renewal office, or reference notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  {editingDoc ? "Save Changes" : "Save Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
