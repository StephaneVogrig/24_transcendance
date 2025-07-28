FROM node:20-alpine

WORKDIR /app

COPY ssl/ /app/ssl/

COPY backend/gateway/package*.json ./

RUN npm ci

COPY backend/gateway/src/ ./src/

EXPOSE 3000

CMD ["node", "src/server.js"]
