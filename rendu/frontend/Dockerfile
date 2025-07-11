# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copier les fichiers de configuration depuis le dossier frontend
COPY frontend/package*.json ./
COPY frontend/tsconfig.json ./
COPY frontend/vite.config.ts ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./

# Installer les dépendances
RUN npm install

# Copier le code source frontend
COPY frontend/ .

# Build de l'application (sans vérification TypeScript)
RUN npm run build:no-typecheck

# Production stage
FROM nginx:alpine

# Copier la configuration nginx depuis le dossier frontend
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

# Créer les répertoires SSL
RUN mkdir -p /etc/ssl/certs /etc/ssl/private

# Copier les certificats SSL depuis le répertoire ssl/ (contexte racine)
COPY ssl/localhost.pem /etc/ssl/certs/localhost.pem
COPY ssl/localhost-key.pem /etc/ssl/private/localhost-key.pem

# Exposer les ports HTTP et HTTPS
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
