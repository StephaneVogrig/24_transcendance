# 24_transcendence

*Réalisé par [Stéphanie Mortemousque](https://github.com/Stephmo1984), [Sébastien Craeymeersch](), [Mathieu](), [Gaël Cannaud](https://github.com/Helco18) et [Stéphane Vogrig](https://github.com/StephaneVogrig).*


# Modules

✅ Major module: Use a framework to build the backend.

✅ Minor module: Use a framework or a toolkit to build the frontend.

❌ Minor module: Use a database for the backend. (Sebastien)

❌ Major module: Implementing a remote authentication. (Stephanie)

❌ Major module: Remote players (Stephane)

❌ Major: Store the score of a tournament in the Blockchain. (Sebastien)

❌ Major module: Introduce an AI opponent. (Mathieu)

✅ Major: Use advanced 3D techniques. (Gael)

✅ Major module: Designing the backend as microservices. *

❌ Minor module: Multiple language support. (Sebastien)

✅ Major module: Replace basic Pong with server-side Pong and implement an API. (Mathieu)

# Microservices
```
authentification
blockchain
database
games
matchmaking
scores
tournament
websocket
```
# Architecture
```
transcendence/
├── backend/				# Fastify uniquement aucun framwork
│   ├── authentification/
│   ├── blockchain/
│   ├── database/			# SQLite
│   ├── games/
│   ├── gateway/			# point d'entrée unique
│   ├── matchmaking/
│   ├── scores/
│   ├── shared/
│   ├── tournament/
│   └── websocket/ 
├── frontend/				# SPA, Tailwind CSS & Typescript uniquement			
└── docker-compose.yml
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

###

### credits
https://svs.gsfc.nasa.gov/4851/