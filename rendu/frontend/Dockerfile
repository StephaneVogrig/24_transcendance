FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install socket.io-client@^4.7.4
RUN npm install @babel/core --save-dev
RUN npm i --save @types/node
RUN npm install @babylonjs/core
RUN npm install @auth0/auth0-spa-js

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
