"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";

export default function AchievementsManager() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    icon: "award",
    display_order: 0,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await fetch("/api/portfolio/achievements");
      const data = await res.json();
      setAchievements(data);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await fetch("/api/portfolio/achievements", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id: editingId }),
        });
      } else {
        await fetch("/api/portfolio/achievements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      setFormData({
        title: "",
        description: "",
        date: "",
        icon: "award",
        display_order: 0,
      });
      setShowForm(false);
      setEditingId(null);
      fetchAchievements();
    } catch (error) {
      console.error("Error saving achievement:", error);
    }
  };

  const handleEdit = (achievement) => {
    setFormData({
      title: achievement.title,
      description: achievement.description || "",
      date: achievement.date || "",
      icon: achievement.icon || "award",
      display_order: achievement.display_order,
    });
    setEditingId(achievement.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;

    try {
      await fetch(`/api/portfolio/achievements?id=${id}`, { method: "DELETE" });
      fetchAchievements();
    } catch (error) {
      console.error("Error deleting achievement:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      icon: "award",
      display_order: 0,
    });
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-[#64748B]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-[#0F172A]">
          Manage Achievements
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-[#FFFFFF] rounded-md text-sm font-medium hover:bg-[#1E293B] transition-colors"
          >
            <Plus size={16} />
            Add Achievement
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
              {editingId ? "Edit Achievement" : "New Achievement"}
            </h4>
            <button
              type="button"
              onClick={handleCancel}
              className="text-[#64748B] hover:text-[#0F172A]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                  placeholder="Achievement title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Date
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                  placeholder="e.g., 2024 or Jan 2024"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                placeholder="Brief description of the achievement"
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

          <div className="flex gap-2 mt-6">
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
        {achievements.length === 0 ? (
          <p className="text-[#64748B] text-sm">
            No achievements yet. Add your first achievement above.
          </p>
        ) : (
          achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center justify-between p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg hover:border-[#0F172A] transition-colors"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="text-xs text-[#64748B] font-medium w-8">
                  #{achievement.display_order}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-[#0F172A]">
                      {achievement.title}
                    </h4>
                    {achievement.date && (
                      <span className="text-xs text-[#64748B]">
                        {achievement.date}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#64748B]">
                    {achievement.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => handleEdit(achievement)}
                  className="px-3 py-1 text-sm text-[#0F172A] hover:bg-[#F8FAFC] rounded-md transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(achievement.id)}
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
