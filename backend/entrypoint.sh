#!/bin/bash
set -e

echo "[Symfony] Nettoyage du cache..."
php bin/console cache:clear --env=prod --no-interaction

echo "[Symfony] Préchauffage du cache..."
php bin/console cache:warmup --env=prod --no-interaction

echo "[Symfony] Exécution des migrations..."
php bin/console doctrine:migrations:migrate --env=prod --no-interaction

echo "[Symfony] Démarrage du serveur sur le port 8000..."
exec php -S 0.0.0.0:8000 -t public/
