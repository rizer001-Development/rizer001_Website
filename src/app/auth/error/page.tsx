"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const errors: Record<string, { title: string; description: string }> = {
  OAuthAccountNotLinked: {
    title: "Account not linked",
    description: "This email is already used with another sign-in method. Please sign in with the same provider.",
  },
  OAuthSignin: {
    title: "Sign-in failed",
    description: "Could not sign in with the selected service. Please try again.",
  },
  OAuthCallback: {
    title: "Callback error",
    description: "Something went wrong during sign-in confirmation. Please try again.",
  },
  AccessDenied: {
    title: "Access denied",
    description: "You don't have permission to access this resource.",
  },
  default: {
    title: "Authentication error",
    description: "An unknown error occurred. Please try signing in again.",
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "default";
  const info = errors[error] || errors.default;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "var(--bg-primary)",
        paddingTop: "var(--navbar-height)",
      }}
    >
      <div
        className="w-full max-w-md p-10 rounded-3xl border text-center"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(239,68,68,0.15))",
            color: "var(--accent-pink)",
            border: "2px solid rgba(236,72,153,0.15)",
          }}
        >
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>

        <h1 className="text-2xl font-extrabold mb-2" style={{ color: "var(--accent-pink)" }}>
          {info.title}
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          {info.description}
        </p>

        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
            color: "#fff",
          }}
        >
          <i className="fa-solid fa-arrow-left"></i>
          Try again
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
