"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, daysUntilStichtag } from "@/lib/utils";
import {
  Home, ListTodo, FolderKanban, Activity, Dumbbell, Trophy, BookOpen, Target, FolderTree, Moon, Sun, LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/", label: "Heute", icon: Home },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/habits", label: "Habits", icon: Activity },
  { href: "/sport", label: "Sport", icon: Dumbbell },
  { href: "/wins", label: "Wins", icon: Trophy },
  { href: "/reading", label: "Reading", icon: BookOpen },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/vault", label: "Vault", icon: FolderTree },
];

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <button onClick={toggle} className="btn-ghost btn" aria-label="Theme toggle">
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const daysLeft = daysUntilStichtag();

  // Auf der Login-Page kein Shell rendern
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Top-Bar */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b hairline">
        <div className="display text-lg">Personal OS</div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-ghost btn"
            aria-label="Logout"
            title="Abmelden"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 md:border-r hairline md:p-4 md:gap-1">
        <div className="display text-base mb-4 px-2 flex items-center justify-between">
          <span>Personal OS</span>
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="btn-ghost btn"
              aria-label="Logout"
              title="Abmelden"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={cn("nav-item", active && "active")}>
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-4 border-t hairline">
          <div className="px-2 text-[11px] num-mono text-[var(--ink-mute)]">
            <div>Stichtag 01.05.2031</div>
            <div className="display text-2xl text-[var(--ink)] mt-1">{daysLeft}</div>
            <div>Tage</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 py-5 md:px-8 md:py-8 max-w-[1100px] w-full mx-auto pb-28 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom-Nav — größere Touch-Targets, safe-area-inset für iPhone-Notch */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 border-t hairline bg-[var(--bg)]/95 backdrop-blur overflow-x-auto no-scrollbar"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[72px] py-2.5 text-[10px] active:bg-[var(--bg-2)]",
                  active ? "text-[var(--ink)]" : "text-[var(--ink-mute)]",
                )}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
