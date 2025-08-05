FROM node:20-alpine

WORKDIR /app

COPY game/package*.json ./

RUN npm ci

COPY shared ./shared

COPY game/src ./src

EXPOSE 3004

CMD ["node", "shared/server.js"]
