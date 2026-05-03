// App entry — wires routing, theme, and page selection.

function App() {
  const [route, go] = useHashRoute();
  const [theme, toggleTheme] = useTheme();

  // Wrap each page so we can pass theme into TopBar
  const pageMap = {
    today:    PageToday,
    tasks:    PageTasks,
    projects: PageProjects,
    habits:   PageHabits,
    sport:    PageSport,
    wins:     PageWins,
    reading:  PageReading,
    goals:    PageGoals,
  };
  let Current = pageMap[route] || PageToday;
  let detailSlug = null;
  if (route.startsWith("project/")) {
    detailSlug = route.slice("project/".length);
    Current = () => <PageProjectDetail slug={detailSlug}/>;
  }

  // Patch TopBar usage: each page renders TopBar without theme prop, so we
  // inject a global theme-toggle button via a tiny floating control on desktop.
  return (
    <div className="flex min-h-screen">
      <Sidebar route={route} go={go}/>
      <div className="flex-1 min-w-0 relative">
        {/* Floating theme toggle (desktop) */}
        <button
          onClick={toggleTheme}
          aria-label="Theme umschalten"
          className="hidden md:flex btn btn-ghost absolute top-6 right-6 md:top-10 md:right-10 z-20">
          {theme === "dark" ? <Ic.Sun/> : <Ic.Moon/>}
        </button>
        <Current/>
      </div>
      <MobileNav route={route}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
