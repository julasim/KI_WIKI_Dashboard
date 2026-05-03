#!/usr/bin/env bash
# update.sh — Dashboard-Update auf VPS
# Verwendung: cd /opt/dashboard && bash update.sh

set -euo pipefail
cd "$(dirname "$0")"

echo "═══════════════════════════════════════════════"
echo "   KI-OS Dashboard — Update"
echo "═══════════════════════════════════════════════"
echo

if [ ! -d .git ]; then
    echo "❌ Kein Git-Repo. Verwende install.sh oder klone das Repo neu."
    exit 1
fi

# Verifiziere richtiges Repo (nicht aus Versehen Bot-Repo gepullt)
EXPECTED_REMOTE="julasim/KI_WIKI_Dashboard"
ACTUAL_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$ACTUAL_REMOTE" != *"$EXPECTED_REMOTE"* ]]; then
    echo "❌ FALSCHES REPO. Erwarte $EXPECTED_REMOTE."
    echo "   Origin ist: $ACTUAL_REMOTE"
    echo "   Fix: git remote set-url origin https://github.com/$EXPECTED_REMOTE.git"
    exit 1
fi

echo "──── Pull aus Git (Repo: $EXPECTED_REMOTE) ────"
BEFORE=$(git rev-parse HEAD)
git pull
AFTER=$(git rev-parse HEAD)

if [ "$BEFORE" = "$AFTER" ]; then
    echo "✓ Bereits auf neuestem Stand. Nichts zu tun."
    exit 0
fi

echo
echo "──── Änderungen ────"
git log --oneline "$BEFORE..$AFTER"

echo
echo "──── Container neu bauen + starten ────"
docker compose up -d --build

echo
echo "──── Status ────"
docker compose ps
echo
echo "✓ Dashboard läuft auf http://$(hostname -I | awk '{print $1}'):3001"
