"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, X, Upload } from "lucide-react";
import useUpload from "@/utils/useUpload";

export default function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    project_url: "",
    github_url: "",
    technologies: "",
    featured: false,
    display_order: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [upload, { loading: uploading }] = useUpload();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/portfolio/projects", { cache: "no-store" });
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      const { url, error } = await upload({ base64 });

      if (error) {
        alert("Failed to upload image");
        return;
      }

      setFormData({ ...formData, image_url: url });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const techArray = formData.technologies
      ? formData.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const payload = {
      ...formData,
      technologies: techArray,
    };

    try {
      if (editingId) {
        await fetch("/api/portfolio/projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingId }),
        });
      } else {
        await fetch("/api/portfolio/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setFormData({
        title: "",
        description: "",
        image_url: "",
        project_url: "",
        github_url: "",
        technologies: "",
        featured: false,
        display_order: 0,
      });
      setShowForm(false);
      setEditingId(null);
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description || "",
      image_url: project.image_url || "",
      project_url: project.project_url || "",
      github_url: project.github_url || "",
      technologies: project.technologies ? project.technologies.join(", ") : "",
      featured: project.featured || false,
      display_order: project.display_order,
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await fetch(`/api/portfolio/projects?id=${id}`, { method: "DELETE" });
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      project_url: "",
      github_url: "",
      technologies: "",
      featured: false,
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
        <h3 className="text-lg font-medium text-[#0F172A]">Manage Projects</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-[#FFFFFF] rounded-md text-sm font-medium hover:bg-[#1E293B] transition-colors"
          >
            <Plus size={16} />
            Add Project
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
              {editingId ? "Edit Project" : "New Project"}
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
                  placeholder="Project name"
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
                placeholder="Brief description of the project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Project Image
              </label>
              <div className="flex items-center gap-4">
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-32 h-20 object-cover rounded border border-[#E2E8F0]"
                  />
                )}
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded-md cursor-pointer hover:bg-[#FFFFFF] text-sm">
                  <Upload size={16} />
                  {uploading ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Project URL
                </label>
                <input
                  type="url"
                  value={formData.project_url}
                  onChange={(e) =>
                    setFormData({ ...formData, project_url: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) =>
                    setFormData({ ...formData, github_url: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                Technologies (comma separated)
              </label>
              <input
                type="text"
                value={formData.technologies}
                onChange={(e) =>
                  setFormData({ ...formData, technologies: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                placeholder="React, Node.js, PostgreSQL"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="w-4 h-4 text-[#0F172A] border-[#E2E8F0] rounded focus:ring-[#0F172A]"
              />
              <label htmlFor="featured" className="text-sm text-[#0F172A]">
                Featured Project
              </label>
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

      <div className="space-y-4">
        {projects.length === 0 ? (
          <p className="text-[#64748B] text-sm">
            No projects yet. Add your first project above.
          </p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="flex gap-4 p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg hover:border-[#0F172A] transition-colors"
            >
              {project.image_url && (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-32 h-24 object-cover rounded border border-[#E2E8F0] flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-[#0F172A]">
                        {project.title}
                      </h4>
                      {project.featured && (
                        <span className="px-2 py-0.5 text-xs font-medium text-[#065F46] bg-[#D1FAE5] rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#64748B] mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(project)}
                      className="px-3 py-1 text-sm text-[#0F172A] hover:bg-[#F8FAFC] rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-[#991B1B] hover:bg-[#FEE2E2] rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs font-medium text-[#0F172A] bg-[#F1F5F9] rounded-full border border-[#E2E8F0]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
