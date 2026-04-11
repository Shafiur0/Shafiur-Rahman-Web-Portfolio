"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Eye,
  Calendar,
  ChevronDown,
  Code,
  ArrowRight,
  X
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "Skills", href: "#services" },
  { label: "Projects", href: "#portfolio" },
  { label: "Achievements", href: "#achievements" },
  { label: "Certificates", href: "#certificates" },
  { label: "Contact", href: "#contact" },
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

function toMediaUrl(value) {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(data|blob):/i.test(trimmed)) return trimmed;
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

function toScore(value, fallback = 80) {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Math.max(1, Math.min(100, Math.round(numeric)));
  }
  return fallback;
}

export default function HomePage() {
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSending, setContactSending] = useState(false);
  const [contactFeedback, setContactFeedback] = useState("");
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const sections = ['home', 'services', 'portfolio', 'achievements', 'certificates', 'contact', 'about'];
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

  useEffect(() => {
    if (!zoomImage) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setZoomImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomImage]);

  const photoUrl =
    profile.photo_url ||
    "https://ucarecdn.com/f7c7966c-96e4-46a8-80c8-96c835ab609c/-/format/auto/";
  const achievementSlidePhoto = toMediaUrl(
    profile.achievement_photo_url ||
      profile.achievement_slide_photo_url ||
      profile.achievements_photo_url,
  );
  const fullName = profile.full_name || "Shafiur Rahman";
  const headline = profile.headline || "Web Developer";
  const contactEmail = profile.email || "shafiurrahman067@gmail.com";
  const contactPhone = profile.phone || "01944023602";
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

  const socialPills = [
    { label: "GitHub", href: toExternalUrl(profile.github_url) || "https://github.com/Shafiur0" },
    {
      label: "LinkedIn",
      href:
        toExternalUrl(profile.linkedin_url) ||
        "https://www.linkedin.com/in/shafiur-rahman-871683347/",
    },
    {
      label: "Facebook",
      href:
        toExternalUrl(profile.facebook_url) ||
        "https://www.facebook.com/share/1CWr8Wod8K/",
    },
    {
      label: "Instagram",
      href:
        toExternalUrl(profile.instagram_url) ||
        "https://www.instagram.com/shafiurshafim?igsh=MTUyaDdoYnNuODhpeg==",
    },
    { label: "X", href: toExternalUrl(profile.x_url) || "https://x.com/Shafiur792" },
    { label: "WhatsApp", href: whatsappHref },
  ].filter((item) => Boolean(item.href));

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const skillCategoryCards = Object.entries(skillsByCategory).map(
    ([category, categorySkills]) => ({
      category,
      skills: categorySkills
        .map((skill) => ({
          ...skill,
          score: toScore(skill.display_order),
        }))
        .sort((a, b) => b.score - a.score),
    }),
  );

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

  const openImageZoom = (src, alt) => {
    if (!src) return;
    setZoomImage({ src, alt });
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    setContactFeedback("");

    const name = contactForm.name.trim();
    const email = contactForm.email.trim();
    const message = contactForm.message.trim();

    if (!name || !email || !message) {
      setContactFeedback("Please fill in name, email, and message.");
      return;
    }

    setContactSending(true);
    try {
      const response = await fetch("/api/portfolio/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setContactForm({ name: "", email: "", message: "" });
      setContactFeedback("Message sent successfully.");
    } catch (error) {
      console.error("Error sending contact message:", error);
      setContactFeedback("Failed to send message. Please try again.");
    } finally {
      setContactSending(false);
    }
  };

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
          <div className="text-2xl font-bold bg-gradient-to-r from-[#A855F7] to-[#38BDF8] text-transparent bg-clip-text transition-colors cursor-pointer tracking-tight">
            {fullName}
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
        <div className="max-w-5xl mx-auto px-6 text-center animate-fade-in-up" style={{ animationDuration: '0.8s', animationFillMode: 'both' }}>
          <div className="text-[10px] md:text-xs font-semibold text-[#67E8F9] tracking-[0.3em] uppercase mb-6">
            Welcome to my portfolio
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            <span className="text-white/95">Hi, I'm</span>
            <br />
            <span className="bg-gradient-to-r from-[#A855F7] to-[#38BDF8] text-transparent bg-clip-text">
              {fullName}
            </span>
          </h1>

          <p className="text-base md:text-2xl text-white/65 max-w-3xl mx-auto mb-8 leading-relaxed font-light">
            {headline} - {bio}
          </p>

          <button
            type="button"
            onClick={() => openImageZoom(photoUrl, `${fullName} profile photo`)}
            className="w-28 h-28 mx-auto rounded-2xl overflow-hidden border border-white/20 bg-white/5 mb-8 cursor-zoom-in"
            aria-label="Open profile photo"
          >
            <img
              src={photoUrl}
              alt="Shafiur Rahman"
              className="w-full h-full object-cover"
            />
          </button>

          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#A855F7] to-[#38BDF8] text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
            >
              Get In Touch
            </a>
            <a
              href="#portfolio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              View My Work
              <ArrowRight size={16} />
            </a>
            {cvUrl && (
              <>
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
                >
                  View CV
                </a>
                <a
                  href={cvUrl}
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#06B6D4] text-[#041c2f] rounded-xl font-semibold hover:bg-[#22D3EE] transition-colors"
                >
                  Download CV
                </a>
              </>
            )}
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
          <div className="mb-12 text-center">
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
               Skills & Expertise
             </h2>
             <p className="text-white/50">Technologies and tools I use to bring ideas to life</p>
          </div>

          {skillCategoryCards.length === 0 ? (
            <p className="text-white/40">No skills added yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {skillCategoryCards.map(({ category, skills }) => (
                <div
                  key={category}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-colors"
                >
                  <h3 className="text-xl font-semibold text-white mb-4 tracking-wide">
                    {category}
                  </h3>
                  <div className="space-y-4">
                    {skills.map((skill) => (
                      <div key={skill.id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-white/80">{skill.name}</span>
                          <span className="text-[#38BDF8] font-semibold">{skill.score}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#A855F7] to-[#22D3EE]"
                            style={{ width: `${skill.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {skills.length === 0 && (
                      <span className="text-sm text-white/40">
                        No skills in this category yet.
                      </span>
                    )}
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
      <section id="achievements" className={`py-32 relative z-10 w-full transition-all duration-1000 transform ${visibleSections['achievements'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="mb-16">
               <div className="text-sm tracking-[0.3em] font-medium text-[#3B82F6] uppercase mb-4">— ACHIEVEMENTS</div>
               <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/50 text-transparent bg-clip-text">
                 Achievements & Milestones
               </h2>
            </div>

            {achievementSlidePhoto && (
              <div className="mb-12 rounded-2xl overflow-hidden border border-white/15 bg-white/5">
                <button
                  type="button"
                  onClick={() => openImageZoom(achievementSlidePhoto, "Achievement slide")}
                  className="w-full cursor-zoom-in"
                  aria-label="Open achievement slide photo"
                >
                  <img
                    src={achievementSlidePhoto}
                    alt="Achievement slide"
                    className="w-full h-52 md:h-72 object-cover"
                  />
                </button>
              </div>
            )}

            {timelineAchievements.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <p className="text-white/60">No achievements added yet. Add one from the Admin Panel.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-[#3B82F6]/30 ml-4 md:ml-6 space-y-16">
                {timelineAchievements.map((achievement) => {
                  const achievementLink = toExternalUrl(
                    achievement.link_url ||
                      achievement.url ||
                      achievement.certificate_url ||
                      achievement.project_url ||
                      getFirstUrlFromText(achievement.description)
                  );
                  const cleanedDescription = stripFirstUrlFromText(achievement.description || "");
                  const descriptionLines = cleanedDescription
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean);
                  let awardText = "";
                  if (descriptionLines.length > 0 && /^award\s*:/i.test(descriptionLines[0])) {
                    awardText = descriptionLines.shift().replace(/^award\s*:/i, "").trim();
                  }
                  const achievementBody = descriptionLines.join(" ");

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
                      {awardText && (
                        <span className="text-[10px] uppercase tracking-widest text-[#A855F7] font-semibold border border-[#A855F7]/30 bg-[#A855F7]/10 px-2 py-1 rounded-full">
                          {awardText}
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 leading-relaxed font-light text-lg">
                      {achievementBody}
                    </p>
                    {achievementLink && (
                      <p className="text-[#3B82F6] text-sm mt-3 uppercase tracking-widest">
                        Open Link
                      </p>
                    )}
                  </div>
                )})}
              </div>
            )}
          </div>
      </section>

      {/* 6. Certificates Section */}
      <section id="certificates" className={`py-32 relative z-10 w-full transition-all duration-1000 transform ${visibleSections['certificates'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Certificates
            </h2>
            <p className="text-white/50">My e-certificates and verified certificates added from the admin panel</p>
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
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-sm tracking-[0.3em] font-medium text-[#A855F7] uppercase mb-4">— CONTACT</div>
            <h2 className="text-5xl md:text-6xl font-black mb-4 leading-tight">Let's Work Together</h2>
            <p className="text-white/50 text-lg">Have a project in mind? I'd love to hear from you</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h3 className="text-3xl font-bold mb-6">Get in touch</h3>
              <p className="text-white/50 mb-8 max-w-md">
                I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
              </p>

              <div className="space-y-4 mb-8">
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-4 text-left group">
                  <span className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                    <Mail size={16} className="text-[#A855F7]" />
                  </span>
                  <span className="text-white/80">{contactEmail}</span>
                </a>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-left group">
                  <span className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                    <Phone size={16} className="text-[#3B82F6]" />
                  </span>
                  <span className="text-white/80">{contactPhone}</span>
                </a>
                <div className="flex items-center gap-4 text-left">
                  <span className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <MapPin size={16} className="text-[#10B981]" />
                  </span>
                  <span className="text-white/80">{contactLocation}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {socialPills.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-sm rounded-md bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleContactSubmit}
              className="rounded-2xl p-6 bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(event) =>
                      setContactForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(event) =>
                      setContactForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">Message</label>
                  <textarea
                    rows={5}
                    value={contactForm.message}
                    onChange={(event) =>
                      setContactForm((prev) => ({ ...prev, message: event.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
                    placeholder="Tell me about your project..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSending}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {contactSending ? "Sending..." : "Send Message"}
                  <ArrowRight size={16} />
                </button>

                {contactFeedback && (
                  <p className="text-sm text-white/80">{contactFeedback}</p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {zoomImage && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <button
            type="button"
            onClick={() => setZoomImage(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
            aria-label="Close image preview"
          >
            <X size={18} />
          </button>

          <img
            src={zoomImage.src}
            alt={zoomImage.alt}
            className="max-w-full max-h-[88vh] object-contain rounded-xl border border-white/20 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

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
