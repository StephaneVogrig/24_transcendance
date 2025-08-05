FROM node:20-alpine

WORKDIR /app

COPY tournament/package*.json ./

RUN npm ci

COPY shared ./shared

COPY tournament/src ./src

EXPOSE 3007

CMD ["node", "shared/server.js"]
