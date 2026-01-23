# Palette de Couleurs - Portfolio E-CV Interactif

## 🎨 Palette Principale

### Fonds et Arrière-plans
- **Fond principal** : `#FFFFFF` (Blanc pur)
- **Fond secondaire** : `#F9FAFB` (Gray-50 - Gris très clair)
- **Dégradé de fond** : `from-gray-50 via-white to-gray-50`
- **Fond Hero** : `from-white via-gray-50/50 to-white`

### Textes
- **Texte principal** : `#111827` (Gray-900 - Gris très foncé)
- **Texte secondaire** : `#374151` (Gray-700 - Gris foncé)
- **Texte tertiaire** : `#4B5563` (Gray-600 - Gris moyen)
- **Texte quaternaire** : `#6B7280` (Gray-500 - Gris clair)
- **Texte discret** : `#9CA3AF` (Gray-400 - Gris très clair)

### Accents et Couleurs Vives
- **Bleu principal** : `#2563EB` (Blue-600)
- **Cyan principal** : `#06B6D4` (Cyan-500)
- **Dégradé accent** : `from-blue-600 via-cyan-500 to-blue-600`
- **Bleu clair** : `#3B82F6` (Blue-500)
- **Cyan clair** : `#22D3EE` (Cyan-400)

### Éléments de fond subtils
- **Bleu très clair** : `#DBEAFE` (Blue-100) avec opacité 30%
- **Cyan très clair** : `#CFFAFE` (Cyan-100) avec opacité 30%

### Bordures
- **Bordure principale** : `rgba(229, 231, 235, 0.5)` (Gray-200 avec 50% d'opacité)
- **Bordure glassmorphism** : `rgba(255, 255, 255, 0.8)` à `rgba(255, 255, 255, 0.95)`

## 🔮 Glassmorphism

### Niveaux d'opacité et flou

#### `.glass` (Niveau standard)
- **Background** : `rgba(255, 255, 255, 0.7)` - 70% d'opacité
- **Backdrop blur** : `40px`
- **Saturation** : `180%`
- **Bordure** : `rgba(255, 255, 255, 0.8)`

#### `.glass-white` (Niveau maximum)
- **Background** : `rgba(255, 255, 255, 0.9)` - 90% d'opacité
- **Backdrop blur** : `60px`
- **Saturation** : `200%`
- **Bordure** : `rgba(255, 255, 255, 0.95)`

#### `.glass-strong` (Niveau renforcé)
- **Background** : `rgba(255, 255, 255, 0.85)` - 85% d'opacité
- **Backdrop blur** : `50px`
- **Saturation** : `180%`
- **Bordure** : `rgba(255, 255, 255, 0.9)`

#### `.glass-light` (Niveau léger)
- **Background** : `rgba(255, 255, 255, 0.5)` - 50% d'opacité
- **Backdrop blur** : `30px`
- **Saturation** : `180%`
- **Bordure** : `rgba(255, 255, 255, 0.6)`

#### `.glass-card` (Pour les cartes)
- **Background** : `rgba(255, 255, 255, 0.75)` - 75% d'opacité
- **Backdrop blur** : `45px`
- **Saturation** : `180%`
- **Bordure** : `rgba(255, 255, 255, 0.85)`

## 📐 Ombres (Box Shadows)

### Ombres Glassmorphism
- **Ombre standard** : `0 8px 32px 0 rgba(0, 0, 0, 0.1)`
- **Ombre renforcée** : `0 8px 32px 0 rgba(0, 0, 0, 0.12)`
- **Ombre maximale** : `0 20px 60px 0 rgba(0, 0, 0, 0.15)`
- **Ombre légère** : `0 4px 16px 0 rgba(0, 0, 0, 0.08)`
- **Ombre carte** : `0 12px 40px 0 rgba(0, 0, 0, 0.1)`

### Ombres internes (Inset)
- **Inset standard** : `inset 0 1px 0 0 rgba(255, 255, 255, 0.9)`
- **Inset renforcé** : `inset 0 1px 0 0 rgba(255, 255, 255, 0.95)`
- **Inset maximum** : `inset 0 1px 0 0 rgba(255, 255, 255, 1)`
- **Inset léger** : `inset 0 1px 0 0 rgba(255, 255, 255, 0.7)`

## 🎯 Utilisation par Composant

### Header
- Fond : `.glass` (blanc 70% opacité)
- Bordure : `border-gray-200/50`
- Texte : `gray-900`, `gray-700`
- Hover : `bg-white/60`

### Hero
- Fond : Dégradé blanc/gris très clair
- Titre principal : `gray-900`
- Titre accent : Dégradé `blue-600 → cyan-500 → blue-600`
- Sous-titre : `gray-600`, `gray-500`
- Boutons : `.glass-white` avec texte `gray-900`

### Cartes de Projets
- Fond : `.glass-card` (blanc 75% opacité)
- Titre : `gray-900` avec hover `blue-600`
- Description : `gray-600`
- Tags : `.glass-light` avec texte `gray-700`
- Bordures : `gray-200/50`

### Barre de Filtres
- Conteneur : `.glass-white` (blanc 90% opacité)
- Texte : `gray-900`, `gray-700`, `gray-600`
- Filtres actifs : `.glass-white`
- Filtres inactifs : `.glass-light`

### Dynamic Island
- Fond : `.glass-white` (blanc 90% opacité)
- Icône : Dégradé `blue-500 → cyan-500`
- Texte : `gray-900`, `gray-700`, `gray-500`
- Input : `.glass-light` avec bordure `gray-200/50`

## 📊 Résumé des Couleurs Hexadécimales

| Couleur | Hex | Utilisation |
|---------|-----|-------------|
| Blanc | `#FFFFFF` | Fond principal |
| Gris très clair | `#F9FAFB` | Fond secondaire |
| Gris foncé | `#111827` | Texte principal |
| Gris moyen | `#374151` | Texte secondaire |
| Gris clair | `#4B5563` | Texte tertiaire |
| Bleu | `#2563EB` | Accents principaux |
| Cyan | `#06B6D4` | Accents secondaires |
| Bleu clair | `#3B82F6` | Icônes, boutons |
| Cyan clair | `#22D3EE` | Dégradés |

## 🎨 Style Global

Le design utilise une **palette minimaliste et épurée** inspirée d'Apple :
- **Dominante** : Blanc et gris très clairs
- **Accents** : Bleu et cyan pour les éléments interactifs
- **Glassmorphism** : Effet de verre avec différents niveaux d'opacité
- **Contraste** : Texte gris foncé sur fond blanc pour une excellente lisibilité
