FROM node:20-alpine

WORKDIR /app

COPY websocket/package*.json ./

RUN npm ci

COPY shared ./shared

COPY websocket/src ./src

EXPOSE 3008

CMD ["node", "shared/server.js"]
