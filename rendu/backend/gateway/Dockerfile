FROM node:20-alpine

WORKDIR /app

COPY gateway/package*.json ./

RUN npm ci

COPY shared ./shared

COPY gateway/src ./src


EXPOSE 3000

CMD ["node", "shared/server.js"]
