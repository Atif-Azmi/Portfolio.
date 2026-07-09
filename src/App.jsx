import { useState, useEffect, useRef } from "react";
import ChatWidget from "./ChatWidget";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [isMobOpen, setIsMobOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSec, setActiveSec] = useState("home");
  const [vGlowOffset, setVGlowOffset] = useState(1000);
  const [vDotTop, setVDotTop] = useState("0vh");
  const [vDotLeft, setVDotLeft] = useState("4.5px");
  const [roleText, setRoleText] = useState("Full Stack Developer");
  const [roleFade, setRoleFade] = useState(false);
  const [githubGrid, setGithubGrid] = useState([]);
  const [phTransform, setPhTransform] = useState(0);

  // Sync Dark Mode class on body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  // Dynamic Role Switcher
  useEffect(() => {
    const roles = ["Full Stack Developer", "Problem Solver"];
    let roleIdx = 0;
    const interval = setInterval(() => {
      setRoleFade(true);
      setTimeout(() => {
        roleIdx = (roleIdx + 1) % roles.length;
        setRoleText(roles[roleIdx]);
        setRoleFade(false);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // GitHub Grid Generation
  useEffect(() => {
    const weights = [0.42, 0.24, 0.18, 0.11, 0.05];
    const items = [];
    for (let i = 0; i < 52 * 7; i++) {
      const r = Math.random();
      let acc = 0;
      let lv = 0;
      for (let j = 0; j < weights.length; j++) {
        acc += weights[j];
        if (r < acc) {
          lv = j;
          break;
        }
      }
      const cnt = lv ? Math.floor(Math.random() * 10) + 1 : 0;
      const title = cnt + (cnt === 1 ? " contribution" : " contributions");
      items.push({ lv, title });
    }
    setGithubGrid(items);
  }, []);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollH = document.body.scrollHeight - window.innerHeight;
      if (scrollH <= 0) return;
      const pct = (window.scrollY / scrollH) * 100;
      setScrollPct(pct);

      // Topnav scroll effect
      setIsScrolled(window.scrollY > 20);

      // Parallax effect on photo
      if (window.innerWidth > 768) {
        setPhTransform(window.scrollY * 0.04);
      }

      // Vertical Zig-zag tracker
      const totalH = document.body.scrollHeight;
      const yPx = (window.scrollY / totalH) * 1000;
      let xOffset = 6;

      // SVG Path: M6 0 L6 400 L1 410 L1 440 L11 460 L11 490 L6 500 L6 1000
      if (yPx <= 400) xOffset = 6;
      else if (yPx > 400 && yPx <= 410) xOffset = 6 - (yPx - 400) * 0.5;
      else if (yPx > 410 && yPx <= 440) xOffset = 1;
      else if (yPx > 440 && yPx <= 460) xOffset = 1 + (yPx - 440) * 0.5;
      else if (yPx > 460 && yPx <= 490) xOffset = 11;
      else if (yPx > 490 && yPx <= 500) xOffset = 11 - (yPx - 490) * 0.5;
      else xOffset = 6;

      setVDotTop((window.scrollY / totalH * 100) + "vh");
      setVDotLeft((xOffset - 1.5) + "px");

      // Animate SVG Glow segment
      const glowPath = document.getElementById("v-path-glow");
      if (glowPath) {
        const pathLen = glowPath.getTotalLength ? glowPath.getTotalLength() : 1000;
        const scrollPctVal = window.scrollY / scrollH;
        setVGlowOffset(pathLen * (1 - scrollPctVal));
      }

      // Active Section nav link
      let currentSection = "home";
      document.querySelectorAll("section[id]").forEach((s) => {
        const htmlSection = s;
        if (window.scrollY >= htmlSection.offsetTop - 120) {
          currentSection = htmlSection.id;
        }
      });
      setActiveSec(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial call to set parameters
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for reveals & counters
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            e.target.querySelectorAll(".counter").forEach(startCount);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".r").forEach((el) => observer.observe(el));

    function startCount(el) {
      if (el._done) return;
      el._done = true;
      const to = +el.dataset.to;
      const suffix = el.dataset.suffix || "";
      const dur = 900;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * to) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    return () => observer.disconnect();
  }, []);

  // Canvas custom cursor + particles
  useEffect(() => {
    // Disable custom cursor on mobile
    if (window.innerWidth <= 768) {
      document.body.style.cursor = "auto";
      return;
    } else {
      document.body.style.cursor = "none";
    }

    const canvas = document.getElementById("p-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dot = document.getElementById("c-dot");

    let w, h;
    let mx = -100;
    let my = -100;
    let particles = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    const onMouseMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (dot) {
        dot.style.opacity = "1";
        dot.style.left = mx + "px";
        dot.style.top = my + "px";
      }

      // Spawn particles
      for (let i = 0; i < 5; i++) {
        particles.push(new Particle(mx, my, isDarkMode));
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    class Particle {
      constructor(x, y, isDark) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 0.5;
        this.sx = (Math.random() - 0.5) * 1.5;
        this.sy = (Math.random() - 0.5) * 1.5;
        this.life = 1;
        this.decay = Math.random() * 0.03 + 0.02;
        this.color = isDark ? "rgba(255, 255, 255, " : "rgba(200, 191, 170, ";
      }
      update() {
        this.x += this.sx;
        this.y += this.sy;
        this.life -= this.decay;
      }
      draw() {
        ctx.fillStyle = this.color + this.life + ")";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let animationId;
    function animate() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }
      animationId = requestAnimationFrame(animate);
    }
    animate();

    // Link hovers
    const links = document.querySelectorAll(
      "a, button, .sk, .conn-link, .proj-row, .hb-fill, .gh-link"
    );
    const handleMouseEnter = () => {
      if (dot) {
        dot.style.transform = "translate(-50%, -50%) scale(2.5)";
        dot.style.backgroundColor = "transparent";
        dot.style.border = "1px solid var(--rust)";
      }
    };
    const handleMouseLeave = () => {
      if (dot) {
        dot.style.transform = "translate(-50%, -50%) scale(1)";
        dot.style.backgroundColor = "var(--rust)";
        dot.style.border = "none";
      }
    };

    links.forEach((l) => {
      l.addEventListener("mouseenter", handleMouseEnter);
      l.addEventListener("mouseleave", handleMouseLeave);
    });

    const docMouseLeave = () => {
      if (dot) dot.style.opacity = "0";
    };
    const docMouseEnter = () => {
      if (dot) dot.style.opacity = "1";
    };
    document.addEventListener("mouseleave", docMouseLeave);
    document.addEventListener("mouseenter", docMouseEnter);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", docMouseLeave);
      document.removeEventListener("mouseenter", docMouseEnter);
      links.forEach((l) => {
        l.removeEventListener("mouseenter", handleMouseEnter);
        l.removeEventListener("mouseleave", handleMouseLeave);
      });
      cancelAnimationFrame(animationId);
      document.body.style.cursor = "auto";
    };
  }, [isDarkMode]);

  // Contact Form Submission (UX upgraded feedback)
  const handleSubmitContact = async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector(".fb-btn");
    const originalText = btn.textContent;

    btn.textContent = "Sending...";
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        btn.textContent = "Sent ✓";
        btn.style.background = "#5c9e4a";
        form.reset();
      } else {
        btn.textContent = "Error ✗";
        btn.style.background = "#b8420a";
      }
    } catch (err) {
      btn.textContent = "Error ✗";
      btn.style.background = "#b8420a";
    }

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = "";
      btn.disabled = false;
    }, 2800);
  };

  const skillsList = [
    ["react", "React"],
    ["nextjs", "Next.js"],
    ["typescript", "TypeScript"],
    ["javascript", "JavaScript"],
    ["nodejs", "Node.js"],
    ["express", "Express"],
    ["mongodb", "MongoDB"],
    ["postgres", "PostgreSQL"],
    ["tailwind", "Tailwind CSS"],
    ["python", "Python"],
    ["git", "Git"],
    ["github", "GitHub"],
    ["vercel", "Vercel"],
    ["figma", "Figma"],
    ["postman", "Postman"],
    ["docker", "Docker"],
  ];

  return (
    <>
      <div className="grain-overlay"></div>
      <div className="v-tracker">
        <svg className="v-line-svg" preserveAspectRatio="none" viewBox="0 0 12 1000">
          <path id="v-path-bg" d="M6 0 L6 400 L1 410 L1 440 L11 460 L11 490 L6 500 L6 1000" />
          <path
            id="v-path-glow"
            className="v-glow-path"
            d="M6 0 L6 400 L1 410 L1 440 L11 460 L11 490 L6 500 L6 1000"
            strokeDasharray="100 900"
            strokeDashoffset={vGlowOffset}
          />
        </svg>
        <div className="v-dot" id="vdot" style={{ top: vDotTop, left: vDotLeft }}></div>
      </div>
      <canvas id="p-canvas"></canvas>
      <div className="cursor-dot" id="c-dot"></div>

      <div id="bar" style={{ width: `${scrollPct}%` }}></div>

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="sidebar">
        <div className="sb-line">
          <div className="sb-progress" id="sbp" style={{ height: `${scrollPct}%` }}></div>
        </div>
        <span className="sb-logo">atif.dev</span>
        <div className="sb-line"></div>
        <div className="sb-socials">
          <a href="https://github.com/Atif-Azmi" target="_blank" rel="noreferrer" className="sb-soc" title="GitHub">
            <svg viewBox="0 0 24 24">
              <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0112 6.268c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.218.694.825.576C20.565 22.297 24 17.8 24 12.5 24 5.87 18.627.5 12 .5z" />
            </svg>
          </a>
          <a href="https://linkedin.com/in/atif-azmi" target="_blank" rel="noreferrer" className="sb-soc" title="LinkedIn">
            <svg viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a href="https://www.instagram.com/atif._.azmi?igsh=eWpzZnczNGttYzEw" target="_blank" rel="noreferrer" className="sb-soc" title="Instagram">
            <svg viewBox="0 0 24 24">
              <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5a4.25 4.25 0 0 0-4.25 4.25v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5-2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
          </a>
          <a href="mailto:atifazmi2005@email.com" className="sb-soc" title="Email">
            <svg viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </a>
          <a href="https://x.com/" target="_blank" rel="noreferrer" className="sb-soc" title="Twitter/X">
            <svg viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </aside>

      {/* ── TOPNAV ── */}
      <header className={`topnav ${isScrolled ? "scrolled" : ""}`} id="tnav">
        <div className="tnav-inner">
          <div className="tnav-logo">atif.dev</div>
          <nav className="tnav-links">
            <a href="#home" className={activeSec === "home" ? "act" : ""}>Home</a>
            <a href="#about" className={activeSec === "about" ? "act" : ""}>About</a>
            <a href="#skills" className={activeSec === "skills" ? "act" : ""}>Skills</a>
            <a href="#experience" className={activeSec === "experience" ? "act" : ""}>Experience</a>
            <a href="#projects" className={activeSec === "projects" ? "act" : ""}>Projects</a>
            <a href="#hackathons" className={activeSec === "hackathons" ? "act" : ""}>Hackathons</a>
          </nav>
          <div className="tnav-actions">
            <button className="dm-toggle" onClick={() => setIsDarkMode((d) => !d)} aria-label="Toggle dark mode">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42" />
              </svg>
            </button>
            <button
              className={`hamburger ${isMobOpen ? "open" : ""}`}
              id="ham"
              aria-label="Menu"
              onClick={() => setIsMobOpen((o) => !o)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <div className={`mobile-menu ${isMobOpen ? "open" : ""}`} id="mob">
        <a href="#home" onClick={() => setIsMobOpen(false)}>Home</a>
        <a href="#about" onClick={() => setIsMobOpen(false)}>About</a>
        <a href="#skills" onClick={() => setIsMobOpen(false)}>Skills</a>
        <a href="#experience" onClick={() => setIsMobOpen(false)}>Experience</a>
        <a href="#projects" onClick={() => setIsMobOpen(false)}>Projects</a>
        <a href="#hackathons" onClick={() => setIsMobOpen(false)}>Hackathons</a>
        <a href="#connect" onClick={() => setIsMobOpen(false)}>Connect</a>
        <div className="mob-footer">
          <div className="mob-socials">
            <a href="https://github.com/Atif-Azmi" target="_blank" rel="noreferrer" title="GitHub">
              <svg viewBox="0 0 24 24">
                <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0112 6.268c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.218.694.825.576C20.565 22.297 24 17.8 24 12.5 24 5.87 18.627.5 12 .5z" />
              </svg>
            </a>
            <a href="https://linkedin.com/in/atif-azmi" target="_blank" rel="noreferrer" title="LinkedIn">
              <svg viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/atif._.azmi?igsh=eWpzZnczNGttYzEw" target="_blank" rel="noreferrer" title="Instagram">
              <svg viewBox="0 0 24 24">
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5a4.25 4.25 0 0 0-4.25 4.25v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5-2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
            </a>
            <a href="mailto:atifazmi2005@email.com" title="Email">
              <svg viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>
            <a href="https://x.com/" target="_blank" rel="noreferrer" title="Twitter/X">
              <svg viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
          <button className="mob-dm" onClick={() => { setIsDarkMode((d) => !d); setIsMobOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42" />
            </svg>
            Theme
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="main-wrap">
        {/* HOME */}
        <section id="home">
          <div className="container">
            <div className="hero-inner">
              {/* LEFT */}
              <div>
                <div className="hero-avail">
                  <span className="avail-dot"></span>Open to work &amp; collaboration
                </div>
                <div className="hero-pre">Hi, I'm</div>
                <h1 className="hero-name">
                  <span className="word">
                    <span>Mo Atif</span>
                  </span>
                  <em>
                    <span>Azmi.</span>
                  </em>
                </h1>
                <p className="hero-meta">
                  <span>20</span>
                  <span className="mdot"></span>
                  <span>Nagpur, Maharashtra</span>
                  <span className="mdot"></span>
                  <span id="role-text" className={`role-swap ${roleFade ? "fade" : ""}`}>
                    {roleText}
                  </span>
                </p>
                <p className="hero-bio">
                  I build <strong>scalable web apps</strong> and SaaS products that solve real problems — from clean, performant frontends to reliable backend systems. Passionate about open-source and shipping things that actually matter.
                </p>
                <div className="hero-ctas">
                  <a href="#projects" className="btn-primary">
                    <div className="fill"></div>
                    <span>View Projects →</span>
                  </a>
                  <a href="#connect" className="btn-ghost">Get in Touch</a>
                </div>
              </div>
              {/* RIGHT — photo */}
              <div className="hero-photo" style={{ transform: `translateY(${phTransform}px)` }}>
                <div className="photo-img">
                  <img src="profile.png" alt="Mo Atif Azmi" onError={(e) => { e.target.style.display = "none"; }} />
                </div>
                <div className="photo-card">
                  <span className="pc-loc">📍 Nagpur, MH</span>
                  <span className="pc-open">
                    <span className="pc-dot"></span>Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about">
          <div className="container">
            <div className="sec-eye r">About</div>
            <div className="about-grid">
              <div>
                <h2 className="about-h r d1">
                  Building things <em>that last.</em>
                </h2>
                <p className="about-p r d2">
                  Hey, I'm <strong>Atif</strong> — a 20-year-old full stack developer from Nagpur. I love turning ideas into real, working products. Whether it's a SaaS dashboard, a data-driven tool, or an open-source contribution, I'm in.
                </p>
                <p className="about-p r d3">
                  Currently interning as a <strong>Full Stack Developer at Shaibya Solutions</strong>, and actively contributing to <strong>GSSoC 2026</strong> &amp; <strong>NSCoC 2026</strong> — building in public, learning by shipping.
                </p>
                <p className="about-p r d4">
                  I believe great code is readable, maintainable, and ships on time. Outside work I explore new frameworks and collaborate with teams at hackathons.
                </p>
                <div className="chips r d5">
                  <span className="chip">🎓 BTech CSE</span>
                  <span className="chip">📍 Nagpur</span>
                  <span className="chip">🌱 Open Source</span>
                  <span className="chip">⚡ SaaS Builder</span>
                  <span className="chip">☕ Tea &gt; Coffee</span>
                </div>
              </div>
              <div className="stats r d2">
                <div className="st">
                  <div className="st-n">
                    <span className="counter" data-to="3" data-suffix="+">
                      0
                    </span>
                  </div>
                  <div className="st-l">Major Projects Done</div>
                </div>
                <div className="st">
                  <div className="st-n">
                    <span className="counter" data-to="3">
                      0
                    </span>
                  </div>
                  <div className="st-l">Hackathons</div>
                </div>
                <div className="st">
                  <div className="st-n">
                    <span className="counter" data-to="3">
                      0
                    </span>
                  </div>
                  <div className="st-l">OSS Programs</div>
                </div>
                <div className="st">
                  <div className="st-n">
                    <span className="counter" data-to="20">
                      0
                    </span>
                  </div>
                  <div className="st-l">Years Young</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills">
          <div className="container">
            <div className="sec-eye r">Skills</div>
            <div className="skills-grid r d1" id="skills-wrap">
              {skillsList.map(([icon, name]) => (
                <div className="sk" key={icon}>
                  <img
                    src={`https://skillicons.dev/icons?i=${icon}`}
                    alt={name}
                    loading="lazy"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience">
          <div className="container">
            <div className="sec-eye r">Experience</div>
            <div className="exp-list">
              <div className="exp-row r">
                <div className="exp-left-wrap">
                  <div className="exp-logo">SB</div>
                  <div className="exp-date">May 2026 — Present</div>
                </div>
                <div>
                  <div className="exp-role">Full Stack Developer Intern</div>
                  <span className="exp-co">Shaibya Solutions</span>
                  <p className="exp-desc">
                    Building production-grade web applications within a professional engineering team. Working across the full stack — architecting REST APIs, crafting responsive React interfaces, and shipping features that real users depend on. Learning fast, contributing faster.
                  </p>
                </div>
              </div>

              <div className="exp-row r d1">
                <div className="exp-left-wrap">
                  <div className="exp-logo">GC</div>
                  <div className="exp-date">15 May 2026 — Present</div>
                </div>
                <div>
                  <div className="exp-role">Open Source Contributor</div>
                  <span className="exp-co">GirlScript Summer of Code 2026</span>
                  <p className="exp-desc">
                    Selected as a contributor in GSSoC — one of India's largest open-source programs. Contributing to real repositories, submitting clean PRs, resolving issues, and collaborating with maintainers. Learning software collaboration at scale.
                  </p>
                </div>
              </div>

              <div className="exp-row r d2">
                <div className="exp-left-wrap">
                  <div className="exp-logo">NC</div>
                  <div className="exp-date">April 2026 — Present</div>
                </div>
                <div>
                  <div className="exp-role">Open Source Contributor</div>
                  <span className="exp-co">Nexus Spring of Code (NSCoC) 2026</span>
                  <p className="exp-desc">
                    Participating in NSCoC's structured program — contributing to diverse open-source projects, picking up real-world patterns in codebases, documentation practices, and distributed development workflows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects">
          <div className="container">
            <div className="sec-eye r">Projects</div>
            <div className="proj-list">
              {/* Project 1 */}
              <div className="proj-row r">
                <div className="proj-n">01</div>
                <div>
                  <div className="proj-name">TradersPro</div>
                  <div className="proj-desc">
                    Fresh operations for your hardware business. Track customers, sales, stock alerts, and bulk WhatsApp reminders in one calm, premium workspace — built for clarity, not clutter.
                    <br />
                    <br />
                    <strong>Demo Credentials:</strong> ID: test@trader.in | Pass: 123456
                  </div>
                  <div className="proj-stack">
                    <span className="pt">React</span>
                    <span className="pt">Node.js</span>
                    <span className="pt">Express</span>
                    <span className="pt">MongoDB</span>
                    <span className="pt">Tailwind CSS</span>
                  </div>
                </div>
                <div className="proj-links-col">
                  <a href="https://traders-proo.vercel.app" target="_blank" rel="noreferrer" className="proj-lnk">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                    Live
                  </a>
                  <a href="https://github.com/Atif-Azmi" target="_blank" rel="noreferrer" className="proj-lnk">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0112 6.268c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.218.694.825.576C20.565 22.297 24 17.8 24 12.5 24 5.87 18.627.5 12 .5z" />
                    </svg>
                    Code
                  </a>
                </div>
              </div>

              {/* Project 2 */}
              <div className="proj-row r d1">
                <div className="proj-n">02</div>
                <div>
                  <div className="proj-name">Dairy Web Pro</div>
                  <div className="proj-desc">
                    Track customers, daily milk entries, payments, and billing in one calm, pasture-inspired workspace — built for clarity, not clutter. A complete SaaS-grade dairy management system with real-time data and auth.
                  </div>
                  <div className="proj-stack">
                    <span className="pt">Next.js</span>
                    <span className="pt">React</span>
                    <span className="pt">TypeScript</span>
                    <span className="pt">Tailwind CSS</span>
                    <span className="pt">Supabase</span>
                    <span className="pt">PostgreSQL</span>
                  </div>
                </div>
                <div className="proj-links-col">
                  <a href="https://dairy-web-app.vercel.app/" target="_blank" rel="noreferrer" className="proj-lnk">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                    Live
                  </a>
                  <a href="https://github.com/Atif-Azmi" target="_blank" rel="noreferrer" className="proj-lnk">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0112 6.268c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.218.694.825.576C20.565 22.297 24 17.8 24 12.5 24 5.87 18.627.5 12 .5z" />
                    </svg>
                    Code
                  </a>
                </div>
              </div>

              {/* Project 3 */}
              <div className="proj-row r d2">
                <div className="proj-n">03</div>
                <div>
                  <div className="proj-name">Ambassador Tribute</div>
                  <div className="proj-desc">
                    The King of Indian Roads — a rich, visually immersive tribute to the legendary Ambassador car. Full-stack MERN application celebrating Indian automotive history with smooth scroll storytelling.
                  </div>
                  <div className="proj-stack">
                    <span className="pt">MongoDB</span>
                    <span className="pt">Express</span>
                    <span className="pt">React</span>
                    <span className="pt">Node.js</span>
                  </div>
                </div>
                <div className="proj-links-col">
                  <a href="https://ambassador-car-website.vercel.app/" target="_blank" rel="noreferrer" className="proj-lnk">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                    Live
                  </a>
                  <a href="https://github.com/Atif-Azmi" target="_blank" rel="noreferrer" className="proj-lnk">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0112 6.268c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.218.694.825.576C20.565 22.297 24 17.8 24 12.5 24 5.87 18.627.5 12 .5z" />
                    </svg>
                    Code
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HACKATHONS */}
        <section id="hackathons">
          <div className="container">
            <div className="sec-eye r">Hackathons</div>
            <div className="hack-list">
              <div className="hack-row r">
                <div>
                  <div className="hack-icon">🏅</div>
                  <div className="hack-date">7th February 2026</div>
                  <div className="hack-name">TECHMENTORX — PCE Hackathon</div>
                  <div className="hack-loc">📍 Priyadarshini College of Engineering, Nagpur</div>
                  <p className="hack-desc">
                    Competed against 70+ teams in this intense on-campus hackathon. Collaborated with my team to design, build, and demo a working product under 24 hours — finishing in the <strong style={{ color: "var(--rust)" }}>Top 6</strong>. Learned rapid prototyping, real-time debugging under pressure, and confident presentations to technical judges.
                  </p>
                </div>
                <span className="hbadge hb-fill">Top 6 / 70+</span>
              </div>

              <div className="hack-row r d1">
                <div>
                  <div className="hack-icon">🛸</div>
                  <div className="hack-date">September 2025</div>
                  <div className="hack-name">Bharatiya Antariksh Hackathon</div>
                  <div className="hack-loc">📍 Online (National Level)</div>
                  <p className="hack-desc">
                    National space-tech hackathon centered around India's growing space ambitions. Built a satellite data visualisation and citizen-science reporting tool. A formative experience in scoping ambitious problems and executing within real-world constraints.
                  </p>
                </div>
                <span className="hbadge hb-mute">Participant</span>
              </div>

              <div className="hack-row r d2">
                <div>
                  <div className="hack-icon">❄️</div>
                  <div className="hack-date">January – February 2026 · 8 Weeks</div>
                  <div className="hack-name">Elite Coders — Winter of Code</div>
                  <div className="hack-loc">📍 Online</div>
                  <p className="hack-desc">
                    An 8-week open-source sprint. Contributed meaningful pull requests to multiple repositories, practised reading large production codebases, wrote documentation, and collaborated asynchronously with distributed maintainers.
                  </p>
                </div>
                <span className="hbadge hb-out">Contributor</span>
              </div>
            </div>
          </div>
        </section>

        {/* GITHUB CONTRIB */}
        <section id="github">
          <div className="container">
            <div className="gh-top r">
              <div>
                <div className="sec-eye" style={{ marginBottom: "6px" }}>
                  Github Contributions
                </div>
                <p style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--sand2)" }}>
                  Consistent work, shipped publicly.
                </p>
              </div>
              <a href="https://github.com/Atif-Azmi" target="_blank" rel="noreferrer" className="gh-link r">
                github.com/Atif-Azmi ↗
              </a>
            </div>
            <div className="gh-wrap">
              <div className="gh-months r d1">
                <span className="gh-month">Jan</span>
                <span className="gh-month">Feb</span>
                <span className="gh-month">Mar</span>
                <span className="gh-month">Apr</span>
                <span className="gh-month">May</span>
                <span className="gh-month">Jun</span>
                <span className="gh-month">Jul</span>
                <span className="gh-month">Aug</span>
                <span className="gh-month">Sep</span>
                <span className="gh-month">Oct</span>
                <span className="gh-month">Nov</span>
                <span className="gh-month">Dec</span>
              </div>
              <div className="contrib-grid r d2" id="grid">
                {githubGrid.map((item, idx) => (
                  <div
                    key={idx}
                    className={`cc cl${item.lv}`}
                    title={item.title}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CONNECT */}
        <section id="connect">
          <div className="container">
            <div className="sec-eye r">Connect</div>
            <div className="connect-grid">
              <div>
                <h2 className="connect-title r d1">
                  Let's build
                  <br />
                  <em>something real.</em>
                </h2>
                <p className="connect-sub r d2">
                  Have a project in mind, want to collaborate on open source, or just want to say hi? I'm always up for a conversation.
                </p>
                <div className="conn-links r d3">
                  <a href="https://github.com/Atif-Azmi" target="_blank" rel="noreferrer" className="conn-link">
                    <div className="conn-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0112 6.268c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.218.694.825.576C20.565 22.297 24 17.8 24 12.5 24 5.87 18.627.5 12 .5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="conn-label">GitHub</div>
                      <div className="conn-val">github.com/Atif-Azmi</div>
                    </div>
                  </a>
                  <a href="https://linkedin.com/in/atif-azmi" target="_blank" rel="noreferrer" className="conn-link">
                    <div className="conn-icon" style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "13px", color: "currentColor" }}>
                      in
                    </div>
                    <div>
                      <div className="conn-label">LinkedIn</div>
                      <div className="conn-val">linkedin.com/in/atif-azmi</div>
                    </div>
                  </a>
                  <a href="https://www.instagram.com/atif._.azmi?igsh=eWpzZnczNGttYzEw" target="_blank" rel="noreferrer" className="conn-link">
                    <div className="conn-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5a4.25 4.25 0 0 0-4.25 4.25v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5-2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="conn-label">Instagram</div>
                      <div className="conn-val">@atif._.azmi</div>
                    </div>
                  </a>
                  <a href="mailto:atifazmi2005@email.com" className="conn-link">
                    <div className="conn-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="conn-label">Email</div>
                      <div className="conn-val">atifazmi2005@email.com</div>
                    </div>
                  </a>
                  <a href="https://x.com/" target="_blank" rel="noreferrer" className="conn-link">
                    <div className="conn-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <div>
                      <div className="conn-label">Twitter / X</div>
                      <div className="conn-val">@atif_azmi</div>
                    </div>
                  </a>
                </div>
              </div>

              <div className="r d2">
                <div className="fb-title">
                  Drop a thought,
                  <br />
                  <em>spark a change.</em>
                </div>
                <p className="fb-sub">I read every message. No templates, no bots.</p>
                <form className="fb-form" action="https://formspree.io/f/mpqbkpwo" method="POST" onSubmit={handleSubmitContact}>
                  <input className="fb-inp" type="text" name="name" placeholder="Your name" required />
                  <input className="fb-inp" type="email" name="email" placeholder="Your email" required />
                  <textarea className="fb-ta" name="message" placeholder="Your message…" required></textarea>
                  <button className="fb-btn" type="submit">
                    Send →
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "8px" }}>
            <span className="ft">
              Design &amp; Developed by <b>Mo Atif Azmi</b>
            </span>
            <span className="ft">© 2026 · All rights reserved.</span>
          </div>
        </footer>
      </div>
      <ChatWidget />
    </>
  );
}
