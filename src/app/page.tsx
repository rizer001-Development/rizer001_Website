import Link from "next/link";
import GitHubProjects from "@/components/GitHubProjects";
import ContactForm from "@/components/ContactForm";

export default function HomePage() {
  return (
    <div>
      {/* HERO SECTION */}
      <section
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
        style={{
          paddingTop: "100px",
          paddingBottom: "60px",
        }}
      >
        <div className="max-w-[700px]">
          {/* Avatar */}
          <div className="relative w-[120px] h-[120px] mx-auto mb-8">
            <div
              className="absolute -inset-[10px] rounded-full animate-[spin_4s_linear_infinite] opacity-60"
              style={{
                background: "conic-gradient(from 0deg, var(--accent-cyan), var(--accent-purple), var(--accent-pink), var(--accent-cyan))",
                filter: "blur(8px)",
              }}
            />
            <div
              className="relative w-full h-full rounded-full flex items-center justify-center border-2 z-10"
              style={{ background: "var(--bg-card)", borderColor: "rgba(0, 212, 255, 0.3)" }}
            >
              <span className="text-5xl font-black gradient-text">R</span>
            </div>
          </div>

          <h1
            className="text-5xl md:text-6xl font-black mb-2"
            style={{
              background: "linear-gradient(135deg, var(--text-primary), var(--accent-cyan))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            rizer001
          </h1>
          <p className="text-xl font-semibold mb-4" style={{ color: "var(--accent-cyan)" }}>
            Minecraft Developer &amp; Creator
          </p>
          <p className="text-base mb-9" style={{ color: "var(--text-secondary)" }}>
            Creating plugins, mods and launchers for Minecraft. Open-source enthusiast.
          </p>

          <div className="flex gap-3 justify-center flex-wrap mb-14">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold transition-all hover:scale-105 hover:-translate-y-1"
              style={{
                background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
                color: "#fff",
                boxShadow: "0 4px 15px rgba(0, 212, 255, 0.3)",
              }}
            >
              <i className="fa-solid fa-newspaper"></i> News
            </Link>
            <a
              href="https://github.com/rizer001"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold border transition-all hover:scale-105 hover:-translate-y-1"
              style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            >
              <i className="fa-brands fa-github"></i> GitHub
            </a>
            <a
              href="https://dsc.gg/rizer001-development"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold border transition-all hover:scale-105 hover:-translate-y-1"
              style={{ borderColor: "rgba(88, 101, 242, 0.3)", color: "var(--text-primary)" }}
            >
              <i className="fa-brands fa-discord"></i> Discord
            </a>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12">
            {[
              { number: "6", label: "Projects" },
              { number: "100", label: "% Java" },
              { number: "1", label: "Team" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="block text-4xl font-extrabold gradient-text">{stat.number}</span>
                <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce" style={{ color: "var(--text-muted)" }}>
          <span className="text-xs">Scroll down</span>
          <i className="fa-solid fa-chevron-down text-sm"></i>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="px-6 py-24" id="about">
        <div className="mx-auto" style={{ maxWidth: "1100px" }}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border text-lg"
              style={{
                background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1))",
                borderColor: "var(--border-color)",
                color: "var(--accent-cyan)",
              }}
            >
              <i className="fa-solid fa-user"></i>
            </span>
            About me
          </h2>
          <p className="text-base mb-14" style={{ color: "var(--text-secondary)", maxWidth: "600px" }}>
            A developer who turns ideas into code
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              { icon: "fa-cubes", title: "Minecraft Development", desc: "Creating plugins for Paper/Spigot servers, mods for NeoForge and handy tools." },
              { icon: "fa-cloud-arrow-up", title: "Open Source", desc: "All my projects are open source on GitHub. I believe in the power of community." },
              { icon: "fa-rocket", title: "Innovation", desc: "Always learning new technologies to build modern solutions." },
            ].map((card, i) => (
              <div key={i} className="card p-8 group">
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center text-xl mb-5 transition-all"
                  style={{
                    background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1))",
                    color: "var(--accent-cyan)",
                  }}
                >
                  <i className={`fa-solid ${card.icon}`}></i>
                </div>
                <h3 className="font-bold mb-3">{card.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-xl font-bold mb-5">Skills</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: "fa-brands fa-java", label: "Java" },
                { icon: "fa-brands fa-js", label: "JavaScript" },
                { icon: "fa-brands fa-git-alt", label: "Git" },
                { icon: "fa-solid fa-cube", label: "Paper API" },
                { icon: "fa-solid fa-cubes", label: "NeoForge" },
                { icon: "fa-solid fa-database", label: "SQL" },
                { icon: "fa-brands fa-gradle", label: "Gradle" },
                { icon: "fa-solid fa-terminal", label: "Bash" },
              ].map((skill) => (
                <span
                  key={skill.label}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium border transition-all hover:-translate-y-0.5 cursor-default"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <i className={skill.icon} style={{ color: "var(--accent-cyan)" }}></i>
                  {skill.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section className="px-6 py-24" id="projects">
        <div className="mx-auto" style={{ maxWidth: "1100px" }}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border text-lg"
              style={{
                background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1))",
                borderColor: "var(--border-color)",
                color: "var(--accent-cyan)",
              }}
            >
              <i className="fa-solid fa-folder-open"></i>
            </span>
            Projects
          </h2>
          <p className="text-base mb-14" style={{ color: "var(--text-secondary)", maxWidth: "600px" }}>
            My open-source projects on GitHub
          </p>

          <GitHubProjects />
        </div>
      </section>

      {/* DISCORD SECTION — now links to /chat */}
      <section className="px-6 py-16" id="discord">
        <div className="mx-auto text-center" style={{ maxWidth: "700px" }}>
          <div className="text-5xl mb-5" style={{ color: "#5865f2" }}>
            <i className="fa-brands fa-discord"></i>
          </div>
          <h2
            className="text-3xl md:text-4xl font-extrabold mb-4"
            style={{
              background: "linear-gradient(135deg, #5865f2, var(--accent-purple))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Discord Community
          </h2>
          <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
            Join the chat — talk, ask questions, follow updates
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all hover:scale-105 hover:-translate-y-1"
              style={{
                background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
                color: "#fff",
                boxShadow: "0 4px 15px rgba(0, 212, 255, 0.3)",
              }}
            >
              <i className="fa-solid fa-comment"></i>
              Open chat
            </Link>
            <a
              href="https://dsc.gg/rizer001-development"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold border transition-all hover:scale-105 hover:-translate-y-1"
              style={{
                borderColor: "rgba(88, 101, 242, 0.3)",
                color: "#5865f2",
              }}
            >
              <i className="fa-brands fa-discord"></i>
              Open in Discord
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="px-6 py-24" id="contact">
        <div className="mx-auto" style={{ maxWidth: "1100px" }}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border text-lg"
              style={{
                background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1))",
                borderColor: "var(--border-color)",
                color: "var(--accent-cyan)",
              }}
            >
              <i className="fa-solid fa-link"></i>
            </span>
            Contacts
          </h2>
          <p className="text-base mb-14" style={{ color: "var(--text-secondary)", maxWidth: "600px" }}>
            Where to find me
          </p>
          <div className="flex justify-center gap-5 flex-wrap mb-16">
            {[
              { href: "https://github.com/rizer001", icon: "fa-brands fa-github", label: "GitHub" },
              { href: "https://dsc.gg/rizer001-development", icon: "fa-brands fa-discord", label: "Discord" },
              { href: "https://t.me/rizer001", icon: "fa-brands fa-telegram", label: "Telegram" },
              { href: "https://github.com/rizer001?tab=repositories", icon: "fa-brands fa-github", label: "All repos" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener"
                className="flex flex-col items-center gap-3 px-8 py-7 min-w-[150px] rounded-2xl border transition-all hover:-translate-y-2"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                <i className={`${link.icon} text-3xl transition-transform hover:scale-110`} style={{ color: "var(--accent-cyan)" }}></i>
                <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{link.label}</span>
              </a>
            ))}
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
