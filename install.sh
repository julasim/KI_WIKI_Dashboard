#!/usr/bin/env bash
# install.sh — Erst-Installation Dashboard auf VPS
# Annahme: läuft als root oder sudo-User in /opt/KI_WIKI_Dashboard
# Verwendung:
#   cd /opt
#   git clone https://github.com/julasim/KI_WIKI_Dashboard.git KI_WIKI_Dashboard
#   cd KI_WIKI_Dashboard
#   bash install.sh

set -euo pipefail
cd "$(dirname "$0")"

echo "═══════════════════════════════════════════════"
echo "   KI-OS Dashboard — Erst-Installation"
echo "═══════════════════════════════════════════════"
echo

# ── 1. Vault-Pfad-Check ──
VAULT_PATH="/opt/vault/KI_WIKI_Vault"
if [ ! -d "$VAULT_PATH" ]; then
    echo "⚠️  Vault unter $VAULT_PATH nicht gefunden."
    echo "   Bot muss schon installiert sein (legt /opt/vault an)."
    echo "   Trotzdem fortfahren? [y/N]"
    read -r ans
    [[ "${ans,,}" == "y" ]] || exit 1
fi

# ── 2. Docker-Check ──
if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker nicht gefunden. Installiere docker + docker compose erst."
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    echo "❌ docker compose plugin nicht gefunden."
    exit 1
fi

# ── 3. Container bauen + starten ──
echo "──── Container bauen ────"
docker compose build

echo
echo "──── Starten ────"
docker compose up -d

echo
echo "──── Status ────"
docker compose ps

IP=$(hostname -I | awk '{print $1}')
echo
echo "✓ Dashboard läuft."
echo "  Lokal:    http://localhost:5001"
echo "  Network:  http://$IP:5001"
echo
echo "Update später mit: cd /opt/KI_WIKI_Dashboard && bash update.sh"
