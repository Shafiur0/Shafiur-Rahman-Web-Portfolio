"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";

export default function SkillsManager() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    display_order: 0,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/portfolio/skills");
      const data = await res.json();
      setSkills(data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await fetch("/api/portfolio/skills", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id: editingId }),
        });
      } else {
        await fetch("/api/portfolio/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      setFormData({ name: "", category: "", display_order: 0 });
      setShowForm(false);
      setEditingId(null);
      fetchSkills();
    } catch (error) {
      console.error("Error saving skill:", error);
    }
  };

  const handleEdit = (skill) => {
    setFormData({
      name: skill.name,
      category: skill.category,
      display_order: skill.display_order,
    });
    setEditingId(skill.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
      await fetch(`/api/portfolio/skills?id=${id}`, { method: "DELETE" });
      fetchSkills();
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", category: "", display_order: 0 });
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-[#64748B]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-[#0F172A]">Manage Skills</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-[#FFFFFF] rounded-md text-sm font-medium hover:bg-[#1E293B] transition-colors"
          >
            <Plus size={16} />
            Add Skill
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-[#0F172A]">
              {editingId ? "Edit Skill" : "New Skill"}
            </h4>
            <button
              type="button"
              onClick={handleCancel}
              className="text-[#64748B] hover:text-[#0F172A]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Skill Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                placeholder="e.g., React"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                placeholder="e.g., Frontend"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    display_order: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-[#FFFFFF] rounded-md text-sm font-medium hover:bg-[#1E293B]"
            >
              <Save size={16} />
              {editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-[#FFFFFF] text-[#0F172A] border border-[#E2E8F0] rounded-md text-sm font-medium hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {skills.length === 0 ? (
          <p className="text-[#64748B] text-sm">
            No skills yet. Add your first skill above.
          </p>
        ) : (
          skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg hover:border-[#0F172A] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-xs text-[#64748B] font-medium w-8">
                  #{skill.display_order}
                </div>
                <div>
                  <div className="font-medium text-[#0F172A]">{skill.name}</div>
                  <div className="text-sm text-[#64748B]">{skill.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(skill)}
                  className="px-3 py-1 text-sm text-[#0F172A] hover:bg-[#F8FAFC] rounded-md transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="p-2 text-[#991B1B] hover:bg-[#FEE2E2] rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
