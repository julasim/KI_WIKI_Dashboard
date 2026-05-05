# ─── Multi-stage Build für Next.js 16 mit standalone output ─────────
# Image-Größe ~180MB statt ~1GB.

# Stage 1: deps
FROM node:24-alpine AS deps
WORKDIR /build
COPY app/package.json app/package-lock.json* ./
# `npm install` (statt `npm ci`) regeneriert lock-file falls package.json
# neuer ist — robust gegenüber Out-of-Sync-Lock-Files. Sobald Lock-File
# stable ist, kann auf `npm ci` zurück.
RUN npm install --no-audit --no-fund

# Stage 2: builder
FROM node:24-alpine AS builder
WORKDIR /build
COPY --from=deps /build/node_modules ./node_modules
COPY app/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: runner (minimal)
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Projekt-Konvention: alle Container-Ports in 5xxx-Range
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

# Standalone-Output enthält Server + minimal node_modules
COPY --from=builder /build/.next/standalone ./
COPY --from=builder /build/.next/static ./.next/static
COPY --from=builder /build/public ./public

# Helper-Scripts (z.B. Password-Hash-Generator) + bcryptjs explizit
# damit `docker compose exec dashboard node scripts/hash-password.mjs PW` läuft.
COPY --from=builder /build/scripts ./scripts
COPY --from=builder /build/node_modules/bcryptjs ./node_modules/bcryptjs

# Läuft als root — Vault wird read-only gemountet (siehe docker-compose.yml),
# daher kein Write-Risiko. Non-root-User würde Permission-Probleme bringen
# da der Vault auf dem VPS root-owned ist.
EXPOSE 5000

CMD ["node", "server.js"]
