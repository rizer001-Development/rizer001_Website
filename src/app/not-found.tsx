import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl font-black mb-4 gradient-text">404</div>
      <h1 className="text-2xl font-bold mb-3">Page not found</h1>
      <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
        This page doesn&apos;t exist or has been removed
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold transition-all hover:scale-105"
        style={{
          background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
          color: "#fff",
        }}
      >
        <i className="fa-solid fa-house"></i> Go home
      </Link>
    </div>
  );
}
