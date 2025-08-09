FROM node:20-alpine

WORKDIR /app

COPY database/package*.json ./

RUN apk add --no-cache python3 make g++ sqlite

RUN npm ci

COPY database/init.sql ./init.sql
COPY shared ./shared
COPY database/src ./src

EXPOSE 3003

CMD ["node", "shared/server.js"]
