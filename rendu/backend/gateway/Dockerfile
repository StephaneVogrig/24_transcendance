FROM node:20-alpine

WORKDIR /app

COPY ssl/ /app/ssl/

COPY backend/gateway/package*.json ./

RUN npm install

COPY backend/gateway/src/ ./src/

COPY frontend/package*.json ./frontend/

COPY frontend/ ./frontend/

RUN cd frontend && npm ci && npm run build && cp -r dist ../public

EXPOSE 3000

CMD ["node", "src/server.js"]
