// Shell — sidebar (desktop) + bottom nav (mobile), header, theme toggle.
const { useState, useEffect } = React;

const NAV = [
  { id: "today",    label: "Heute",    icon: "Home" },
  { id: "tasks",    label: "Tasks",    icon: "Check" },
  { id: "projects", label: "Projects", icon: "Folder" },
  { id: "habits",   label: "Habits",   icon: "Heart" },
  { id: "sport",    label: "Sport",    icon: "Run" },
  { id: "wins",     label: "Wins",     icon: "Flame" },
  { id: "reading",  label: "Reading",  icon: "Doc" },
  { id: "goals",    label: "Goals",    icon: "Target" },
];

function useHashRoute() {
  const [route, setRoute] = useState(() => (location.hash || "#today").slice(1));
  useEffect(() => {
    const fn = () => setRoute((location.hash || "#today").slice(1));
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return [route, (id) => { location.hash = "#" + id; }];
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("pos-theme");
    if (stored) return stored;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("pos-theme", theme);
  }, [theme]);
  return [theme, () => setTheme(t => t === "dark" ? "light" : "dark")];
}

function Sidebar({ route, go }) {
  return (
    <aside className="hidden md:flex flex-col w-[220px] shrink-0 h-screen sticky top-0 px-4 py-6 border-r hairline">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-7 h-7 rounded-md bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center text-[12px] font-mono">JS</div>
        <div>
          <div className="text-[13px] font-semibold leading-tight">Personal OS</div>
          <div className="text-[10.5px] text-[var(--ink-mute)] font-mono leading-tight">julius-sima.at</div>
        </div>
      </div>
      <div className="eyebrow mb-2 px-2">Workspace</div>
      <nav className="flex flex-col gap-0.5">
        {NAV.map(n => {
          const Icon = Ic[n.icon];
          const active = route === n.id || (n.id === "projects" && route.startsWith("project/"));
          return (
            <a key={n.id} href={"#" + n.id}
               className={"nav-item " + (active ? "active" : "")}>
              <Icon/>
              <span>{n.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t hairline">
        <div className="eyebrow mb-2 px-2">Vault</div>
        <div className="px-2 text-[11px] text-[var(--ink-mute)] font-mono leading-relaxed">
          /opt/vault/<br/>KI_WIKI_Vault/
        </div>
        <div className="px-2 mt-2 text-[10.5px] text-[var(--ink-soft)] font-mono">read-only · 218 files</div>
      </div>
    </aside>
  );
}

function MobileNav({ route }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t hairline bg-[var(--bg)]/90 backdrop-blur">
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex min-w-max">
          {NAV.map(n => {
            const Icon = Ic[n.icon];
            const active = route === n.id || (n.id === "projects" && route.startsWith("project/"));
            return (
              <a key={n.id} href={"#" + n.id}
                 className={"flex flex-col items-center justify-center gap-1 py-2.5 w-[72px] text-[9.5px] font-medium " +
                            (active ? "text-[var(--ink)]" : "text-[var(--ink-mute)]")}>
                <Icon/>
                <span>{n.label}</span>
              </a>
            );
          })}
        </div>
      </div>
      <div style={{ height: "env(safe-area-inset-bottom)" }}/>
    </nav>
  );
}

function TopBar({ title, sub }) {
  return (
    <header className="mb-8 md:mb-10 pr-12 md:pr-16">
      <div className="eyebrow mb-2">{sub}</div>
      <h1 className="display text-[34px] md:text-[44px] leading-[1.05]">{title}</h1>
    </header>
  );
}

function Page({ children }) {
  return (
    <main className="flex-1 min-w-0">
      <div className="max-w-[1180px] mx-auto px-5 md:px-10 pt-6 md:pt-10 pb-28 md:pb-12">
        {children}
      </div>
    </main>
  );
}

Object.assign(window, { useHashRoute, useTheme, Sidebar, MobileNav, TopBar, Page, NAV });
