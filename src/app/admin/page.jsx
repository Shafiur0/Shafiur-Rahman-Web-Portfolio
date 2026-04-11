"use client";

import { useEffect, useState } from "react";
import { Settings, Briefcase, Award, Code, Lock, LogOut } from "lucide-react";
import SkillsManager from "@/components/admin/SkillsManager";
import ProjectsManager from "@/components/admin/ProjectsManager";
import AchievementsManager from "@/components/admin/AchievementsManager";
import ProfileManager from "@/components/admin/ProfileManager";

const ADMIN_USERNAME = "Shafir/admin";
const ADMIN_PASSWORD = "Shafim12345@";
const ADMIN_AUTH_KEY = "portfolio_admin_authenticated";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const tabs = [
    { id: "profile", label: "Profile", icon: Settings },
    { id: "skills", label: "Skills", icon: Code },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "achievements", label: "Achievements", icon: Award },
  ];

  useEffect(() => {
    const savedAuth = window.sessionStorage.getItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(savedAuth === "true");
    setCheckingAuth(false);
  }, []);

  const handleLogin = (event) => {
    event.preventDefault();
    const validUsername = username.trim() === ADMIN_USERNAME;
    const validPassword = password === ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      setAuthError("Invalid username or password");
      return;
    }

    window.sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
    setAuthError("");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setAuthError("");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-[#64748B]">Checking access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#0F172A]">Admin Panel Login</h1>
              <p className="text-sm text-[#64748B]">Sign in to manage portfolio content</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                placeholder="Enter admin username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                placeholder="Enter admin password"
                required
              />
            </div>

            {authError && <p className="text-sm text-[#991B1B]">{authError}</p>}

            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#0F172A] text-[#FFFFFF] rounded-md text-sm font-medium hover:bg-[#1E293B] transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="px-4 py-2 text-sm font-medium text-[#0F172A] bg-[#F8FAFC] rounded-md border border-[#E2E8F0] hover:border-[#0F172A] transition-colors"
              >
                View Site
              </a>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#991B1B] bg-[#FFFFFF] rounded-md border border-[#FECACA] hover:bg-[#FEF2F2] transition-colors"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
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
