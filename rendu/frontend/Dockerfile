FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm i --save @types/node
RUN npm install @babylonjs/core

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
