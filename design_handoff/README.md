# Handoff: Personal OS — Dashboard & Architektur

## Overview

Ein persönliches Wissens- und Tracking-System ("Personal OS") mit zwei Lieferungen:

1. **Personal OS Dashboard** — Mobile-first Web-App mit 10 Seiten (Heute, Tasks, Projects, Project-Detail, Habits, Sport, Wins, Reading, Goals). Liest lokale Markdown-Files mit YAML-Frontmatter aus `/vault/`.
2. **Personal OS Architektur** — Statisches Poster-Diagramm zur 4-Schichten-Architektur (Kern · Mittelring · Aussenring · Frontends). Dient nur als Doku-Asset.

Die Datenquelle ist immer der gleiche Obsidian-Vault — Markdown + YAML-Frontmatter, zusätzlich Wikilinks.

## About the Design Files

Die Dateien unter `design/` sind **Design-Referenzen, in HTML/JSX als Prototypen erstellt**. Sie zeigen Look-and-Feel, Layout, Interaktionen und die genauen Datenformen — sie sind **kein Production-Code zum direkten Kopieren**. Die Aufgabe ist, diese Designs im Ziel-Stack (Next.js 15 + TypeScript + Tailwind + shadcn/ui + Recharts) sauber neu aufzubauen, mit den dort etablierten Patterns.

Mock-Daten in `dashboard/data.jsx` sind als Schema-Referenz gemeint — die Felder dort entsprechen 1:1 dem YAML-Frontmatter, das aus dem Vault gelesen werden soll.

## Fidelity

**High-fidelity (hifi).** Farben, Typografie, Spacing, Statuszustände, Charts und Interaktionen sind final entworfen. Pixel-genau in shadcn/ui umsetzen.

## Tech-Stack (Ziel)

- Next.js 15 (App Router, Server Components wo sinnvoll)
- TypeScript strict
- Tailwind CSS
- shadcn/ui (Card, Button, Tabs, Badge, Progress, Dialog, ScrollArea, Separator)
- Recharts für Charts
- `gray-matter` + `remark` zum Lesen der Vault-Files
- `chokidar` (oder Next.js File-Watcher) für Live-Reload bei Vault-Änderungen
- Datenquelle: lokale Markdown-Files unter `vault/` mit YAML-Frontmatter

## Vault-Struktur (Datenquelle)

```
vault/
├── 00_Inbox/
├── 01_Daily/                       # YYYY-MM-DD.md
├── 05_Projects/
│   └── <slug>/
│       ├── README.md               # frontmatter: status, started, paused?, stack
│       ├── tasks/*.md
│       ├── notes/*.md
│       └── meetings/*.md
├── 10_Life/
│   ├── tasks/*.md                  # frontmatter: status, priority, due, project, context, recurrence
│   ├── habits/<YYYY-MM-DD>.md      # frontmatter: sport, lesen, schlaf, bildschirm, vision, wasser
│   ├── sport/<YYYY-MM-DD>.md       # frontmatter: art, dauer, notiz
│   └── tracker/
│       ├── wins.md                 # YAML-Liste: wins: [{date, saeule, text}]
│       └── books.md                # YAML-Liste: books: [{title, author, status, progress, ...}]
├── 20_Goals/
│   ├── vision.md                   # frontmatter: stichtag, statement
│   └── saeulen/<saeule>.md         # 6 Säulen: gesundheit, finanzen, wissen, beziehungen, karriere, mindset
└── 99_Meta/
```

## Design-Tokens

### Farben (Light)

| Token | Hex | Verwendung |
|---|---|---|
| `--bg` | `#fafaf9` | Page-Hintergrund |
| `--bg-2` | `#f4f4f3` | Subtler Hintergrund (Nav-active, Progress-Track) |
| `--surface` | `#ffffff` | Cards |
| `--surface-2` | `#f8f8f7` | Hover, sekundäre Cards |
| `--border` | `rgba(20,20,18,0.08)` | Hairline-Borders |
| `--border-2` | `rgba(20,20,18,0.14)` | Stärkere Borders, Pills |
| `--ink` | `#18181b` | Text Primary |
| `--ink-2` | `#3f3f46` | Text Secondary |
| `--ink-mute` | `#71717a` | Tertiary, Mono-Labels |
| `--ink-soft` | `#a1a1aa` | Quartiär, leere Zustände |
| `--ok` | `#16a34a` | Status: erfüllt, abgeschlossen |
| `--warn` | `#d97706` | Status: Warnung, in-progress |
| `--bad` | `#dc2626` | Status: überfällig, blocked, drift |
| `--info` | `#2563eb` | Status: aktiv, links, today-marker |
| `--hm-empty` | `#ececea` | Heatmap leer |
| `--hm-skip` | `#e7e7e5` | Heatmap übersprungen |
| `--hm-ok` | `#18181b` | Heatmap erfüllt |
| `--hm-bad` | `#f5e6e6` | Heatmap nicht erfüllt (mit Border `#e6b4b4`) |
| `--hm-today` | `#2563eb` | Heatmap-Zelle Heute (Outline 2px) |

### Farben (Dark)

| Token | Hex |
|---|---|
| `--bg` | `#0c0c0d` |
| `--bg-2` | `#131315` |
| `--surface` | `#161618` |
| `--surface-2` | `#1c1c1f` |
| `--border` | `rgba(255,255,255,0.08)` |
| `--border-2` | `rgba(255,255,255,0.14)` |
| `--ink` | `#fafafa` |
| `--ink-2` | `#d4d4d8` |
| `--ink-mute` | `#a1a1aa` |
| `--ink-soft` | `#71717a` |
| `--ok / --warn / --bad / --info` | `#34d399 / #fbbf24 / #f87171 / #60a5fa` |

Status-Soft-BGs werden über `color-mix(in oklab, var(--<status>) 14%, transparent)` erzeugt (siehe `.bg-ok-soft` etc.).

### Typografie

- **Sans:** Geist (300/400/450/500/600/700) — `font-feature-settings: "ss01", "cv11"`
- **Mono:** Geist Mono (400/500) — `font-feature-settings: "tnum", "zero"` für Zahlen
- **Display-Tracking:** `letter-spacing: -0.025em` bei großen Headlines, `-0.03em` bei Hero
- **Eyebrow:** Mono, 10.5 px, `letter-spacing: 0.06em`, Color `--ink-mute`

### Spacing & Radii

- Card-Radius: `12px`
- Button-Radius: `10px`, Pill: `999px`, Heatmap-Zelle: `4px`
- Card-Padding: `p-5` mobile / `p-6` desktop
- Section-Gap: `gap-4` mobile / `gap-5` desktop, `mb-6 md:mb-8` zwischen Sektionen

### Atome (siehe `dashboard/Personal OS Dashboard.html` `<style>`-Block)

- `.card` — Cards
- `.pill`, `.pill-solid` — Mono-Tags mit optionalem Dot
- `.btn`, `.btn-ghost` — 36 px hoch
- `.nav-item` — Sidebar-Items, 36 px hoch
- `.eyebrow` — Mono-Sektionslabel
- `.num-mono` — Tabular-Mono für Zahlen
- `.progress` / `.progress > i` — 4 px Bar
- `.hm-cell` mit Modifiern `.ok / .bad / .skip / .today`
- `.hairline`, `.hairline-2` — Border-Color-Helper

## Screens

### Shell

- **Desktop (md+):** Linke Sidebar 224 px (Logo, Nav, Stichtag-Footer), rechte Content-Spalte mit Max-Breite ~1100 px.
- **Mobile (< md):** Top-Bar (Logo + Theme-Toggle), Bottom-Nav fixed, horizontal scrollbar (`overflow-x-auto`, `no-scrollbar`), 8 Items à 72 px Breite.
- **Routing:** Hash-basiert. `#today | #tasks | #projects | #project/<slug> | #habits | #sport | #wins | #reading | #goals`.
- **Theme:** Light/Dark, Toggle persistiert in `localStorage`. Default = system.

### 1 · Heute

- **Hero:** Datum (lang, deutsch) + Wochentag, Streak-Badge, Tage-bis-Stichtag.
- **Vision-Card:** Zitat in Geist 450, mit kleinem `eyebrow` "Vision · 5-Jahres-Anker".
- **Quick-Cards 2×2:** Tasks heute · Erinnerungen · Habits-Preview · Sport letzter Eintrag.
- **Yesterday-Recap:** Mini-Liste mit erfülltem/nicht erfülltem Habit-Status.

### 2 · Tasks

- Filter-Tabs: alle / heute / überfällig / blocked / inbox.
- Gruppierung wählbar: Datum · Projekt · Priorität (Segmented).
- Zeile: Checkbox · Titel · Pills (Projekt, Kontext `@home`/`@computer`, Priorität, Recurrence) · Datum.
- Klick auf Projekt-Pill → `#project/<slug>`.
- Schema: `status: open|in-progress|blocked|done`, `priority: 1|2|3`, `due: ISO`, `project: <slug>`, `context: @<tag>`, `recurrence: daily|weekly|monthly|null`.

### 3 · Projects

- Drei Sektionen: Aktiv · Pausiert · Archiv.
- Project-Card: Name, Status-Dot, Stack-Pills, Live-Counts (Tasks open/in-progress/blocked), Drift-Counter (überfällige Tasks, rot), letzte Aktivität.
- Sub-Project-Indent (1× `↳`).

### 4 · Project-Detail (`#project/<slug>`)

- Top: Breadcrumb (← Projects), Titel, Status-Pill, Stat-Strip (Tasks total/open/blocked, Notes count, last touch).
- Tabs: Tasks · Notes · Meetings.
- Sidebar (md+): Vault-Pfad (mono), Stack, Started/Paused-Daten.

### 5 · Habits

- 30-Tage-Heatmap, 6 Zeilen × 30 Spalten. Heute mit blauem Outline.
- Legende oben rechts: ok · bad · skip.
- Pro Zeile: Habit-Label + Target + Streak-Counter rechts.
- Klick auf Zelle → öffnet Tag-Detail (Phase-4-Modal, jetzt nur Tooltip).

### 6 · Sport

- 12-Wochen-Bar-Chart (stacked: cardio + kraft), Recharts.
- Top-Stats: Sessions diese Woche · Distanz Monat · Längster Streak.
- Log-Liste, neueste oben, mit Datum, Art (Pill), Dauer, Notiz.

### 7 · Wins

- Stat-Cards: Wins 30 d · Stärkste Säule · Quelle (vault/...).
- Filter-Pills: Alle + 6 Säulen mit Counter.
- Liste: `MM-DD · Text · Säule-Pill`. Border-bottom hairline pro Eintrag.

### 8 · Reading

- 4 Stat-Cards: Bücher Jahr/Soll · Aktuell · Ø min/Tag · Streak (Tage ≥ 15 min).
- 30-Tage-Lese-Minuten-Chart mit gestrichelter Soll-Linie bei 30 min.
- Drei Sektionen mit Karten: Lese gerade · Geplant · Gelesen. Karte zeigt Progress-Bar, Daten, Notiz.

### 9 · Goals

- 6 Säulen-Karten (Gesundheit · Finanzen · Wissen · Beziehungen · Karriere · Mindset), je mit Status-Dot, KPI, Drift-Counter, kurzer Notiz, "letztes Update".
- Vision-Banner oben mit Stichtag-Countdown.

## Interaktionen

- **Hash-Routing** mit `popstate`/`hashchange`. Initial-Route aus `location.hash.slice(1)`.
- **Theme-Toggle** togglet Class auf `html`. Persist in `localStorage.theme`.
- **Tabs/Filter:** lokaler `useState`, kein URL-State (außer Project-Detail).
- Keine Animationen außer Tailwinds Standard-Transitions (`.12s` Hover, `.15s` Border).

## Komponenten-Mapping (HTML-Prototyp → shadcn)

| Prototyp | shadcn/ui |
|---|---|
| `.card` | `<Card>` |
| `.pill` | `<Badge variant="outline">` (mono Font-Override) |
| `.btn` | `<Button variant="outline" size="sm">` |
| `.nav-item` | Custom mit `cn()` + `usePathname` |
| Tabs (Filter, Project-Detail) | `<Tabs>` |
| Progress | `<Progress>` |
| Sport-Chart | `<BarChart stackId>` (Recharts) |
| Reading-Chart | Custom (CSS-Bars, da nur 30 Punkte; alternativ Recharts) |
| Heatmap | Custom CSS-Grid (kein Recharts) |
| Tag-Detail (Phase 4) | `<Dialog>` |

## Datei-Übersicht

```
design_handoff_personal_os/
├── README.md                                  ← du bist hier
└── design/
    ├── Personal OS Dashboard.html             ← Shell, Style-Tokens, Script-Loader
    ├── Personal OS Architektur.html           ← Architektur-Poster (statisch)
    └── dashboard/
        ├── app.jsx                            ← Routing, Theme, PageMap
        ├── data.jsx                           ← Mock-Daten + Schema-Referenz
        ├── icons.jsx                          ← SVG-Icon-Set (Ic.Home etc.)
        ├── shell.jsx                          ← Sidebar + BottomNav + TopBar + Page-Wrapper
        ├── page-today.jsx
        ├── page-tasks.jsx
        ├── page-projects.jsx
        ├── page-project-detail.jsx
        ├── page-habits.jsx
        ├── page-sport.jsx
        ├── page-wins.jsx
        ├── page-reading.jsx
        └── page-goals.jsx
```

`data.jsx` ist die wichtigste Schema-Referenz: Jede Konstante (`HABIT_KEYS`, `SPORT_SESSIONS`, `TASKS_ALL`, `PROJECTS`, `WINS`, `BOOKS`, `SAEULEN`, `DRIFT`, `READING_MINUTES_30D`) entspricht einem Vault-Quellpfad. Den Reader gegen den realen Vault austauschen, Schema 1:1 übernehmen.

## Empfohlene Implementierungs-Reihenfolge

1. Tokens nach Tailwind-Config + globalem CSS portieren.
2. shadcn-Komponenten (Card, Button, Badge, Tabs, Progress, Dialog) installieren.
3. `lib/vault.ts` — Reader für Markdown + YAML, mit Watch.
4. Shell + Routing (App Router, parallele Routes für Modal optional).
5. Pages in obiger Reihenfolge, jede gegen echtes Vault-Lesen verifizieren.
6. Charts (Recharts für Sport, custom für Heatmap & Reading).
7. Theme-Toggle + Persist.

## Assets

- Fonts: Geist + Geist Mono via Google Fonts (oder `next/font/google`).
- Icons: Inline-SVGs in `dashboard/icons.jsx`. Alternative: Lucide React (passt visuell, gleiches Stroke-Width 1.5).

Keine Bild-Assets, keine Brand-Assets — bewusst monochrom.
