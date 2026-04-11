"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  MessageCircle,
  Eye,
  Calendar,
  ChevronDown,
  Code,
  ArrowRight
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "Projects", href: "#portfolio" },
  { label: "Achievements", href: "#experience" },
  { label: "Skills", href: "#services" },
  { label: "Certificates", href: "#certificates" },
  { label: "Contact", href: "#contact" },
  { label: "About", href: "#about" },
];

const URL_REGEX = /(https?:\/\/[^\s)]+|www\.[^\s)]+)/i;

function getFirstUrlFromText(text) {
  if (typeof text !== "string") return "";
  const match = text.match(URL_REGEX);
  return match ? match[0] : "";
}

function stripFirstUrlFromText(text) {
  if (typeof text !== "string") return "";
  return text.replace(URL_REGEX, "").replace(/\n{2,}/g, "\n").trim();
}

function toExternalUrl(value) {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isCertificateEntry(item) {
  return /certificate|certification|credential/i.test(String(item?.icon || ""));
}

function toWhatsAppHref(value) {
  if (!value || typeof value !== "string") return "https://wa.me/";
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "https://wa.me/";
  if (digits.startsWith("88")) return `https://wa.me/${digits}`;
  if (digits.startsWith("0")) return `https://wa.me/88${digits}`;
  return `https://wa.me/${digits}`;
}

export default function HomePage() {
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const sections = ['home', 'portfolio', 'experience', 'services', 'certificates', 'contact', 'about'];
      const newVisible = {};
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.85) {
            newVisible[id] = true;
          }
        }
      });
      setVisibleSections(prev => ({ ...prev, ...newVisible }));
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger once on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [skillsRes, projectsRes, achievementsRes, profileRes] =
          await Promise.all([
            fetch("/api/portfolio/skills"),
            fetch("/api/portfolio/projects"),
            fetch("/api/portfolio/achievements"),
            fetch("/api/portfolio/profile"),
          ]);
        const [skillsData, projectsData, achievementsData, profileData] =
          await Promise.all([
            skillsRes.json(),
            projectsRes.json(),
            achievementsRes.json(),
            profileRes.json(),
          ]);
        setSkills(Array.isArray(skillsData) ? skillsData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setAchievements(
          Array.isArray(achievementsData) ? achievementsData : [],
        );
        setProfile(profileData || {});
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const photoUrl =
    profile.photo_url ||
    "https://ucarecdn.com/f7c7966c-96e4-46a8-80c8-96c835ab609c/-/format/auto/";
  const fullName = profile.full_name || "Shafiur Rahman";
  const headline = profile.headline || "Web Developer";
  const contactEmail = profile.email || "shafiurrahman067@gmail.com";
  const contactLocation = profile.location || "Dhaka, Bangladesh";
  const whatsappNumber = profile.whatsapp || profile.phone || "+8801758958055";
  const whatsappHref = toWhatsAppHref(whatsappNumber);
  const cvUrl = toExternalUrl(profile.cv_url);
  const bio =
    profile.bio ||
    "Creating modern, production-ready applications that solve real-world problems through exceptional full-stack development.";

  const socialLinks = [
    { href: toExternalUrl(profile.github_url) || "https://github.com/Shafiur0", icon: Github },
    {
      href:
        toExternalUrl(profile.linkedin_url) ||
        "https://www.linkedin.com/in/shafiur-rahman-871683347/",
      icon: Linkedin,
    },
    { href: toExternalUrl(profile.facebook_url) || "https://www.facebook.com/share/1CWr8Wod8K/", icon: Facebook },
    {
      href:
        toExternalUrl(profile.instagram_url) ||
        "https://www.instagram.com/shafiurshafim?igsh=MTUyaDdoYnNuODhpeg==",
      icon: Instagram,
    },
    {
      href: toExternalUrl(profile.x_url) || "https://x.com/Shafiur792",
      icon: MessageCircle,
    },
  ].filter((item) => Boolean(item.href));

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const timelineAchievements = achievements.filter(
    (achievement) => !isCertificateEntry(achievement),
  );

  const explicitCertificates = achievements.filter(isCertificateEntry);
  const fallbackCertificates = achievements.filter(
    (achievement) =>
      !isCertificateEntry(achievement) &&
      /certificate|certification|credential/i.test(
        `${achievement.title || ""} ${achievement.description || ""}`,
      ),
  );

  const certificateItems = (explicitCertificates.length
    ? explicitCertificates
    : fallbackCertificates
  )
    .map((achievement) => {
      const href = toExternalUrl(
        achievement.certificate_url ||
          achievement.certificate_link ||
          achievement.link_url ||
          achievement.url ||
          getFirstUrlFromText(achievement.description)
      );

      return {
        id: achievement.id,
        title: achievement.title,
        issuer: achievement.date || "Certificate Issuer",
        description: stripFirstUrlFromText(achievement.description || ""),
        href,
      };
    })
    .filter((certificate) => Boolean(certificate.href));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000428] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000428] text-white selection:bg-[#A855F7]/30 selection:text-white font-sans overflow-x-hidden relative">
      {/* Premium Vertical Grid Background Strategy */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:5rem_100%]"></div>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#3B82F6]/10 blur-[130px] mix-blend-screen animate-pulse duration-[6000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#A855F7]/15 blur-[150px] mix-blend-screen animate-pulse duration-[8000ms]" />
      </div>

      {/* Navigation Layer */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          scrolled
            ? "bg-[#000428]/80 backdrop-blur-xl border-b border-white/5 py-4 shadow-lg shadow-black/20"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="text-xl font-bold text-white hover:text-[#A855F7] transition-colors cursor-pointer tracking-wider">
            SHAFIUR.
          </div>
          <div className="hidden md:flex items-center gap-10">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[12px] tracking-[0.2em] text-white/50 font-medium transition-colors hover:text-white relative group uppercase"
              >
                {item.label}
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#3B82F6] to-[#A855F7] transition-all group-hover:w-full"></span>
              </a>
            ))}
            <a
              href="/admin"
              className="px-6 py-2.5 bg-white text-[#000428] text-sm rounded-full font-bold hover:scale-105 active:scale-95 transition-all"
            >
              ADMIN
            </a>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section
        id="home"
        className="min-h-screen flex items-center justify-center relative z-10 pt-20"
      >
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left animate-fade-in-up" style={{ animationDuration: '0.8s', animationFillMode: 'both' }}>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span className="text-[11px] font-semibold text-white/80 tracking-widest uppercase">
                Available for New Projects
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-tight">
              <span className="text-white/90">Hi, I'm </span>
              <br />
              <span className="bg-gradient-to-r from-[#3B82F6] to-[#A855F7] text-transparent bg-clip-text">
                {fullName}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-lg mb-10 leading-relaxed font-light">
              {headline} - {bio}
            </p>

            <div className="flex flex-wrap items-center gap-5">
              <a
                href="#portfolio"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#3B82F6] to-[#A855F7] text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#A855F7]/25"
              >
                View Selected Works
                <ArrowRight size={18} />
              </a>
              {cvUrl && (
                <>
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-4 bg-white/10 border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-colors"
                  >
                    View CV
                  </a>
                  <a
                    href={cvUrl}
                    download
                    className="inline-flex items-center gap-2 px-6 py-4 bg-white/10 border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-colors"
                  >
                    Download CV
                  </a>
                </>
              )}
              <div className="flex items-center gap-4 ml-4">
                {socialLinks.slice(0, 2).map(({ href, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:-translate-y-1 hover:bg-white/10 text-white/60 hover:text-white"
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right side hero visual placeholder/image */}
          <div className="hidden lg:block relative group animate-fade-in-up" style={{ animationDuration: '1s', animationDelay: '0.3s', animationFillMode: 'both' }}>
             <div className="absolute inset-0 bg-gradient-to-tr from-[#3B82F6] to-[#A855F7] rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
             <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 aspect-[4/5] isolate p-2">
                <img
                  src={photoUrl}
                  alt="Shafiur Rahman"
                  className="w-full h-full object-cover rounded-3xl grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
                />
             </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* 2. About Section */}
      <section id="about" className={`py-32 relative z-10 w-full transition-all duration-1000 transform ${visibleSections['about'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <div className="text-sm tracking-[0.3em] font-medium text-[#A855F7] uppercase mb-4">— ABOUT ME</div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/50 text-transparent bg-clip-text">
              Engineering Excellence
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="text-lg text-white/60 leading-relaxed font-light space-y-6">
              <p>
                I'm Shafiur Rahman, a professional Software Engineer specializing in Full-Stack Development. I create modern, eye-catching, and production-ready applications that not only look visually stunning but also perform effectively in real-world scenarios.
              </p>
              <p>
                With deep expertise in modern web technologies, scalable backend architectures, and delightful UI/UX design, I bridge the gap between creative vision and technical reality. Let's build something extraordinary together.
              </p>
              
              <div className="pt-6">
                <a href="#contact" className="inline-flex items-center gap-2 text-white font-semibold hover:text-[#A855F7] transition-colors border-b border-white/20 hover:border-[#A855F7] pb-1">
                  Let's Discuss Concept <ArrowRight size={16} />
                </a>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm group hover:border-[#A855F7]/30 transition-colors">
                <Code className="text-[#A855F7] mb-6" size={32} />
                <div className="text-4xl font-black text-white mb-2">{projects.length}+</div>
                <div className="text-sm tracking-wide text-white/40 uppercase">Projects <br/>Completed</div>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm group hover:border-[#3B82F6]/30 transition-colors">
                <Calendar className="text-[#3B82F6] mb-6" size={32} />
                <div className="text-4xl font-black text-white mb-2">3+</div>
                <div className="text-sm tracking-wide text-white/40 uppercase">Years of <br/>Experience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Services / Arsenal Section */}
      <section id="services" className={`py-32 relative z-10 w-full transition-all duration-1000 transform ${visibleSections['services'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
             <div className="text-sm tracking-[0.3em] font-medium text-[#3B82F6] uppercase mb-4">— EXPERTISE</div>
             <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/50 text-transparent bg-clip-text">
               Core Technologies
             </h2>
          </div>

          {Object.keys(skillsByCategory).length === 0 ? (
            <p className="text-white/40">No skills added yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(skillsByCategory).map(([category, categorySkills], index) => (
                <div
                  key={category}
                  className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors duration-500 overflow-hidden relative group"
                >
                  <div className="absolute right-0 top-0 w-32 h-32 bg-[#A855F7]/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[#A855F7]/20 transition-colors"></div>
                  <h3 className="text-xl font-bold text-white/90 mb-6 tracking-wide">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-4 py-2 bg-[#000428]/50 border border-white/5 rounded-full text-white/70 text-sm font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Portfolio Section */}
      <section id="portfolio" className={`py-32 relative z-10 w-full transition-all duration-1000 transform ${visibleSections['portfolio'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div>
                <div className="text-sm tracking-[0.3em] font-medium text-[#A855F7] uppercase mb-4">— PORTFOLIO</div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/50 text-transparent bg-clip-text">
                  Selected Works
                </h2>
             </div>
             <a href="https://github.com/Shafiur0" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors">
               Explore GitHub <ArrowRight size={16} />
             </a>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
              {projects.map((project) => {
                const projectLink = toExternalUrl(
                  project.project_url ||
                    project.github_url ||
                    getFirstUrlFromText(project.description)
                );

                return (
                <div
                  key={project.id}
                  className={`group relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-500 ${projectLink ? "cursor-pointer" : ""}`}
                  onClick={() => {
                    if (projectLink) {
                      window.open(projectLink, "_blank", "noopener,noreferrer");
                    }
                  }}
                  onKeyDown={(event) => {
                    if (!projectLink) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      window.open(projectLink, "_blank", "noopener,noreferrer");
                    }
                  }}
                  role={projectLink ? "link" : undefined}
                  tabIndex={projectLink ? 0 : undefined}
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                     <div className="absolute inset-0 bg-[#000428]/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                     {project.image_url ? (
                       <img
                         src={project.image_url}
                         alt={project.title}
                         className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                       />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <Code size={48} className="text-white/20" />
                       </div>
                     )}
                     
                     {/* Overlay Content */}
                     <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 bg-gradient-to-t from-[#000428] via-[#000428]/50 to-transparent translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-4">
                           {project.project_url && (
                             <a
                               href={project.project_url}
                               target="_blank"
                               rel="noopener noreferrer"
                               onClick={(event) => event.stopPropagation()}
                               className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                             >
                                <Eye size={18} />
                             </a>
                           )}
                           {project.github_url && (
                             <a
                               href={project.github_url}
                               target="_blank"
                               rel="noopener noreferrer"
                               onClick={(event) => event.stopPropagation()}
                               className="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20 hover:bg-white/30 transition-colors"
                             >
                               <Github size={18} />
                             </a>
                           )}
                        </div>
                     </div>
                  </div>
                  <div className="p-8 border-t border-white/5">
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#A855F7] transition-colors">{project.title}</h3>
                    <p className="text-white/50 leading-relaxed mb-6 line-clamp-2">{project.description}</p>
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-[11px] tracking-wider uppercase font-medium text-white/50 bg-white/5 border border-white/5 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
        </div>
      </section>

      {/* 5. Professional Journey / Experience */}
      {timelineAchievements.length > 0 && (
        <section id="experience" className={`py-32 relative z-10 w-full transition-all duration-1000 transform ${visibleSections['experience'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="mb-16">
               <div className="text-sm tracking-[0.3em] font-medium text-[#3B82F6] uppercase mb-4">— JOURNEY</div>
               <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/50 text-transparent bg-clip-text">
                 Professional Experience
               </h2>
            </div>

            <div className="relative border-l-2 border-[#3B82F6]/30 ml-4 md:ml-6 space-y-16">
              {timelineAchievements.map((achievement) => {
                const achievementLink = toExternalUrl(
                  achievement.link_url ||
                    achievement.url ||
                    achievement.certificate_url ||
                    achievement.project_url ||
                    getFirstUrlFromText(achievement.description)
                );

                return (
                <div
                  key={achievement.id}
                  className={`relative pl-10 md:pl-16 group ${achievementLink ? "cursor-pointer" : ""}`}
                  onClick={() => {
                    if (achievementLink) {
                      window.open(achievementLink, "_blank", "noopener,noreferrer");
                    }
                  }}
                  onKeyDown={(event) => {
                    if (!achievementLink) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      window.open(achievementLink, "_blank", "noopener,noreferrer");
                    }
                  }}
                  role={achievementLink ? "link" : undefined}
                  tabIndex={achievementLink ? 0 : undefined}
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-[#000428] border-4 border-[#A855F7] group-hover:scale-125 transition-transform z-10"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 mb-3">
                    <h3 className="text-2xl font-bold text-white">{achievement.title}</h3>
                    {achievement.date && (
                      <span className="text-xs uppercase tracking-widest text-[#3B82F6] font-semibold">
                        {achievement.date}
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 leading-relaxed font-light text-lg">
                    {achievement.description}
                  </p>
                  {achievementLink && (
                    <p className="text-[#3B82F6] text-sm mt-3 uppercase tracking-widest">
                      Open Link
                    </p>
                  )}
                </div>
              )})}
            </div>
          </div>
        </section>
      )}

      {/* 6. Certificates Section */}
      <section id="certificates" className={`py-32 relative z-10 w-full transition-all duration-1000 transform ${visibleSections['certificates'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <div className="text-sm tracking-[0.3em] font-medium text-[#A855F7] uppercase mb-4">— CERTIFICATES</div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/50 text-transparent bg-clip-text">
              Certifications & Credentials
            </h2>
          </div>

          {certificateItems.length === 0 ? (
            <p className="text-white/50">No certificate links added yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificateItems.map((certificate) => (
                <a
                  key={certificate.id}
                  href={certificate.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#A855F7]/50 hover:bg-white/10 transition-colors"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{certificate.title}</h3>
                  <p className="text-sm uppercase tracking-widest text-[#3B82F6] mb-3">{certificate.issuer}</p>
                  <p className="text-white/60 text-sm line-clamp-3">{certificate.description || "Open credential"}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. Contact Section */}
      <section id="contact" className={`py-32 relative z-10 w-full overflow-hidden transition-all duration-1000 transform ${visibleSections['contact'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-sm tracking-[0.3em] font-medium text-[#A855F7] uppercase mb-6">— CONTACT</div>
          <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
            <span className="text-white">Let's build something </span>
            <span className="bg-gradient-to-r from-[#3B82F6] to-[#A855F7] text-transparent bg-clip-text">
              amazing.
            </span>
          </h2>
          <p className="text-xl text-white/50 mb-16 max-w-2xl mx-auto font-light leading-relaxed">
             Drop me an email or message to discuss your project requirements or just to say hello.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-16 max-w-2xl mx-auto">
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group text-left"
            >
              <div className="w-14 h-14 rounded-full bg-[#A855F7]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#A855F7]/30 transition-colors">
                <Mail size={24} className="text-[#A855F7]" />
              </div>
              <div>
                 <div className="text-xs uppercase tracking-widest text-white/40 mb-1">Email Me</div>
                 <div className="font-semibold text-white/90">{contactEmail}</div>
              </div>
            </a>
            
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#10B981]/30 hover:bg-[#10B981]/5 transition-all group text-left"
            >
              <div className="w-14 h-14 rounded-full bg-[#10B981]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#10B981]/30 transition-colors">
                <MessageCircle size={24} className="text-[#10B981]" />
              </div>
              <div>
                 <div className="text-xs uppercase tracking-widest text-[#10B981]/60 mb-1">WhatsApp</div>
                 <div className="font-semibold text-white/90">{whatsappNumber}</div>
              </div>
            </a>
          </div>

          <p className="text-white/50 mb-6">{contactLocation}</p>
        </div>
      </section>

      {/* Floating WhatsApp Action Button */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_30px_rgba(37,211,102,0.4)] group overflow-hidden hover:scale-110 active:scale-95 transition-transform"
      >
        <MessageCircle size={28} className="text-white relative z-10" />
      </a>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/40 text-sm tracking-wide">
            © {new Date().getFullYear()} Shafiur Rahman. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
              {socialLinks.map(({ href, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-[#A855F7] transition-colors"
                >
                  <Icon size={20} />
                </a>
              ))}
          </div>
        </div>
      </footer>

      {/* Keyframes for subtle entrance animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation-name: fadeInUp;
        }
      `}} />
    </div>
  );
}
