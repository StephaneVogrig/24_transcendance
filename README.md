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

❌ Major: Use advanced 3D techniques. (Gael)

❌ Major module: Designing the backend as microservices. *

❌ Minor module: Multiple language support. (Sebastien)

❌ Major module: Replace basic Pong with server-side Pong and implement an API. (Mathieu)

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
## node.js
### installation
Links:
- [Telecharger Node.js](https://nodejs.org/fr/download)
- [Linux-Terminal.com](https://fr.linux-terminal.com/?p=4411)

#### nvm (Node Version Manager)
- Télécharger et installer nvm (script bash utilisé pour gérer plusieurs versions de Node.js.):
	```sh
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
	```
	La commande ci-dessus clonera le référentiel nvm sur ~/.nvm et ajoutera la ligne source à votre profil (~/.bash_profile, ~/.zshrc, ~/.profile ou ~/.bashrc).  

- Verification de l'installation de nvm:
	```sh
	command -v nvm
	```
	Doit afficher `nvm`
- redémarrer le shell ou:
	```sh
	\. "$HOME/.nvm/nvm.sh"
	```

#### node.js
- Installation de node.js et npm (Node Package Manager).
	Pour la version 22 (LTS au 25/06/2025):
	```sh
	nvm install 22
	```
	ou pour la version la plus recente:
	```sh
	nvm install node
	```

- Vérifier la version de Node.js :
	```sh
	node -v
	```
	Doit afficher `v22.17.0` (au 25/06/2025).  
	Puis:
	```sh
	nvm current
	```
	Doit afficher `v22.17.0` (au 25/06/2025).  

- Vérifier la version de npm (Node Package Manager):
	```sh
	npm -v
	```
	Doit afficher `10.9.2` (au 25/06/2025).

## Tailwind CSS


## Single Page Application
Links:
- [medium.com - Exploring Single Page Applications and TypeScript- Part I](https://medium.com/@pratheeshrussell/exploring-single-page-applications-and-typescript-part-i-15990126f601)

## Frontend
Links:
	[color - generate color palette](https://coolors.co/)