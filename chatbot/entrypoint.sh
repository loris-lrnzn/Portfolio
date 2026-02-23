#!/bin/bash
set -e

echo "[Django] Exécution des migrations..."
python manage.py migrate --noinput

echo "[Django] Démarrage de Gunicorn sur le port 8001..."
exec gunicorn --bind 0.0.0.0:8001 --workers 2 backend.wsgi:application
