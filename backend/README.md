# Backend Symfony - E-CV Interactif

## Installation

1. **Créer le fichier .env** :
```bash
cp .env.example .env
```

2. **Installer les dépendances** (déjà fait) :
```bash
composer install
```

3. **Créer la base de données** :
```bash
php bin/console doctrine:database:create
php bin/console doctrine:schema:update --force
```

4. **Ajouter des données de test** :
Visitez `http://localhost:8000/api/projects/seed` dans votre navigateur

5. **Démarrer le serveur** :
```bash
symfony server:start
# ou
php -S localhost:8000 -t public
```

## API Endpoints

- `GET /api/projects` - Liste de tous les projets
- `GET /api/projects/seed` - Ajoute des données de test

## Structure

- `src/Entity/Project.php` - Entité Project
- `src/Controller/ApiController.php` - Contrôleur API REST
