"use client";

import { useState, useEffect } from "react";
import { Camera, Download, Save, Upload, Trash2 } from "lucide-react";
import useUpload from "@/utils/useUpload";

const DEFAULT_PROFILE = {
  full_name: "",
  headline: "",
  email: "",
  phone: "",
  telegram: "",
  whatsapp: "",
  location: "",
  github_url: "",
  linkedin_url: "",
  facebook_url: "",
  instagram_url: "",
  x_url: "",
  bio: "",
  photo_url: "",
  about_photo_url: "",
  achievement_photo_url: "",
  cv_url: "",
};

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const parseMultiplePhotos = (value) => {
  if (!value || typeof value !== "string") return [];
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Fallback
    }
  }
  if (trimmed.includes("|")) {
    return trimmed.split("|").map((s) => s.trim()).filter(Boolean);
  }
  if (trimmed.includes(",")) {
    if (/^data:/i.test(trimmed)) {
      return [trimmed];
    }
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [trimmed];
};

export default function ProfileManager({ onDataChange }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [savedProfile, setSavedProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [upload, { loading: uploading }] = useUpload();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/portfolio/profile");
      const data = await res.json();
      const mergedProfile = {
        ...DEFAULT_PROFILE,
        ...(data || {}),
      };
      setProfile(mergedProfile);
      setSavedProfile(mergedProfile);
      onDataChange?.(mergedProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfileEntry = async (key, value) => {
    const response = await fetch("/api/portfolio/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });

    if (!response.ok) {
      let details = "";
      try {
        const data = await response.json();
        details = data?.error || "";
      } catch {
        details = "";
      }
      throw new Error(details || `Failed to save ${key}`);
    }

    return response.json();
  };

  const handleUpload = async (field, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let fileUrl = "";

    const { url, error } = await upload({ file });
    if (error) {
      const isImageField = field === "photo_url" || field === "about_photo_url" || field === "achievement_photo_url";
      if (!isImageField) {
        setMessage("Failed to upload file");
        return;
      }

      try {
        // Fallback: store image as data URL when upload endpoint is unavailable in production.
        fileUrl = await toDataUrl(file);
      } catch (fallbackError) {
        console.error("Fallback image conversion failed:", fallbackError);
        setMessage("Failed to upload image");
        return;
      }
    } else {
      fileUrl = url;
    }

    let finalValue = fileUrl;
    if (field === "achievement_photo_url") {
      const currentList = parseMultiplePhotos(profile.achievement_photo_url);
      finalValue = [...currentList, fileUrl].join("|");
    }

    const nextProfile = {
      ...profile,
      [field]: finalValue,
    };
    setProfile(nextProfile);

    try {
      await saveProfileEntry(field, finalValue);
      setMessage("File uploaded and saved successfully");
      setSavedProfile((prev) => ({
        ...prev,
        [field]: finalValue,
      }));
      onDataChange?.(nextProfile);
    } catch (saveError) {
      console.error("Error saving uploaded file:", saveError);
      setMessage("Upload succeeded, but saving failed. Try Save Now.");
    }
  };

  const handleDeleteAchievementPhoto = async (photoUrlToDelete) => {
    const currentList = parseMultiplePhotos(profile.achievement_photo_url);
    const updatedList = currentList.filter((url) => url !== photoUrlToDelete);
    const newValue = updatedList.join("|");

    const nextProfile = {
      ...profile,
      achievement_photo_url: newValue,
    };
    setProfile(nextProfile);

    try {
      await saveProfileEntry("achievement_photo_url", newValue);
      setMessage("Photo removed successfully");
      setSavedProfile((prev) => ({
        ...prev,
        achievement_photo_url: newValue,
      }));
      onDataChange?.(nextProfile);
    } catch (saveError) {
      console.error("Error saving updated profile setting:", saveError);
      setMessage("Failed to save changes. Try Save Now.");
    }
  };

  const handleDownloadCv = async () => {
    if (!profile.cv_url) return;

    try {
      if (/^(data|blob):/i.test(profile.cv_url)) {
        const response = await fetch(profile.cv_url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = "Shafiur_Rahman_CV.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
        return;
      }

      const link = document.createElement("a");
      link.href = profile.cv_url;
      link.download = "Shafiur_Rahman_CV.pdf";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading CV:", error);
      setMessage("Failed to download CV");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const entries = Object.entries(profile).filter(([key, value]) => {
      if (typeof value !== "string") return false;
      return value !== (savedProfile[key] ?? "");
    });

    if (entries.length === 0) {
      setMessage("No changes to save");
      setSaving(false);
      return;
    }

    try {
      await Promise.all(
        entries.map(([key, value]) => saveProfileEntry(key, value)),
      );

      setSavedProfile(profile);
      setMessage("Profile saved successfully");
      onDataChange?.(profile);
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-cyan-500/20 bg-[#09152b] p-6 md:p-8">
        <p className="text-slate-300">Loading profile...</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-[#09152b] p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 className="text-2xl font-bold text-white">Profile and Contact</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-[#05202f] font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-70"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Now"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          value={profile.full_name}
          onChange={(event) => updateField("full_name", event.target.value)}
          className="rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="Full Name"
        />
        <input
          type="text"
          value={profile.headline}
          onChange={(event) => updateField("headline", event.target.value)}
          className="rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="Headline"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <input
          type="email"
          value={profile.email}
          onChange={(event) => updateField("email", event.target.value)}
          className="rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="Email"
        />
        <input
          type="text"
          value={profile.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          className="rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="Call Number"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          value={profile.telegram}
          onChange={(event) => updateField("telegram", event.target.value)}
          className="rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="Telegram Number"
        />
        <input
          type="text"
          value={profile.whatsapp}
          onChange={(event) => updateField("whatsapp", event.target.value)}
          className="rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="WhatsApp Number"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          value={profile.location}
          onChange={(event) => updateField("location", event.target.value)}
          className="rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="Location"
        />
        <input
          type="url"
          value={profile.github_url}
          onChange={(event) => updateField("github_url", event.target.value)}
          className="rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="GitHub Link"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <input
          type="url"
          value={profile.linkedin_url}
          onChange={(event) => updateField("linkedin_url", event.target.value)}
          className="rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="LinkedIn Link"
        />
        <input
          type="url"
          value={profile.facebook_url}
          onChange={(event) => updateField("facebook_url", event.target.value)}
          className="rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="Facebook Link"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <input
          type="url"
          value={profile.instagram_url}
          onChange={(event) => updateField("instagram_url", event.target.value)}
          className="rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="Instagram Link"
        />
        <input
          type="url"
          value={profile.x_url}
          onChange={(event) => updateField("x_url", event.target.value)}
          className="rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          placeholder="X Link"
        />
      </div>

      <textarea
        value={profile.bio}
        onChange={(event) => updateField("bio", event.target.value)}
        rows={4}
        className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 mb-6"
        placeholder="About/Bio"
      />

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="rounded-xl border border-cyan-500/20 p-4 bg-[#0f1f3a]">
          <p className="text-sm text-slate-300 mb-1">Profile Photo</p>
          <p className="text-xs text-slate-500 mb-3">Used in the Hero section (left column)</p>
          {profile.photo_url && (
            <img
              src={profile.photo_url}
              alt="Profile"
              className="w-full h-32 object-cover rounded-lg border border-cyan-500/20 mb-3"
            />
          )}
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-100 cursor-pointer hover:bg-cyan-500/30 transition-colors">
            <Camera size={16} />
            {uploading ? "Uploading..." : "Choose Photo"}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleUpload("photo_url", event)}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        <div className="rounded-xl border border-purple-500/20 p-4 bg-[#0f1f3a]">
          <p className="text-sm text-slate-300 mb-1">About Section Photo</p>
          <p className="text-xs text-slate-500 mb-3">Shown in the About Me card (separate image)</p>
          {profile.about_photo_url && (
            <img
              src={profile.about_photo_url}
              alt="About"
              className="w-full h-32 object-cover rounded-lg border border-purple-500/20 mb-3"
            />
          )}
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-100 cursor-pointer hover:bg-purple-500/30 transition-colors">
            <Camera size={16} />
            {uploading ? "Uploading..." : "Choose Photo"}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleUpload("about_photo_url", event)}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        <div className="rounded-xl border border-cyan-500/20 p-4 bg-[#0f1f3a] md:col-span-2">
          <p className="text-sm text-slate-300 mb-1">Achievement Slide Photos</p>
          <p className="text-xs text-slate-500 mb-3">Add multiple images. They will display as an auto-loop slideshow (2s delay) in the achievements section.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
            {parseMultiplePhotos(profile.achievement_photo_url).length > 0 ? (
              parseMultiplePhotos(profile.achievement_photo_url).map((photoUrl, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-white/10 aspect-video bg-black/40">
                  <img
                    src={photoUrl}
                    alt={`Achievement Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteAchievementPhoto(photoUrl)}
                    className="absolute inset-0 bg-red-600/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    title="Delete photo"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-4 text-center text-xs text-slate-500 italic">
                No achievement slide photos uploaded yet.
              </div>
            )}
          </div>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-100 cursor-pointer hover:bg-cyan-500/30 transition-colors">
            <Upload size={16} />
            {uploading ? "Uploading..." : "Add Achievement Photo"}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleUpload("achievement_photo_url", event)}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/20 p-4 bg-[#0f1f3a] mb-6">
        <p className="text-sm text-slate-300 mb-2">CV Upload / Link</p>
        <p className="text-xs text-slate-500 mb-4">Upload your CV file, or paste a link to your online CV (Google Drive, OneDrive, etc.) below.</p>

        <input
          type="text"
          value={profile.cv_url || ""}
          onChange={(event) => updateField("cv_url", event.target.value)}
          className="w-full rounded-lg bg-[#12213e] border border-cyan-500/20 px-4 py-2.5 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 mb-4"
          placeholder="Paste CV link (e.g., https://drive.google.com/...)"
        />

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-100 cursor-pointer hover:bg-cyan-500/30 transition-colors">
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload File"}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => handleUpload("cv_url", event)}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {profile.cv_url && (
            <>
              <a
                href={profile.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-slate-500 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                View CV
              </a>
              <button
                type="button"
                onClick={handleDownloadCv}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-[#05202f] font-semibold hover:bg-cyan-400 transition-colors"
              >
                <Download size={14} />
                Download CV
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 text-[#05202f] font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-70"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Now"}
        </button>
        {message && <span className="text-sm text-cyan-200">{message}</span>}
      </div>
    </section>
  );
}
