#!/usr/bin/env node
/**
 * Helper: Erzeugt einen bcrypt-Hash für ein Passwort + zeigt direkt
 * die docker-compose-safe Version (mit $$-Escape) zum Reinpasten in .env.
 *
 * Usage:
 *   docker compose exec dashboard node scripts/hash-password.mjs "deinpasswort"
 *   # oder lokal:
 *   node scripts/hash-password.mjs "deinpasswort"
 *
 * Output (Beispiel):
 *
 *   ── RAW HASH (zum Vergleich/Debug) ──────────────
 *   $2a$12$cX6DUwRxSJgCua6n7LmwIuVPb2eZktXJAfmwYG7d/VLRMuVVC3jU.
 *
 *   ── ZEILE FÜR .env (in /opt/dashboard/.env) ─────
 *   DASHBOARD_USER_PASSWORD_HASH=$$2a$$12$$cX6DUwRxSJgCua6n7LmwIuVPb2eZktXJAfmwYG7d/VLRMuVVC3jU.
 *
 * Warum das $$-Escape?
 *   docker-compose env_file interpretiert ein einzelnes `$` als Variable-
 *   Expansion. Aus `$2a$12$cX6DUwRx...` würde Compose `$cX6DUwRx...` als
 *   ENV-Variable suchen, nicht finden, und das Stück löschen → kaputter Hash.
 *   Mit `$$` umgeht Compose die Expansion und der Hash kommt 1:1 im Container an.
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  console.error('Example: node scripts/hash-password.mjs "MeinPasswort123"');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const escaped = hash.replace(/\$/g, "$$$$"); // $ → $$ für docker-compose env_file

console.log("");
console.log("── RAW HASH (zum Vergleich/Debug) ──────────────");
console.log(hash);
console.log("");
console.log("── ZEILE FÜR .env (in /opt/dashboard/.env) ─────");
console.log(`DASHBOARD_USER_PASSWORD_HASH=${escaped}`);
console.log("");
console.log(
  "  Diese Zeile EXAKT in /opt/dashboard/.env eintragen (überschreibt evtl.\n" +
    "  bestehende DASHBOARD_USER_PASSWORD_HASH-Zeile). Danach:\n" +
    "    cd /opt/ki-os && docker compose up -d --force-recreate dashboard",
);
console.log("");
