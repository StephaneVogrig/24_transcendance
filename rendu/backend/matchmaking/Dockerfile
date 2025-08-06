FROM node:20-alpine

WORKDIR /app

COPY matchmaking/package*.json ./

RUN npm ci

COPY shared ./shared

COPY matchmaking/src ./src

EXPOSE 3005

CMD ["node", "shared/server.js"]