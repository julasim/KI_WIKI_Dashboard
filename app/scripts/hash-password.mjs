#!/usr/bin/env node
/**
 * Helper: Erzeugt einen bcrypt-Hash für ein Passwort.
 *
 * Usage:
 *   node scripts/hash-password.mjs "mein-supergeheimes-passwort"
 *
 * Output:
 *   $2b$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *
 * Setze den Output dann in /opt/dashboard/.env als
 *   DASHBOARD_USER_PASSWORD_HASH=$2b$12$...
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log(hash);
