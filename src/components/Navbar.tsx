"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  const links = [
    { href: "/", label: "Home" },
    { href: "/news", label: "News" },
    { href: "/#projects", label: "Projects" },
    { href: "/chat", label: "Chat" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(20px)",
        borderColor: "var(--border-color)",
        height: "var(--navbar-height)",
      }}
    >
      <div className="mx-auto h-full flex items-center justify-between px-6" style={{ maxWidth: "1100px" }}>
        {/* Logo */}
        <Link href="/" className="text-lg font-extrabold gradient-text tracking-tight">
          &lt;rizer001 /&gt;
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                color: pathname === link.href ? "var(--text-primary)" : "var(--text-secondary)",
                background: pathname === link.href ? "rgba(0, 212, 255, 0.1)" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l" style={{ borderColor: "var(--border-color)" }}>
              {(session.user?.role === "admin" || session.user?.role === "owner") && (
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
                    color: "#fff",
                  }}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="text-sm text-muted hover:text-primary transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Sign out
              </button>
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border"
                  style={{ borderColor: "var(--border-color)" }}
                />
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="ml-4 px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: "#24292f",
                color: "#fff",
                boxShadow: "0 4px 15px rgba(36, 41, 47, 0.4)",
              }}
            >
              <i className="fa-brands fa-github mr-2"></i>
              Sign in
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1 z-50"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span
            className="block w-6 h-0.5 bg-white rounded transition-all"
            style={{ transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }}
          />
          <span
            className="block w-6 h-0.5 bg-white rounded transition-all"
            style={{ opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="block w-6 h-0.5 bg-white rounded transition-all"
            style={{ transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMenuOpen(false)} />
          <div
            className="fixed top-0 right-0 h-full w-72 z-50 flex flex-col p-8 pt-24 border-l"
            style={{
              background: "rgba(10, 10, 15, 0.98)",
              backdropFilter: "blur(20px)",
              borderColor: "var(--border-color)",
            }}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 rounded-lg text-base font-medium transition-colors"
                style={{
                  color: pathname === link.href ? "var(--text-primary)" : "var(--text-secondary)",
                  background: pathname === link.href ? "rgba(0, 212, 255, 0.1)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--border-color)" }}>
              {session ? (
                <>
                  {(session.user?.role === "admin" || session.user?.role === "owner") && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block text-center py-3 rounded-full font-semibold mb-3"
                      style={{
                        background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
                        color: "#fff",
                      }}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="w-full text-center py-3 rounded-full font-medium"
                    style={{ color: "var(--text-muted)", border: "1px solid var(--border-color)" }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn("github")}
                  className="w-full text-center py-3 rounded-full font-semibold"
                  style={{
                    background: "#24292f",
                    color: "#fff",
                    boxShadow: "0 4px 15px rgba(36, 41, 47, 0.4)",
                  }}
                >
                  <i className="fa-brands fa-github mr-2"></i>
                  Sign in with GitHub
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
