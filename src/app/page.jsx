
import { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
export async function loader() {
  console.log("--- RUNNING LOADER ---");
  const { getPortfolioData } = await import("./page.queries.js");
  const data = await getPortfolioData();
  console.log("Loader Data:", data);
  return data;
}
export function headers() {
  return {
    "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=600",
  };
}
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

const URL_REGEX = /(https?:\/\/[^\s)]+|www\.[^\s)]+|data:[^\s)]+|blob:[^\s)]+)/i;

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
  if (/^(data|blob|mailto:|tel:)/i.test(trimmed)) return trimmed;
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
  const initialData = useLoaderData();
  console.log("HomePage render initialData:", initialData);

  const [skills, setSkills] = useState(initialData?.skills || []);
  const [projects, setProjects] = useState(initialData?.projects || []);
  const [achievements, setAchievements] = useState(initialData?.achievements || []);
  const [profile, setProfile] = useState(initialData?.profile || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSkills(initialData.skills || []);
      setProjects(initialData.projects || []);
      setAchievements(initialData.achievements || []);
      setProfile(initialData.profile || {});
    }
  }, [initialData]);
  const [scrolled, setScrolled] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSending, setContactSending] = useState(false);
  const [contactFeedback, setContactFeedback] = useState("");
  const [cvDownloading, setCvDownloading] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger once on mount
    return () => window.removeEventListener("scroll", handleScroll);
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

  const handleNavClick = (event, href) => {
    event.preventDefault();
    const id = href.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      window.history.pushState(null, null, href);
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
  const cvFileName = `${(fullName || "Shafiur_Rahman").trim().replace(/\s+/g, "_")}_CV.pdf`;
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
    });

  const openImageZoom = (src, alt) => {
    if (!src) return;
    setZoomImage({ src, alt });
  };

  const handleDownloadCv = async () => {
    if (!cvUrl || cvDownloading) return;
    setCvDownloading(true);

    try {
      if (/^(data|blob):/i.test(cvUrl)) {
        const response = await fetch(cvUrl);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = cvFileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      } else {
        const link = document.createElement("a");
        link.href = cvUrl;
        link.download = cvFileName;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Error downloading CV:", error);
      window.open(cvUrl, "_blank", "noopener,noreferrer");
    } finally {
      setCvDownloading(false);
    }
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
                onClick={(event) => handleNavClick(event, item.href)}
                className="text-[12px] tracking-[0.2em] text-white/50 font-medium transition-colors hover:text-white relative group uppercase"
              >
                {item.label}
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#3B82F6] to-[#A855F7] transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section
        id="home"
        className="min-h-screen relative z-10 lg:flex items-stretch overflow-hidden pt-16 lg:pt-0"
      >
        {/* Left Column: Full height Image container on desktop */}
        <div className="w-full lg:w-[42%] relative min-h-[50vh] lg:min-h-screen flex-shrink-0">
          <img
            src={photoUrl}
            alt={fullName}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Vertical label inside the left column, overlaying the image near the right border */}
          <div className="absolute right-6 bottom-24 origin-bottom-right -rotate-90 select-none hidden lg:block z-20">
            <span className="text-[11px] uppercase tracking-[0.4em] font-extrabold text-slate-800/70 whitespace-nowrap">
              Software Engineer & Developer
            </span>
          </div>
          {/* Bottom fade out gradient for mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#000428] via-transparent to-transparent lg:hidden"></div>
        </div>

        {/* Right Column: Content on desktop */}
        <div className="flex-grow flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16 lg:py-24 relative z-20">
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mb-12 animate-fade-in-up" style={{ animationDuration: '0.6s', animationFillMode: 'both' }}>
            <div>
              <div className="text-3xl md:text-4xl font-black text-white">+3</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#38BDF8] mt-1 font-semibold">Years Exp</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-white">+{projects.length}</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#A855F7] mt-1 font-semibold">Projects</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-white">100%</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#22D3EE] mt-1 font-semibold">Dedication</div>
            </div>
          </div>

          <div className="animate-fade-in-up" style={{ animationDuration: '0.8s', animationFillMode: 'both' }}>
            <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tight leading-none text-white/95">
              Hello
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[2px] bg-[#A855F7]"></span>
              <p className="text-lg md:text-xl font-semibold text-[#67E8F9] tracking-wider uppercase">
                — It's {fullName}
              </p>
            </div>

            <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-white/60 text-transparent bg-clip-text mb-6">
              {headline || "Software Engineer & Developer"}
            </p>

            <p className="text-base md:text-lg text-white/60 max-w-2xl mb-10 leading-relaxed font-light">
              {bio}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#portfolio"
                onClick={(event) => handleNavClick(event, "#portfolio")}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#000428] rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
              >
                View Portfolio
                <ArrowRight size={16} />
              </a>
              {cvUrl && (
                <>
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-transparent border border-white/20 text-white rounded-xl font-bold hover:bg-white/10 hover:border-white/40 transition-colors"
                  >
                    View CV
                  </a>
                  <button
                    type="button"
                    onClick={handleDownloadCv}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    {cvDownloading ? "Downloading..." : "Download CV"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. About Section */}
      <section id="about" className="py-32 relative z-10 w-full">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left side: Photo Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-full max-w-sm">
                {/* Glowing outline */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#A855F7] to-[#3B82F6] rounded-3xl blur opacity-20 group-hover:opacity-35 transition duration-1000"></div>
                
                {/* Image Container Card */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#081327]/90 p-3 shadow-2xl">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
                    <img
                      src={photoUrl}
                      alt={fullName}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    
                    {/* Floating Info Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-[#000428]/85 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                          {contactLocation}
                        </span>
                      </div>
                      <span className="text-[9px] text-[#22D3EE] uppercase tracking-widest font-semibold">
                        Available for work
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Detailed Description & Metrics */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div>
                <div className="text-xs tracking-[0.3em] font-bold text-[#A855F7] uppercase mb-3">
                  — ABOUT ME
                </div>
                <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-white via-white to-white/50 text-transparent bg-clip-text leading-tight tracking-tight">
                  Designing robust code that performs in production
                </h2>
              </div>

              <h3 className="text-lg md:text-xl font-semibold text-[#67E8F9] tracking-wide">
                {fullName} | Full-Stack Software Engineer
              </h3>

              <div className="text-base md:text-lg text-white/60 leading-relaxed font-light space-y-4">
                <p>
                  I'm Shafiur Rahman, a software engineering student specializing in Full-Stack Web Development. I focus on creating high-performance, eye-catching, and production-ready applications that solve real-world problems.
                </p>
                <p>
                  With experience spanning client-side design patterns, server pre-rendering, and PostgreSQL database logic, I bridge the gap between creative visual layouts and efficient technical execution.
                </p>
              </div>

              {/* Mini Metrics Row */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 shadow-lg">
                  <div className="text-[10px] uppercase tracking-widest text-[#A855F7] font-bold">Expertise</div>
                  <div className="text-sm font-bold text-white mt-1">Web & APIs</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 shadow-lg">
                  <div className="text-[10px] uppercase tracking-widest text-[#3B82F6] font-bold">Experience</div>
                  <div className="text-sm font-bold text-white mt-1">3+ Years</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 shadow-lg">
                  <div className="text-[10px] uppercase tracking-widest text-[#22D3EE] font-bold">Projects</div>
                  <div className="text-sm font-bold text-white mt-1">+{projects.length} Completed</div>
                </div>
              </div>

              {/* Technologies Pills */}
              <div className="pt-6 space-y-3">
                <div className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                  Key Technologies:
                </div>
                <div className="flex flex-wrap gap-2">
                  {["React", "Next.js", "React Router v7", "Node.js", "PostgreSQL", "Vercel CDN", "Tailwind CSS", "Vite"].map((tech) => (
                    <span
                      key={tech}
                      className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/70 bg-white/5 border border-white/10 rounded-full hover:text-white hover:border-[#A855F7]/50 hover:bg-[#A855F7]/10 transition-colors cursor-default"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Services / Arsenal Section */}
      <section id="services" className="py-32 relative z-10 w-full">
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
      <section id="portfolio" className="py-32 relative z-10 w-full">
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
      <section id="achievements" className="py-32 relative z-10 w-full">
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
      <section id="certificates" className="py-32 relative z-10 w-full">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Certificates
            </h2>
            <p className="text-white/50">My e-certificates and verified certificates added from the admin panel</p>
          </div>

          {certificateItems.length === 0 ? (
            <p className="text-white/50">No certificates added yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificateItems.map((certificate) => {
                const cardClassName =
                  "block bg-white/5 border border-white/10 rounded-2xl p-6 transition-colors " +
                  (certificate.href
                    ? "hover:border-[#A855F7]/50 hover:bg-white/10"
                    : "opacity-95");

                if (certificate.href) {
                  return (
                    <a
                      key={certificate.id}
                      href={certificate.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cardClassName}
                    >
                      <h3 className="text-xl font-bold text-white mb-2">{certificate.title}</h3>
                      <p className="text-sm uppercase tracking-widest text-[#3B82F6] mb-3">{certificate.issuer}</p>
                      <p className="text-white/60 text-sm line-clamp-3">{certificate.description || "Open credential"}</p>
                    </a>
                  );
                }

                return (
                  <div key={certificate.id} className={cardClassName}>
                    <h3 className="text-xl font-bold text-white mb-2">{certificate.title}</h3>
                    <p className="text-sm uppercase tracking-widest text-[#3B82F6] mb-3">{certificate.issuer}</p>
                    <p className="text-white/60 text-sm line-clamp-3">{certificate.description || "Certificate added from admin panel"}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 7. Contact Section */}
      <section id="contact" className="py-32 relative z-10 w-full overflow-hidden">
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
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/40 text-sm tracking-wide">
              © {new Date().getFullYear()} Shafiur Rahman. All rights reserved. Developed by Shafiur Rahman Shafim
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
