"use client";

import { useState, useEffect } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

const initialFormData = {
  name: "",
  category: "",
  display_order: 0,
};

export default function SkillsManager({ onDataChange }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/portfolio/skills");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setSkills(list);
      onDataChange?.(list);
    } catch (error) {
      console.error("Error fetching skills:", error);
      setMessage("Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (editingId) {
        const response = await fetch("/api/portfolio/skills", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id: editingId }),
        });
        if (!response.ok) throw new Error("Failed to update skill");
      } else {
        const response = await fetch("/api/portfolio/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error("Failed to create skill");
      }

      setFormData(initialFormData);
      setEditingId(null);
      setMessage(editingId ? "Skill updated" : "Skill added");
      await fetchSkills();
    } catch (error) {
      console.error("Error saving skill:", error);
      setMessage("Failed to save skill");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (skill) => {
    setFormData({
      name: skill.name,
      category: skill.category,
      display_order: skill.display_order,
    });
    setEditingId(skill.id);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
      const response = await fetch(`/api/portfolio/skills?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete skill");

      setMessage("Skill removed");
      await fetchSkills();
    } catch (error) {
      console.error("Error deleting skill:", error);
      setMessage("Failed to delete skill");
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
        <h3 className="text-2xl font-bold text-white">Add Skill</h3>
        <span className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
          {loading ? "Loading..." : `${skills.length} skills`}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Skill name"
            required
          />

          <input
            type="text"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Category"
            required
          />

          <input
            type="number"
            value={formData.display_order}
            onChange={(e) =>
              setFormData({
                ...formData,
                display_order: Number(e.target.value) || 0,
              })
            }
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Score/Order"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 text-[#05202f] font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-70"
          >
            <Plus size={16} />
            {saving ? "Saving..." : editingId ? "Update Skill" : "Add Skill"}
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
        {skills.length === 0 ? (
          <p className="text-slate-400 text-sm">No skills yet.</p>
        ) : (
          skills.map((skill) => (
            <div
              key={skill.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg bg-[#0f1f3a] border border-cyan-500/10 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-slate-100 font-medium">
                  {skill.name}
                  <span className="text-cyan-200/70"> • {skill.category}</span>
                  <span className="text-cyan-300/90"> • {skill.display_order}%</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(skill)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-cyan-200 hover:bg-cyan-500/10"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(skill.id)}
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
