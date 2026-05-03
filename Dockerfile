# ─── Multi-stage Build für Next.js 16 mit standalone output ─────────
# Image-Größe ~180MB statt ~1GB.

# Stage 1: deps
FROM node:24-alpine AS deps
WORKDIR /build
COPY app/package.json app/package-lock.json ./
RUN npm ci --no-audit --no-fund

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
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root User für Sicherheit
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Standalone-Output enthält Server + minimal node_modules
COPY --from=builder --chown=nextjs:nodejs /build/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /build/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /build/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
