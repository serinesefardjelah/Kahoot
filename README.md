# Kahoot Clone — Ionic / Angular / Firebase

Application mobile de quiz inspirée de Kahoot, développée avec **Ionic 8**, **Angular 21** et **Firebase** (Firestore + Authentication). Compatible web, Android et iOS via Capacitor.

---

## Prérequis

- [Node.js](https://nodejs.org/) >= 18
- npm >= 9
- [Ionic CLI](https://ionicframework.com/docs/cli) : `npm install -g @ionic/cli`
- Pour Android : Android Studio + JDK 17
- Pour iOS : Xcode 14+ (macOS uniquement)

---

## Installation

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd kahoot

# Installer les dépendances
npm install
```

---

## Lancer le projet

### Web (navigateur)

```bash
npm start
# ou
ionic serve
```

L'application est accessible sur [http://localhost:8100](http://localhost:8100).

### Android

```bash
# Compiler et synchroniser
ionic build
npx cap sync android

# Ouvrir dans Android Studio
npx cap open android
```

Lancer ensuite l'application depuis Android Studio sur un émulateur ou un appareil physique.

### iOS (macOS uniquement)

```bash
ionic build
npx cap sync ios
npx cap open ios
```

Lancer depuis Xcode sur un simulateur ou un appareil physique.

---

## Configuration Firebase

Le projet utilise Firebase pour l'authentification et la base de données Firestore.
La configuration se trouve dans [src/environments/environment.ts](src/environments/environment.ts).

Pour utiliser votre propre projet Firebase :

1. Créer un projet sur [console.firebase.google.com](https://console.firebase.google.com)
2. Activer **Authentication** (Email/Password et Google)
3. Activer **Firestore Database**
4. Remplacer les valeurs dans `src/environments/environment.ts` et `environment.prod.ts` par celles de votre projet

---

## Structure du projet

```
src/
├── app/
│   ├── auth/             # Pages login, register, mot de passe oublié
│   ├── components/       # Composants réutilisables (header, quiz card)
│   ├── game/             # Page rejoindre une partie
│   ├── models/           # Interfaces TypeScript (Quiz, Question, Choice, Game)
│   ├── modals/           # Modal de création de quiz
│   ├── quiz/             # Liste et édition de quiz
│   ├── services/         # AuthService, QuizService, UserService
│   ├── app.component.ts  # Composant racine
│   ├── app.routes.ts     # Routes avec guard d'authentification
│   └── main.component.ts # Interface à onglets principale
├── environments/         # Configuration Firebase par environnement
├── assets/               # Ressources statiques
└── theme/                # Variables SCSS globales
```

---

## Scripts disponibles

| Commande       | Description                        |
|----------------|------------------------------------|
| `npm start`    | Serveur de développement web       |
| `npm run build`| Build de production (dossier `www/`)|
| `npm test`     | Tests unitaires (Karma + Jasmine)  |
| `npm run lint` | Analyse statique du code (ESLint)  |

---

## Technologies utilisées

- **Ionic 8** — UI mobile
- **Angular 21** — Framework (architecture standalone)
- **Firebase** — Auth + Firestore
- **Capacitor 8** — Accès aux APIs natives iOS/Android
- **Cypress** — Tests end-to-end

---

## Licence

MIT — Copyright 2026 Sylvain DEDIEU
