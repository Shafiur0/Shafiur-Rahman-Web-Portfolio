"use client";

import { useState } from "react";
import { Settings, Briefcase, Award, Code } from "lucide-react";
import SkillsManager from "@/components/admin/SkillsManager";
import ProjectsManager from "@/components/admin/ProjectsManager";
import AchievementsManager from "@/components/admin/AchievementsManager";
import ProfileManager from "@/components/admin/ProfileManager";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: Settings },
    { id: "skills", label: "Skills", icon: Code },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "achievements", label: "Achievements", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-normal text-[#0F172A] tracking-tight">
                Portfolio Admin
              </h1>
              <p className="text-sm text-[#64748B] mt-1">
                Manage your portfolio content
              </p>
            </div>
            <a
              href="/"
              className="px-4 py-2 text-sm font-medium text-[#0F172A] bg-[#F8FAFC] rounded-md border border-[#E2E8F0] hover:border-[#0F172A] transition-colors"
            >
              View Site
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="bg-[#FFFFFF] rounded-lg border border-[#E2E8F0] mb-6">
          <div className="flex border-b border-[#E2E8F0]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-[#0F172A]"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F172A]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "profile" && <ProfileManager />}
            {activeTab === "skills" && <SkillsManager />}
            {activeTab === "projects" && <ProjectsManager />}
            {activeTab === "achievements" && <AchievementsManager />}
          </div>
        </div>
      </div>
    </div>
  );
}
