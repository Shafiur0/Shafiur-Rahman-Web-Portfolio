"use client";

import { useState, useEffect } from "react";
import { Camera, Save } from "lucide-react";
import useUpload from "@/utils/useUpload";

export default function ProfileManager() {
  const [photoUrl, setPhotoUrl] = useState("");
  const [bio, setBio] = useState("");
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
      setPhotoUrl(data.photo_url || "");
      setBio(data.bio || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage("Failed to load profile");
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
        setMessage("Failed to upload image");
        return;
      }

      setPhotoUrl(url);
      setMessage("Image uploaded! Remember to save.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      // Update photo URL
      await fetch("/api/portfolio/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "photo_url", value: photoUrl }),
      });

      // Update bio
      await fetch("/api/portfolio/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "bio", value: bio }),
      });

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-[#64748B]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-[#0F172A] mb-4">
          Profile Settings
        </h3>

        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#0F172A] mb-2">
            Profile Photo
          </label>
          <div className="flex items-start gap-6">
            {photoUrl && (
              <div className="w-32 h-32 rounded-lg overflow-hidden border border-[#E2E8F0]">
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-[#FFFFFF] rounded-md cursor-pointer hover:bg-[#1E293B] transition-colors">
                <Camera size={16} />
                {uploading ? "Uploading..." : "Upload Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <p className="text-xs text-[#64748B] mt-2">
                Recommended: 800x1000px
              </p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#0F172A] mb-2">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:border-transparent"
            placeholder="Write a short bio about yourself..."
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#0F172A] text-[#FFFFFF] rounded-md font-medium hover:bg-[#1E293B] transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && (
            <span
              className={`text-sm ${message.includes("success") ? "text-[#065F46]" : "text-[#991B1B]"}`}
            >
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
