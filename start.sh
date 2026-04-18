#!/bin/bash
set -e

echo "=========================================="
echo "🚀 Lancement SecureTask + DevSecOps"
echo "=========================================="

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "📁 Création des répertoires..."
mkdir -p devsecops/sonarqube/{data,logs,extensions,postgresql}

echo ""
echo "🐳 Construction de l'image Docker..."
docker compose build --no-cache

echo ""
echo "🐘🚀 Démarrage de l'infrastructure (DB + Redis)..."
docker compose up -d db redis

echo ""
echo "⏳ Attente PostgreSQL (15s)..."
sleep 15

echo ""
echo "🌐🚀 Démarrage de l'application FastAPI..."
docker compose up -d web-app

echo ""
echo "🛡️🚀 Démarrage SonarQube..."
docker compose -f docker-compose.devsecops.yml up -d

echo ""
echo "=========================================="
echo "       ✅ Tous les services sont UP!"
echo "=========================================="
echo ""
echo "🌍 Services disponibles:"
echo "   ├─ Application:      http://localhost:8000"
echo "   ├─ API FastAPI:      http://localhost:8000"
echo "   ├─ API Health:       http://localhost:8000/api/v1/health"
echo "   └─ SonarQube:        http://localhost:9000 (admin/admin)"
echo ""
echo "📋 Commandes utiles:"
echo "   logs app     → docker compose logs -f web-app"
echo "   logs sonar   → docker compose -f docker-compose.devsecops.yml logs -f"
echo "   stop         → docker compose down && docker compose -f docker-compose.devsecops.yml down"
echo ""
