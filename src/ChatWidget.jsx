import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are the AI assistant on Mo Atif Azmi's portfolio website (atif-dev.vercel.app).
Visitors are recruiters, potential clients, and other developers exploring the site.

## About
- Role: Full-Stack Developer & SaaS Builder
- Bio: Atif is a 20-year-old Full Stack Developer from Nagpur who loves turning ideas into real, working products. He specializes in building scalable web apps and SaaS products, from clean frontends to reliable backends.

## Skills
React, Next.js, TypeScript, JavaScript, Node.js, Express, MongoDB, PostgreSQL, Tailwind CSS, Python, Git, GitHub, Vercel, Figma, Postman, Docker

## Projects
1. AutoSettle — Autonomous AI payment-recovery agent built for Razorpay AI Builder Track. Detects failed checkouts and executes policy-governed re-engagement with quiet-hour suppression, Hinglish intent parsing, HMAC verification, live Razorpay API checks, integer-paise matching, and SHA-256 hash-chained audit ledger. — Tech: TypeScript, Node.js, Express, Redis/BullMQ, MongoDB, Razorpay SDK, Gemini Flash, React — Link: https://autosettle-razorpay-six.vercel.app/ (GitHub: https://github.com/Atif-Azmi/AutoSettle)
2. Canopy — Startup Outlook — Machine learning platform predicting startup survivability and acquisition outcomes based on historical venture funding profiles using Random Forest, RBF SVM, Logistic Regression, and Decision Tree. — Tech: Python, Scikit-Learn, Random Forest, Flask, Jupyter, Pandas — Link: https://startup-survivability-predictor.onrender.com (GitHub: https://github.com/AamirrH/Startup-Survivability-Predictor)
3. DuruCare (Duyu) — Ultra-smooth 3D scroll-driven digital product showcase for a modern thyroid wellness brand with 60FPS frame-by-frame canvas image sequence bottle animation synchronized to viewport scrolling. — Tech: Next.js, React, HTML5 Canvas, Tailwind CSS, JavaScript — Link: https://duru-care.vercel.app/ (GitHub: https://github.com/Atif-Azmi/DuruCare)
4. TradersPro — ERP workspace for hardware businesses to track customers, stock alerts, sales, and bulk WhatsApp reminders. — Tech: React, Node.js, Express, MongoDB, Tailwind CSS — Link: https://traders-proo.vercel.app (Demo ID: test@trader.in, Pass: 123456)
5. Dairy Web Pro — SaaS-grade dairy management system designed for tracking customers, daily milk entries, payments, and billing. — Tech: Next.js, React, TypeScript, Tailwind CSS, Supabase, PostgreSQL — Link: https://dairy-web-app.vercel.app/
6. Ambassador Tribute — A rich, visually immersive tribute website celebrating the legendary Indian car with smooth scroll storytelling. — Tech: MongoDB, Express, React, Node.js — Link: https://ambassador-car-website.vercel.app/

## Experience
- Full Stack Developer Intern at Shaibya Solutions (May 2026 — Present)
- Open Source Contributor at GirlScript Summer of Code (GSSoC 2026)
- Open Source Contributor at Nexus Spring of Code (NSCoC 2026)
- PCE TECHMENTORX Hackathon (Top 6 / 70+ teams)

## Contact
- Email: atifazmi2005@email.com
- LinkedIn: linkedin.com/in/atif-azmi
- GitHub: github.com/Atif-Azmi
- Instagram: @atif._.azmi

## Response rules
- Keep answers short (2-4 sentences), conversational.
- Speak as Atif's assistant, third person.
- If unsure, say so and point to the contact section.
- Never invent projects or skills not listed here.
- Redirect off-topic questions back to portfolio content.`;

// Talks to a mocked backend client-side using local timeout responses.
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Ask me anything about Atif's background, projects, or experience." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const newMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Levenshtein helper
    function levenshteinDistance(s, t) {
      if (!s.length) return t.length;
      if (!t.length) return s.length;
      const arr = Array(t.length + 1).fill(null).map(() => Array(s.length + 1).fill(0));
      for (let i = 0; i <= t.length; i++) arr[i][0] = i;
      for (let j = 0; j <= s.length; j++) arr[0][j] = j;
      for (let i = 1; i <= t.length; i++) {
        for (let j = 1; j <= s.length; j++) {
          const cost = t[i - 1] === s[j - 1] ? 0 : 1;
          arr[i][j] = Math.min(
            arr[i - 1][j] + 1,
            arr[i][j - 1] + 1,
            arr[i - 1][j - 1] + cost
          );
        }
      }
      return arr[t.length][s.length];
    }

    function isSimilar(word, keyword) {
      if (word === keyword) return true;
      if (word.length > 3 && (word.includes(keyword) || keyword.includes(word))) return true;
      const dist = levenshteinDistance(word, keyword);
      const minLen = Math.min(word.length, keyword.length);
      if (minLen <= 3) return dist === 0;
      if (minLen <= 5) return dist <= 1;
      return dist <= 2;
    }

    function runFallbackMatching(userInput) {
      const lower = userInput.toLowerCase();
      let reply = "I'm Atif's AI assistant. I can tell you that he is a Full Stack Developer from Nagpur, building scalable web apps and SaaS products like AutoSettle, Canopy ML, DuruCare, and TradersPro! Ask me about his skills, experience, or projects.";

      const inputWords = lower.split(/[^a-zA-Z0-9]/).filter(Boolean);

      const matches = (keywords) => {
        return inputWords.some(word => 
          keywords.some(keyword => isSimilar(word, keyword))
        );
      };

      if (/\b(hi|hello|hey|yo|sup|greetings|greet)\b/i.test(lower)) {
        reply = "Hello! Nice to meet you. Feel free to ask me anything about Atif's projects, experience, education, or skills.";
      } else if (/\b(who\s+(r|are)\s+(u|you)|your\s+name|ur\s+name)\b/i.test(lower)) {
        reply = "I'm Atif's AI portfolio assistant. Ask me anything about his technical background, education, projects, or work history!";
      } else if (matches(["autosettle", "razorpay", "recovery", "settle", "payment"])) {
        reply = "AutoSettle is an autonomous AI revenue-recovery agent built for the Razorpay AI Builder Track. It detects failed digital payments and recovers them within strict safety guardrails. It enforces 100% closed-loop recovery proof with HMAC-verified webhooks, live Razorpay API verification, exact integer-paise matching, and a tamper-evident SHA-256 hash-chained ledger.";
      } else if (matches(["canopy", "startup", "survivability", "predictor", "prediction", "ml", "machine"])) {
        reply = "Canopy is a machine learning web app that predicts startup survivability (acquired vs. closed) from historical venture investment datasets. Built with Python, Scikit-Learn, and Flask, it compares four ML algorithms (Random Forest, RBF SVM, Logistic Regression, Decision Tree) under a unified evaluation protocol.";
      } else if (matches(["durucare", "duru", "duyu", "thyroid", "canvas", "3d", "supplement"])) {
        reply = "DuruCare (Duyu) is a 3D scroll-driven product experience built for a modern thyroid health supplement brand. It features a high-performance 60FPS frame-by-frame canvas image sequence synchronized to user scrolling with responsive multi-device fallbacks.";
      } else if (matches(["traderspro", "traderpro", "traders", "trader"])) {
        reply = "TradersPro is a comprehensive ERP workspace built for hardware businesses. It manages customers, inventory, sales, stock alerts, and bulk WhatsApp reminders. It is built using the MERN stack (React, Node.js, Express, MongoDB, Tailwind CSS).";
      } else if (matches(["dairy", "milk", "pasture", "billing"])) {
        reply = "Dairy Web Pro is a SaaS-grade dairy management system designed for tracking customers, daily milk entries, payments, and billing. It features real-time data syncing and authentication, built using Next.js, React, TypeScript, Tailwind CSS, Supabase, and PostgreSQL.";
      } else if (matches(["ambassador", "car", "tribute"])) {
        reply = "Ambassador Tribute is a rich, visually immersive tribute website dedicated to the legendary Ambassador car. It is built as a full-stack MERN application featuring smooth scroll storytelling.";
      } else if (matches(["study", "studying", "education", "college", "school", "btech", "degree", "university"])) {
        reply = "Atif is currently pursuing his BTech in Computer Science & Engineering (CSE). He is 20 years old and based in Nagpur, Maharashtra.";
      } else if (matches(["intern", "internship", "job", "work", "employer", "shaibya", "experience"])) {
        reply = "Atif is a Full Stack Developer Intern at Shaibya Solutions, where he builds responsive interfaces and REST APIs. He is also actively contributing to open-source programs like GirlScript Summer of Code (GSSoC 2026) and Nexus Spring of Code (NSCoC 2026).";
      } else if (matches(["hackathon", "hackathons", "competition", "techmentorx", "pce", "antariksh"])) {
        reply = "Atif is a keen competitor! He achieved Top 6 out of 70+ teams at the PCE TECHMENTORX Hackathon (building a product in 24 hours), and participated in the national-level space-tech Bharatiya Antariksh Hackathon in 2025.";
      } else if (matches(["skills", "skill", "technologies", "tech", "languages", "frameworks", "framework", "database", "coding", "code"])) {
        reply = "Atif is highly skilled in React, Next.js, TypeScript, JavaScript, Node.js, Express, MongoDB, PostgreSQL, Tailwind CSS, Python, Git, and Docker.";
      } else if (matches(["contact", "email", "hire", "reach", "linkedin", "github", "instagram", "insta", "socials", "social"])) {
        reply = "You can email Atif directly at atifazmi2005@email.com, connect with him on LinkedIn (linkedin.com/in/atif-azmi), check out his Github (github.com/Atif-Azmi), or follow his Instagram (@atif._.azmi).";
      } else if (matches(["price", "pricing", "cost", "charge", "charges", "rate", "rates", "fee", "fees", "money", "budget", "salary"])) {
        reply = "Atif's project charges and rates depend entirely on the scope, complexity, and timeline of the work (e.g., building a SaaS MVP or custom web application). For freelance inquiries, please email him at atifazmi2005@email.com with details of your requirements to get an estimate!";
      } else if (matches(["locat", "live", "living", "based", "nagpur", "maharashtra", "india", "where"])) {
        reply = "Atif is located in Nagpur, Maharashtra, India, and is fully equipped for remote work and asynchronous collaboration across global timezones.";
      } else if (matches(["build", "create", "make", "develop", "services", "service"])) {
        reply = "Atif builds custom full-stack web applications, SaaS products, interactive MVPs, databases, and responsive websites using modern technologies like Next.js, React, Node, Supabase, and MongoDB.";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (apiKey) {
      // Call Real Gemini API
      try {
        const contents = newMessages.map(msg => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        }));

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: contents,
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
              }
            })
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `Status ${response.status}`;
          throw new Error(errMsg);
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!replyText) throw new Error("Empty candidate parts in Gemini response");

        setMessages((prev) => [...prev, { role: "assistant", content: replyText }]);
      } catch (err) {
        console.error("Gemini API Error, falling back to local matches:", err);
        // Silently fall back to offline match so user always gets an answer!
        runFallbackMatching(trimmed);
      } finally {
        setIsLoading(false);
      }
    } else {
      runFallbackMatching(trimmed);
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-widget-panel">
          <div style={styles.header}>
            <span style={styles.headerText}>Ask me anything</span>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn} aria-label="Close chat">
              ×
            </button>
          </div>

          <div style={styles.messages} ref={scrollRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.bubble,
                  ...(m.role === "user" ? styles.userBubble : styles.assistantBubble),
                }}
              >
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div style={{ ...styles.bubble, ...styles.assistantBubble }}>
                <span style={styles.typing}>typing…</span>
              </div>
            )}
          </div>

          <div style={styles.inputRow}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a question…"
              rows={1}
              style={styles.textarea}
            />
            <button onClick={sendMessage} disabled={isLoading || !input.trim()} style={styles.sendBtn}>
              Send
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setIsOpen((o) => !o)} className="chat-widget-toggle" aria-label="Toggle chat">
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
}

const styles = {
  header: {
    padding: "14px 16px",
    background: "#1a1a1a",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: { fontSize: "14px", fontWeight: 600 },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "20px",
    cursor: "pointer",
    lineHeight: 1,
  },
  messages: {
    flex: 1,
    padding: "12px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  bubble: {
    maxWidth: "80%",
    padding: "8px 12px",
    borderRadius: "12px",
    fontSize: "14px",
    lineHeight: 1.4,
  },
  userBubble: {
    alignSelf: "flex-end",
    background: "#1a1a1a",
    color: "#fff",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    background: "#f2f2f2",
    color: "#1a1a1a",
  },
  typing: { fontStyle: "italic", opacity: 0.6 },
  inputRow: {
    display: "flex",
    gap: "8px",
    padding: "12px",
    borderTop: "1px solid #eee",
  },
  textarea: {
    flex: 1,
    resize: "none",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "8px 10px",
    fontSize: "14px",
    fontFamily: "inherit",
    maxHeight: "80px",
  },
  sendBtn: {
    padding: "8px 14px",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};
