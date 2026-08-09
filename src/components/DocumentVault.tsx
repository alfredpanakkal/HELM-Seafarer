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
    <div className="card-surface rounded-2xl p-5 md:p-6 shadow-sm mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-5 bg-emerald-600 rounded-sm"></span>
            <h2 className="text-xl font-bold text-app flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              CDC &amp; Passport Document Vault
            </h2>
          </div>
          <p className="text-xs text-muted-app">
            Track Continuous Discharge Certificates, Passports, STCW &amp; Visas with automatic expiry tracking.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-recessed border border-app rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-app">Valid Docs</div>
            <div className="text-base font-bold text-app">{activeCount}</div>
          </div>
        </div>

        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-amber-800 font-medium">Expiring &lt;90d</div>
            <div className="text-base font-bold text-amber-900">{expiringCount}</div>
          </div>
        </div>

        <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-rose-800 font-medium">Expired</div>
            <div className="text-base font-bold text-rose-900">{expiredCount}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-app absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search document name, number, authority..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-app focus:border-emerald-600 rounded-xl pl-9 pr-4 py-2 text-xs text-app outline-none transition-all placeholder:text-muted-app shadow-sm"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-surface border border-app text-app text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-600 transition-all shadow-sm"
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
        <div className="text-center py-8 px-4 border border-dashed border-app rounded-xl bg-recessed">
          <FileText className="w-8 h-8 text-muted-app mx-auto mb-2" />
          <p className="text-sm font-semibold text-app">No documents found</p>
          <p className="text-xs text-muted-app mt-1 max-w-sm mx-auto">
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
                className={`bg-surface border p-4 rounded-xl flex flex-col justify-between transition-all relative shadow-sm ${
                  statusInfo.status === "expired"
                    ? "border-rose-300 bg-rose-50/30"
                    : statusInfo.status === "expiring"
                    ? "border-amber-300 bg-amber-50/30"
                    : "border-app hover:border-emerald-500"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-recessed text-emerald-800 border border-app">
                          {doc.docType}
                        </span>
                        <h3 className="text-sm font-bold text-app">{doc.name}</h3>
                      </div>
                      <p className="text-xs font-mono text-muted-app mt-1">
                        No: <span className="text-app font-semibold">{doc.docNumber || "N/A"}</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        statusInfo.status === "expired"
                          ? "bg-rose-100 border-rose-200 text-rose-800"
                          : statusInfo.status === "expiring"
                          ? "bg-amber-100 border-amber-200 text-amber-900"
                          : "bg-emerald-100 border-emerald-200 text-emerald-800"
                      }`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-app mt-3 pt-3 border-t border-app">
                    <div>
                      <span className="text-[10px] text-muted-app block">Issue Date</span>
                      <span>{doc.issueDate || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-app block">Expiry Date</span>
                      <span className="font-semibold text-app">{doc.expiryDate}</span>
                    </div>
                  </div>

                  {doc.issuingAuthority && (
                    <div className="text-xs text-muted-app mt-2">
                      Authority: <span className="text-app">{doc.issuingAuthority}</span>
                    </div>
                  )}

                  {doc.notes && (
                    <p className="text-xs text-muted-app bg-recessed p-2 rounded-lg mt-2 italic border border-app">
                      "{doc.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-app">
                  <button
                    onClick={() => openEditModal(doc)}
                    className="p-1.5 hover:bg-recessed text-muted-app hover:text-app rounded-lg transition-all cursor-pointer"
                    title="Edit Document"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 hover:bg-rose-100 text-muted-app hover:text-rose-700 rounded-lg transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface border border-app w-full max-w-lg rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-app mb-4">
              <h3 className="text-lg font-bold text-app flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                {editingDoc ? "Edit Document" : "Add New Maritime Document"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-muted-app hover:text-app rounded-lg hover:bg-recessed transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indian Passport, Indian CDC, US C1/D Visa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-recessed border border-app focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-app outline-none shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app mb-1">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocumentItem["docType"])}
                    className="w-full bg-recessed border border-app focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-app outline-none shadow-sm"
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
                  <label className="block text-xs font-semibold text-app mb-1">
                    Document / Registration No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Z1234567 / MUM18273"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full bg-recessed border border-app focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-app outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-recessed border border-app focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-app outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-app mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-recessed border border-app focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-app outline-none shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app mb-1">
                  Issuing Authority
                </label>
                <input
                  type="text"
                  placeholder="e.g. MMD Mumbai / Embassy of USA / MCA UK"
                  value={issuingAuthority}
                  onChange={(e) => setIssuingAuthority(e.target.value)}
                  className="w-full bg-recessed border border-app focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-app outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-app mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details, renewal office, or reference notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-recessed border border-app focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-app outline-none resize-none shadow-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-app">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-recessed border border-app hover:bg-surface text-app text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
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
