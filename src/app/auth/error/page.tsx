"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const errors: Record<string, { title: string; description: string }> = {
  OAuthAccountNotLinked: {
    title: "Аккаунт не привязан",
    description: "Этот email уже используется с другим способом входа. Войди через тот же провайдер.",
  },
  OAuthSignin: {
    title: "Ошибка входа",
    description: "Не удалось войти через выбранный сервис. Попробуй снова.",
  },
  OAuthCallback: {
    title: "Ошибка подтверждения",
    description: "Что-то пошло не так при подтверждении входа. Попробуй ещё раз.",
  },
  AccessDenied: {
    title: "Доступ запрещён",
    description: "У тебя нет доступа к этому ресурсу.",
  },
  default: {
    title: "Ошибка авторизации",
    description: "Произошла неизвестная ошибка. Попробуй войти снова.",
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
          Попробовать снова
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
