"""
Django settings for portfolio chatbot.
"""

import os
from pathlib import Path

def _load_env_file():
    env_path = Path(__file__).resolve().parent.parent / '.env'
    if not env_path.exists():
        return
    try:
        from dotenv import load_dotenv
        load_dotenv(env_path)
    except ImportError:
        # Fallback : lecture manuelle du fichier .env
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, _, value = line.partition('=')
                os.environ.setdefault(key.strip(), value.strip())

_load_env_file()

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Sécurité — toutes ces valeurs DOIVENT venir des variables d'environnement ──

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    raise RuntimeError(
        "La variable d'environnement DJANGO_SECRET_KEY n'est pas définie. "
        "Vérifiez votre fichier .env ou les variables d'environnement du serveur."
    )

DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'

_allowed_hosts = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1')
ALLOWED_HOSTS = [h.strip() for h in _allowed_hosts.split(',') if h.strip()]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'chatbot',
    'accounts',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Europe/Paris'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_URL = "/accounts/login/"
LOGIN_REDIRECT_URL = "/accounts/profile/"
LOGOUT_REDIRECT_URL = "/accounts/login/"

# ── CORS ──────────────────────────────────────────────────────────────
_cors_origins = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173'
)
CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_origins.split(',') if o.strip()]
CORS_ALLOW_CREDENTIALS = True

# ── Gemini (via l'API compatible OpenAI) ──────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite")

# Optionnelle : uniquement pour la modération OpenAI (gratuite)
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

OPENAI_MAX_TOKENS_PER_SESSION = 15000
OPENAI_MAX_MESSAGES_PER_SESSION = 50
OPENAI_MAX_HISTORY_MESSAGES = 5
OPENAI_MAX_MESSAGE_LENGTH = 500

OPENAI_SYSTEM_MESSAGE = """Assistant du portfolio de Loris Lorenzini. Réponses courtes et professionnelles."""

# ── Multi-chatbots : profil portfolio ─────────────────────────────────
CHATBOT_PROFILES = {
    "portfolio": {
        "name": "Assistant Portfolio",
        "memory_enabled": True,
        "system_message": """Tu es l'assistant virtuel du portfolio de Loris Lorenzini, développeur web full stack.

INFORMATIONS SUR LORIS :
- Diplômé du B.U.T. MMI (Métiers du Multimédia et de l'Internet), parcours Développement Web, à l'IUT de Saint-Dié-des-Vosges (2024-2026)
- Précédemment en Licence Informatique à la FST de Nancy (2023-2024)
- Admis au Mastère CTO & Tech Lead à l'école HETIC (Paris), rentrée 2026
- RECHERCHE ACTIVEMENT UNE ALTERNANCE pour accompagner ce Mastère (rythme alternant, région parisienne ou télétravail). C'est son objectif prioritaire : si un visiteur semble être un recruteur ou évoque un recrutement, mets cette recherche en avant et invite-le à le contacter.
- Basé à Moyenmoutier, France
- Contact : lorislorenzini@outlook.com
- GitHub : github.com/loris-lrnzn
- LinkedIn : linkedin.com/in/loris-lorenzini

COMPÉTENCES TECHNIQUES :
- Back-end : PHP 8, Symfony 6/7 (MVC, Doctrine ORM, API Platform), conception d'API REST
- Front-end : React, Vue.js 3, TypeScript, Tailwind CSS, JavaScript ES6+, HTML5, CSS3
- Base de données : MySQL, modélisation relationnelle, requêtes optimisées
- Outils & Méthodes : Git/GitHub, Docker, Figma, VS Code

PROJET UNIVERSITAIRE :
1. Plateforme de gestion d'adhérents JSP (Client Réel) — Développement Back-end avec Symfony 7 : API REST et interface administrateur pour le suivi des dossiers, cours, planning et quizs. Technologies : Symfony 7, API REST, MySQL, Twig.

PROJET PERSONNEL :
2. Judodex (projet personnel, judodex.vercel.app) — Carnet d'apprentissage du judo : 104 techniques décomposées (kuzushi, tsukuri, kake), programme officiel de passage de grade FFJDA, révisions espacées (système de Leitner) et application installable fonctionnant hors ligne. Technologies : React 19, TypeScript strict, Tailwind CSS 4, Vite, Vitest (119 tests), Playwright, PWA, déploiement Vercel.

PROJET PROFESSIONNEL :
3. Écosystème web — Clinique SMR La Louvière (Stage DSI, 2026) — Écosystème web complet mis en production pour l'établissement : site public (React/Vite), CMS sur mesure avec API d'administration (Symfony), espace pro sécurisé par SSO (React 19 + Keycloak), annuaire interne (Symfony) et chatbot RAG (Django + LangChain + ChromaDB). Déploiement Ubuntu/Apache/MySQL/Docker. C'est son projet le plus complet et le plus représentatif de son niveau : mets-le en avant en priorité.

EXPÉRIENCES :
- Stage de développement web à la DSI de la Clinique La Louvière (2026) — Conception et mise en production d'un écosystème web complet : site public (React/Vite), CMS et API d'administration (Symfony), espace pro sécurisé (React 19 + Keycloak SSO), annuaire (Symfony) et chatbot RAG (Django + LangChain + ChromaDB). Le tout déployé sur un serveur Ubuntu avec Apache (vhosts multi-ports), MySQL et Docker. Rédaction d'un document de passation complet pour la reprise par l'équipe.
- Manutentionnaire polyvalent aux Papeteries Clairefontaine (étés 2022, 2024, 2025) — Rigueur, travail d'équipe, autonomie

AUTRES :
- Langues : Français (langue maternelle), Anglais (niveau B2 technique)
- Intérêts : Judo (Diplôme d'animateur suppléant)

RÈGLES :
- Réponds en français, de manière concise et professionnelle
- Si on te demande des informations qui ne sont pas dans ton contexte, dis que tu ne sais pas
- Sois enthousiaste mais authentique sur les compétences de Loris
- Ne partage jamais son numéro de téléphone

NAVIGATION — TRÈS IMPORTANT :
Quand ta réponse mentionne une section du site ou un projet, ajoute UNE balise d'action à la fin (avant les suggestions).
Formats possibles :
- [action:anchor:about] → scrolle vers la section "À propos"
- [action:anchor:services] → scrolle vers la section "Services"
- [action:anchor:skills] → scrolle vers la section "Compétences"
- [action:anchor:projects] → scrolle vers la section "Projets"
- [action:project:1] → ouvre le projet "Plateforme de gestion d'adhérents JSP"
- [action:project:2] → ouvre le projet "JudoDex"
- [action:project:3] → ouvre le projet "Écosystème web — Clinique SMR La Louvière"

N'utilise qu'UNE seule balise [action:...] par réponse, celle la plus pertinente.
Si la question ne concerne pas une section précise, n'ajoute pas de balise action.""",
        "context_rules": {
            "time_rules": [
                {"hours": (6, 12), "instruction": "Nous sommes le matin. Commence par un bonjour chaleureux."},
                {"hours": (12, 14), "instruction": "C'est l'heure du déjeuner. Sois bref."},
                {"hours": (18, 23), "instruction": "Nous sommes en soirée. Adopte un ton détendu."},
                {"hours": (23, 6), "instruction": "Il est tard. Sois concis."},
            ],
            "conversation_rules": [
                {"condition": "first_message", "instruction": "C'est le premier message du visiteur. Présente-toi brièvement comme l'assistant du portfolio de Loris."},
                {"condition": "returning_after_reset", "instruction": "Le visiteur revient après une absence. Accueille-le à nouveau."},
                {"condition": "has_summary", "instruction": "La conversation est longue. Reste focalisé sur le sujet."},
                {"condition": "tokens_low", "threshold": 0.75, "instruction": "La session approche de sa limite. Donne des réponses très concises."},
                {"condition": "messages_high", "threshold": 0.80, "instruction": "Beaucoup de messages échangés. Essaie de conclure."},
            ],
            "extra_instructions": "Tu peux terminer ta réponse avec [suggestions: Option A | Option B | Option C] pour proposer 2-3 réponses rapides au visiteur. Utilise-le quand c'est pertinent, pas systématiquement.",
        },
    },
}
CHATBOT_DEFAULT = "portfolio"
CHATBOT_URL_PREFIX = "/chatbot"
CHATBOT_TIMEZONE = "Europe/Paris"

CHATBOT_MODERATION_ENABLED = True
CHATBOT_MODERATION_MESSAGE = "Votre message a été bloqué car il enfreint nos règles d'utilisation."

CHATBOT_SUMMARY_THRESHOLD = 6

CHAT_INACTIVITY_TIMEOUT_SECONDS = 1800

CHATBOT_RATELIMIT_CHAT_REQUESTS = 10
CHATBOT_RATELIMIT_STATUS_REQUESTS = 60
CHATBOT_RATELIMIT_WINDOW = 60

CHATBOT_MEMORY_ENABLED = True
CHATBOT_MEMORY_EXTRACT_EVERY = 3
CHATBOT_MEMORY_MAX_PER_USER = 50
CHATBOT_MEMORY_MAX_INJECTED = 20
CHATBOT_MEMORY_COOKIE_MAX_AGE = 365 * 24 * 3600
CHATBOT_MEMORY_COOKIE_SECURE = not DEBUG

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "chatbot": {
            "format": "[%(asctime)s] %(levelname)s %(name)s: %(message)s",
        },
    },
    "handlers": {
        "chatbot_console": {
            "class": "logging.StreamHandler",
            "formatter": "chatbot",
        },
    },
    "loggers": {
        "chatbot": {
            "handlers": ["chatbot_console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
