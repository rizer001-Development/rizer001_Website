"use client";

import { signIn, getProviders } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type ProviderInfo = {
  id: string;
  name: string;
};

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProviders().then((p) => {
      if (p) {
        const list: ProviderInfo[] = [];
        if (p.discord) list.push({ id: "discord", name: "Discord" });
        if (p.github) list.push({ id: "github", name: "GitHub" });
        setProviders(list);
      }
      setLoading(false);
    });
  }, []);

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
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))",
            color: "var(--accent-cyan)",
            border: "2px solid rgba(0,212,255,0.15)",
          }}
        >
          <i className="fa-solid fa-right-to-bracket"></i>
        </div>

        <h1 className="text-2xl font-extrabold mb-2 gradient-text">Войти на сайт</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          Войди чтобы получить доступ к админ-панели
        </p>

        {error === "OAuthAccountNotLinked" && (
          <div
            className="text-xs p-3 rounded-xl mb-4"
            style={{
              background: "rgba(236,72,153,0.1)",
              color: "var(--accent-pink)",
              border: "1px solid rgba(236,72,153,0.2)",
            }}
          >
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>
            Этот email уже используется с другим способом входа. Войди через тот же провайдер.
          </div>
        )}

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-sm" style={{ color: "var(--text-muted)" }}>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Загрузка...
            </div>
          ) : providers.length === 0 ? (
            <div
              className="text-xs p-4 rounded-xl"
              style={{
                background: "rgba(236,72,153,0.1)",
                color: "var(--accent-pink)",
                border: "1px solid rgba(236,72,153,0.2)",
              }}
            >
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              Авторизация не настроена. Добавь ключи в <code className="text-xs px-1 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>.env</code>:
              <br />
              <code className="text-xs px-1 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>
                DISCORD_CLIENT_ID=<wbr />...
              </code>
              <br />
              <code className="text-xs px-1 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.3)" }}>
                GITHUB_CLIENT_ID=<wbr />...
              </code>
            </div>
          ) : (
            providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => signIn(provider.id, { callbackUrl })}
                className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all hover:scale-[1.02] active:scale-95"
                style={
                  provider.id === "discord"
                    ? {
                        background: "#5865f2",
                        color: "#fff",
                        boxShadow: "0 4px 20px rgba(88,101,242,0.3)",
                      }
                    : {
                        background: "#24292f",
                        color: "#fff",
                        boxShadow: "0 4px 20px rgba(36,41,47,0.3)",
                      }
                }
              >
                {provider.id === "discord" ? (
                  <i className="fa-brands fa-discord text-xl"></i>
                ) : (
                  <i className="fa-brands fa-github text-xl"></i>
                )}
                Войти через {provider.name}
              </button>
            ))
          )}
        </div>

        <p className="mt-8 text-xs" style={{ color: "var(--text-muted)" }}>
          Вход нужен для доступа к админ-панели
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
