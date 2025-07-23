FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY src/ ./src/

EXPOSE 3443

USER node

CMD ["node", "src/server.js"]
