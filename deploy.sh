#!/bin/bash
set -e

# ═══════════════════════════════════════════════════════════════════
# Script de déploiement — Portfolio
# Usage : ./deploy.sh
# Prérequis VPS : git, docker, docker compose, node, npm
# ═══════════════════════════════════════════════════════════════════

echo "══════════════════════════════════════"
echo "  Déploiement du Portfolio"
echo "══════════════════════════════════════"

# Vérifier que .env.prod existe
if [ ! -f ".env.prod" ]; then
    echo "❌ Fichier .env.prod introuvable."
    echo "   Lance : cp .env.prod.example .env.prod puis remplis les valeurs."
    exit 1
fi

# 1. Récupérer le dernier code
echo ""
echo "→ [1/4] Récupération du code..."
git pull origin main

# 2. Builder le frontend
echo ""
echo "→ [2/4] Build du frontend React..."
cd frontend
npm ci --silent
npm run build
cd ..
echo "   ✓ Frontend buildé dans frontend/dist/"

# 3. Builder et (re)démarrer les conteneurs
echo ""
echo "→ [3/4] Build et démarrage des conteneurs Docker..."
docker compose -f docker-compose.prod.yml up -d --build
# Nginx garde en cache les IP des conteneurs : on le redémarre pour suivre ceux recréés
docker compose -f docker-compose.prod.yml restart nginx

# 4. Attendre que les services soient prêts
echo ""
echo "→ [4/4] Vérification des services..."
sleep 5
docker compose -f docker-compose.prod.yml ps

echo ""
echo "══════════════════════════════════════"
echo "  ✓ Déploiement terminé !"
echo "  Site accessible sur http://$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo "══════════════════════════════════════"
