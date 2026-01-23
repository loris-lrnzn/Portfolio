# E-CV Interactif - Portfolio

Portfolio moderne avec React (frontend) et Symfony 7 (backend API REST).

## 🎨 Design

- **Style** : Dark Tech Modern
- **Couleurs** : Fond noir mat (#121212), touches de bleu électrique (#00D9FF)
- **Effets** : Glassmorphism (flou et transparence)
- **Animations** : Framer Motion pour les transitions fluides

## 📁 Structure du projet

```
Portfolio/
├── backend/          # Application Symfony 7 (API REST)
│   ├── src/
│   │   ├── Entity/   # Entité Project
│   │   └── Controller/ # Contrôleurs API
│   └── config/
├── frontend/         # Application React avec Tailwind CSS
│   ├── src/
│   │   ├── components/ # Composants React
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 📋 Prérequis

- PHP >= 8.2
- Composer
- Node.js >= 18
- npm ou yarn
- Base de données (PostgreSQL, MySQL ou SQLite)

## 🚀 Installation

### Backend (Symfony 7)

```bash
cd backend
composer install
```

### Frontend (React)

```bash
cd frontend
npm install
```

## ⚙️ Configuration

### Base de données

1. Configurez votre base de données dans `backend/.env` :
```env
DATABASE_URL="postgresql://user:password@127.0.0.1:5432/portfolio?serverVersion=13&charset=utf8"
```

2. Créez la base de données et les tables :
```bash
cd backend
php bin/console doctrine:database:create
php bin/console doctrine:schema:update --force
```

3. Ajoutez des données de test :
```bash
# Visitez http://localhost:8000/api/projects/seed dans votre navigateur
# ou utilisez curl :
curl http://localhost:8000/api/projects/seed
```

## 🎯 Démarrage

### Backend

Dans un terminal, depuis le dossier `backend` :

```bash
symfony server:start
# ou
php -S localhost:8000 -t public
```

Le backend sera accessible sur `http://localhost:8000`

### Frontend

Dans un autre terminal, depuis le dossier `frontend` :

```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

## 📡 API Endpoints

- `GET /api/projects` - Liste de tous les projets
- `GET /api/projects/seed` - Ajoute des données de test (à appeler une seule fois)

## 🎨 Fonctionnalités

### Backend
- ✅ Entité `Project` avec les champs : id, title, description, technology_tags, image_url, github_link
- ✅ Route API REST `GET /api/projects` retournant du JSON
- ✅ CORS configuré pour autoriser le frontend React
- ✅ Endpoint de seed pour ajouter des données de test

### Frontend
- ✅ Layout principal avec fond sombre (#121212)
- ✅ Composant `ProjectCard` avec effet glassmorphism
- ✅ Récupération des projets via l'API Symfony
- ✅ Barre chatbot fixe en bas avec effet glass
- ✅ Animations fluides avec Framer Motion
- ✅ Design responsive avec Tailwind CSS

## 🛠️ Technologies utilisées

### Backend
- Symfony 7
- Doctrine ORM
- Nelmio CORS Bundle

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- Lucide React (icônes)

## 📝 Prochaines étapes

- [ ] Ajouter l'authentification
- [ ] Implémenter le chatbot interactif
- [ ] Ajouter un système de filtres par technologies
- [ ] Créer une page de détail pour chaque projet
- [ ] Ajouter un formulaire de contact
- [ ] Optimiser les images
- [ ] Ajouter des tests unitaires
