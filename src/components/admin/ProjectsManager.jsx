"use client";

import { useState, useEffect } from "react";
import { Link2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import useUpload from "@/utils/useUpload";

const initialFormData = {
  title: "",
  description: "",
  image_url: "",
  video_url: "",
  project_url: "",
  github_url: "",
  technologies: "",
  featured: false,
  display_order: 0,
};

export default function ProjectsManager({ onDataChange }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [upload, { loading: uploading }] = useUpload();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/portfolio/projects", { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setProjects(list);
      onDataChange?.(list);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setMessage("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { url, error } = await upload({ file });

    if (error) {
      setMessage("Failed to upload image");
      return;
    }

    setFormData((prev) => ({ ...prev, image_url: url }));
    setMessage("Image uploaded");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

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
        const response = await fetch("/api/portfolio/projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingId }),
        });
        if (!response.ok) throw new Error("Failed to update project");
      } else {
        const response = await fetch("/api/portfolio/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to create project");
      }

      setFormData(initialFormData);
      setEditingId(null);
      setMessage(editingId ? "Project updated" : "Project added");
      await fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      setMessage("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description || "",
      image_url: project.image_url || "",
      video_url: project.video_url || "",
      project_url: project.project_url || "",
      github_url: project.github_url || "",
      technologies: project.technologies ? project.technologies.join(", ") : "",
      featured: project.featured || false,
      display_order: project.display_order,
    });
    setEditingId(project.id);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/portfolio/projects?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");

      setMessage("Project removed");
      await fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      setMessage("Failed to delete project");
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
        <h3 className="text-2xl font-bold text-white">Add Project</h3>
        <span className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
          {loading ? "Loading..." : `${projects.length} projects`}
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
            type="url"
            value={formData.project_url}
            onChange={(e) =>
              setFormData({ ...formData, project_url: e.target.value })
            }
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Project link"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Image URL (optional)"
          />
          <input
            type="url"
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Video URL (YouTube, Drive, or direct MP4/WebM)"
          />
        </div>

        <div className="grid md:grid-cols-1 gap-4">
          <input
            type="text"
            value={formData.technologies}
            onChange={(e) =>
              setFormData({ ...formData, technologies: e.target.value })
            }
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="Tags, comma separated"
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

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            placeholder="GitHub link"
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
            placeholder="Display order"
          />
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#12213e] border border-cyan-500/20 text-slate-200">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="accent-cyan-400"
            />
            Featured
          </label>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-100 cursor-pointer hover:bg-cyan-500/30 transition-colors">
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

          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="Preview"
              className="w-16 h-12 object-cover rounded border border-cyan-500/20"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 text-[#05202f] font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-70"
          >
            <Plus size={16} />
            {saving ? "Saving..." : editingId ? "Update Project" : "Add Project"}
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
        {projects.length === 0 ? (
          <p className="text-slate-400 text-sm">No projects yet.</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col md:flex-row gap-4 p-4 bg-[#0f1f3a] border border-cyan-500/10 rounded-lg"
            >
              {project.image_url && (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-32 h-24 object-cover rounded border border-cyan-500/20 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-100">{project.title}</h4>
                      {project.featured && (
                        <span className="px-2 py-0.5 text-xs font-medium text-cyan-100 bg-cyan-500/20 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                      {project.project_url && (
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-200 hover:text-cyan-100"
                        >
                          <Link2 size={12} /> View Project
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-200 hover:text-cyan-100"
                        >
                          <Link2 size={12} /> GitHub
                        </a>
                      )}
                      {project.video_url && (
                        <span className="inline-flex items-center gap-1 text-slate-400 select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Demo Video: <span className="text-cyan-300 font-mono max-w-[200px] truncate" title={project.video_url}>{project.video_url}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(project)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-cyan-200 hover:bg-cyan-500/10"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-rose-300 hover:bg-rose-500/10"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs font-medium text-cyan-100 bg-cyan-500/10 rounded-full border border-cyan-500/20"
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
    </section>
  );
}
