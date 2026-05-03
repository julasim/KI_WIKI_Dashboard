# KI-OS Dashboard

Read-only Web-Dashboard für den KI-OS Personal-OS-Vault.

Zeigt Habits, Sport, Tasks, Projekte, Wins, Bücher, Goals visuell.
**Schreibt nichts** — Eingabe läuft über Telegram-Bot + Claude Code.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4
- Recharts (Sport-Charts)
- gray-matter (YAML Frontmatter Parser)
- lucide-react (Icons)

## Quickstart (lokal)

```bash
cd app
npm install         # Dependencies
npm run dev         # Dev-Server auf http://localhost:3000 (oder PORT=3001)
```

`.env.local`:
```
VAULT_PATH=Z:/vault/KI_WIKI_Vault
```

Auf VPS später: `VAULT_PATH=/opt/vault/KI_WIKI_Vault`.

## Routes

| Route | Page | Quelle |
|---|---|---|
| `/` | Today (Hero, Vision, Quick-Cards, Yesterday) | mehrere |
| `/tasks` | Task-Inventory mit Gruppierung | `10_Life/tasks/*.md` |
| `/projects` | Projekt-Übersicht | `05_Projects/*/README.md` |
| `/projects/[slug]` | Projekt-Detail | dito + Tasks |
| `/habits` | 30-Tage-Heatmap | `10_Life/goals/5y-2031/tracker/habits.md` |
| `/sport` | Bar-Chart 12 Wochen + Log | `tracker/sport-log.md` |
| `/wins` | Datums-gruppierte Liste | `tracker/wins.md` |
| `/reading` | Bücher (3 Sektionen) | `tracker/lesen.md` |
| `/goals` | Vision + Drift + 6 Säulen | `vision.md`, `readme.md` |

## Schema-Mapping (Real-Vault ↔ Reader)

Der Reader (`lib/vault.ts`) parsed unsere ECHTE Vault-Struktur — keine Per-Tag-Files für Habits/Sport, sondern Single-Files mit Markdown-Tabellen.

| Komponente | Vault-Datei | Format |
|---|---|---|
| Vision | `10_Life/goals/5y-2031/vision.md` | Manifesto-Block in Blockquote |
| Habits | `10_Life/goals/5y-2031/tracker/habits.md` | MD-Tabelle: Datum + 6 Spalten |
| Sport | `10_Life/goals/5y-2031/tracker/sport-log.md` | MD-Tabelle: Datum, Art, Dauer, Notiz |
| Wins | `10_Life/goals/5y-2031/tracker/wins.md` | `## YYYY-MM-DD` + Bullets |
| Bücher | `10_Life/goals/5y-2031/tracker/lesen.md` | 3 Sektionen mit Tabellen/Listen |
| Säulen | `10_Life/goals/5y-2031/readme.md` | Säulen-Tabelle |
| Drift | `10_Life/goals/5y-2031/readme.md` | "Letzter X-Anker:" Zeilen |
| Tasks | `10_Life/tasks/*.md` | YAML-Frontmatter |
| Projekte | `05_Projects/*/README.md` | YAML-Frontmatter |
| Reminders | `06_Meta/reminders.json` | JSON |

## Design

Vom Claude-Design-Handoff übernommen — Tokens (Light + Dark), Atome (`.card`, `.pill`, `.btn`, `.nav-item`, `.eyebrow`, `.hm-cell`) in `app/globals.css`.

Original-Handoff liegt unter `../design_handoff/` (Read-Only Reference).

## Deploy auf VPS

### Erst-Installation

```bash
cd /opt
git clone https://github.com/julasim/KI_WIKI_Dashboard.git dashboard
cd dashboard
bash install.sh
```

→ Dashboard läuft auf `http://<vps-ip>:3001`.

### Updates

```bash
cd /opt/dashboard
bash update.sh
```

`update.sh` verifiziert dass das **richtige Repo** gepullt wird (`julasim/KI_WIKI_Dashboard`, nicht das Bot-Repo), pullt nur wenn neue Commits da sind, baut den Container neu und startet ihn.

### Architektur auf VPS

```
/opt/
├── bot/            ← KI_WIKI_OS Repo (Bot-Container :8080)
├── dashboard/      ← KI_WIKI_Dashboard Repo (Dashboard-Container :3001)
└── vault/
    └── KI_WIKI_Vault/   ← read-write für Bot, read-only für Dashboard
```

Beide Container mounten den gleichen Vault — Bot schreibt, Dashboard liest.

## Status (2026-05-03)

✅ Setup + Tokens + Reader + 8 Pages
✅ Docker-Setup (Dockerfile + docker-compose.yml + install.sh + update.sh)
⏳ Auth (vorerst keine — local/VPS-IP only)
⏳ Erweiterte Features (Calendar via MS Graph, Read-Cache bei Performance-Bedarf)
