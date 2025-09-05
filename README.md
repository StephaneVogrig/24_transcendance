# 24_transcendence

*Réalisé par [Stéphanie Mortemousque](https://github.com/Stephmo1984), [Sébastien Craeymeersch](http://github.com/AgarOther), [Gaël Cannaud](https://github.com/Helco18) et [Stéphane Vogrig](https://github.com/StephaneVogrig).*


# Modules

✅ Major module: Use a framework to build the backend.

✅ Minor module: Use a framework or a toolkit to build the frontend.

✅ Minor module: Use a database for the backend.

✅ Major module: Implementing a remote authentication.

✅ Major module: Remote players.

✅ Major: Store the score of a tournament in the Blockchain.

✅ Major module: Introduce an AI opponent.

✅ Major: Use advanced 3D techniques.

✅ Major module: Designing the backend as microservices. *

✅ Minor module: Multiple language support.

✅ Major module: Replace basic Pong with server-side Pong and implement an API.

# Microservices
```
authentification
blockchain
database
games
matchmaking
tournament
websocket
```
# Architecture

```
└── proxy					# point d'entrée unique
	├── frontend
	└── gateway				# point d'entrée API
		├── ai
		├── authentification
		├── blockchain
		├── database
		├── games
		├── matchmaking
		├── shared
		├── tournament
		└── websocket 
```

# Tutos
### Installation sur la session

#### [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm?tab=readme-ov-file#about)

- Télécharger et installer nvm (script bash utilisé pour gérer plusieurs versions de Node.js.):
	```sh
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
	```
	La commande ci-dessus clonera le référentiel nvm sur \~/.nvm et ajoutera la ligne source à votre profil (~/.bash_profile, ~/.zshrc, ~/.profile ou ~/.bashrc).  

- Verification de l'installation de nvm:
	```sh
	command -v nvm
	```
	Doit afficher `nvm`

- pour connaitre la version installe:
	```sh
	nvm --version
	```
- redémarrer le shell ou:
	```sh
	\. "$HOME/.nvm/nvm.sh"
	```

#### node.js
Links:
- [Telecharger Node.js](https://nodejs.org/fr/download)
- [Linux-Terminal.com](https://fr.linux-terminal.com/?p=4411)
- Installation de node.js et npm (Node Package Manager).
	Nos docker sont base sur node:20-alpine donc utilisation de la version 20
	```sh
	nvm install 20
	```

- Vérifier la version de Node.js :
	```sh
	node -v
	```
	et
	```sh
	nvm current
	```
	Doivent afficher `v20.19.3`

- Vérifier la version de npm (Node Package Manager):
	```sh
	npm -v
	```
	Doit afficher `10.8.2`

### Installation dans le projet
- Dans le terminal situez vous a la racine de votre projet.

	```sh
	npm init -y
	```
	Cela cree le fichier package.json.
- [Installation de Typescript]()
	```sh
	npm install -D typescript
	```
	Cela va cree le fichier package_lock, le dossier node_modules.
	```sh
	npx tsc --init
	```
	Cela cree le fichier tsconfig.json. Le fichier package.json est modifie.


- [Installation de Tailwind CSS](https://v3.tailwindcss.com/docs/installation)  
Tailwind CSS necessite postcss pour fonctionner. autoprefixer ajoute automatiquement les prefixe css pour la compatibilite avec les differents navigateurs.
	```sh
	npm install -D tailwindcss@3 postcss autoprefixer
	```
	Le fichier package.json est modifie.
	
	```sh
	npx tailwindcss init -p
	```
	Cela cree les fichiers tailwind.config.js et postcss.config.js.
	Pour connaitre la version de Tailwindcss installe dans le projet:
	```sh
	npm list tailwindcss
	```
	ou lire dans le fichier package.json.  
	Configuration du fichier 'tailwind.config.js'
	```js
	...
		content: ["./index.html", "./src/**/*.{js,ts}"],
	...
	```
	Dans le fichier .css ajouter au debut
	```css
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
	```

- [Installation de Vite](https://vite.dev/)
	```sh
	npm install -D vite@7
	```
	Configuration : ajouter dans le fichier 'package.json' dans la rubrique scripts
	```json
	"scripts": {
		"dev": "vite",
		"build": "vite build",
		"preview": "vite preview"
	}
	```
	Creer si besoin le fichier vit.config.js ou vit.config.ts
## Single Page Application
Links:
- [medium.com - Exploring Single Page Applications and TypeScript- Part I](https://medium.com/@pratheeshrussell/exploring-single-page-applications-and-typescript-part-i-15990126f601)
- [InfiniteJS - Building a SPA site without using a framework](https://infinitejs.com/posts/building-spa-site-without-framework/)

Manipulation de l'historique de navigation.
- [developer.mozilla.org - History](https://developer.mozilla.org/en-US/docs/Web/API/History)

## Frontend
Links:
	[color - generate color palette](https://coolors.co/)

## Typescript
[TypeScript Documentation officielle](https://www.typescriptlang.org/fr/docs/)

## Figama
https://www.figma.com/slides/bE0cLtw0m0GEfEW2xCNLrw/Untitled?node-id=1-42&t=XtBTBjDyrwIyI9GK-0

## [Vite](https://vite.dev/)
Vite est un serveur de developpement permettant de refleter a chaud les changements effectues dans le projet. Il permet d'accelerer et de simplifier le developpement.
### [Vite setup catalog](https://github.com/sapphi-red/vite-setup-catalogue)

[Configuration du hmr](https://vite.dev/config/server-options.html#server-hmr).

## [fastify](https://fastify.dev/)

## Authentification Google
L'authentification Google permet aux utilisateurs de s'authentifier en utilisant leur compte Google existant. Elle repose sur le protocole OAuth 2.0, et plus spécifiquement sur le flux Authorization code flow (flux de code d'autorisation).

#### Liens utiles
[Comment implémenter le flux Codes d’autorisation](https://auth0.com/docs/fr-ca/get-started/authentication-and-authorization-flow/authorization-code-flow)  
[Implicit flow vs. Authorization code flow: Why implicit flow is dead?](https://blog.logto.io/implicit-flow-is-dead)   
[Diagrams And Movies Of All The OAuth 2.0 Flows](https://darutk.medium.com/diagrams-and-movies-of-all-the-oauth-2-0-flows-194f3c3ade85)  
[An Illustrated Guide to OAuth and OpenID Connect](https://www.youtube.com/watch?v=t18YB3xDfXI)

#### Etapes detaillees de 'Authorization code flow'
Le processus d'authentification se divise en plusieurs phases distinctes, impliquant à la fois le client (frontend) et le serveur (backend).

---
**Phase 1 : Côté client (frontend) dans la HomePage**
* **Réponse à l'action de l'utilisateur**
    * Sur la HomePage l'utilisateur clique sur un bouton "Se connecter avec Google".
    * Le code JavaScript (TypeScript) de la HomePage intercepte cet événement.
* **Préparation de la requête**
    * Le code de la HomePage génère un **'state'** aléatoire et unique (ex: `crypto.randomUUID()`) pour se protéger des attaques **CSRF**.
    * Stockage immédiat de **'state'** dans le `sessionStorage`.
* **Construction de l'URL d'authentification pour l'API Google**
    * Le code de la HomePage concatène l'URL de base (`https://accounts.google.com/o/oauth2/v2/auth`) avec des paramètres de requête:
        * `response_type=code` : Indique que vous attendez un code d'autorisation en retour.
        * `client_id=VOTRE_CLIENT_ID` : L'identifiant de votre application, obtenu auprès de Google.
        * `redirect_uri=VOTRE_CALLBACK_URL` : L'URL où Google doit renvoyer l'utilisateur.
        * `scope=email%20profile` : Les informations demandé à l'utilisateur (email, profil public).
        * `state=VOTRE_VALEUR_DE_STATE` : La valeur que vous venez de générer.
* **Ouverture de la fenêtre pop-up**
    * Le code de la HomePage ouvre la pop-up en utilisant `window.open()`, en lui passant l'URL precedement construite.
    * La nouvelle fenêtre charge cette URL et affiche le formulaire de connexion de Google.

---
**Phase 2 : Côté PopUp sur la page Google (fournisseur d'identité)**
* **Authentification et consentement**
    * L’utilisateur saisit ses identifiants et accepte de partager ses infos.
* **Redirection le `redirect_uri`**
    * Une fois que l'authentification et le consentement sont réussis, Google envoie une réponse de redirection HTTP (code 302).
    * Cette réponse ordonne au navigateur de la pop-up de charger une nouvelle URL. Cette URL est le `redirect_uri` (ex: `https://votrejeu.com/auth/popup-callback`), mais elle contient en plus:
        * le code d'autorisation (usage unique, expire rapidement)
        * le state (le meme que celui envoye precedement).

---
**Phase 3 : Côté PopUp sur la page de redirection**
* **Réception du code sur la pop-up**
    * La pop-up charge la page `auth/popup-callback`. Le code JavaScript de cette page s'exécute:
        * Extaction du code d'autorisation et du state de l'URL.
        * Preparation du message avec le code d'autorisation et le state.
        * utilisation `window.opener.postMessage()` pour envoyer le message préparé à la fenêtre qui l'a ouverte. L'origine de la page principale est incluse dans l'appel pour des raisons de sécurité.
    * La pop-up se ferme.

---
**Phase 4 : Côté client (frontend) dans la HomePage**
* **Vérification de sécurité**
    * La HomePage, en écoutant l'événement `message`, reçoit le message de la pop-up.
    * La HomePage compare le state reçu dans le message avec le state stocké dans le `sessionStorage`. Si les valeurs correspondent, la vérification est un succès. La page principale peut faire confiance au code d'autorisation.
* **Transmission au backend**
    * La HomePage envoie ce code au microservice d'authentification (backend) via une requête API **POST** (pas GET) et **HTTPS**, pour éviter qu’il ne soit logged dans les historiques ou les logs serveur.

---
**Phase 5 : Côté serveur (backend)**
* **Échange de code et création de la session**
    * Le backend reçoit le code d'autorisation du frontend.
    * Le backend envoi le code d'autorisation a Google via une requête sécurisée de serveur à serveur.
    * Google renvoie:
        * **ID Token** → contient les infos d’identité de l’utilisateur (nom, email, etc.), signé par Google.
        * **Access Token** → permet d’accéder aux API Google.
        * **Refresh Token** (optionnel) → permet d’obtenir un nouvel access token sans redemander la connexion à l’utilisateur.
    * Le backend valide l'identité de l'utilisateur à partir de l'**ID Token** et crée une session pour l'utilisateur dans votre système.
    * Le backend genere un jeton de session interne (**JWT**) et l'envoi en reponse au frontend pour finaliser le processus d'authentification.
---

## credits
Skybox voie lactee: [nasa](https://svs.gsfc.nasa.gov/4851/)
