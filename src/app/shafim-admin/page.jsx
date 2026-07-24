"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Award,
  BadgeCheck,
  Briefcase,
  Code,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
} from "lucide-react";
import SkillsManager from "@/components/admin/SkillsManager";
import ProjectsManager from "@/components/admin/ProjectsManager";
import AchievementsManager from "@/components/admin/AchievementsManager";
import CertificatesManager from "@/components/admin/CertificatesManager";
import MessagesManager from "@/components/admin/MessagesManager";
import ProfileManager from "@/components/admin/ProfileManager";

const ADMIN_USERNAME = "Shafir/admin";
const ADMIN_PASSWORD = "Shafim12345@";
const ADMIN_AUTH_KEY = "portfolio_admin_authenticated";

const isCertificateEntry = (item) =>
  /certificate|certification|credential/i.test(String(item?.icon || ""));

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({
    skills: 0,
    projects: 0,
    achievements: 0,
    certificates: 0,
    messages: 0,
  });

  const loadDashboardStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [skillsRes, projectsRes, achievementsRes, messagesRes] = await Promise.all([
        fetch("/api/portfolio/skills", { cache: "no-store" }),
        fetch("/api/portfolio/projects", { cache: "no-store" }),
        fetch("/api/portfolio/achievements", { cache: "no-store" }),
        fetch("/api/portfolio/messages", { cache: "no-store" }),
      ]);

      const [skillsData, projectsData, achievementsData, messagesData] = await Promise.all([
        skillsRes.json(),
        projectsRes.json(),
        achievementsRes.json(),
        messagesRes.json(),
      ]);

      const allAchievements = Array.isArray(achievementsData)
        ? achievementsData
        : [];
      const certificates = allAchievements.filter(isCertificateEntry);
      const achievements = allAchievements.filter(
        (item) => !isCertificateEntry(item),
      );

      setStats({
        skills: Array.isArray(skillsData) ? skillsData.length : 0,
        projects: Array.isArray(projectsData) ? projectsData.length : 0,
        achievements: achievements.length,
        certificates: certificates.length,
        messages: Array.isArray(messagesData) ? messagesData.length : 0,
      });
    } catch (error) {
      console.error("Error loading admin stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedAuth = window.sessionStorage.getItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(savedAuth === "true");
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardStats();
    }
  }, [isAuthenticated, loadDashboardStats]);

  const handleLogin = (event) => {
    event.preventDefault();
    const validUsername =
      username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase();
    const validPassword = password.trim() === ADMIN_PASSWORD;

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
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <p className="text-cyan-200/80">Checking access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-cyan-500/20 bg-[#081327]/95 p-8 shadow-[0_0_60px_rgba(8,145,178,0.12)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-100 flex items-center justify-center border border-cyan-400/40">
              <Lock size={18} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Admin Panel Login</h1>
              <p className="text-sm text-slate-400">Sign in to manage portfolio content</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full px-3 py-2 rounded-md text-sm bg-[#10203b] border border-cyan-500/30 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-300"
                placeholder="Enter admin username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-3 py-2 rounded-md text-sm bg-[#10203b] border border-cyan-500/30 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-300"
                placeholder="Enter admin password"
                required
              />
            </div>

            {authError && <p className="text-sm text-rose-300">{authError}</p>}

            <button
              type="submit"
              className="w-full px-4 py-2 bg-cyan-400 text-[#05202f] rounded-md text-sm font-semibold hover:bg-cyan-300 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 space-y-6">
        <header className="rounded-2xl border border-cyan-500/20 bg-[#071428] px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80 mb-2">
                Portfolio Admin
              </p>
              <h1 className="text-4xl font-black tracking-tight text-slate-100">
                Manage your portfolio content
              </h1>
              <p className="text-slate-400 mt-2">
                Add projects, achievements, skills, profile info, and links in one place.
              </p>
              <p className="text-cyan-200/80 text-sm mt-2">
                Important: use each section's Add/Update/Save button to store data.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/"
                className="px-4 py-2 rounded-lg border border-slate-500 text-slate-200 hover:bg-slate-800 transition-colors"
              >
                View Site
              </a>
              <button
                onClick={loadDashboardStats}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-[#072332] font-semibold hover:bg-cyan-400 transition-colors"
              >
                <RefreshCw size={14} className={statsLoading ? "animate-spin" : ""} />
                Refresh Stats
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-500/40 text-rose-200 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="rounded-xl border border-cyan-500/20 bg-[#0b1b35] p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Skills</span>
              <Code size={16} className="text-cyan-300" />
            </div>
            <p className="text-3xl font-black mt-2">{stats.skills}</p>
          </div>
          <div className="rounded-xl border border-cyan-500/20 bg-[#0b1b35] p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Projects</span>
              <Briefcase size={16} className="text-cyan-300" />
            </div>
            <p className="text-3xl font-black mt-2">{stats.projects}</p>
          </div>
          <div className="rounded-xl border border-cyan-500/20 bg-[#0b1b35] p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Achievements</span>
              <Award size={16} className="text-cyan-300" />
            </div>
            <p className="text-3xl font-black mt-2">{stats.achievements}</p>
          </div>
          <div className="rounded-xl border border-cyan-500/20 bg-[#0b1b35] p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Certificates</span>
              <BadgeCheck size={16} className="text-cyan-300" />
            </div>
            <p className="text-3xl font-black mt-2">{stats.certificates}</p>
          </div>
          <div className="rounded-xl border border-cyan-500/20 bg-[#0b1b35] p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Messages</span>
              <Mail size={16} className="text-cyan-300" />
            </div>
            <p className="text-3xl font-black mt-2">{stats.messages}</p>
          </div>
        </div>

        <div className="space-y-6">
          <ProfileManager onDataChange={loadDashboardStats} />
          <SkillsManager onDataChange={loadDashboardStats} />
          <ProjectsManager onDataChange={loadDashboardStats} />
          <AchievementsManager onDataChange={loadDashboardStats} />
          <CertificatesManager onDataChange={loadDashboardStats} />
          <MessagesManager onDataChange={loadDashboardStats} />
        </div>
      </div>
    </div>
  );
}
