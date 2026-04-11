"use client";

import { useState, useEffect } from "react";
import { Link2, Pencil, Plus, Trash2, X } from "lucide-react";

const URL_REGEX = /(https?:\/\/[^\s)]+|www\.[^\s)]+)/i;

const isCertificateEntry = (item) =>
  /certificate|certification|credential/i.test(String(item?.icon || ""));

const extractUrl = (text) => {
  if (typeof text !== "string") return "";
  const match = text.match(URL_REGEX);
  return match ? match[0] : "";
};

const stripFirstUrl = (text) => {
  if (typeof text !== "string") return "";
  return text.replace(URL_REGEX, "").replace(/\n{2,}/g, "\n").trim();
};

const initialFormData = {
  title: "",
  description: "",
  date: "",
  icon: "award",
  link_url: "",
  display_order: 0,
};

export default function AchievementsManager({ onDataChange }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await fetch("/api/portfolio/achievements");
      const data = await res.json();
      const list = Array.isArray(data)
        ? data.filter((item) => !isCertificateEntry(item))
        : [];
      setAchievements(list);
      onDataChange?.(list);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      setMessage("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      title: formData.title.trim(),
      date: formData.date.trim(),
      icon: formData.icon.trim() || "award",
      display_order: Number(formData.display_order) || 0,
      description: [formData.description.trim(), formData.link_url.trim()]
        .filter(Boolean)
        .join("\n"),
    };

    if (!payload.title) {
      setMessage("Title is required");
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        const response = await fetch("/api/portfolio/achievements", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingId }),
        });
        if (!response.ok) throw new Error("Failed to update achievement");
      } else {
        const response = await fetch("/api/portfolio/achievements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to create achievement");
      }

      setFormData(initialFormData);
      setEditingId(null);
      setMessage(editingId ? "Achievement updated" : "Achievement added");
      await fetchAchievements();
    } catch (error) {
      console.error("Error saving achievement:", error);
      setMessage("Failed to save achievement");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (achievement) => {
    const linkUrl = extractUrl(achievement.description);
    setFormData({
      title: achievement.title,
      description: stripFirstUrl(achievement.description || ""),
      date: achievement.date || "",
      icon: achievement.icon || "award",
      link_url: linkUrl,
      display_order: achievement.display_order,
    });
    setEditingId(achievement.id);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;

    try {
      const response = await fetch(`/api/portfolio/achievements?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete achievement");

      setMessage("Achievement removed");
      await fetchAchievements();
    } catch (error) {
      console.error("Error deleting achievement:", error);
      setMessage("Failed to delete achievement");
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setMessage("");
  };

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-[#09152b] p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold text-white">Add Achievement</h3>
        <span className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
          {loading ? "Loading..." : `${achievements.length} items`}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Title"
            required
          />
          <input
            type="text"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Date"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="award"
          />
          <input
            type="url"
            value={formData.link_url}
            onChange={(e) =>
              setFormData({ ...formData, link_url: e.target.value })
            }
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Achievement link"
          />
        </div>

        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="Description"
        />

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            value={formData.display_order}
            onChange={(e) =>
              setFormData({
                ...formData,
                display_order: Number(e.target.value) || 0,
              })
            }
            className="w-40 rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Order"
          />

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 text-[#05202f] font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-70"
          >
            <Plus size={16} />
            {saving
              ? "Saving..."
              : editingId
                ? "Update Achievement"
                : "Add Achievement"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
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
        {achievements.length === 0 ? (
          <p className="text-slate-400 text-sm">No achievements yet.</p>
        ) : (
          achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg bg-[#0f1f3a] border border-cyan-500/10 px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h4 className="font-medium text-slate-100">{achievement.title}</h4>
                  {achievement.date && (
                    <span className="text-xs uppercase tracking-widest text-cyan-300/80">
                      {achievement.date}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">
                  {stripFirstUrl(achievement.description || "")}
                </p>
                {extractUrl(achievement.description) && (
                  <a
                    href={extractUrl(achievement.description).startsWith("http")
                      ? extractUrl(achievement.description)
                      : `https://${extractUrl(achievement.description)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-cyan-200 hover:text-cyan-100"
                  >
                    <Link2 size={12} /> Open Link
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => handleEdit(achievement)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-cyan-200 hover:bg-cyan-500/10"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(achievement.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
