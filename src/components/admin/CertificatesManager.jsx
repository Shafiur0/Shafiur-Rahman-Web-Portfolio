"use client";

import { useEffect, useState } from "react";
import { Link2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import useUpload from "@/utils/useUpload";

const URL_REGEX = /(https?:\/\/[^\s)]+|www\.[^\s)]+)/i;

const isCertificateEntry = (item) =>
  /certificate|certification|credential/i.test(String(item?.icon || ""));

function extractUrl(text) {
  if (typeof text !== "string") return "";
  const match = text.match(URL_REGEX);
  return match ? match[0] : "";
}

function stripFirstUrl(text) {
  if (typeof text !== "string") return "";
  return text.replace(URL_REGEX, "").replace(/\n{2,}/g, "\n").trim();
}

const initialFormData = {
  title: "",
  issuer: "",
  issue_date: "",
  certificate_link: "",
  description: "",
  display_order: 0,
};

export default function CertificatesManager({ onDataChange }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [upload, { loading: uploading }] = useUpload();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/portfolio/achievements", { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data.filter(isCertificateEntry) : [];
      setCertificates(list);
      onDataChange?.(list);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setMessage("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { url, error } = await upload({ file });

    if (error) {
      setMessage("Failed to upload certificate file");
      return;
    }

    setFormData((prev) => ({ ...prev, certificate_link: url }));
    setMessage("Certificate file uploaded");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const description = [
      formData.description.trim(),
      formData.certificate_link.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    const date = [formData.issue_date.trim(), formData.issuer.trim()]
      .filter(Boolean)
      .join(" | ");

    const payload = {
      title: formData.title.trim(),
      description,
      date,
      icon: "certificate",
      display_order: Number(formData.display_order) || 0,
    };

    if (!payload.title) {
      setMessage("Certificate title is required");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/portfolio/achievements", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save certificate");
      }

      setFormData(initialFormData);
      setEditingId(null);
      setMessage(editingId ? "Certificate updated" : "Certificate added");
      await fetchCertificates();
    } catch (error) {
      console.error("Error saving certificate:", error);
      setMessage("Failed to save certificate");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (certificate) => {
    const [issueDatePart = "", issuerPart = ""] = String(certificate.date || "")
      .split("|")
      .map((part) => part.trim());

    setFormData({
      title: certificate.title || "",
      issuer: issuerPart,
      issue_date: issueDatePart,
      certificate_link: extractUrl(certificate.description) || "",
      description: stripFirstUrl(certificate.description),
      display_order: certificate.display_order || 0,
    });
    setEditingId(certificate.id);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this certificate?")) return;

    try {
      const response = await fetch(`/api/portfolio/achievements?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete certificate");
      }

      setMessage("Certificate removed");
      await fetchCertificates();
    } catch (error) {
      console.error("Error deleting certificate:", error);
      setMessage("Failed to delete certificate");
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setMessage("");
  };

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-[#09152b] p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold text-white">Add Certificate</h3>
        <span className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
          {loading ? "Loading..." : `${certificates.length} items`}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            value={formData.title}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, title: event.target.value }))
            }
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Certificate title"
            required
          />
          <input
            type="text"
            value={formData.issuer}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, issuer: event.target.value }))
            }
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Issuer"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            value={formData.issue_date}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, issue_date: event.target.value }))
            }
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Issue date"
          />
          <input
            type="url"
            value={formData.certificate_link}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, certificate_link: event.target.value }))
            }
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 md:col-span-2"
            placeholder="Certificate link (optional)"
          />
        </div>

        <textarea
          value={formData.description}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, description: event.target.value }))
          }
          rows={3}
          className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="Description"
        />

        <div className="grid md:grid-cols-2 gap-4 items-center">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-100 cursor-pointer hover:bg-cyan-500/30 transition-colors">
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload certificate file"}
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <span className="text-xs text-slate-400">Image or PDF</span>
          </div>

          <input
            type="number"
            value={formData.display_order}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                display_order: Number(event.target.value) || 0,
              }))
            }
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Display order"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 text-[#021526] font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-70"
          >
            <Plus size={16} />
            {saving ? "Saving..." : editingId ? "Update Certificate" : "Add Certificate"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-transparent border border-slate-500 text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
              Cancel edit
            </button>
          )}

          {message && <p className="text-sm text-cyan-200">{message}</p>}
        </div>
      </form>

      <div className="mt-6 space-y-2">
        {certificates.length === 0 ? (
          <p className="text-slate-400 text-sm">No certificates yet.</p>
        ) : (
          certificates.map((certificate) => {
            const link = extractUrl(certificate.description);
            return (
              <div
                key={certificate.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg bg-[#0f1f3a] border border-cyan-500/10 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-slate-100 font-medium">{certificate.title}</p>
                  <p className="text-xs text-cyan-300/70 mt-1">{certificate.date || "Certificate"}</p>
                  {link && (
                    <a
                      href={link.startsWith("http") ? link : `https://${link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-cyan-200 hover:text-cyan-100"
                    >
                      <Link2 size={12} /> Open certificate
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(certificate)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-cyan-200 hover:bg-cyan-500/10"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(certificate.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-rose-300 hover:bg-rose-500/10"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}