import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="border-t py-12 px-6"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
    >
      <div className="mx-auto" style={{ maxWidth: "1100px" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <span className="text-xl font-extrabold gradient-text">&lt;rizer001 /&gt;</span>
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)", maxWidth: "300px" }}>
              Software Developer &amp; Creator. Open-source enthusiast.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold mb-4 text-sm">Navigation</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm transition-colors hover:pl-1" style={{ color: "var(--text-muted)" }}>
                Home
              </Link>
              <Link href="/news" className="text-sm transition-colors hover:pl-1" style={{ color: "var(--text-muted)" }}>
                News
              </Link>
              <Link href="/#projects" className="text-sm transition-colors hover:pl-1" style={{ color: "var(--text-muted)" }}>
                Projects
              </Link>
              <Link href="/#discord" className="text-sm transition-colors hover:pl-1" style={{ color: "var(--text-muted)" }}>
                Discord
              </Link>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold mb-4 text-sm">Social</h4>
            <div className="flex gap-3">
              <a
                href="https://github.com/rizer001"
                target="_blank"
                rel="noopener"
                className="flex items-center justify-center w-10 h-10 rounded-lg border transition-all hover:-translate-y-1"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                aria-label="GitHub"
              >
                <i className="fa-brands fa-github"></i>
              </a>
              <a
                href="https://dsc.gg/rizer001-development"
                target="_blank"
                rel="noopener"
                className="flex items-center justify-center w-10 h-10 rounded-lg border transition-all hover:-translate-y-1"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                aria-label="Discord"
              >
                <i className="fa-brands fa-discord"></i>
              </a>
              <a
                href="https://t.me/rizer001"
                target="_blank"
                rel="noopener"
                className="flex items-center justify-center w-10 h-10 rounded-lg border transition-all hover:-translate-y-1"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
                aria-label="Telegram"
              >
                <i className="fa-brands fa-telegram"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t text-center text-xs" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
          <p>rizer001. Open-source enthusiast.</p>
        </div>
      </div>
    </footer>
  );
}
