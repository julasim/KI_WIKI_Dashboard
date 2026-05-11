# KI_WIKI_Dashboard — Read-only Web-UI

Next.js 16 App mit Auth.js-Login (Single-User). Liest aus dem KI_WIKI-Vault, schreibt **nicht** direkt — alle Mutations laufen über MCP-Server-Calls. Bietet Übersicht über Tasks, Habits, Daily-Log, Bücher, Goals.

> Hinweis: Spezifische Next.js-16-Konventionen (breaking-changes vs. Trainingsdaten) stehen in [`app/CLAUDE.md`](app/CLAUDE.md). Diese Datei hier deckt die Service-/Container-/Edge-Proxy-Ebene ab.

## Schlüssel-Dateien

| Datei | Was |
|---|---|
| `app/` | Next.js 16 App (siehe `app/CLAUDE.md` für Framework-Spezifika) |
| `Dockerfile` | Multi-Stage Build (deps → builder → runner) |
| `docker-compose.yml` | Standalone-Variante (falls Dashboard ohne KI_WIKI_Stack läuft) |
| `install.sh` / `update.sh` | Standalone-Setup/Update |
| `app/scripts/hash-password.mjs` | bcrypt-Hash-Generator für `DASHBOARD_USER_PASSWORD_HASH` |
| `app/lib/vault.ts` | Vault-Reader für lokale Hot-Paths (Habits/Sport-Tabellen) |
| `app/lib/mcp.ts` | MCP-Client für Vault-Mutations |

## Auth-Modell

Auth.js (NextAuth) mit Credentials-Provider:
- `DASHBOARD_USER_EMAIL` (frei wählbar, default `julius@sima.or.at`)
- `DASHBOARD_USER_PASSWORD_HASH` (bcrypt mit `$$`-Escape wegen docker-compose env_file parser)
- `NEXTAUTH_SECRET` für JWT-Signing

Login-Page als einzige unauthentifizierte Route. Alle anderen Routes redirecten zu `/login` ohne Session-Cookie.

## MCP-Anbindung

`MCP_BASE_URL` aus env, Default `http://ki-os-mcp:5002/mcp/` (interner Docker-Hostname). Token `MCP_TOKEN` muss mit dem von `KI_WIKI_MCP/.env` matchen.

**Wichtig:** NICHT die Public-URL `https://wiki-mcp.sima.business/mcp/` für Co-Stack-Deployment — Hairpin-NAT-Risiko. Standalone-Deployment darf TLS-URL nutzen.

## Container

- Im Stack als `ki-os-dashboard`, auf `default` + `proxy` networks
- Port `5001:5000` (direct exposed zusätzlich zu Caddy für lokal-Debug)
- Vault als Read-Only Volume gemounted (`/opt/vault/KI_WIKI_Vault:/vault:ro`)
- Healthcheck: GET `/api/health` (von Next.js)

## Edge-Proxy / Public-Reachability

Dashboard wird vom **edge-caddy** (Repo `julasim/Proxy`, deployed `/opt/Proxy/`) auf `wiki-dashboard.sima.business` exponiert:

```caddyfile
wiki-dashboard.sima.business {
    import html_security_headers
    reverse_proxy ki-os-dashboard:5000 { header_up X-Real-IP {remote_host} }
}
```

`html_security_headers` erlaubt `'unsafe-inline'` für Scripts/Styles (Next.js braucht das) und Google-Fonts. Strenger als das wäre Next.js-CSR kaputt.

**Goldene Regeln (Verstoß bricht andere Stacks auf VPS):**
- Kein eigener Caddy/Nginx mit `ports: "80:80"` im Dashboard-Compose
- Container-Name `ki-os-dashboard` nicht ändern — edge-caddy referenziert per Name
- `ki-os-dashboard` hängt an `default` (intern, für MCP-Calls) UND `proxy` (extern via Caddy)
- Public-URL `https://wiki-dashboard.sima.business` nutzt der User im Browser. Interne MCP-Calls bleiben auf `http://ki-os-mcp:5002/mcp/`.

Multi-Stack-Architektur-Details: `Proxy/CLAUDE.md` im Proxy-Repo.

## Häufige Fallen

- **bcrypt-Hashes mit `$`** in `.env` brauchen `$$`-Escape (siehe hash-password.mjs Output — der escaped automatisch)
- **`docker compose restart dashboard`** lädt env_file NICHT neu — für ENV-Changes `up -d --force-recreate dashboard`
- **MCP-Token-Mismatch** zwischen Dashboard- und MCP-`.env` führt zu 401 bei Vault-Mutations — Token via `python3 /opt/KI_WIKI_MCP/scripts/rotate_token.py` rotieren + alle 3 (Bot, MCP, Dashboard) syncen
- **Next.js 16 Build-Errors** als Warnings konfiguriert (siehe `next.config`) — TypeScript+ESLint blocken den Build nicht, da Dev-Velocity > Strict-Mode

## Tools-Surface

Dashboard ist Read-mostly. Wenige Write-Calls via MCP:
- `task` (mark done / reactivate)
- `goal_log` (manuelle Log-Einträge)
- `daily_briefing` (manueller Trigger)

Die UI-Surface ist allerdings groß: Habits-Heatmap, Sport-Charts, Task-Liste mit Filter, Book-Tracker, Daily-Frontmatter-Editor.
