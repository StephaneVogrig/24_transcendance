FROM node:20-alpine

WORKDIR /app

COPY ai/package*.json ./

RUN npm ci

COPY shared ./shared

COPY ai/src ./src

EXPOSE 3009

CMD ["node", "shared/server.js"]
