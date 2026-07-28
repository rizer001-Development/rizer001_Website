import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "rizer001 — Developer & Creator",
  description: "Личный сайт rizer001 — разработчик Minecraft плагинов, модов и лаунчеров.",
  openGraph: {
    title: "rizer001 — Developer & Creator",
    description: "Личный сайт rizer001 — разработчик Minecraft плагинов, модов и лаунчеров.",
    url: "https://github.com/rizer001",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#00d4ff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        <SessionProvider>
          <Navbar />
          <main className="pt-[70px]">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
